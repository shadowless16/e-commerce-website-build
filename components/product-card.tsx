"use client"

import Link from "next/link"
import Image from "next/image"
import { Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { showToast } from "@/components/toast"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAddToCart = (product: Product) => {
    onAddToCart?.(product)
    showToast(`${product.name} added to cart!`, "success")
  }

  const formattedPrice = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace('NGN', '₦')
  }

  return (
    <div className="group relative">
      <Link href={`/product/${product._id}`}>
        <div className="relative overflow-hidden bg-muted rounded-lg aspect-square mb-4">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discountPrice && (
            <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-1 rounded">
              SALE
            </div>
          )}
        </div>
      </Link>
      <Link href={`/product/${product._id}`}>
        <h3 className="font-semibold text-sm mb-1 group-hover:text-accent transition-colors">{product.name}</h3>
      </Link>
      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{product.description}</p>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
          <span className="text-xs font-medium">{product.rating}</span>
        </div>
        <span className="text-xs text-muted-foreground">({product.reviews.length})</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          {product.discountPrice ? (
            <>
              <span className="text-lg font-bold text-accent">{formattedPrice(product.discountPrice)}</span>
              <span className="text-xs text-muted-foreground line-through">{formattedPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-lg font-bold">{formattedPrice(product.price)}</span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => handleAddToCart(product)} className="h-9 w-9 p-0 md:w-auto md:px-3 md:gap-2 rounded-full">
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden md:inline text-xs">Add</span>
        </Button>
      </div>
    </div>
  )
}
