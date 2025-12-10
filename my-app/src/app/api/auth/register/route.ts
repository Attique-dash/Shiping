import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic'; // Ensure the route is dynamic

// First step of registration - basic info
export async function POST(request: Request) {
  try {
    // Connect to database
    await dbConnect();
    
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email already in use',
          nextStep: existingUser.registrationStep > 1 ? '/login' : null
        },
        { status: 400 }
      );
    }

    // Create new user with basic info (step 1)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save hook
      registrationStep: 1, // First step completed
      accountStatus: 'pending',
    });

    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    
    // Save the user
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please complete your profile.',
      userId: user._id,
      nextStep: `/register/${user._id}/details`
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    const errorMessage = error.code === 11000 
      ? 'This email is already registered. Please use a different email or login.'
      : 'An error occurred during registration. Please try again.';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}