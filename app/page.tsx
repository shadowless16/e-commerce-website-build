"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductGrid } from "@/components/product-grid"
import { TestimonialSection } from "@/components/testimonial-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { Button } from "@/components/ui/button"
import { cartStore } from "@/lib/store"
import type { Product, Category, CartItem } from "@/lib/types"

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setCart(cartStore.getCart())
    
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ])
        
        if (!prodRes.ok || !catRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const prodData: Product[] = await prodRes.json()
        const catData: Category[] = await catRes.json()
        
        setProducts(prodData)
        setCategories(catData)
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred'
        console.error("Failed to fetch data:", errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddToCart = (product: Product) => {
    cartStore.addItem({
      productId: product._id,
      quantity: 1,
      price: product.price,
    })
    setCart([...cartStore.getCart()])
  }

  const featuredProducts = products.slice(0, 4)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-accent/10 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
                  Discover Premium <span className="text-accent">Quality</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Curated collection of exceptional products for those who demand the best. Experience luxury redefined.
                </p>
                <div className="flex gap-4">
                  <Link href="/shop">
                    <Button size="lg" className="gap-2">
                      Shop Now
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative h-96 hidden md:block">
                <Image src="/abstract-beauty.png" alt="Premium products" fill className="object-cover rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12">Shop by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link key={category._id} href={`/shop?category=${category.slug}`}>
                  <div className="group relative overflow-hidden rounded-lg h-48 cursor-pointer">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <h3 className="text-white font-bold text-lg">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
              <p className="text-muted-foreground max-w-2xl">
                Handpicked selection of our most popular and highly-rated items.
              </p>
            </div>
            <ProductGrid products={featuredProducts} onAddToCart={handleAddToCart} />
            <div className="text-center mt-12">
              <Link href="/shop">
                <Button variant="outline" size="lg">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Promo Banner */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Special Offer</h2>
            <p className="mb-6 opacity-90">Get 15% off on your first order with code: WELCOME15</p>
            <Link href="/shop">
              <Button variant="secondary" size="lg">
                Shop Now
              </Button>
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <TestimonialSection />

        {/* Newsletter */}
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  )
}
