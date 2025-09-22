import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Package } from "@/models/Package";
import { updatePackageSchema } from "@/lib/validators";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const parsed = updatePackageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { trackingNumber, status, note } = parsed.data;

  const pkg = await Package.findOne({ trackingNumber });
  if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

  pkg.status = status;
  pkg.history.push({ status, at: new Date(), note });
  await pkg.save();

  return NextResponse.json({ message: "Package updated", package: pkg });
}
