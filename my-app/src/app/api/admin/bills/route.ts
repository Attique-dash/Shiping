import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/rbac";
import { dbConnect } from "@/lib/db";
import { GeneratedInvoice } from "@/models/GeneratedInvoice";
import { PosTransaction } from "@/models/PosTransaction";

export async function GET(req: Request) {
  const payload = await getAuthFromRequest(req);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Aggregate bills from multiple sources:
    // 1. Prisma bills (from packages)
    // 2. MongoDB GeneratedInvoices
    // 3. POS Transactions (as bills)

    const [prismaBills, invoices, posTransactions] = await Promise.all([
      // Fetch Prisma bills
      prisma.bill.findMany({
        include: {
          package: {
            select: {
              trackingNumber: true,
              status: true,
            },
          },
        },
        orderBy: { date: "desc" },
        take: 100,
      }).catch(() => []), // If Prisma fails, continue with other sources

      // Fetch MongoDB invoices
      GeneratedInvoice.find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
        .catch(() => []),

      // Fetch POS transactions (as bills)
      PosTransaction.find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
        .catch(() => []),
    ]);

    // Format Prisma bills
    const formattedPrismaBills = prismaBills.map((bill) => ({
      id: `prisma-${bill.id}`,
      billNumber: bill.billNumber,
      trackingNumber: bill.trackingNumber,
      date: bill.date.toISOString(),
      branch: bill.branch,
      dueAmount: bill.dueAmount,
      paidAmount: bill.paidAmount,
      balance: bill.balance,
      currency: bill.currency,
      status: bill.status,
      source: "package",
    }));

    // Format MongoDB invoices as bills
    const formattedInvoiceBills = invoices.map((inv) => ({
      id: `invoice-${inv._id}`,
      billNumber: inv.invoiceNumber,
      trackingNumber: inv.customerId || "N/A",
      date: inv.issueDate.toISOString(),
      branch: "Main Branch",
      dueAmount: inv.total,
      paidAmount: inv.status === "paid" ? inv.total : 0,
      balance: inv.status === "paid" ? 0 : inv.total,
      currency: inv.currency || "USD",
      status: inv.status === "paid" ? "paid" : inv.status === "overdue" ? "unpaid" : "unpaid",
      source: "invoice",
    }));

    // Format POS transactions as bills
    const formattedPosBills = posTransactions.map((pos) => ({
      id: `pos-${pos._id}`,
      billNumber: pos.receiptNo,
      trackingNumber: pos.customerCode || "Walk-in",
      date: pos.createdAt ? new Date(pos.createdAt).toISOString() : new Date().toISOString(),
      branch: "POS Terminal",
      dueAmount: pos.total,
      paidAmount: pos.total, // POS transactions are always paid
      balance: 0,
      currency: "USD",
      status: "paid" as const,
      source: "pos",
    }));

    // Combine all bills and sort by date
    const allBills = [...formattedPrismaBills, ...formattedInvoiceBills, ...formattedPosBills]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 100);

    return NextResponse.json({ bills: allBills });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const payload = await getAuthFromRequest(req);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { packageId, trackingNumber, date, branch, dueAmount, currency = "JMD" } = body;

    if (!packageId || !trackingNumber || !date || !branch || !dueAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate bill number
    const billCount = await prisma.bill.count();
    const billNumber = `BILL-${String(billCount + 1).padStart(6, "0")}`;

    const bill = await prisma.bill.create({
      data: {
        packageId,
        trackingNumber,
        billNumber,
        date: new Date(date),
        branch,
        dueAmount: parseFloat(dueAmount),
        paidAmount: 0,
        balance: parseFloat(dueAmount),
        currency,
        status: "unpaid",
      },
    });

    return NextResponse.json({ bill: { id: bill.id, billNumber: bill.billNumber } });
  } catch (error) {
    console.error("Error creating bill:", error);
    return NextResponse.json({ error: "Failed to create bill" }, { status: 500 });
  }
}

