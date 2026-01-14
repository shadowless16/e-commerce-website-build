// Simple in-memory store for cart and user state
import type { CartItem, User } from "./types"

interface StoreState {
  cart: CartItem[]
  user: User | null
  isAuthenticated: boolean
}

const store: StoreState = {
  cart: [],
  user: null,
  isAuthenticated: false,
}

export const cartStore = {
  getCart: () => store.cart,
  addItem: (item: CartItem) => {
    const existing = store.cart.find((i) => i.productId === item.productId)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      store.cart.push(item)
    }
  },
  removeItem: (productId: string) => {
    store.cart = store.cart.filter((i) => i.productId !== productId)
  },
  updateQuantity: (productId: string, quantity: number) => {
    const item = store.cart.find((i) => i.productId === productId)
    if (item) {
      item.quantity = quantity
      if (item.quantity <= 0) {
        store.cart = store.cart.filter((i) => i.productId !== productId)
      }
    }
  },
  clearCart: () => {
    store.cart = []
  },
}

export const authStore = {
  getUser: () => store.user,
  setUser: (user: User | null) => {
    store.user = user
    store.isAuthenticated = !!user
  },
  isAuthenticated: () => store.isAuthenticated,
  logout: () => {
    store.user = null
    store.isAuthenticated = false
  },
}
