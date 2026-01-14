import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

// Helper to ensure category exists
async function ensureCategoryExists(categoryName: string) {
  if (!categoryName) return;
  const slug = categoryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  const existing = await Category.findOne({ name: categoryName });
  if (!existing) {
    await Category.create({
      _id: `cat_${Date.now()}`,
      name: categoryName,
      slug,
      image: '/placeholder.svg' // Default image
    });
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = {};
    if (category) {
      query = { category };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Ensure category exists
    await ensureCategoryExists(body.category);
    
    // Generate simple ID if missing
    if (!body._id) {
      body._id = `prod_${Date.now()}`;
    }
    
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
