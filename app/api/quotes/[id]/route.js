import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Quote from '@/app/lib/models/Quote';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const quote = await Quote.findById(params.id)
      .populate('client', 'name phone email address')
      .populate('items.itemId', 'name basePrice unit category');

    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, quote });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();

    const quote = await Quote.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Quote updated',
      quote,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const quote = await Quote.findByIdAndDelete(params.id);

    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Quote deleted',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
