import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Quote from '@/app/lib/models/Quote';
import Client from '@/app/lib/models/Client';
import Item from '@/app/lib/models/Item';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET all quotes
export async function GET(request) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    let query = {};

    if (search) {
      query.$or = [
        { quoteNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { clientPhone: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const quotes = await Quote.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Quote.countDocuments(query);

    return NextResponse.json({
      success: true,
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create quote
// POST create quote
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();

    if (!body.client || !body.items?.length) {
      return NextResponse.json(
        { success: false, error: 'Client and items are required' },
        { status: 400 }
      );
    }

    const client = await Client.findById(body.client);
    if (!client) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    // Prepare items with totalPrice calculation
    const itemsWithDetails = await Promise.all(
      body.items.map(async (item) => {
        const dbItem = await Item.findById(item.itemId);
        if (!dbItem) {
          throw new Error(`Item with ID ${item.itemId} not found`);
        }

        const quantity = item.quantity || 1;
        const unitPrice = item.unitPrice || dbItem.basePrice;
        const totalPrice = quantity * unitPrice;

        return {
          itemId: dbItem._id,
          name: dbItem.name,
          quantity: quantity,
          unit: dbItem.unit,
          unitPrice: unitPrice,
          totalPrice: totalPrice, // Make sure this is set!
          notes: item.notes || ''
        };
      })
    );

    // Calculate initial totals for the quote
    const subtotal = itemsWithDetails.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAdditionalCharges = (body.additionalCharges || []).reduce((sum, charge) => sum + (charge.amount || 0), 0);
    const totalDiscount = (body.discounts || []).reduce((sum, discount) => {
      if (discount.type === 'percentage') {
        return sum + (subtotal * (discount.amount / 100));
      }
      return sum + (discount.amount || 0);
    }, 0);
    
    const vatPercentage = body.vatPercentage || 15;
    const vatBase = subtotal + totalAdditionalCharges - totalDiscount;
    const vatAmount = (vatBase * vatPercentage) / 100;
    const grandTotal = vatBase + vatAmount;

    const quoteData = {
      client: client._id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email || '',
      items: itemsWithDetails,
      additionalCharges: body.additionalCharges || [],
      discounts: body.discounts || [],
      vatPercentage: vatPercentage,
      vatAmount: vatAmount, // Include vatAmount
      validityDays: body.validityDays || 30,
      status: body.status || 'draft',
      notes: body.notes || '',
      termsConditions: body.termsConditions || 'Payment due within 30 days. Prices valid for 30 days.',
      subtotal: subtotal,
      totalAdditionalCharges: totalAdditionalCharges,
      totalDiscount: totalDiscount,
      grandTotal: grandTotal,
    };

    const quote = await Quote.create(quoteData);

    return NextResponse.json({ 
      success: true, 
      message: 'Quote created successfully',
      quote 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        validationErrors: errors
      }, { status: 400 });
    }
    
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'Quote number already exists'
      }, { status: 409 });
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create quote' },
      { status: 500 }
    );
  }
}