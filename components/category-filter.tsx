"use client"

import type { Category } from "@/lib/types"

interface CategoryFilterProps {
  categories: Category[]
  activeCategory?: string
  onCategoryChange?: (category: string) => void
}

export function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Categories</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange?.("")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !activeCategory ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onCategoryChange?.(category.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === category.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}
