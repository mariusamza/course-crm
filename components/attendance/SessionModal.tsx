'use client'
// components/attendance/SessionModal.tsx
import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { generateTimeSlots } from '@/lib/utils'

const TIME_SLOTS = generateTimeSlots()

interface Props {
  onClose: () => void
  onSave: () => void
  courses: any[]
}

export function SessionModal({ onClose, onSave, courses }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    courseId: '',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '20:00',
    topic: '',
    notes: '',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Sesiune adăugată' })
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
          <h2 className="text-lg font-bold text-foreground">Sesiune nouă</h2>
          <button className="btn-ghost p-2" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="form-label">Curs *</label>
              <select className="form-input" value={form.courseId} onChange={e => set('courseId', e.target.value)} required>
                <option value="">Selectează curs...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Data *</label>
              <input type="date" className="form-input" value={form.sessionDate} onChange={e => set('sessionDate', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Ora start</label>
                <select className="form-input" value={form.startTime} onChange={e => set('startTime', e.target.value)}>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Ora final</label>
                <select className="form-input" value={form.endTime} onChange={e => set('endTime', e.target.value)}>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Subiect</label>
              <input className="form-input" value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="ex: Introducere în React Hooks" />
            </div>
            <div>
              <label className="form-label">Note</label>
              <textarea className="form-textarea" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={onClose}>Anulează</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Adaugă sesiune
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
