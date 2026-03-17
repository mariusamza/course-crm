'use client'
// components/courses/CourseModal.tsx
import { useState, useEffect } from 'react'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { DAYS_OF_WEEK, DAYS_RO, generateTimeSlots } from '@/lib/utils'

interface Props {
  course?: any
  onClose: () => void
  onSave: () => void
}

const TIME_SLOTS = generateTimeSlots()

export function CourseModal({ course, onClose, onSave }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [trainers, setTrainers] = useState<any[]>([])
  const [form, setForm] = useState({
    name: course?.name || '',
    description: course?.description || '',
    startDate: course?.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
    endDate: course?.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
    trainerId: course?.trainerId || '',
    weekDays: course?.weekDays || [] as string[],
    timeSlots: course?.timeSlots || [{ day: 'Monday', startTime: '18:00', endTime: '20:00' }] as any[],
  })

  useEffect(() => {
    fetch('/api/trainers').then(r => r.json()).then(d => setTrainers(d.data || []))
  }, [])

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))

  const toggleDay = (day: string) => {
    set('weekDays', form.weekDays.includes(day)
      ? form.weekDays.filter((d: string) => d !== day)
      : [...form.weekDays, day]
    )
  }

  const addTimeSlot = () => {
    set('timeSlots', [...form.timeSlots, { day: 'Monday', startTime: '18:00', endTime: '20:00' }])
  }

  const updateTimeSlot = (i: number, key: string, value: string) => {
    const updated = [...form.timeSlots]
    updated[i] = { ...updated[i], [key]: value }
    set('timeSlots', updated)
  }

  const removeTimeSlot = (i: number) => {
    set('timeSlots', form.timeSlots.filter((_: any, idx: number) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.startDate || !form.endDate) {
      toast({ title: 'Datele de start și final sunt obligatorii', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const url = course ? `/api/courses/${course.id}` : '/api/courses'
      const method = course ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, trainerId: form.trainerId || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: course ? 'Curs actualizat' : 'Curs adăugat' })
      onSave()
    } catch (e: any) {
      toast({ title: e.message || 'Eroare', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-bold text-foreground">
            {course ? 'Editează curs' : 'Adaugă curs nou'}
          </h2>
          <button className="btn-ghost p-2" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <div>
              <label className="form-label">Denumire curs *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="ex: Programare Web Full Stack" />
            </div>

            <div>
              <label className="form-label">Descriere</label>
              <textarea className="form-textarea" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descriere scurtă a cursului..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Data start *</label>
                <input type="date" className="form-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Data final *</label>
                <input type="date" className="form-input" value={form.endDate} onChange={e => set('endDate', e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="form-label">Trainer (opțional)</label>
              <select className="form-input" value={form.trainerId} onChange={e => set('trainerId', e.target.value)}>
                <option value="">Fără trainer asignat</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                ))}
              </select>
            </div>

            {/* Week days */}
            <div>
              <label className="form-label">Zile săptămână</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      form.weekDays.includes(day)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {DAYS_RO[day].substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time slots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">Ore cursuri</label>
                <button type="button" className="btn-ghost p-1.5 text-xs" onClick={addTimeSlot}>
                  <Plus className="w-3.5 h-3.5" />
                  Adaugă orar
                </button>
              </div>
              <div className="space-y-2">
                {form.timeSlots.map((slot: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                    <select
                      className="form-input flex-1 py-1.5"
                      value={slot.day}
                      onChange={e => updateTimeSlot(i, 'day', e.target.value)}
                    >
                      {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{DAYS_RO[d]}</option>)}
                    </select>
                    <select className="form-input w-28 py-1.5" value={slot.startTime} onChange={e => updateTimeSlot(i, 'startTime', e.target.value)}>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="text-muted-foreground text-sm">—</span>
                    <select className="form-input w-28 py-1.5" value={slot.endTime} onChange={e => updateTimeSlot(i, 'endTime', e.target.value)}>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {form.timeSlots.length > 1 && (
                      <button type="button" className="btn-ghost p-1.5 text-destructive" onClick={() => removeTimeSlot(i)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border flex justify-end gap-3 flex-shrink-0">
            <button type="button" className="btn-secondary" onClick={onClose}>Anulează</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {course ? 'Salvează' : 'Adaugă curs'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
