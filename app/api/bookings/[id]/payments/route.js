import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Booking from '../../../../lib/models/Booking';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    // IMPORTANT: params needs to be awaited in Next.js 13/14
    const { id } = await params;
    
    console.log("🔍 Extracted ID after await:", id);
    
    if (!id) {
      console.log("❌ No ID provided in params");
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    console.log("💰 Payment data received:", body);

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Find the booking with the exact ID
    console.log("🔍 Attempting to find booking with ID:", id);
    const booking = await Booking.findById(id);
    
    if (!booking) {
      console.log("❌ Booking not found with ID:", id);
      
      // Optional: Check if there are any bookings in the database
      const count = await Booking.countDocuments();
      console.log("📊 Total bookings in database:", count);
      
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    console.log("✅ Booking found:", {
      id: booking._id.toString(),
      bookingNumber: booking.bookingNumber,
      clientName: booking.clientName,
      currentTotalPaid: booking.paymentHistory?.reduce((sum, p) => sum + p.amount, 0) || 0
    });

    // Initialize paymentHistory if it doesn't exist
    if (!booking.paymentHistory) {
      booking.paymentHistory = [];
    }

    // Initialize payments array if it doesn't exist
    if (!booking.payments) {
      booking.payments = [];
    }

    // Create new payment object
    const newPayment = {
      amount: body.amount,
      method: body.paymentMethod || 'cash',
      date: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      notes: body.notes || '',
    };

    // Add to paymentHistory
    booking.paymentHistory.push(newPayment);

    // Also add to payments array for backward compatibility
    booking.payments.push({
      amount: body.amount,
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      paymentMethod: body.paymentMethod === 'card' ? 'credit_card' : (body.paymentMethod || 'cash'),
      notes: body.notes,
      status: 'completed'
    });

    // Calculate total paid from paymentHistory
    const totalPaid = booking.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
    
    // Update advanceAmount
    booking.advanceAmount = totalPaid;
    
    // Calculate grand total (subtotal + vat)
    const subtotal = booking.subtotal || 0;
    const vatAmount = booking.vatAmount || 0;
    const grandTotal = subtotal + vatAmount;
    
    // Calculate remaining amount
    booking.remainingAmount = Math.max(0, grandTotal - totalPaid);

    // Save the booking
    await booking.save();

    console.log("✅ Payment recorded successfully");
    console.log("💰 Updated totals:", {
      totalPaid,
      grandTotal,
      remainingAmount: booking.remainingAmount
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Payment recorded successfully',
      payment: newPayment,
      remainingAmount: booking.remainingAmount,
      totalPaid: totalPaid,
      advanceAmount: booking.advanceAmount,
      grandTotal: grandTotal
    });

  } catch (error) {
    console.error('❌ Error recording payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to fetch payment history
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    const booking = await Booking.findById(id)
      .select('paymentHistory payments advanceAmount remainingAmount subtotal vatAmount totalAmount');
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    const totalPaid = booking.paymentHistory?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const grandTotal = (booking.subtotal || 0) + (booking.vatAmount || 0);
    
    return NextResponse.json({
      success: true,
      paymentHistory: booking.paymentHistory || [],
      payments: booking.payments || [],
      summary: {
        totalPaid,
        grandTotal,
        remainingAmount: Math.max(0, grandTotal - totalPaid),
        advanceAmount: booking.advanceAmount || 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}