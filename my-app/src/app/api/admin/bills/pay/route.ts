import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/rbac";
import * as paypal from "@paypal/checkout-server-sdk";

// PayPal client setup
function paypalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = process.env.PAYPAL_ENVIRONMENT || "sandbox";

  if (!clientId || !clientSecret) {
    return null;
  }

  const environment_obj = environment === "production"
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(environment_obj);
}

export async function POST(req: Request) {
  const payload = await getAuthFromRequest(req);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { billId, amount, paymentMethod, cardDetails, usePayPal } = body;

    if (!billId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bill = await prisma.bill.findUnique({
      where: { id: billId },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    if (amount > bill.balance) {
      return NextResponse.json({ error: "Payment amount exceeds balance" }, { status: 400 });
    }

    let paymentGateway = "powertranz";
    let paypalOrderId = null;

    // Process PayPal payment if requested
    if (usePayPal && paymentMethod === "paypal") {
      const client = paypalClient();
      if (!client) {
        return NextResponse.json({ error: "PayPal not configured" }, { status: 500 });
      }

      try {
        // Create PayPal order
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
          intent: "CAPTURE",
          purchase_units: [{
            amount: {
              currency_code: bill.currency,
              value: amount.toFixed(2),
            },
            description: `Payment for bill ${bill.billNumber}`,
          }],
        });

        const order = await client.execute(request);
        if (order.statusCode === 201 && order.result) {
          paypalOrderId = order.result.id;
          paymentGateway = "paypal";
        } else {
          throw new Error("Failed to create PayPal order");
        }
      } catch (paypalError) {
        console.error("PayPal error:", paypalError);
        return NextResponse.json({ 
          error: "PayPal payment failed", 
          details: paypalError instanceof Error ? paypalError.message : "Unknown error" 
        }, { status: 500 });
      }
    }

    // Process payment
    const newPaidAmount = bill.paidAmount + amount;
    const newBalance = bill.dueAmount - newPaidAmount;
    const newStatus = newBalance <= 0 ? "paid" : newPaidAmount > 0 ? "partial" : "unpaid";

    const updatedBill = await prisma.bill.update({
      where: { id: billId },
      data: {
        paidAmount: newPaidAmount,
        balance: newBalance,
        status: newStatus,
        paymentMethod,
        paymentDate: new Date(),
        paymentDetails: {
          cardDetails: cardDetails || null,
          paypalOrderId: paypalOrderId || null,
          gateway: paymentGateway,
        },
      },
    });

    // Get package to find userId
    const packageData = await prisma.package.findUnique({
      where: { id: bill.packageId },
      select: { userId: true },
    });

    // Create payment record
    if (packageData) {
      await prisma.payment.create({
        data: {
          userId: packageData.userId,
          transactionId: paypalOrderId || `PAY-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          amount: amount,
          currency: bill.currency,
          paymentMethod: paymentMethod || "card",
          paymentGateway: paymentGateway,
          status: usePayPal ? "pending" : "completed", // PayPal needs capture
          description: `Payment for bill ${bill.billNumber}`,
          paidAt: usePayPal ? null : new Date(),
          metadata: paypalOrderId ? { paypalOrderId } : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      bill: {
        id: updatedBill.id,
        balance: updatedBill.balance,
        status: updatedBill.status,
      },
      paypalOrderId: paypalOrderId,
      requiresCapture: !!usePayPal,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}

