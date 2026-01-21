import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Transaction from '@/models/Transaction';
import Product from '@/models/Product';
import { connectToDatabase } from '@/lib/mongoose'; // Assuming this exists, based on other files usually present

// Helper to ensure DB connection
const ensureDb = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }
};

export async function POST(req: Request) {
  try {
    await ensureDb();
    const body = await req.json();
    const { type, productId, quantity, price } = body;

    // Validate input
    if (!['BUY', 'SELL'].includes(type) || !productId || !quantity || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update stock based on transaction type
    if (type === 'BUY') {
      product.stock += quantity;
      // Optionally update costPrice if it's a new purchase? 
      // For now, let's keep it simple or maybe update weighted average in future.
      if (body.updateCostPrice) {
         product.costPrice = price; 
      }
    } else if (type === 'SELL') {
      if (product.stock < quantity) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }
      product.stock -= quantity;
    }

    await product.save();

    const transaction = await Transaction.create({
      type,
      productId,
      productName: product.name,
      quantity,
      price,
      total: quantity * price,
      date: new Date(),
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await ensureDb();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    
    const query: any = {};
    if (productId) query.productId = productId;

    const transactions = await Transaction.find(query).sort({ date: -1 });
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
