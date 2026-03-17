'use client'
// components/ui/Toaster.tsx
import { useToastState } from '@/hooks/useToast'
import { CheckCircle2, XCircle, X } from 'lucide-react'

export function Toaster() {
  const toasts = useToastState()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-lg border animate-fade-in ${
            toast.variant === 'destructive'
              ? 'bg-destructive text-destructive-foreground border-destructive/20'
              : 'bg-card text-card-foreground border-border'
          }`}
        >
          {toast.variant === 'destructive'
            ? <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            : <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-500" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description && (
              <p className="text-xs opacity-80 mt-0.5">{toast.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
