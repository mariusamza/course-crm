'use client'
// hooks/useToast.ts
import { useState, useCallback } from 'react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

// Simple global toast state
let toastListeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []

function notify() {
  toastListeners.forEach(l => l([...toasts]))
}

export function useToast() {
  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    toasts = [...toasts, { id, title, description, variant }]
    notify()
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id)
      notify()
    }, 3500)
  }, [])

  return { toast }
}

export function useToastState() {
  const [state, setState] = useState<Toast[]>([])
  toastListeners = [setState]
  return state
}
