"use client"

import { useEffect, useState, useRef } from "react"
import { Loader2, Printer, TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, BarChart3, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { TransactionForm } from "@/components/admin/TransactionForm"
import { Receipt } from "@/components/admin/Receipt"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

interface AnalyticsData {
  summary: {
    totalRevenue: number
    totalCost: number
    totalProfit: number
    profitMargin: number
    inventoryValue: number
    retailValue: number
    potentialProfit: number
    totalProducts: number
    totalStock: number
    transactionCount: number
  }
  lowStockProducts: Array<{ _id: string; name: string; stock: number; image: string }>
  bestSellers: Array<{ productId: string; name: string; quantity: number; revenue: number }>
  categoryBreakdown: Array<{ name: string; count: number; value: number; revenue: number }>
  salesTrend: Array<{ date: string; revenue: number }>
  transactions: Array<{
    _id: string
    date: string
    productName: string
    quantity: number
    sellingPrice: number
    costPrice: number
    revenue: number
    cost: number
    profit: number
    margin: number
  }>
}

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6'];

export default function InventoryDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const receiptRef = useRef<HTMLDivElement>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      let url = "/api/reports/analytics"
      const params = new URLSearchParams()
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)
      if (params.toString()) url += `?${params.toString()}`
      
      const res = await fetch(url)
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error("Failed to fetch analytics data", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handlePrint = () => {
    const printContent = receiptRef.current
    if (printContent) {
      const originalContents = document.body.innerHTML
      document.body.innerHTML = printContent.outerHTML
      window.print()
      document.body.innerHTML = originalContents
      window.location.reload()
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>
  }

  const summary = data?.summary ?? { totalRevenue: 0, totalProfit: 0, totalCost: 0, profitMargin: 0, inventoryValue: 0, retailValue: 0, potentialProfit: 0, totalProducts: 0, totalStock: 0, transactionCount: 0 }
  const transactions = data?.transactions ?? []
  const lowStockProducts = data?.lowStockProducts ?? []
  const bestSellers = data?.bestSellers ?? []
  const categoryBreakdown = data?.categoryBreakdown ?? []
  const salesTrend = data?.salesTrend ?? []

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Dashboard</h2>
          <p className="text-muted-foreground">Complete overview of your stock, sales, and profitability.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border p-2 rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="h-8 w-32 border-0 focus-visible:ring-0 px-0"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="h-8 w-32 border-0 focus-visible:ring-0 px-0"
            />
            <Button size="sm" variant="outline" onClick={fetchData}>Apply</Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{summary.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary.transactionCount} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₦{summary.totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary.profitMargin.toFixed(1)}% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{summary.inventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary.totalStock} items in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Profit</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{summary.potentialProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Expected return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.profitMargin.toFixed(1)}%</div>
            <Progress value={summary.profitMargin} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Sales Trend (Last 7 Days)
            </CardTitle>
            <CardDescription>Daily revenue overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                  />
                  <YAxis tickFormatter={(value) => `₦${value}`} />
                  <Tooltip 
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--primary)" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Category Breakdown
            </CardTitle>
            <CardDescription>Revenue by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {categoryBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Low Stock Alert */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Products with less than 10 items</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">All products well stocked!</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="font-medium truncate">{product.name}</span>
                    <Badge variant={product.stock === 0 ? "destructive" : "secondary"} className="ml-2">
                      {product.stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Best Sellers */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Best Sellers
            </CardTitle>
            <CardDescription>Top performing products</CardDescription>
          </CardHeader>
          <CardContent>
            {bestSellers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No sales recorded yet</p>
            ) : (
              <div className="space-y-3">
                {bestSellers.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-600">#{index + 1}</span>
                      <span className="font-medium truncate">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">₦{product.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{product.quantity} sold</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Form */}
        <TransactionForm onSuccess={fetchData} />
      </div>

      {/* Transactions Table */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="variance">Profit Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Latest transactions recorded.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 10).map((t) => (
                    <TableRow key={t._id}>
                      <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{t.productName}</TableCell>
                      <TableCell className="text-right">{t.quantity}</TableCell>
                      <TableCell className="text-right">₦{t.revenue.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-bold ${t.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t.profit >= 0 ? '+' : ''}₦{t.profit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-fit">
                            <div className="flex flex-col items-center gap-4">
                              <Receipt ref={receiptRef} transaction={t} />
                              <Button onClick={handlePrint} className="w-full">Print Receipt</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variance">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Variance Report</CardTitle>
              <CardDescription>Analyze profit margins per transaction.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Sold At</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell className="font-medium">{t.productName}</TableCell>
                      <TableCell className="text-right">₦{t.cost.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₦{t.revenue.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-bold ${t.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₦{t.profit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={t.margin >= 20 ? "default" : t.margin >= 0 ? "outline" : "destructive"}>
                          {t.margin.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
