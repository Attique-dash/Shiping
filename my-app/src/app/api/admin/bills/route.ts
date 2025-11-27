import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/rbac";

export async function GET(req: Request) {
  const payload = await getAuthFromRequest(req);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First, check if we need to auto-generate bills from packages
    const packagesWithoutBills = await prisma.package.findMany({
      where: {
        bills: {
          none: {},
        },
        totalAmount: {
          gt: 0,
        },
      },
      take: 50,
    });

    // Auto-generate bills for packages without bills
    for (const pkg of packagesWithoutBills) {
      const billCount = await prisma.bill.count();
      const billNumber = `BILL-${String(billCount + 1).padStart(6, "0")}`;
      
      await prisma.bill.create({
        data: {
          packageId: pkg.id,
          trackingNumber: pkg.trackingNumber,
          billNumber,
          date: pkg.createdAt,
          branch: pkg.currentLocation || "Main Branch/Kingston",
          dueAmount: pkg.totalAmount || 0,
          paidAmount: pkg.paymentStatus === "paid" ? pkg.totalAmount || 0 : 0,
          balance: pkg.paymentStatus === "paid" ? 0 : pkg.totalAmount || 0,
          currency: "JMD",
          status: pkg.paymentStatus === "paid" ? "paid" : "unpaid",
        },
      });
    }

    // Fetch all bills
    const bills = await prisma.bill.findMany({
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
    });

    const formattedBills = bills.map((bill) => ({
      id: bill.id,
      billNumber: bill.billNumber,
      trackingNumber: bill.trackingNumber,
      date: bill.date.toISOString(),
      branch: bill.branch,
      dueAmount: bill.dueAmount,
      paidAmount: bill.paidAmount,
      balance: bill.balance,
      currency: bill.currency,
      status: bill.status,
    }));

    return NextResponse.json({ bills: formattedBills });
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

