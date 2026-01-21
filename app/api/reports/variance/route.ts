import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Transaction from '@/models/Transaction';
import Product from '@/models/Product';
// import { connectToDatabase } from '@/lib/mongoose'; 

const ensureDb = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }
};

export async function GET(req: Request) {
  try {
    await ensureDb();
    
    // Fetch all SELL transactions
    const sales = await Transaction.find({ type: 'SELL' }).sort({ date: -1 });
    
    // Fetch all products to get current cost price
    const products = await Product.find({});
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    const varianceData = sales.map(sale => {
      const product = productMap.get(sale.productId);
      const costPrice = product?.costPrice || 0;
      const revenue = sale.total;
      const cost = costPrice * sale.quantity;
      const profit = revenue - cost;
      
      return {
        _id: sale._id,
        date: sale.date,
        productName: sale.productName,
        quantity: sale.quantity,
        sellingPrice: sale.price,
        costPrice: costPrice,
        revenue,
        cost,
        profit,
        margin: revenue > 0 ? (profit / revenue) * 100 : 0
      };
    });

    const totalRevenue = varianceData.reduce((acc, item) => acc + item.revenue, 0);
    const totalCost = varianceData.reduce((acc, item) => acc + item.cost, 0);
    const totalProfit = totalRevenue - totalCost;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalCost,
        totalProfit
      },
      transactions: varianceData
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
