import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Item from '@/app/lib/models/Item';
import mongoose from 'mongoose';

// Helper to validate ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET single item by ID
export async function GET(request, { params }) {
  console.log('📦 API: GET /api/items/[id] called');
  
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    console.log('📋 Item ID:', id);

    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid item ID format'
      }, { status: 400 });
    }

    await dbConnect();
    
    const item = await Item.findById(id).lean();
    
    if (!item) {
      return NextResponse.json({
        success: false,
        error: 'Item not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      item
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error in GET /api/items/[id]:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch item',
      message: error.message
    }, { status: 500 });
  }
}

// PUT update item by ID
export async function PUT(request, { params }) {
  console.log('📦 API: PUT /api/items/[id] called');
  
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    console.log('📋 Item ID:', id);

    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid item ID format'
      }, { status: 400 });
    }

    await dbConnect();
    
    const body = await request.json();
    console.log('📝 Update data:', body);

    // Check if item exists
    const existingItem = await Item.findById(id);
    if (!existingItem) {
      return NextResponse.json({
        success: false,
        error: 'Item not found'
      }, { status: 404 });
    }

    // Check for duplicate name (excluding current item)
    if (body.name && body.name !== existingItem.name) {
      const duplicateItem = await Item.findOne({
        name: { $regex: `^${body.name}$`, $options: 'i' },
        _id: { $ne: id }
      });

      if (duplicateItem) {
        return NextResponse.json({
          success: false,
          error: 'Another item with this name already exists'
        }, { status: 409 });
      }
    }

    // Prepare update data
    const updateData = {};
    
    if (body.name) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.category) updateData.category = body.category;
    if (body.basePrice !== undefined) updateData.basePrice = parseFloat(body.basePrice);
    if (body.unit) updateData.unit = body.unit;
    if (body.size) updateData.size = body.size;
    if (body.difficulty) updateData.difficulty = body.difficulty;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl.trim();
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.notes !== undefined) updateData.notes = body.notes.trim();

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    console.log('✅ Item updated successfully:', updatedItem._id);

    return NextResponse.json({
      success: true,
      message: 'Item updated successfully',
      item: updatedItem
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error in PUT /api/items/[id]:', error);
    
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
        error: 'Item name already exists'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update item',
      message: error.message
    }, { status: 500 });
  }
}

// DELETE item by ID
export async function DELETE(request, { params }) {
  console.log('📦 API: DELETE /api/items/[id] called');
  
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    console.log('📋 Item ID:', id);

    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid item ID format'
      }, { status: 400 });
    }

    await dbConnect();
    
    const deletedItem = await Item.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return NextResponse.json({
        success: false,
        error: 'Item not found'
      }, { status: 404 });
    }

    console.log('✅ Item deleted successfully:', deletedItem._id);

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
      item: {
        id: deletedItem._id,
        name: deletedItem.name
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error in DELETE /api/items/[id]:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete item',
      message: error.message
    }, { status: 500 });
  }
}