"use client"

import { useState } from "react"

interface PriceRangeFilterProps {
  onPriceChange?: (min: number, max: number) => void
}

export function PriceRangeFilter({ onPriceChange }: PriceRangeFilterProps) {
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(500)

  const handleChange = () => {
    onPriceChange?.(min, max)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Price Range</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Min: ${min}</label>
          <input
            type="range"
            min="0"
            max="500"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            onMouseUp={handleChange}
            onTouchEnd={handleChange}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Max: ${max}</label>
          <input
            type="range"
            min="0"
            max="500"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            onMouseUp={handleChange}
            onTouchEnd={handleChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
