import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Package } from "@/models/Package";

export async function GET(
  _req: Request,
  { params }: { params: { trackingNumber: string } }
) {
  await dbConnect();
  const pkg = await Package.findOne({ trackingNumber: params.trackingNumber });
  if (!pkg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pkg);
}
