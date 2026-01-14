// Database and application type definitions

export interface User {
  _id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: "user" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  image: string
  images: string[]
  category: string
  rating: number
  reviews: Review[]
  stock: number
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  _id: string
  userId: string
  productId: string
  rating: number
  comment: string
  createdAt: Date
}

export interface CartItem {
  productId: string
  quantity: number
  price: number
}

export interface Order {
  _id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "shipped" | "delivered"
  shippingAddress: Address
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface IOrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  image: string
}

export interface IOrder {
  _id: string
  user: string
  items: IOrderItem[]
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: Address
  paymentStatus: 'pending' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  _id: string
  name: string
  slug: string
  image: string
}
