import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

// Type guard to detect Mongo duplicate key errors safely
function isMongoDuplicateKeyError(e: unknown): e is { code: number } {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    typeof (e as { code: unknown }).code === "number" &&
    (e as { code: unknown }).code === 11000
  );
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    let body: unknown = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { firstName, lastName, email, password, branch, serviceTypeIDs } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Create a simple userCode from timestamp - in production you may use a better generator
    const userCode = `U${Date.now()}`;
    const passwordHash = await hashPassword(password);

    const user = await User.create({
      userCode,
      firstName,
      lastName,
      email,
      passwordHash,
      branch,
      serviceTypeIDs,
      role: "customer",
    });

    return NextResponse.json({
      message: "Registered",
      user: { id: user._id, userCode: user.userCode, email: user.email, firstName, lastName },
    });
  } catch (err: unknown) {
    // Map common mongoose errors
    if (isMongoDuplicateKeyError(err)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    console.error("/api/auth/register failed", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
