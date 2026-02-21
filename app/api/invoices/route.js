import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Invoice from '@/app/lib/models/Invoice';
import Booking from '@/app/lib/models/Booking';

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
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const invoices = await Invoice.find(query)
      .populate('booking', 'bookingNumber shiftingDate')
      .populate('client', 'name phone email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Invoice.countDocuments(query);

    return NextResponse.json({
      success: true,
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { bookingId } = body;

    console.log('🔍 Creating invoice for booking:', bookingId);

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate('client')
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    console.log('✅ Booking found:', {
      id: booking._id,
      clientName: booking.clientName,
      itemsCount: booking.items?.length,
      extraChargesCount: booking.extraCharges?.length
    });

    // Calculate items total
    const itemsTotal = booking.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
    
    // Calculate extra charges total
    const extraChargesTotal = (booking.extraCharges || []).reduce((sum, charge) => sum + (charge.amount || 0), 0);
    
    // Calculate subtotal (items + extra charges)
    const subtotal = itemsTotal + extraChargesTotal;
    
    // Calculate total amount (subtotal + VAT)
    const totalAmount = subtotal + (booking.vatAmount || 0);
    
    // Calculate amount paid from payment history
    const amountPaid = booking.paymentHistory?.reduce((sum, p) => sum + (p.amount || 0), 0) || booking.advanceAmount || 0;
    const remainingAmount = Math.max(0, totalAmount - amountPaid);

    // Determine payment status
    let paymentStatus = 'unpaid';
    if (remainingAmount === 0) {
      paymentStatus = 'paid';
    } else if (amountPaid > 0 && remainingAmount > 0) {
      paymentStatus = 'partial';
    }

    // Prepare items for invoice - ensure no _id fields
    const itemsForInvoice = (booking.items || []).map(item => ({
      name: item.name || '',
      quantity: item.quantity || 0,
      unit: item.unit || 'pc',
      unitPrice: item.unitPrice || 0,
      totalPrice: item.totalPrice || 0,
    }));

    // Prepare extra charges for invoice
    const extraChargesForInvoice = (booking.extraCharges || []).map(charge => ({
      description: charge.description || 'Extra charge',
      amount: typeof charge.amount === 'number' ? charge.amount : parseInt(charge.amount) || 0,
      type: charge.type || 'other',
      date: charge.date ? new Date(charge.date) : new Date(),
      notes: charge.notes || '',
    }));

    // Check if invoice already exists for this booking
    const existingInvoice = await Invoice.findOne({ booking: booking._id });
    if (existingInvoice) {
      return NextResponse.json({
        success: false,
        error: 'Invoice already exists for this booking',
        invoiceId: existingInvoice._id,
      }, { status: 400 });
    }

    // Create invoice data WITHOUT invoiceNumber (it will be generated in pre-validate hook)
    const invoiceData = {
      booking: booking._id,
      client: booking.client?._id || booking.client,
      clientName: booking.clientName,
      clientPhone: booking.clientPhone,
      clientEmail: booking.clientEmail || '',
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      items: itemsForInvoice,
      extraCharges: extraChargesForInvoice,
      subtotal,
      vatPercentage: booking.vatPercentage || 15,
      vatAmount: booking.vatAmount || 0,
      totalAmount,
      amountPaid,
      remainingAmount,
      paymentStatus,
      status: 'draft',
    };

    console.log('📄 Creating invoice with data:', JSON.stringify(invoiceData, null, 2));

    // Create invoice - invoiceNumber will be generated in pre-validate hook
    const invoice = new Invoice(invoiceData);
    await invoice.save();

    console.log('✅ Invoice created successfully:', {
      id: invoice._id,
      number: invoice.invoiceNumber
    });

    // Update booking with invoice reference
    await Booking.findByIdAndUpdate(booking._id, {
      invoiceGenerated: true,
      invoiceId: invoice._id,
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      invoice,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    
    // Detailed error logging
    if (error.name === 'ValidationError') {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = {
          message: error.errors[field].message,
          value: error.errors[field].value,
          kind: error.errors[field].kind,
          path: error.errors[field].path
        };
      }
      console.error('Validation errors details:', JSON.stringify(errors, null, 2));
      
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        validationErrors: errors,
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}