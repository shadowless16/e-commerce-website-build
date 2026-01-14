"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Star, ArrowLeft, ShoppingCart } from "lucide-react"
import { cartStore } from "@/lib/store"
import { showToast } from "@/components/toast"
import type { Product, CartItem } from "@/lib/types"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [added, setAdded] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setCart(cartStore.getCart())
    
    const fetchProductData = async () => {
      try {
        const { id } = await params
        const response = await fetch(`/api/products/${id}`)
        if (!response.ok) throw new Error('Product not found')
        const data: Product = await response.json()
        setProduct(data)

        // Fetch related products (same category)
        const relatedRes = await fetch(`/api/products?category=${data.category}`)
        const relatedData: Product[] = await relatedRes.json()
        setRelatedProducts(relatedData.filter(p => p._id !== data._id).slice(0, 4))
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to load product'
        console.error(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchProductData()
  }, [params])

  const formattedPrice = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace('NGN', '₦')
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading product details...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Link href="/shop">
              <Button>Back to Shop</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      cartStore.addItem({
        productId: product._id,
        quantity: 1,
        price: product.price,
      })
    }
    setCart([...cartStore.getCart()])
    setAdded(true)
    showToast(`${quantity} ${quantity === 1 ? "item" : "items"} added to cart!`, "success")
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Link
            href="/shop"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {/* Image */}
            <div className="relative h-96 md:h-[500px] bg-muted rounded-lg overflow-hidden">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>

            {/* Details */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="font-medium">{product.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviews.length} reviews)</span>
                </div>
                <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  {product.discountPrice ? (
                    <>
                      <p className="text-2xl font-bold text-accent">{formattedPrice(product.discountPrice)}</p>
                      <p className="text-lg text-muted-foreground line-through">{formattedPrice(product.price)}</p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold text-accent">{formattedPrice(product.price)}</p>
                  )}
                </div>
                <p className="text-muted-foreground text-lg">{product.description}</p>
              </div>

              {/* Stock Status */}
              <div>
                <p className="text-sm font-medium mb-2">
                  {product.stock > 0 ? (
                    <span className="text-green-600">In Stock ({product.stock} available)</span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Quantity</label>
                  <div className="flex items-center gap-4 border border-border rounded-lg w-fit p-2">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2 py-1">
                      −
                    </button>
                    <span className="w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-2 py-1">
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button onClick={handleAddToCart} disabled={product.stock === 0} size="lg" className="w-full gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  {added ? "Added to Cart!" : "Add to Cart"}
                </Button>
              </div>

              {/* Features */}
              <div className="border-t border-border pt-8">
                <h3 className="font-semibold mb-4">Product Highlights</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-accent">✓</span>
                    <span>Premium quality materials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent">✓</span>
                    <span>Free shipping on all orders</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent">✓</span>
                    <span>30-day money back guarantee</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent">✓</span>
                    <span>Secure checkout</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <Link key={p._id} href={`/product/${p._id}`}>
                    <div className="group cursor-pointer">
                      <div className="relative overflow-hidden bg-muted rounded-lg aspect-square mb-4">
                        <Image
                          src={p.image || "/placeholder.svg"}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{p.name}</h3>
                      <p className="text-lg font-bold mt-2">{formattedPrice(p.discountPrice ?? p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
