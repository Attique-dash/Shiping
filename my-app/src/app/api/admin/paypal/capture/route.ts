import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
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
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const client = paypalClient();
    if (!client) {
      return NextResponse.json({ error: "PayPal not configured" }, { status: 500 });
    }

    // Capture the PayPal order
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client.execute(request);

    if (capture.statusCode === 201 && capture.result) {
      const captureId = capture.result.id;
      const amount = capture.result.purchase_units[0]?.payments?.captures[0]?.amount?.value;

      // Update payment status
      await prisma.payment.updateMany({
        where: {
          transactionId: orderId,
        },
        data: {
          status: "completed",
          paidAt: new Date(),
          metadata: {
            captureId,
            paypalOrderId: orderId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        captureId,
        amount,
      });
    } else {
      throw new Error("Failed to capture PayPal order");
    }
  } catch (error) {
    console.error("Error capturing PayPal payment:", error);
    return NextResponse.json({ 
      error: "Failed to capture payment",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

