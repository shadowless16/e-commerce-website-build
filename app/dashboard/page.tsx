"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { LogOut, Package, User } from "lucide-react"
import { authStore } from "@/lib/store"
import type { User as UserType, IOrder } from "@/lib/types"
import { showToast } from "@/components/toast"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders")
  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const formattedPrice = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace('NGN', '₦')
  }

  useEffect(() => {
    const currentUser = authStore.getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?userId=${currentUser._id}`)
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
        }
      } catch (err) {
        console.error("Failed to fetch user orders", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [router])

  const handleLogout = () => {
    authStore.logout()
    router.push("/")
  }

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setUpdating(true)
    
    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
    }

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const updatedUser = await res.json()
        authStore.setUser(updatedUser)
        setUser(updatedUser)
        showToast("Profile updated successfully!", "success")
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (err: any) {
      showToast(err.message, "error")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-muted rounded-lg p-6 space-y-6">
                <div>
                  <h2 className="font-semibold text-sm mb-1">Welcome back!</h2>
                  <p className="text-lg font-bold">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "orders"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-background"
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    Orders
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "profile"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-background"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <Link href="/shop" className="w-full block">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
                      Continue Shopping
                    </Button>
                  </Link>
                </nav>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm font-medium text-destructive transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Order History</h1>
                    <p className="text-muted-foreground">View your past orders and their status</p>
                  </div>

                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="text-center py-16 bg-muted rounded-lg border border-dashed border-border">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                        <p className="text-muted-foreground mb-6">You haven't placed any orders yet</p>
                        <Link href="/shop">
                          <Button className="bg-accent hover:bg-accent/90">Start Shopping</Button>
                        </Link>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div
                          key={order._id}
                          className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow bg-background"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className="font-mono text-sm font-bold uppercase tracking-tight">#{order._id.slice(-8)}</h3>
                              <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-NG', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-accent">{formattedPrice(order.totalAmount)}</p>
                              <span
                                className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                  order.status === "delivered" ? "bg-green-100 text-green-700" :
                                  order.status === "cancelled" ? "bg-red-100 text-red-700" :
                                  "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                            <span>{order.items.length} item(s)</span>
                            <span>•</span>
                            <span className="capitalize">Payment: {order.paymentStatus}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
                    <p className="text-muted-foreground">Manage your account information and password</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="bg-muted/50 rounded-lg p-8 border border-border space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">First Name</label>
                        <input
                          name="firstName"
                          type="text"
                          defaultValue={user.firstName}
                          className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-accent outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Last Name</label>
                        <input
                          name="lastName"
                          type="text"
                          defaultValue={user.lastName}
                          className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-accent outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        defaultValue={user.email}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-accent outline-none"
                      />
                    </div>

                    <div className="border-t border-border pt-8">
                      <h3 className="font-bold mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent"></span>
                        Security
                      </h3>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">New Password</label>
                          <input
                            type="password"
                            placeholder="Leave blank to keep current password"
                            className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-accent outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90" disabled={updating}>
                      {updating ? "Saving Changes..." : "Update Profile"}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
