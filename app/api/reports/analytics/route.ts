import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Transaction from '@/models/Transaction';
import Product from '@/models/Product';

const ensureDb = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }
};

export async function GET(req: Request) {
  try {
    await ensureDb();
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Date range filter
    const dateFilter: Record<string, Date | Record<string, Date>> = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    const transactionQuery: Record<string, unknown> = { type: 'SELL' };
    if (Object.keys(dateFilter).length > 0) {
      transactionQuery.date = dateFilter;
    }

    // Fetch all products for calculations
    const products = await Product.find({});
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // Calculate Total Inventory Value (Stock * CostPrice)
    const inventoryValue = products.reduce((acc, p) => {
      const cost = p.costPrice || 0;
      return acc + (p.stock * cost);
    }, 0);

    // Calculate Retail Value (Stock * Price)
    const retailValue = products.reduce((acc, p) => {
      return acc + (p.stock * p.price);
    }, 0);

    // Low Stock Products (< 10 items)
    const lowStockProducts = products
      .filter(p => p.stock < 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5)
      .map(p => ({
        _id: p._id,
        name: p.name,
        stock: p.stock,
        image: p.image
      }));

    // Get all SELL transactions  
    const allSales = await Transaction.find(transactionQuery).sort({ date: -1 });

    // Best Selling Products (by quantity sold)
    const salesByProduct = new Map<string, { name: string; quantity: number; revenue: number }>();
    allSales.forEach(sale => {
      const existing = salesByProduct.get(sale.productId) || { name: sale.productName, quantity: 0, revenue: 0 };
      existing.quantity += sale.quantity;
      existing.revenue += sale.total;
      salesByProduct.set(sale.productId, existing);
    });

    const bestSellers = Array.from(salesByProduct.entries())
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 5)
      .map(([productId, data]) => ({
        productId,
        ...data
      }));

    // Category Breakdown
    const categoryStats = new Map<string, { count: number; value: number; revenue: number }>();
    products.forEach(p => {
      const category = p.category || 'Uncategorized';
      const existing = categoryStats.get(category) || { count: 0, value: 0, revenue: 0 };
      existing.count += p.stock;
      existing.value += p.stock * (p.costPrice || 0);
      categoryStats.set(category, existing);
    });

    // Add revenue to category stats from sales
    allSales.forEach(sale => {
      const product = productMap.get(sale.productId);
      if (product) {
        const category = product.category || 'Uncategorized';
        const existing = categoryStats.get(category) || { count: 0, value: 0, revenue: 0 };
        existing.revenue += sale.total;
        categoryStats.set(category, existing);
      }
    });

    const categoryBreakdown = Array.from(categoryStats.entries()).map(([name, stats]) => ({
      name,
      ...stats
    }));

    // Sales Trend (Last 7 days)
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const salesByDay = new Map<string, number>();
    last7Days.forEach(day => salesByDay.set(day, 0));

    allSales.forEach(sale => {
      const day = new Date(sale.date).toISOString().split('T')[0];
      if (salesByDay.has(day)) {
        salesByDay.set(day, (salesByDay.get(day) || 0) + sale.total);
      }
    });

    const salesTrend = last7Days.map(day => ({
      date: day,
      revenue: salesByDay.get(day) || 0
    }));

    // Variance Data for profit analysis
    const varianceData = allSales.map(sale => {
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
        totalProfit,
        profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        inventoryValue,
        retailValue,
        potentialProfit: retailValue - inventoryValue,
        totalProducts: products.length,
        totalStock: products.reduce((acc, p) => acc + p.stock, 0),
        transactionCount: allSales.length
      },
      lowStockProducts,
      bestSellers,
      categoryBreakdown,
      salesTrend,
      transactions: varianceData
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
