import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Invoice from '@/app/lib/models/Invoice';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    const { signature, signedBy } = body;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    invoice.signature = {
      data: signature,
      signedBy: signedBy || invoice.clientName,
      signedAt: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
    };

    invoice.deliveryConfirmed = true;
    invoice.deliveryConfirmedAt = new Date();

    await invoice.save();

    return NextResponse.json({
      success: true,
      message: 'Signature saved successfully',
      invoice,
    });
  } catch (error) {
    console.error('Error saving signature:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}