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
    console.log("📝 Update body:", JSON.stringify(body, null, 2));

    // Prepare the update data
    let updateData = { ...body };

    // Only validate client if it's being updated
    if (body.client) {
      const client = await Client.findById(body.client);
      if (!client) {
        return NextResponse.json(
          { success: false, error: 'Client not found' },
          { status: 404 }
        );
      }

      // Update client details
      updateData.clientName = client.name;
      updateData.clientPhone = client.phone;
      updateData.clientEmail = client.email || '';
    }

    // Ensure items have proper structure with totalPrice calculated
    if (body.items && Array.isArray(body.items)) {
      console.log("📦 Processing items array...");
      updateData.items = body.items.map((item) => {
        const quantity = parseInt(item.quantity) || 1;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const totalPrice = quantity * unitPrice;
        
        return {
          itemId: item.itemId,
          name: item.name,
          quantity: quantity,
          unit: item.unit,
          unitPrice: unitPrice,
          totalPrice: totalPrice,
          notes: item.notes || "",
        };
      });
      console.log("✅ Items processed:", updateData.items);
    }

    // Ensure charges and discounts are properly formatted
    if (body.additionalCharges && Array.isArray(body.additionalCharges)) {
      updateData.additionalCharges = body.additionalCharges.map((charge) => ({
        description: charge.description,
        amount: parseFloat(charge.amount) || 0,
        type: charge.type,
      }));
    }

    if (body.discounts && Array.isArray(body.discounts)) {
      updateData.discounts = body.discounts.map((discount) => ({
        description: discount.description,
        amount: parseFloat(discount.amount) || 0,
        type: discount.type,
      }));
    }

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
    console.log("💾 Updated quote data:", JSON.stringify(quote, null, 2));

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