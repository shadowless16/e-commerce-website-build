"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus, Minus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const transactionSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  type: z.enum(["BUY", "SELL"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

export function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "SELL",
      quantity: 1,
      price: 0,
    },
  })

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to load products", err))
  }, [])

  const selectedProductId = form.watch("productId")
  const selectedProduct = products.find((p) => p._id === selectedProductId)

  // Auto-fill price when product is selected
  useEffect(() => {
    if (selectedProduct) {
      const type = form.getValues("type")
      if (type === "SELL") {
        form.setValue("price", selectedProduct.price)
      } else {
        // For BUY, maybe default to 0 or costPrice if available
        form.setValue("price", selectedProduct.costPrice || 0)
      }
    }
  }, [selectedProductId, form.watch("type"), selectedProduct, form])

  const onSubmit = async (data: TransactionFormValues) => {
    setLoading(true)
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Transaction failed")
      }

      toast.success("Transaction recorded successfully")
      form.reset({
        type: data.type, // Keep the same type
        quantity: 1,
        price: 0,
        productId: ""
      })
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={form.watch("type") === "SELL" ? "default" : "outline"}
                className="flex-1"
                onClick={() => form.setValue("type", "SELL")}
              >
                <Minus className="mr-2 h-4 w-4" /> Sell (Out)
              </Button>
              <Button
                type="button"
                variant={form.watch("type") === "BUY" ? "default" : "outline"}
                className="flex-1"
                onClick={() => form.setValue("type", "BUY")}
              >
                <Plus className="mr-2 h-4 w-4" /> Buy (In)
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product</Label>
            {/* Simple Searchable Select Implementation or use Command/Combobox */}
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search product..."
                  className="pl-8 mb-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            <Select
              onValueChange={(val) => form.setValue("productId", val)}
              value={form.watch("productId")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name} (Stock: {product.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.productId && (
              <p className="text-sm text-red-500">{form.formState.errors.productId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                {...form.register("quantity", { valueAsNumber: true })}
              />
              {form.formState.errors.quantity && (
                <p className="text-sm text-red-500">{form.formState.errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Unit Price</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
              )}
            </div>
          </div>

          {selectedProduct && (
             <div className="text-sm text-muted-foreground">
                Total: ₦{(form.watch("quantity") * form.watch("price")).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Record Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
