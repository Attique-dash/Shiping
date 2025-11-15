import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { 
      fullName, 
      email, 
      phoneNo, 
      password, 
      adress, 
      city, 
      state, 
      zip_code, 
      country 
    } = body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Split full name
    const nameParts = (fullName || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Generate unique user code
    const userCode = `C${Date.now()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      userCode,
      firstName,
      lastName,
      email,
      passwordHash,
      phone: phoneNo,
      address: {
        street: adress,
        city,
        state,
        zipCode: zip_code,
        country,
      },
      role: 'customer',
      accountStatus: 'active',
      emailVerified: false,
    });

    // Return success without password
    const { passwordHash: _, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        userCode: user.userCode,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating user' },
      { status: 500 }
    );
  }
}