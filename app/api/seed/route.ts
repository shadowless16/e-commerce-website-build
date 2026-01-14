import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { categories as mockCategories, products as mockProducts } from '@/lib/mock-data';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Seed Categories
    await Category.insertMany(mockCategories);
    
    // Adjust prices for Nigerian market (realistic values)
    const nigerianProducts = mockProducts.map(p => {
      let price = p.price;
      let discountPrice = undefined;

      if (p.name.includes("Headphones")) {
        price = 185000;
        discountPrice = 150000;
      }
      else if (p.name.includes("Watch")) price = 75000;
      else if (p.name.includes("Lamp")) price = 25000;
      else if (p.name.includes("Serum")) {
        price = 45000;
        discountPrice = 35000;
      }
      else if (p.name.includes("Sunglasses")) price = 95000;
      else if (p.name.includes("Home Hub")) price = 120000;
      
      return {
        ...p,
        price: price,
        discountPrice: discountPrice
      };
    });

    await Product.insertMany(nigerianProducts);

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
