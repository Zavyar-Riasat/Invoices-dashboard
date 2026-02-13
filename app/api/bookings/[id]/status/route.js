import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Booking from '@/app/lib/models/Booking';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const { status } = await request.json();
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking status' },
      { status: 500 }
    );
  }
}