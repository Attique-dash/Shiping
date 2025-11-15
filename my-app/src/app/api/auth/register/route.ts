// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const { email, password, name } = await request.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    const user = await User.create({
      email,
      password,
      name,
      role: 'user'
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error creating user' },
      { status: 500 }
    );
  }
}