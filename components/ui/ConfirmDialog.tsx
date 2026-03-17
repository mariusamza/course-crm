'use client'
// components/ui/ConfirmDialog.tsx
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface Props {
  open: boolean
  title: string
  description: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({ open, title, description, onConfirm, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  if (!open) return null

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-sm shadow-2xl animate-fade-in">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={onCancel} disabled={loading}>Anulează</button>
            <button className="btn-danger" onClick={handleConfirm} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Șterge
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
