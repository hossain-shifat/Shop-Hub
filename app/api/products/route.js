import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import Product from '@/backend/src/models/Product';

// GET all products
export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

        let query = {};
        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        const products = await Product.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, products }, { status: 200 });
    } catch (error) {
        console.error('Get products error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to get products' },
            { status: 500 }
        );
    }
}

// POST new product
export async function POST(req) {
    try {
        await connectDB();

        const productData = await req.json();

        if (!productData.name || !productData.price || !productData.category) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Check for duplicate
        const existingProduct = await Product.findOne({
            name: { $regex: new RegExp(`^${productData.name}$`, 'i') },
            category: productData.category
        });

        if (existingProduct) {
            return NextResponse.json({ message: 'Product already exists' }, { status: 400 });
        }

        const newProduct = new Product(productData);
        await newProduct.save();

        return NextResponse.json(
            { message: 'Product added successfully', product: newProduct },
            { status: 201 }
        );
    } catch (error) {
        console.error('Add product error:', error);
        return NextResponse.json(
            { message: 'Failed to add product', error: error.message },
            { status: 500 }
        );
    }
}
