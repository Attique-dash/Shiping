import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Shipment, { IShipment } from '@/models/Shipment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Create a new shipment
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId, currentLocation } = await req.json();
    
    if (!packageId || !currentLocation) {
      return NextResponse.json(
        { error: 'Package ID and current location are required' },
        { status: 400 }
      );
    }

    const shipment = new Shipment({
      package: packageId,
      currentLocation: {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        address: currentLocation.address || 'Address not specified',
        lastUpdated: new Date()
      },
      status: 'pending'
    });

    await shipment.save();

    return NextResponse.json(shipment, { status: 201 });
  } catch (error) {
    console.error('Error creating shipment:', error);
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
}

// Get all shipments with optional filters
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const [shipments, total] = await Promise.all([
      Shipment.find(query)
        .populate('package', 'tracking_number user_code description weight status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Shipment.countDocuments(query)
    ]);

    return NextResponse.json({
      data: shipments,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}
