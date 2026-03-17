'use client'
// components/trainers/TrainerModal.tsx
import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface Props {
  trainer?: any
  onClose: () => void
  onSave: () => void
}

export function TrainerModal({ trainer, onClose, onSave }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: trainer?.firstName || '',
    lastName: trainer?.lastName || '',
    phone: trainer?.phone || '',
    email: trainer?.email || '',
    bio: trainer?.bio || '',
    username: trainer?.user?.username || '',
    password: '',
  })

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = trainer ? `/api/trainers/${trainer.id}` : '/api/trainers'
      const method = trainer ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: trainer ? 'Trainer actualizat' : 'Trainer adăugat' })
      onSave()
    } catch (e: any) {
      toast({ title: e.message || 'Eroare', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            {trainer ? 'Editează trainer' : 'Adaugă trainer nou'}
          </h2>
          <button className="btn-ghost p-2" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Prenume *</label>
                <input className="form-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Nume *</label>
                <input className="form-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="form-label">Telefon</label>
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0721 123 456" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Bio / Descriere</label>
              <textarea className="form-textarea" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Experiență și specializări..." />
            </div>

            <div className="pt-4 border-t border-border space-y-4">
              <p className="text-sm font-semibold text-foreground">Date cont</p>
              <div>
                <label className="form-label">Utilizator *</label>
                <input
                  className="form-input"
                  value={form.username}
                  onChange={e => set('username', e.target.value)}
                  required={!trainer}
                  disabled={!!trainer}
                  placeholder="ion.popescu"
                />
              </div>
              <div>
                <label className="form-label">{trainer ? 'Parolă nouă (opțional)' : 'Parolă *'}</label>
                <input
                  type="password"
                  className="form-input"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required={!trainer}
                  placeholder={trainer ? 'Lasă gol pentru a păstra parola' : 'Minim 6 caractere'}
                  minLength={trainer && !form.password ? 0 : 6}
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={onClose}>Anulează</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {trainer ? 'Salvează' : 'Adaugă trainer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
