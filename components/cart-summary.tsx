"use client"

import { Button } from "@/components/ui/button"
import type { CartItem } from "@/lib/types"

interface CartSummaryProps {
  items: CartItem[]
  onCheckout?: () => void
}

export function CartSummary({ items, onCheckout }: CartSummaryProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const formattedPrice = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace('NGN', '₦')
  }

  return (
    <div className="bg-muted rounded-lg p-6 space-y-4">
      <h3 className="font-semibold text-lg">Order Summary</h3>
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formattedPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (10%)</span>
          <span className="font-medium">{formattedPrice(tax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">Free</span>
        </div>
      </div>
      <div className="border-t border-border pt-4 flex justify-between">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold">{formattedPrice(total)}</span>
      </div>
      <Button onClick={onCheckout} className="w-full" size="lg">
        Proceed to Checkout
      </Button>
    </div>
  )
}
