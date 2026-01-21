import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Client from '@/app/lib/models/Client';
import mongoose from 'mongoose';

// Helper function to validate ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET single client by ID
export async function GET(request, { params }) {
  console.log('🔵 API: GET /api/clients/[id] called');
  
  try {
    // CORRECT: Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    console.log('📋 Client ID from params:', id);

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      console.log('❌ Invalid ObjectId format:', id);
      return NextResponse.json({
        success: false,
        error: 'Invalid client ID format',
        id: id
      }, { status: 400 });
    }

    // Connect to database
    await dbConnect();
    console.log('✅ Database connected');

    // Find client by ID
    const client = await Client.findById(id).lean();
    
    if (!client) {
      console.log('❌ Client not found:', id);
      return NextResponse.json({
        success: false,
        error: 'Client not found',
        id: id
      }, { status: 404 });
    }

    console.log('✅ Client found:', client._id);

    // Format dates for frontend
    const formattedClient = {
      ...client,
      shiftingDate: client.shiftingDate ? client.shiftingDate.toISOString() : null,
      createdAt: client.createdAt ? client.createdAt.toISOString() : null,
      updatedAt: client.updatedAt ? client.updatedAt.toISOString() : null,
      deliveries: client.deliveries ? client.deliveries.map(delivery => ({
        ...delivery,
        date: delivery.date ? delivery.date.toISOString() : null
      })) : []
    };

    // Return success response
    return NextResponse.json({
      success: true,
      client: formattedClient
    }, {
      status: 200
    });

  } catch (error) {
    console.error('❌ Error in GET /api/clients/[id]:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch client',
      message: error.message
    }, {
      status: 500
    });
  }
}

// PUT update client by ID
export async function PUT(request, { params }) {
  console.log('🟡 API: PUT /api/clients/[id] called');
  
  try {
    // CORRECT: Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    console.log('📋 Client ID from params:', id);

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      console.log('❌ Invalid ObjectId format:', id);
      return NextResponse.json({
        success: false,
        error: 'Invalid client ID format',
        id: id
      }, { status: 400 });
    }

    // Connect to database
    await dbConnect();
    console.log('✅ Database connected');

    // Parse request body
    const body = await request.json();
    console.log('📝 Update data:', body);

    // Check if client exists
    const existingClient = await Client.findById(id);
    if (!existingClient) {
      console.log('❌ Client not found:', id);
      return NextResponse.json({
        success: false,
        error: 'Client not found',
        id: id
      }, { status: 404 });
    }

    // If phone is being updated, check for duplicates
    if (body.phone && body.phone !== existingClient.phone) {
      // More flexible phone validation
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      const cleanedPhone = body.phone.replace(/[\s\-\(\)]/g, '');
      
      if (!phoneRegex.test(body.phone) || cleanedPhone.length < 10) {
        console.log('❌ Invalid phone:', body.phone);
        return NextResponse.json({
          success: false,
          error: 'Invalid phone number. Must be at least 10 digits.',
          phone: body.phone
        }, { status: 400 });
      }

      const duplicateClient = await Client.findOne({
        phone: body.phone,
        _id: { $ne: id }
      });

      if (duplicateClient) {
        console.log('❌ Phone already exists:', body.phone);
        return NextResponse.json({
          success: false,
          error: 'Another client with this phone number already exists'
        }, { status: 409 });
      }
    }

    // Prepare update data
    const updateData = {};
    
    if (body.name) updateData.name = body.name.trim();
    if (body.phone) updateData.phone = body.phone.trim();
    if (body.email) updateData.email = body.email.trim().toLowerCase();
    if (body.address) updateData.address = body.address.trim();
    if (body.shiftingDate) {
      const shiftingDate = new Date(body.shiftingDate);
      updateData.shiftingDate = shiftingDate;
    }
    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes.trim();
    
    updateData.updatedAt = new Date();

    console.log('📊 Updating client with data:', updateData);
    
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).lean();

    console.log('✅ Client updated successfully:', updatedClient._id);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Client updated successfully',
      client: {
        ...updatedClient,
        shiftingDate: updatedClient.shiftingDate ? updatedClient.shiftingDate.toISOString() : null,
        createdAt: updatedClient.createdAt ? updatedClient.createdAt.toISOString() : null,
        updatedAt: updatedClient.updatedAt ? updatedClient.updatedAt.toISOString() : null
      }
    }, {
      status: 200
    });

  } catch (error) {
    console.error('❌ Error in PUT /api/clients/[id]:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        validationErrors: errors
      }, { status: 400 });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'Phone number already exists'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update client',
      message: error.message
    }, {
      status: 500
    });
  }
}

// DELETE client by ID
export async function DELETE(request, { params }) {
  console.log('🔴 API: DELETE /api/clients/[id] called');
  
  try {
    // CORRECT: Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    console.log('📋 Client ID from params:', id);

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      console.log('❌ Invalid ObjectId format:', id);
      return NextResponse.json({
        success: false,
        error: 'Invalid client ID format',
        id: id
      }, { status: 400 });
    }

    // Connect to database
    await dbConnect();
    console.log('✅ Database connected');

    // Find and delete client
    const deletedClient = await Client.findByIdAndDelete(id);
    
    if (!deletedClient) {
      console.log('❌ Client not found:', id);
      return NextResponse.json({
        success: false,
        error: 'Client not found',
        id: id
      }, { status: 404 });
    }

    console.log('✅ Client deleted successfully:', deletedClient._id);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
      client: {
        id: deletedClient._id,
        name: deletedClient.name,
        phone: deletedClient.phone
      }
    }, {
      status: 200
    });

  } catch (error) {
    console.error('❌ Error in DELETE /api/clients/[id]:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete client',
      message: error.message
    }, {
      status: 500
    });
  }
}

// PATCH add delivery to client
export async function PATCH(request, { params }) {
  console.log('🟣 API: PATCH /api/clients/[id] called');
  
  try {
    // CORRECT: Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    console.log('📋 Client ID from params:', id);

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      console.log('❌ Invalid ObjectId format:', id);
      return NextResponse.json({
        success: false,
        error: 'Invalid client ID format',
        id: id
      }, { status: 400 });
    }

    // Connect to database
    await dbConnect();
    console.log('✅ Database connected');

    // Parse request body
    const body = await request.json();
    console.log('📝 Delivery data:', body);

    // Check if client exists
    const client = await Client.findById(id);
    if (!client) {
      console.log('❌ Client not found:', id);
      return NextResponse.json({
        success: false,
        error: 'Client not found',
        id: id
      }, { status: 404 });
    }

    // Validate delivery data
    if (!body.amount || isNaN(parseFloat(body.amount))) {
      return NextResponse.json({
        success: false,
        error: 'Invalid delivery amount',
        amount: body.amount
      }, { status: 400 });
    }

    const delivery = {
      date: body.date ? new Date(body.date) : new Date(),
      amount: parseFloat(body.amount),
      status: body.status || 'completed',
      notes: body.notes || ''
    };

    // Add delivery to client
    client.deliveries.push(delivery);
    
    // Recalculate totals
    client.totalDeliveries = client.deliveries.length;
    client.totalSpent = client.deliveries.reduce((sum, d) => sum + d.amount, 0);
    
    await client.save();
    
    console.log('✅ Delivery added successfully to client:', client._id);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Delivery added successfully',
      client: {
        id: client._id,
        name: client.name,
        totalDeliveries: client.totalDeliveries,
        totalSpent: client.totalSpent,
        delivery: {
          ...delivery,
          date: delivery.date.toISOString()
        }
      }
    }, {
      status: 200
    });

  } catch (error) {
    console.error('❌ Error in PATCH /api/clients/[id]:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to add delivery',
      message: error.message
    }, {
      status: 500
    });
  }
}