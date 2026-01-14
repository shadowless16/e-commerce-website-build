"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { authStore } from "@/lib/store"
import { showToast } from "@/components/toast"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Mock authentication
    setTimeout(() => {
      if (formData.email && formData.password) {
        const isAdmin = formData.email === "admin@example.com" && formData.password === "admin123"

        authStore.setUser({
          _id: isAdmin ? "admin-001" : "user-123",
          email: formData.email,
          password: formData.password,
          firstName: isAdmin ? "Admin" : "John",
          lastName: isAdmin ? "User" : "Doe",
          role: isAdmin ? "admin" : "user",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        showToast(`Welcome ${isAdmin ? "Admin" : "back"}!`, "success")
        router.push(isAdmin ? "/admin" : "/dashboard")
      } else {
        setError("Please fill in all fields")
        showToast("Please fill in all fields", "error")
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <Link href="/forgot-password" className="text-sm text-accent hover:underline">
              Forgot password?
            </Link>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="font-semibold text-accent hover:underline">
              Sign up
            </Link>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <p className="font-semibold mb-3">Demo Credentials:</p>
            <div className="space-y-2">
              <div>
                <p className="font-medium">Regular User:</p>
                <p>Email: demo@example.com</p>
                <p>Password: password123</p>
              </div>
              <div className="border-t border-blue-200 pt-2">
                <p className="font-medium">Admin User:</p>
                <p>Email: admin@example.com</p>
                <p>Password: admin123</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
