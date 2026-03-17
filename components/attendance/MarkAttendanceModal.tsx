'use client'
// components/attendance/MarkAttendanceModal.tsx
import { useState, useEffect } from 'react'
import { X, Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/lib/utils'

interface Props {
  session: any
  onClose: () => void
  onSave: () => void
}

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Prezent', icon: CheckCircle2, color: 'text-green-600 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' },
  { value: 'ABSENT', label: 'Absent', icon: XCircle, color: 'text-red-600 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' },
  { value: 'LATE', label: 'Întârziat', icon: Clock, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800' },
  { value: 'LEAVE', label: 'Invoiect', icon: AlertCircle, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800' },
]

export function MarkAttendanceModal({ session, onClose, onSave }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchingStudents, setFetchingStudents] = useState(true)
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, { status: string; notes: string }>>({})

  useEffect(() => {
    // Fetch enrolled students for this course
    Promise.all([
      fetch(`/api/enrollments?courseId=${session.courseId}`),
      fetch(`/api/attendance?sessionId=${session.id}`),
    ]).then(async ([enrRes, attRes]) => {
      const [enrData, attData] = await Promise.all([enrRes.json(), attRes.json()])
      const enrolled = enrData.data || []
      const existing = attData.data || []

      setStudents(enrolled.map((e: any) => e.student).filter(Boolean))

      // Pre-fill existing attendance
      const attMap: Record<string, { status: string; notes: string }> = {}
      enrolled.forEach((e: any) => {
        const existing_rec = existing.find((a: any) => a.studentId === e.studentId)
        attMap[e.studentId] = {
          status: existing_rec?.status || 'PRESENT',
          notes: existing_rec?.notes || '',
        }
      })
      setAttendance(attMap)
      setFetchingStudents(false)
    })
  }, [session])

  const setStatus = (studentId: string, status: string) => {
    setAttendance(a => ({ ...a, [studentId]: { ...a[studentId], status } }))
  }

  const setNotes = (studentId: string, notes: string) => {
    setAttendance(a => ({ ...a, [studentId]: { ...a[studentId], notes } }))
  }

  const markAll = (status: string) => {
    const updated = { ...attendance }
    Object.keys(updated).forEach(id => { updated[id] = { ...updated[id], status } })
    setAttendance(updated)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const records = students.map(s => ({
        sessionId: session.id,
        studentId: s.id,
        status: attendance[s.id]?.status || 'PRESENT',
        notes: attendance[s.id]?.notes || null,
      }))

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Prezență salvată cu succes' })
      onSave()
    } catch {
      toast({ title: 'Eroare la salvare', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Marchează prezența</h2>
            <p className="text-sm text-muted-foreground">
              {session.course?.name} • {formatDate(session.sessionDate)} • {session.startTime}–{session.endTime}
            </p>
          </div>
          <button className="btn-ghost p-2" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>

        {/* Bulk actions */}
        <div className="px-6 py-3 border-b border-border flex items-center gap-2 flex-wrap flex-shrink-0">
          <span className="text-sm text-muted-foreground mr-2">Marchează toți ca:</span>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => markAll(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:opacity-80 ${opt.color}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto p-6">
          {fetchingStudents ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Niciun student înscris la acest curs</p>
          ) : (
            <div className="space-y-3">
              {students.map(student => {
                const att = attendance[student.id] || { status: 'PRESENT', notes: '' }
                const currentOpt = STATUS_OPTIONS.find(o => o.value === att.status)
                return (
                  <div key={student.id} className="p-4 bg-muted/20 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="avatar w-8 h-8 text-xs flex-shrink-0">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">{student.firstName} {student.lastName}</p>
                        <p className="text-xs font-mono text-muted-foreground">{student.studentId}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setStatus(student.id, opt.value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            att.status === opt.value
                              ? opt.color
                              : 'bg-background text-muted-foreground border-border hover:border-primary/30'
                          }`}
                        >
                          <opt.icon className="w-3.5 h-3.5" />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {(att.status === 'ABSENT' || att.status === 'LATE' || att.status === 'LEAVE') && (
                      <input
                        className="form-input py-1.5 text-sm"
                        placeholder="Motiv (opțional)..."
                        value={att.notes}
                        onChange={e => setNotes(student.id, e.target.value)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-between items-center flex-shrink-0">
          <p className="text-sm text-muted-foreground">{students.length} studenți</p>
          <div className="flex gap-3">
            <button className="btn-secondary" onClick={onClose}>Anulează</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading || students.length === 0}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvează prezența
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
