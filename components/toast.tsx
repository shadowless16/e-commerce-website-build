"use client"

import { useState, useEffect, useCallback } from "react"
import { X } from "lucide-react"

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
  duration?: number
}

let toastListeners: Array<(toast: Toast) => void> = []
let toastId = 0

export function showToast(message: string, type: "success" | "error" | "info" = "success", duration = 3000) {
  const id = `toast-${toastId++}`
  const toast: Toast = { id, message, type, duration }

  toastListeners.forEach((listener) => listener(toast))

  if (duration) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

export function removeToast(id: string) {
  toastListeners.forEach((listener) => listener({ id, message: "", type: "info", duration: 0 }))
}

export function useToastListener() {
  return useCallback((listener: (toast: Toast) => void) => {
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const addListener = useToastListener()

  useEffect(() => {
    const unsubscribe = addListener((toast) => {
      if (toast.message) {
        setToasts((prev) => {
          const exists = prev.some((t) => t.id === toast.id)
          return exists ? prev : [...prev, toast]
        })
      } else {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }
    })

    return unsubscribe
  }, [addListener])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
          }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => {
              removeToast(toast.id)
            }}
            className="hover:opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
