import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Quote from '../../../lib/models/Quote';
import Client from '../../../lib/models/Client';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    console.log("📦 API: Fetching quote with ID:", id);

    const quote = await Quote.findById(id)
      .populate('client', 'name phone email address')
      .populate('items.itemId', 'name basePrice unit category')
      .lean(); // Use lean() for better performance

    if (!quote) {
      console.log("❌ API: Quote not found with ID:", id);
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }

    console.log("✅ API: Quote found:", quote._id);

    // Format the quote to include client details at the top level
    const formattedQuote = {
      ...quote,
      // Extract client details from the populated client object
      clientName: quote.client?.name || '',
      clientPhone: quote.client?.phone || '',
      clientEmail: quote.client?.email || '',
      // Keep the client ID for reference
      client: quote.client?._id || quote.client,
    };

    return NextResponse.json({ success: true, quote: formattedQuote });
    
  } catch (error) {
    console.error("❌ API Error fetching quote:", error);
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

    console.log("📦 API: Updating quote with ID:", id);

    // Find the client to get updated details
    const client = await Client.findById(body.client);
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Prepare the update data with client details
    const updateData = {
      ...body,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email || '',
    };

    const quote = await Quote.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('client', 'name phone email address')
     .populate('items.itemId', 'name basePrice unit category');

    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }

    console.log("✅ API: Quote updated successfully:", quote._id);

    // Format the response
    const formattedQuote = {
      ...quote.toObject(),
      clientName: quote.client?.name || '',
      clientPhone: quote.client?.phone || '',
      clientEmail: quote.client?.email || '',
      client: quote.client?._id || quote.client,
    };

    return NextResponse.json({
      success: true,
      message: 'Quote updated',
      quote: formattedQuote,
    });
    
  } catch (error) {
    console.error("❌ API Error updating quote:", error);
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
    
    const quote = await Quote.findByIdAndDelete(id);

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
    console.error("❌ API Error deleting quote:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}