import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Booking from '@/app/lib/models/Booking';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    // Build query
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { clientPhone: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (dateFrom || dateTo) {
      query.shiftingDate = {};
      if (dateFrom) {
        query.shiftingDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.shiftingDate.$lte = new Date(dateTo);
      }
    }
    
    // Execute query
    const bookings = await Booking.find(query)
      .sort({ shiftingDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    const total = await Booking.countDocuments(query);
    
    // Get statistics
    const stats = {
      total: await Booking.countDocuments(),
      pending: await Booking.countDocuments({ status: 'pending' }),
      confirmed: await Booking.countDocuments({ status: 'confirmed' }),
      in_progress: await Booking.countDocuments({ status: 'in_progress' }),
      completed: await Booking.countDocuments({ status: 'completed' }),
      cancelled: await Booking.countDocuments({ status: 'cancelled' }),
    };
    
    return NextResponse.json({
      success: true,
      bookings,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['client', 'shiftingDate', 'shiftingTime', 'pickupAddress', 'deliveryAddress'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Create booking
    const booking = await Booking.create(body);
    
    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}