import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Connect to database
    await dbConnect();
    
    const { userId } = params;
    const body = await request.json();
    
    const {
      phone,
      address,
      city,
      state,
      zipCode,
      country = 'Jamaica',
      dateOfBirth,
      idType,
      idNumber,
      idExpiry
    } = body;

    // Validate required fields
    if (!phone || !address || !city || !state || !zipCode) {
      return NextResponse.json(
        { success: false, error: 'All address fields are required' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user with additional details
    user.phone = phone;
    user.address = {
      street: address,
      city,
      state,
      zipCode,
      country
    };
    
    // Add optional fields if provided
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (idType) user.idType = idType;
    if (idNumber) user.idNumber = idNumber;
    if (idExpiry) user.idExpiry = new Date(idExpiry);
    
    // Mark registration as complete
    user.registrationStep = 2; // Profile complete
    user.accountStatus = 'active';
    
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      nextStep: '/dashboard'
    });

  } catch (error: unknown) {
    console.error('Profile update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update profile',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
