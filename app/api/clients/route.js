    import { NextResponse } from 'next/server';
    import dbConnect from '@/app/lib/mongodb';
    import Client from '@/app/lib/models/Client';

    // Helper function for pagination
    function paginate(array, page, limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return array.slice(startIndex, endIndex);
    }

    // GET all clients with search, filter, and pagination
    export async function GET(request) {
    console.log('🔵 API: GET /api/clients called');
    
    try {
        // Connect to database
        await dbConnect();
        console.log('✅ Database connected');

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        
        console.log('📋 Query params:', { 
        page, limit, search, status, sortBy, sortOrder 
        });

        // Build MongoDB query
        let query = {};
        
        // Search in multiple fields
        if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } }
        ];
        console.log('🔍 Search query:', query.$or);
        }
        
        // Filter by status
        if (status && status !== 'all') {
        query.status = status;
        console.log('🏷️ Status filter:', status);
        }
        
        // Set sort order
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        // Execute query with pagination
        const clients = await Client.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
        
        // Get total count for pagination
        const total = await Client.countDocuments(query);
        
        console.log(`✅ Found ${clients.length} clients (total: ${total})`);
        
        // Return success response
        return NextResponse.json({
        success: true,
        clients,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1
        }
        }, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        }
        });

    } catch (error) {
        console.error('❌ Error in GET /api/clients:', error);
        
        // Return error response
        return NextResponse.json({
        success: false,
        error: 'Failed to fetch clients',
        message: error.message,
        timestamp: new Date().toISOString()
        }, {
        status: 500,
        headers: {
            'Content-Type': 'application/json',
        }
        });
    }
    }

    // POST create new client
    export async function POST(request) {
    console.log('🟢 API: POST /api/clients called');
    
    try {
        // Connect to database
        await dbConnect();
        console.log('✅ Database connected');

        // Parse request body
        const body = await request.json();
        console.log('📝 Request body:', body);

        // Validate required fields
        const requiredFields = ['name', 'phone', 'address', 'shiftingDate'];
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

        // Validate phone number format
        const phoneRegex = /^[\+]?[1-9][\d]{1,14}$/;
        const cleanedPhone = body.phone.replace(/[\s\-\(\)]/g, '');
        
        if (!phoneRegex.test(cleanedPhone)) {
        console.log('❌ Invalid phone:', body.phone);
        return NextResponse.json({
            success: false,
            error: 'Invalid phone number format',
            phone: body.phone
        }, { status: 400 });
        }

        // Check if client with same phone already exists
        const existingClient = await Client.findOne({ phone: body.phone });
        if (existingClient) {
        console.log('❌ Phone already exists:', body.phone);
        return NextResponse.json({
            success: false,
            error: 'Client with this phone number already exists',
            clientId: existingClient._id,
            existingClient: {
            name: existingClient.name,
            phone: existingClient.phone
            }
        }, { status: 409 }); // 409 Conflict
        }

        // Validate shifting date (should not be in future)
        const shiftingDate = new Date(body.shiftingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (shiftingDate > today) {
        console.log('❌ Future shifting date:', body.shiftingDate);
        return NextResponse.json({
            success: false,
            error: 'Shifting date cannot be in the future',
            shiftingDate: body.shiftingDate
        }, { status: 400 });
        }

        // Validate email if provided
        if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        console.log('❌ Invalid email:', body.email);
        return NextResponse.json({
            success: false,
            error: 'Invalid email format',
            email: body.email
        }, { status: 400 });
        }

        // Create new client
        const clientData = {
        name: body.name.trim(),
        phone: body.phone.trim(),
        email: body.email ? body.email.trim().toLowerCase() : undefined,
        address: body.address.trim(),
        shiftingDate: shiftingDate,
        status: body.status || 'active',
        notes: body.notes || '',
        totalDeliveries: 0,
        totalSpent: 0,
        deliveries: []
        };

        console.log('📊 Creating client with data:', clientData);
        
        const client = await Client.create(clientData);
        
        console.log('✅ Client created successfully:', client._id);

        // Return success response
        return NextResponse.json({
        success: true,
        message: 'Client created successfully',
        client: {
            ...client.toObject(),
            // Format dates for frontend
            shiftingDate: client.shiftingDate.toISOString(),
            createdAt: client.createdAt.toISOString(),
            updatedAt: client.updatedAt.toISOString()
        }
        }, {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        }
        });

    } catch (error) {
        console.error('❌ Error in POST /api/clients:', error);
        
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
            error: 'Phone number already exists',
            field: Object.keys(error.keyPattern)[0]
        }, { status: 409 });
        }

        // Generic error
        return NextResponse.json({
        success: false,
        error: 'Failed to create client',
        message: error.message,
        timestamp: new Date().toISOString()
        }, {
        status: 500,
        headers: {
            'Content-Type': 'application/json',
        }
        });
    }
    }