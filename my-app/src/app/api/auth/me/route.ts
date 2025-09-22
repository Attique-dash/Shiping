import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { getAuthFromCookies } from "@/lib/auth";

export async function GET() {
  await dbConnect();
  const auth = getAuthFromCookies();
  if (!auth) return NextResponse.json({ user: null });

  const user = await User.findById(auth.uid).select("firstName lastName email role userCode");
  return NextResponse.json({ user });
}
