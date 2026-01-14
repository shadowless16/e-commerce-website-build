"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductGrid } from "@/components/product-grid"
import { CategoryFilter } from "@/components/category-filter"
import { PriceRangeFilter } from "@/components/price-range-filter"
import { SearchBar } from "@/components/search-bar"
import { cartStore } from "@/lib/store"
import type { Product, Category, CartItem } from "@/lib/types"
import { useSearchParams } from "next/navigation"

function ShopContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? "")
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000000 })
  const [cart, setCart] = useState<CartItem[]>([])
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

  useEffect(() => {
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    if (search !== null) setSearchQuery(search)
    if (category !== null) setSelectedCategory(category)
  }, [searchParams])

  const filteredProducts = useMemo(() => {
    const filter = searchParams.get("filter")
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !selectedCategory || product.category === selectedCategory
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max
      
      let matchesFilter = true
      if (filter === "new") {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        matchesFilter = new Date(product.createdAt) >= weekAgo
      } else if (filter === "deals") {
        matchesFilter = !!product.discountPrice
      }

      return matchesSearch && matchesCategory && matchesPrice && matchesFilter
    })
  }, [searchQuery, selectedCategory, priceRange, products, searchParams])

  const handleAddToCart = (product: Product) => {
    cartStore.addItem({
      productId: product._id,
      quantity: 1,
      price: product.price,
    })
    setCart([...cartStore.getCart()])
  }

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop All Products</h1>
          <p className="text-muted-foreground">Discover our complete collection of premium products.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="space-y-8">
            <SearchBar onSearch={setSearchQuery} />
            <CategoryFilter
              categories={categories}
              activeCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            <PriceRangeFilter onPriceChange={(min, max) => setPriceRange({ min, max })} />
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
            <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ShopPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Suspense fallback={<div className="flex-1" />}>
        <ShopContent />
      </Suspense>
      <Footer />
    </div>
  )
}
