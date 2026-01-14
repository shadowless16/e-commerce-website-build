"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setEmail("")
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
        <p className="mb-8 opacity-90">Get exclusive offers and new product announcements delivered to your inbox.</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground text-primary placeholder-primary/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary"
          />
          <Button type="submit" variant="secondary" size="lg" className="whitespace-nowrap">
            {submitted ? "Subscribed!" : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  )
}
