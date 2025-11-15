import { NextResponse } from 'next/server';
import { signOut } from 'next-auth/react';

export async function POST() {
  try {
    await signOut({ redirect: false });
    
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // Clear the session cookie
    response.cookies.set({
      name: 'next-auth.session-token',
      value: '',
      httpOnly: true,
      path: '/',
      expires: new Date(0)
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}