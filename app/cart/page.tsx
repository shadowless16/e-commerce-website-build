"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartSummary } from "@/components/cart-summary"
import { Button } from "@/components/ui/button"
import { Trash2, ArrowLeft } from "lucide-react"
import { cartStore } from "@/lib/store"
import { showToast } from "@/components/toast"
import type { CartItem, Product } from "@/lib/types"

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(cartStore.getCart())
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data: Product[] = await res.json()
        setProducts(data)
      } catch (err: unknown) {
        console.error("Failed to fetch products for cart:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleRemoveItem = (productId: string) => {
    const product = products.find((p) => p._id === productId)
    cartStore.removeItem(productId)
    setCartItems([...cartStore.getCart()])
    showToast(`${product?.name ?? 'Item'} removed from cart`, "info")
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    cartStore.updateQuantity(productId, quantity)
    setCartItems([...cartStore.getCart()])
  }

  const handleCheckout = () => {
    window.location.href = "/checkout"
  }

  const getProductDetails = (item: CartItem) => {
    return products.find((p) => p._id === item.productId)
  }

  const formattedPrice = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace('NGN', '₦')
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
            <p className="text-muted-foreground">Add items to your cart to get started.</p>
            <Link href="/shop">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="flex items-center gap-4 mb-12">
            <Link href="/shop">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = getProductDetails(item)
                if (!product) return null

                return (
                  <div key={item.productId} className="flex gap-4 border border-border rounded-lg p-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link href={`/product/${product._id}`}>
                        <h3 className="font-semibold hover:text-accent transition-colors">{product.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-4">{formattedPrice(product.discountPrice ?? product.price)} each</p>

                      {/* Quantity Control */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-border rounded-lg w-fit">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-muted"
                          >
                            −
                          </button>
                          <span className="px-4 py-1 border-l border-r border-border">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-muted"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="text-right space-y-4">
                      <p className="font-semibold">{formattedPrice((product.discountPrice ?? product.price) * item.quantity)}</p>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-destructive hover:bg-destructive/10 p-2 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Cart Summary */}
            <div>
              <CartSummary items={cartItems} onCheckout={handleCheckout} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
