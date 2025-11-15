import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    let body: unknown = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: { message: "Invalid request body" } }, 
        { status: 400 }
      );
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: { 
            message: "Validation failed",
            details: parsed.error.flatten()
          } 
        }, 
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = parsed.data;
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;

    // Check for admin credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
      const admin = await prisma.admin.findUnique({ where: { email } });
      
      const token = signToken({ 
        role: "admin", 
        email: adminEmail,
        id: admin?.id || "admin"
      });
      
      const response = NextResponse.json({
        message: "Logged in as admin",
        user: { 
          id: admin?.id || "admin", 
          email: adminEmail, 
          role: "admin"
        }
      });

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge,
      });

      return response;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { 
          error: { 
            message: "Invalid email or password",
            details: { email: "No account found with this email" }
          } 
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          error: { 
            message: "Invalid email or password",
            details: { password: "Incorrect password" }
          } 
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = signToken({
      id: user.id,
      email: user.email,
      role: "customer"
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });

    const response = NextResponse.json({
      message: user.isVerified 
        ? "Logged in successfully" 
        : "Please verify your email address",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "customer"
      }
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { 
        error: { 
          message: "An unexpected error occurred",
          details: process.env.NODE_ENV === 'development' ? error : undefined
        } 
      },
      { status: 500 }
    );
  }