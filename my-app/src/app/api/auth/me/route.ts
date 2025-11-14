import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { getAuthFromCookies } from "@/lib/auth";

export async function GET() {
  try {
    // Connect to database
    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Get authentication from cookies
    let auth;
    try {
      auth = await getAuthFromCookies();
      if (!auth) {
        return NextResponse.json(
          { user: null },
          { status: 401 }
        );
      }
    } catch (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }

    // Handle admin token without a DB uid
    if (!auth.uid && auth.role === "admin") {
      return NextResponse.json({
        user: {
          id: null,
          user_code: "ADMIN",
          role: "admin",
          full_name: "Administrator",
          email: process.env.ADMIN_EMAIL || "admin@example.com",
          phone: undefined,
          address: undefined,
          account_status: "active",
          member_since: undefined,
          last_login: undefined,
        },
      });
    }

    if (!auth.uid) {
      return NextResponse.json(
        { error: 'User ID not found in token' },
        { status: 400 }
      );
    }

    // Find user in database
    let user;
    try {
      user = await User.findById(auth.uid).select(
        "firstName lastName email role userCode phone address createdAt lastLogin accountStatus"
      );
      
      if (!user) {
        console.warn(`User not found with ID: ${auth.uid}`);
        return NextResponse.json(
          { user: null },
          { status: 404 }
        );
      }
    } catch (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Error fetching user data' },
        { status: 500 }
      );
    }

    // Prepare user data
    const full_name = [user.firstName, user.lastName].filter(Boolean).join(" ");
    const member_since = user.createdAt ? user.createdAt.toISOString() : undefined;
    const last_login = user.lastLogin ? user.lastLogin.toISOString() : undefined;
    const address = user.address
      ? {
          street: user.address.street || undefined,
          city: user.address.city || undefined,
          state: user.address.state || undefined,
          zip_code: user.address.zipCode || undefined,
          country: user.address.country || undefined,
        }
      : undefined;

    try {
      return NextResponse.json({
        user: {
          id: String(user._id),
          user_code: user.userCode,
          role: user.role,
          full_name,
          email: user.email,
          phone: user.phone,
          address,
          account_status: user.accountStatus || "active",
          member_since,
          last_login,
        },
      });
    } catch (error) {
      console.error('Unexpected error in /api/auth/me:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
