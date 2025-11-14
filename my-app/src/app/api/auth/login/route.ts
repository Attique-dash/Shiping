import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { comparePassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    // Parse body and validate first
    let body: unknown = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password, rememberMe } = parsed.data;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30d or 7d

    // Determine if connection is secure, but never mark cookie secure on localhost
    const url = new URL(req.url);
    const forwardedProto = (typeof (req as any).headers?.get === "function" && (req as any).headers.get("x-forwarded-proto")) || null;
    const proto = (forwardedProto ? String(forwardedProto) : url.protocol.replace(":", "")).toLowerCase();
    const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const isSecure = !isLocalhost && proto === "https";

    // Fast path: allow env-based admin login without hitting the DB
    if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
      const token = signToken({ role: "admin", userCode: "ADMIN" });
      const res = NextResponse.json({
        message: "Logged in",
        user: { id: null, email: adminEmail, role: "admin", userCode: "ADMIN" },
      });
      res.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge,
      });
      return res;
    }

    // Otherwise, connect to DB for customer/warehouse users
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    // Allow login but indicate if email is not verified
    if (!user.emailVerified) {
      // Generate token with unverified_email flag
      const token = signToken({ 
        uid: user._id, 
        role: user.role, 
        userCode: user.userCode,
        emailVerified: false
      });

      const res = NextResponse.json({
        message: "Logged in - Please verify your email",
        user: { 
          id: user._id, 
          email: user.email, 
          role: user.role, 
          userCode: user.userCode,
          emailVerified: false
        },
        requiresVerification: true
      });
      
      res.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge,
      });
      
      return res;
    }

    // Ensure passwordHash exists and is a string to avoid runtime errors
    if (!user.passwordHash || typeof user.passwordHash !== "string") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    let ok = false;
    try {
      ok = await comparePassword(password, user.passwordHash);
    } catch (e) {
      console.warn("[login] comparePassword failed", e);
      ok = false;
    }
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    // Update last login timestamp
    try {
      user.lastLogin = new Date();
      await user.save();
    } catch (e) {
      console.warn("[login] Failed to update lastLogin", e);
    }

    const token = signToken({ 
      uid: user._id, 
      role: user.role, 
      userCode: user.userCode,
      emailVerified: true
    });

    // Set cookie on the response to avoid using cookies() after awaited work
    const res = NextResponse.json({
      message: "Logged in successfully",
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        userCode: user.userCode,
        emailVerified: true
      },
      requiresVerification: false
    });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge, // 7 or 30 days based on rememberMe
    });
    return res;
  } catch (err) {
    console.error("/api/auth/login failed", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

