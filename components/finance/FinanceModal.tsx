'use client'
// components/finance/FinanceModal.tsx
import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface Props { onClose: () => void; onSave: () => void }

export function FinanceModal({ onClose, onSave }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [form, setForm] = useState({ studentId: '', courseId: '', totalAmount: '', advanceAmount: '', notes: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    Promise.all([fetch('/api/students').then(r => r.json()), fetch('/api/courses').then(r => r.json())])
      .then(([s, c]) => { setStudents(s.data || []); setCourses(c.data || []) })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Record financiar adăugat' })
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
          <h2 className="text-lg font-bold text-foreground">Record financiar nou</h2>
          <button className="btn-ghost p-2" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="form-label">Student *</label>
              <select className="form-input" value={form.studentId} onChange={e => set('studentId', e.target.value)} required>
                <option value="">Selectează student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Curs *</label>
              <select className="form-input" value={form.courseId} onChange={e => set('courseId', e.target.value)} required>
                <option value="">Selectează curs...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Sumă totală (RON) *</label>
                <input type="number" className="form-input" value={form.totalAmount} onChange={e => set('totalAmount', e.target.value)} required min="0" step="0.01" placeholder="2400" />
              </div>
              <div>
                <label className="form-label">Avans (RON)</label>
                <input type="number" className="form-input" value={form.advanceAmount} onChange={e => set('advanceAmount', e.target.value)} min="0" step="0.01" placeholder="0" />
              </div>
            </div>
            <div>
              <label className="form-label">Note</label>
              <textarea className="form-textarea" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Note despre plată..." />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={onClose}>Anulează</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Adaugă record
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
