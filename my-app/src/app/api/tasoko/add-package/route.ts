import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Package } from "@/models/Package";
import { User } from "@/models/User";
import { addPackageSchema } from "@/lib/validators";
import { sendNewPackageEmail } from "@/lib/email";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const parsed = addPackageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { trackingNumber, userCode, weight, shipper, description } = parsed.data;

  // Try to link to customer
  const customer = await User.findOne({ userCode });

  const pkg = await Package.create({
    trackingNumber,
    userCode,
    customer: customer?._id,
    weight,
    shipper,
    description,
    status: "At Warehouse",
    history: [{ status: "At Warehouse", at: new Date(), note: "Added by Tasoko" }],
  });

  // Optional email notification to customer
  try {
    if (customer?.email) {
      await sendNewPackageEmail({
        to: customer.email,
        firstName: customer.firstName,
        trackingNumber,
        status: "At Warehouse",
        weight,
        shipper,
      });
    }
  } catch (e) {
    // swallow email errors to not break warehouse flow
    console.warn("Email send failed", e);
  }

  return NextResponse.json({ message: "Package added", package: pkg });
}
