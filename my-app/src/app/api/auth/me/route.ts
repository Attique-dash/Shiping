import { NextRequest, NextResponse } from 'next-server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated', authenticated: false },
        { status: 401 }
      );
    }

    // Determine if admin or user
    const isAdmin = session.user.role === 'admin';
    
    let userData;
    if (isAdmin) {
      userData = await prisma.admin.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          isActive: true,
          createdAt: true
        }
      });
    } else {
      userData = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          avatar: true,
          isActive: true,
          isVerified: true,
          createdAt: true
        }
      });
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found', authenticated: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        ...userData,
        role: session.user.role
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        authenticated: false,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}


// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const response = NextResponse.json({ message: "Logged out successfully" });
  
  // Clear NextAuth session cookie
  response.cookies.set("next-auth.session-token", "", { 
    httpOnly: true, 
    expires: new Date(0), 
    path: "/" 
  });
  
  // Clear custom auth token if you're using one
  response.cookies.set("auth_token", "", { 
    httpOnly: true, 
    expires: new Date(0), 
    path: "/" 
  });
  
  return response;
}

export async function GET(req: Request) {
  return POST(req);
}
