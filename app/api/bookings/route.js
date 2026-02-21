import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Booking from '../../lib/models/Booking';
import Client from '../../lib/models/Client';
import Quote from '../../lib/models/Quote';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    let query = {};

    if (search) {
      query.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { clientPhone: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('client', 'name phone email')
      .populate('quote', 'quoteNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Booking.countDocuments(query);

    return NextResponse.json({
      success: true,
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error.message, error.stack);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    console.log('Creating booking with data:', body);

    // Validate required fields
    if (!body.client) {
      return NextResponse.json(
        { success: false, error: 'Client is required' },
        { status: 400 }
      );
    }

    if (!body.shiftingDate || !body.shiftingTime) {
      return NextResponse.json(
        { success: false, error: 'Shifting date and time are required' },
        { status: 400 }
      );
    }

    if (!body.pickupAddress || !body.deliveryAddress) {
      return NextResponse.json(
        { success: false, error: 'Pickup and delivery addresses are required' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Calculate items total
    const itemsTotal = body.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice),
      0
    );

    // Calculate extra charges total
    const extraChargesTotal = (body.extraCharges || []).reduce(
      (sum, charge) => sum + (charge.amount || 0),
      0
    );

    // Calculate subtotal (items + extra charges)
    const subtotal = itemsTotal + extraChargesTotal;

    // Calculate VAT
    const vatPercentage = parseFloat(body.vatPercentage) || 15;
    const vatAmount = Math.round(subtotal * (vatPercentage / 100) * 100) / 100; // Round to 2 decimals
    
    // Grand total includes VAT
    const totalAmount = subtotal + vatAmount;
    
    // Ensure advance amount is a number
    const advanceAmount = parseFloat(body.advanceAmount) || 0;
    
    // Calculate remaining (after advance payment)
    const remainingAmount = Math.max(0, totalAmount - advanceAmount);

    // Prepare payment history if there's an advance payment
    const paymentHistory = [];
    const payments = [];

    // If there's an advance amount and payment method, create a payment record
    if (advanceAmount > 0 && body.payments && body.payments.length > 0) {
      const payment = body.payments[0];
      
      // Map payment method to allowed values for paymentHistory
      let paymentHistoryMethod = 'cash'; // default
      if (payment.paymentMethod === 'credit_card' || payment.paymentMethod === 'debit_card') {
        paymentHistoryMethod = 'card';
      } else if (payment.paymentMethod === 'bank_transfer') {
        paymentHistoryMethod = 'bank_transfer';
      } else if (payment.paymentMethod === 'cheque') {
        paymentHistoryMethod = 'check';
      } else if (payment.paymentMethod === 'cash') {
        paymentHistoryMethod = 'cash';
      }
      
      // Add to paymentHistory
      paymentHistory.push({
        amount: advanceAmount,
        method: paymentHistoryMethod,
        date: new Date(),
        notes: 'Advance payment at booking creation',
      });

      // Add to payments array (this one can keep the original method as it has a different enum)
      payments.push({
        amount: advanceAmount,
        paymentDate: new Date(),
        paymentMethod: payment.paymentMethod,
        notes: 'Advance payment at booking creation',
        status: 'completed'
      });
    }

    // Prepare booking data
    const bookingData = {
      client: body.client,
      clientName: body.clientName,
      clientPhone: body.clientPhone,
      clientEmail: body.clientEmail || '',
      shiftingDate: new Date(body.shiftingDate),
      shiftingTime: body.shiftingTime,
      pickupAddress: body.pickupAddress,
      deliveryAddress: body.deliveryAddress,
      items: body.items.map(item => ({
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      })),
      // Add extra charges
      extraCharges: body.extraCharges || [],
      subtotal,
      vatPercentage,
      vatAmount,
      totalAmount,
      advanceAmount,
      remainingAmount,
      paymentHistory,
      payments,
      assignedStaff: body.assignedStaff || [],
      notes: body.notes || '',
      specialInstructions: body.specialInstructions || '',
      status: body.status || 'pending',
    };

    // Add quote reference if provided
    if (body.quote) {
      bookingData.quote = body.quote;
      
      // Update quote status to converted
      await Quote.findByIdAndUpdate(body.quote, {
        status: 'converted',
        convertedToBooking: true,
      });
    }

    console.log('Booking data being saved:', JSON.stringify(bookingData, null, 2));
    const booking = await Booking.create(bookingData);

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      console.error('Validation errors:', errors);
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        validationErrors: errors,
      }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}