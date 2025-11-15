import { NextResponse } from 'next/server';
import { signIn } from 'next-auth/react';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/dashboard',
    });

    if (result?.error) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, redirect: result?.url || '/dashboard' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as Partial<LoginRequest>;
    
    // Validate request body
    if (!body.email || !body.password) {
      return NextResponse.json(
        { 
          error: { 
            message: "Email and password are required",
            details: { 
              email: !body.email ? "Email is required" : undefined,
              password: !body.password ? "Password is required" : undefined
            }
          } 
        },
        { status: 400 }
      );
    }
    
    const { email, password } = body;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return NextResponse.json(
          { 
            error: { 
              message: "Invalid email or password",
              details: { email: "Invalid email or password" }
            } 
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    } catch (error) {
      console.error('Sign in error:', error);
      return NextResponse.json(
        { error: { message: 'Authentication failed' } },
        { status: 500 }
      );
    }

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
}