import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Shipment, { IStatusUpdate } from '@/models/Shipment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Types } from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid shipment ID' }, { status: 400 });
    }

    const shipment = await Shipment.findById(params.id)
      .populate('package', 'tracking_number user_code description weight status');

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    return NextResponse.json(shipment);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipment' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid shipment ID' }, { status: 400 });
    }

    const { status, location, notes } = await req.json();
    
    const update: any = {
      'currentLocation.lat': location.lat,
      'currentLocation.lng': location.lng,
      'currentLocation.address': location.address || 'Address not specified',
      'currentLocation.lastUpdated': new Date()
    };

    if (status) {
      update.status = status;
    }

    const shipment = await Shipment.findByIdAndUpdate(
      params.id,
      { $set: update },
      { new: true }
    );

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Add to status history
    const statusUpdate: IStatusUpdate = {
      status: status || shipment.status,
      location: {
        lat: location.lat,
        lng: location.lng
      },
      address: location.address || 'Address not specified',
      timestamp: new Date(),
      notes: notes || 'Location updated'
    };

    await Shipment.updateOne(
      { _id: params.id },
      { $push: { statusHistory: statusUpdate } }
    );

    return NextResponse.json({
      ...shipment.toObject(),
      statusHistory: [...shipment.statusHistory, statusUpdate]
    });
  } catch (error) {
    console.error('Error updating shipment:', error);
    return NextResponse.json(
      { error: 'Failed to update shipment' },
      { status: 500 }
    );
  }
}
