'use client'
// components/finance/InstallmentModal.tsx
import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { formatCurrency } from '@/lib/utils'

interface Props { finance: any; onClose: () => void; onSave: () => void }

export function InstallmentModal({ finance, onClose, onSave }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    amount: String(finance.totalAmount - finance.paidAmount),
    dueDate: new Date().toISOString().split('T')[0],
    method: 'CASH',
    notes: '',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/finance/${finance.id}/installments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Rată adăugată' })
      onSave()
    } catch (e: any) {
      toast({ title: e.message || 'Eroare', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Adaugă rată de plată</h2>
            <p className="text-sm text-muted-foreground">
              {finance.student?.firstName} {finance.student?.lastName} • {finance.course?.name}
            </p>
          </div>
          <button className="btn-ghost p-2" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">{formatCurrency(finance.totalAmount)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Plătit:</span>
                <span className="font-semibold text-green-600">{formatCurrency(finance.paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restant:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(finance.totalAmount - finance.paidAmount)}</span>
              </div>
            </div>
            <div>
              <label className="form-label">Sumă rată (RON) *</label>
              <input type="number" className="form-input" value={form.amount} onChange={e => set('amount', e.target.value)} required min="0.01" step="0.01" />
            </div>
            <div>
              <label className="form-label">Data scadentă *</label>
              <input type="date" className="form-input" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Metodă plată</label>
              <select className="form-input" value={form.method} onChange={e => set('method', e.target.value)}>
                <option value="CASH">Numerar</option>
                <option value="CARD">Card</option>
                <option value="TRANSFER">Transfer bancar</option>
                <option value="OTHER">Altul</option>
              </select>
            </div>
            <div>
              <label className="form-label">Note</label>
              <input className="form-input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notă opțională..." />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={onClose}>Anulează</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Adaugă rată
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
