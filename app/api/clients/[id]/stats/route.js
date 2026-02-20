import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Client from '@/app/lib/models/Client';
import Booking from '@/app/lib/models/Booking';
import mongoose from 'mongoose';

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid client ID format'
      }, { status: 400 });
    }

    await dbConnect();

    const client = await Client.findById(id).lean();
    if (!client) {
      return NextResponse.json({
        success: false,
        error: 'Client not found'
      }, { status: 404 });
    }

    // Fetch all bookings for this client
    const bookings = await Booking.find({ client: id }).lean();

    // Calculate statistics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const pendingBookings = bookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length;
    
    // Calculate total remaining amount
    const totalRemaining = bookings.reduce((total, booking) => {
      const grandTotal = (booking.subtotal || booking.totalAmount || 0) + (booking.vatAmount || 0);
      const totalPaid = booking.paymentHistory 
        ? booking.paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0)
        : (booking.advanceAmount || 0);
      return total + Math.max(0, grandTotal - totalPaid);
    }, 0);

    // Calculate total spent (completed payments only)
    const totalSpent = bookings.reduce((total, booking) => {
      const paid = booking.paymentHistory 
        ? booking.paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0)
        : (booking.advanceAmount || 0);
      return total + paid;
    }, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalBookings,
        completedBookings,
        pendingBookings,
        totalRemaining,
        totalSpent,
        averageBookingValue: totalBookings > 0 ? totalSpent / totalBookings : 0
      }
    });

  } catch (error) {
    console.error('Error fetching client stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch client statistics'
    }, { status: 500 });
  }
}