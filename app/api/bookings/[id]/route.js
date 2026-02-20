import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Booking from '../../../lib/models/Booking';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const booking = await Booking.findById(id)
      .populate('client', 'name phone email address')
      .populate('quote', 'quoteNumber grandTotal')
      .populate('items.itemId', 'name basePrice unit');
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    
    // Remove fields that shouldn't be directly updated
    const updateData = { ...body };
    delete updateData._id;
    delete updateData.bookingNumber;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        validationErrors: errors,
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const booking = await Booking.findByIdAndDelete(id);
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}