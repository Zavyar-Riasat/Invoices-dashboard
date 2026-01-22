import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Item from '@/app/lib/models/Item';

// GET all items with search, filter, and pagination
export async function GET(request) {
  console.log('📦 API: GET /api/items called');
  
  try {
    await dbConnect();
    console.log('✅ Database connected');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    
    console.log('📋 Query params:', { 
      page, limit, search, category, sortBy, sortOrder, activeOnly 
    });

    // Build query
    let query = {};
    
    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter active items
    if (activeOnly) {
      query.isActive = true;
    }
    
    // Set sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query
    const items = await Item.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    // Get total count
    const total = await Item.countDocuments(query);
    
    console.log(`✅ Found ${items.length} items (total: ${total})`);
    
    return NextResponse.json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      },
      filters: {
        categories: await Item.distinct('category'),
        activeOnly
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error in GET /api/items:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch items',
      message: error.message
    }, { status: 500 });
  }
}

// POST create new item
export async function POST(request) {
  console.log('📦 API: POST /api/items called');
  
  try {
    await dbConnect();
    console.log('✅ Database connected');

    const body = await request.json();
    console.log('📝 Request body:', body);

    // Validate required fields
    const requiredFields = ['name', 'category', 'basePrice', 'unit'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        missingFields,
        requiredFields
      }, { status: 400 });
    }

    // Check if item with same name exists
    const existingItem = await Item.findOne({ 
      name: { $regex: `^${body.name}$`, $options: 'i' } 
    });
    
    if (existingItem) {
      console.log('❌ Item name already exists:', body.name);
      return NextResponse.json({
        success: false,
        error: 'Item with this name already exists',
        itemId: existingItem._id,
        existingItem: {
          name: existingItem.name,
          category: existingItem.category
        }
      }, { status: 409 });
    }

    // Create new item
    const itemData = {
      name: body.name.trim(),
      description: body.description?.trim() || '',
      category: body.category,
      basePrice: parseFloat(body.basePrice),
      unit: body.unit,
      size: body.size || 'Medium',
      difficulty: body.difficulty || 'Medium',
      imageUrl: body.imageUrl?.trim() || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      notes: body.notes?.trim() || ''
    };

    console.log('📊 Creating item with data:', itemData);
    
    const item = await Item.create(itemData);
    
    console.log('✅ Item created successfully:', item._id);

    return NextResponse.json({
      success: true,
      message: 'Item created successfully',
      item
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error in POST /api/items:', error);
    
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
      error: 'Failed to create item',
      message: error.message
    }, { status: 500 });
  }
}