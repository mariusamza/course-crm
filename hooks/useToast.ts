'use client'
// hooks/useToast.ts
import { useState, useCallback, useEffect } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

type ToastListener = (toasts: Toast[]) => void

class ToastStore {
  private toasts: Toast[] = []
  private listeners: Set<ToastListener> = new Set()

  subscribe(listener: ToastListener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getToasts() {
    return this.toasts
  }

  add(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).slice(2)
    this.toasts = [...this.toasts, { ...toast, id }]
    this.notify()
    setTimeout(() => this.remove(id), 3500)
  }

  private remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notify()
  }

  private notify() {
    this.listeners.forEach(l => l([...this.toasts]))
  }
}

const store = new ToastStore()

export function useToast() {
  const toast = useCallback((t: Omit<Toast, 'id'>) => store.add(t), [])
  return { toast }
}

export function useToastState(): Toast[] {
  const [toasts, setToasts] = useState<Toast[]>([])
  useEffect(() => store.subscribe(setToasts), [])
  return toasts
}
