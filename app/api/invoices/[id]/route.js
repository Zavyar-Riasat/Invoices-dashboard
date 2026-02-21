import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Invoice from '@/app/lib/models/Invoice';
import client from '@/app/lib/models/Client';
import booking from '@/app/lib/models/Booking';
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const invoice = await Invoice.findById(id)
      .populate('booking')
      .populate('client');

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice updated successfully',
      invoice,
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}