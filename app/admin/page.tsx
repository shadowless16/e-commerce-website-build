"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { BarChart3, Package, Users, Plus, Trash2, Edit } from "lucide-react"
import { authStore } from "@/lib/store"
import type { User as UserType, Product, IOrder, Category } from "@/lib/types"

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "users">("products")
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<IOrder[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

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
    if (currentUser.role !== "admin") {
      router.push("/dashboard")
      return
    }
    setUser(currentUser)
    
    const fetchData = async () => {
      try {
        const [prodRes, orderRes, userRes, catRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders'),
          fetch('/api/users'),
          fetch('/api/categories')
        ])
        
        const [prodData, orderData, userData, catData] = await Promise.all([
          prodRes.json(),
          orderRes.json(),
          userRes.json(),
          catRes.json()
        ])
        
        setProducts(prodData)
        setOrders(orderData)
        setUsers(userData)
        setCategories(catData)
      } catch (err) {
        console.error("Failed to fetch admin data", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id))
      }
    } catch (err) {
      console.error("Failed to delete product", err)
    }
  }

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product)
    setUploadedImageUrl(product?.image ?? "")
    setShowNewCategoryInput(false)
    setNewCategoryName("")
    setIsModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.url) {
        setUploadedImageUrl(data.url)
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"))
      }
    } catch (err) {
      console.error("Upload failed", err)
      alert("Upload failed. Please check your Cloudinary configuration.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const finalCategory = showNewCategoryInput ? newCategoryName : formData.get("category")
    
    const productData = {
      name: formData.get("name"),
      price: Number(formData.get("price")),
      discountPrice: formData.get("discountPrice") ? Number(formData.get("discountPrice")) : undefined,
      stock: Number(formData.get("stock")),
      category: finalCategory,
      description: formData.get("description"),
      image: uploadedImageUrl || formData.get("image") || "/placeholder.svg",
    }

    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (res.ok) {
        const savedProduct = await res.json()
        if (editingProduct) {
          setProducts(products.map(p => p._id === savedProduct._id ? savedProduct : p))
        } else {
          setProducts([savedProduct, ...products])
        }
        
        // Refresh categories if a new one was added
        if (showNewCategoryInput) {
          const catRes = await fetch('/api/categories')
          if (catRes.ok) setCategories(await catRes.json())
        }
        
        setIsModalOpen(false)
      }
    } catch (err) {
      console.error("Failed to save product", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-lg italic">Accessing administrative data...</div>
        </main>
        <Footer />
      </div>
    )
  }

  const stats = {
    totalRevenue: orders.reduce((acc, o) => acc + o.totalAmount, 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    activeUsers: users.length
  }

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
                  <h2 className="font-semibold text-sm mb-1">Admin Panel</h2>
                  <p className="text-lg font-bold">{user?.firstName}</p>
                  <p className="text-xs text-muted-foreground text-accent font-semibold">Administrator</p>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("products")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "products"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-background"
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    Products
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "orders"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-background"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Orders
                  </button>
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "users"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-background"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Users
                  </button>
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === "products" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold">Products</h1>
                      <p className="text-muted-foreground">Manage your product catalog</p>
                    </div>
                    <Button className="gap-2" onClick={() => handleOpenModal()}>
                      <Plus className="w-4 h-4" /> Add Product
                    </Button>
                  </div>

                  <div className="bg-muted rounded-lg overflow-hidden border border-border">
                    <table className="w-full">
                      <thead className="bg-background">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Stock</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {products.map((p) => (
                          <tr key={p._id} className="hover:bg-background/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium">{p.name}</td>
                            <td className="px-6 py-4 text-sm">{formattedPrice(p.discountPrice ?? p.price)}</td>
                            <td className="px-6 py-4 text-sm">{p.stock}</td>
                            <td className="px-6 py-4 text-sm text-right space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenModal(p)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteProduct(p._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold">Orders</h1>
                    <p className="text-muted-foreground">Monitor and fulfill customer orders</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-muted rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold">{formattedPrice(stats.totalRevenue)}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Orders</p>
                      <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Active Users</p>
                      <p className="text-2xl font-bold text-accent">{stats.activeUsers}</p>
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg overflow-hidden border border-border">
                    {orders.length === 0 ? (
                      <div className="p-12 text-center text-muted-foreground italic">No orders found in the system.</div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-background">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold">Order ID</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold">Total</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {orders.map((o) => (
                            <tr key={o._id} className="hover:bg-background/50 transition-colors">
                              <td className="px-6 py-4 text-sm font-mono">{o._id.slice(-8).toUpperCase()}</td>
                              <td className="px-6 py-4 text-sm">{o.user}</td>
                              <td className="px-6 py-4 text-sm font-bold">{formattedPrice(o.totalAmount)}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                  o.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                  o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold">Users</h1>
                    <p className="text-muted-foreground">Manage platform access and customer profiles</p>
                  </div>

                  <div className="bg-muted rounded-lg overflow-hidden border border-border">
                    <table className="w-full">
                      <thead className="bg-background">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-background/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium">{u.firstName} {u.lastName}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                u.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-muted-foreground/20 text-muted-foreground'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-xl p-8 max-w-2xl w-full border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleProductSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-muted-foreground">Name</label>
                  <input name="name" defaultValue={editingProduct?.name} required className="w-full px-4 py-3 bg-muted rounded-lg border border-border focus:ring-2 focus:ring-accent outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-muted-foreground">Category</label>
                  {!showNewCategoryInput ? (
                    <div className="flex gap-2">
                      <select 
                        name="category" 
                        defaultValue={editingProduct?.category} 
                        required 
                        className="flex-1 px-4 py-3 bg-muted rounded-lg border border-border focus:ring-2 focus:ring-accent outline-none"
                        onChange={(e) => {
                          if (e.target.value === "ADD_NEW") {
                            setShowNewCategoryInput(true)
                          }
                        }}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                        <option value="ADD_NEW" className="font-bold text-accent">+ Add New Category</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="New Category Name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        required
                        className="flex-1 px-4 py-3 bg-muted rounded-lg border border-border focus:ring-2 focus:ring-accent outline-none animate-in slide-in-from-left-2"
                      />
                      <Button variant="outline" type="button" onClick={() => setShowNewCategoryInput(false)}>Cancel</Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-muted-foreground">Price (₦)</label>
                  <input name="price" type="number" defaultValue={editingProduct?.price} required className="w-full px-4 py-3 bg-muted rounded-lg border border-border focus:ring-2 focus:ring-accent outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-muted-foreground">Discount Price (₦)</label>
                  <input name="discountPrice" type="number" defaultValue={editingProduct?.discountPrice} className="w-full px-4 py-3 bg-muted rounded-lg border border-border focus:ring-2 focus:ring-accent outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase text-muted-foreground">Stock</label>
                  <input name="stock" type="number" defaultValue={editingProduct?.stock} required className="w-full px-4 py-3 bg-muted rounded-lg border border-border focus:ring-2 focus:ring-accent outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-muted-foreground">Description</label>
                <textarea name="description" defaultValue={editingProduct?.description} rows={3} className="w-full px-4 py-3 bg-muted rounded-lg border border-border focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-muted-foreground">Product Image</label>
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-border border-dashed">
                  {uploadedImageUrl ? (
                    <div className="relative w-20 h-20 rounded-md overflow-hidden bg-background border border-border">
                      <img src={uploadedImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setUploadedImageUrl("")}
                        className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-1 rounded-bl-md shadow-sm hover:bg-destructive/90"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-md bg-background border border-border flex items-center justify-center text-muted-foreground italic text-xs">No image</div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      id="image-upload" 
                      disabled={isUploadingImage}
                    />
                    <label 
                      htmlFor="image-upload" 
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-background hover:bg-muted cursor-pointer transition-colors text-sm font-medium ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isUploadingImage ? 'Uploading...' : (uploadedImageUrl ? 'Change Image' : 'Upload Image')}
                    </label>
                    <p className="text-[10px] text-muted-foreground mt-2">Recommended: 800x800px, PNG or JPG</p>
                  </div>
                </div>
                <input type="hidden" name="image" value={uploadedImageUrl} />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90" disabled={isSubmitting || isUploadingImage}>
                  {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
