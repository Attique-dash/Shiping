import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type StripeNS from "stripe";
import { stripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/db";
import { Payment } from "@/models/Payment";

export async function POST(req: Request) {
  const sig = headers().get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });

  let event: StripeNS.Event;
  const body = await req.text();

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = typeof err === "object" && err && "message" in err ? (err as { message?: string }).message : String(err);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  await dbConnect();

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as StripeNS.PaymentIntent;
        await Payment.findOneAndUpdate(
          { gatewayId: pi.id },
          { status: "captured" }
        );
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as StripeNS.PaymentIntent;
        await Payment.findOneAndUpdate(
          { gatewayId: pi.id },
          { status: "failed" }
        );
        break;
      }
      default:
        // ignore other events for now
        break;
    }
  } catch (err) {
    const message = typeof err === "object" && err && "message" in err ? (err as { message?: string }).message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
