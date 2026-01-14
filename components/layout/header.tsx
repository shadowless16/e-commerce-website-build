"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, ShoppingCart, User, LogOut, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cartStore, authStore } from "@/lib/store"
import type { User as UserType, Category } from "@/lib/types"

export function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<UserType | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)

  useEffect(() => {
    // Update cart count and user
    setCartCount(cartStore.getCart().length)
    const currentUser = authStore.getUser()
    setUser(currentUser)

    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Failed to fetch categories:", err))
  }, [])

  const handleLogout = () => {
    authStore.logout()
    setUser(null)
    setIsUserMenuOpen(false)
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-foreground hover:text-accent transition-colors shrink-0">
            LUXE
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/shop" className="text-sm font-medium hover:text-accent transition-colors">
              Shop
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative group">
              <button 
                onMouseEnter={() => setIsCategoryMenuOpen(true)}
                onMouseLeave={() => setIsCategoryMenuOpen(false)}
                className="flex items-center gap-1 text-sm font-medium hover:text-accent transition-colors py-2"
              >
                Categories <ChevronDown className="w-4 h-4" />
              </button>
              {isCategoryMenuOpen && (
                <div 
                  onMouseEnter={() => setIsCategoryMenuOpen(true)}
                  onMouseLeave={() => setIsCategoryMenuOpen(false)}
                  className="absolute top-full left-0 w-48 bg-background border border-border rounded-lg shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2"
                >
                  {categories.map((cat) => (
                    <Link key={cat._id} href={`/shop?category=${cat.slug}`}>
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted rounded transition-colors">
                        {cat.name}
                      </button>
                    </Link>
                  ))}
                  {categories.length === 0 && (
                    <p className="px-4 py-2 text-xs text-muted-foreground text-center">No categories found</p>
                  )}
                </div>
              )}
            </div>

            <Link href="/shop?filter=new" className="text-sm font-medium hover:text-accent transition-colors">
              New Arrivals
            </Link>
            <Link href="/shop?filter=deals" className="text-sm font-medium hover:text-accent transition-colors text-accent">
              Deals
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-sm">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border-none focus:ring-2 focus:ring-accent text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-muted rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-border"
                >
                  <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{user.firstName}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg p-2 space-y-1 z-50">
                    <Link href="/dashboard">
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted rounded transition-colors">
                        My Dashboard
                      </button>
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin">
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted rounded transition-colors font-medium text-accent">
                          Admin Panel
                        </button>
                      </Link>
                    )}
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive rounded transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 rounded-full">
                  <User className="w-4 h-4" />
                  Login
                </Button>
                <button className="sm:hidden p-2 hover:bg-muted rounded-full">
                  <User className="w-5 h-5" />
                </button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 hover:bg-muted rounded-full">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {isSearchOpen && (
          <div className="lg:hidden mt-4 animate-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search for items..."
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border-none focus:ring-2 focus:ring-accent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </form>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-border flex flex-col gap-2 animate-in slide-in-from-top-4">
            <Link href="/shop" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-lg transition-colors">
              Shop All
            </Link>
            <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Categories</div>
            <div className="grid grid-cols-2 gap-2 px-2">
              {categories.map((cat) => (
                <Link key={cat._id} href={`/shop?category=${cat.slug}`}>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
                    {cat.name}
                  </button>
                </Link>
              ))}
            </div>
            <div className="h-px bg-border my-2" />
            <Link href="/shop?filter=new" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-lg">
              New Arrivals
            </Link>
            <Link href="/shop?filter=deals" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-lg text-accent">
              Hot Deals
            </Link>
            <Link href="/about" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-lg">
              About Luxe
            </Link>
            <Link href="/contact" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-lg">
              Contact Us
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
