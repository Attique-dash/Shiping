import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Package } from "@/models/Package";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const cookie = req.headers.get("cookie") || "";
  const token = /auth_token=([^;]+)/.exec(cookie)?.[1];
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const packages = await Package.find({}).sort({ updatedAt: -1 }).limit(500);
  return NextResponse.json(packages);
}
