'use client'
// components/enrollments/EnrollmentsClient.tsx
import { useState, useEffect, useCallback } from 'react'
import { ClipboardList, Plus, Search, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import { formatDate, STATUS_COLORS, STATUS_LABELS_RO } from '@/lib/utils'
import { EnrollmentModal } from './EnrollmentModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/hooks/useToast'

interface Props { userRole: string }

export function EnrollmentsClient({ userRole }: Props) {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editEnrollment, setEditEnrollment] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchEnrollments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/enrollments?${params}`)
      const data = await res.json()
      setEnrollments(data.data || [])
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchEnrollments() }, [fetchEnrollments])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/enrollments/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ title: 'Înscriere ștearsă' })
      fetchEnrollments()
    } catch {
      toast({ title: 'Eroare la ștergere', variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  const filtered = enrollments.filter(e => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      `${e.student?.firstName} ${e.student?.lastName}`.toLowerCase().includes(q) ||
      e.course?.name.toLowerCase().includes(q) ||
      e.student?.studentId?.toLowerCase().includes(q)
    )
  })

  const statusOptions = [
    { value: '', label: 'Toate' },
    { value: 'INTERESTED', label: 'Interesați' },
    { value: 'FOLLOWING', label: 'Înscriși' },
    { value: 'FINISHED', label: 'Absolvenți' },
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="page-title">Înscrieri</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} înregistrări</p>
          </div>
        </div>
        {userRole !== 'STUDENT' && (
          <button className="btn-primary" onClick={() => { setEditEnrollment(null); setShowModal(true) }}>
            <Plus className="w-4 h-4" />
            Adaugă înscriere
          </button>
        )}
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className="search-input w-full" placeholder="Caută student sau curs..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map(opt => (
              <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <ClipboardList className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">Nu s-au găsit înscrieri</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Curs</th>
                  <th>Status</th>
                  <th>Data înscrierii</th>
                  <th>Data finalizării</th>
                  {userRole !== 'STUDENT' && <th className="text-right">Acțiuni</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(enr => (
                  <tr key={enr.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar w-8 h-8 text-xs">
                          {enr.student?.firstName?.[0]}{enr.student?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{enr.student?.firstName} {enr.student?.lastName}</p>
                          <p className="text-xs font-mono text-muted-foreground">{enr.student?.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-medium text-foreground">{enr.course?.name}</p>
                      {enr.course?.trainer && (
                        <p className="text-xs text-muted-foreground">{enr.course.trainer.firstName} {enr.course.trainer.lastName}</p>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[enr.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS_RO[enr.status]}
                      </span>
                    </td>
                    <td className="text-sm text-muted-foreground">{formatDate(enr.enrollmentDate)}</td>
                    <td className="text-sm text-muted-foreground">{enr.completionDate ? formatDate(enr.completionDate) : '—'}</td>
                    {userRole !== 'STUDENT' && (
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button className="btn-ghost p-2" onClick={() => { setEditEnrollment(enr); setShowModal(true) }}>
                            <Pencil className="w-4 h-4" />
                          </button>
                          {userRole === 'ADMIN' && (
                            <button className="btn-ghost p-2 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(enr.id)}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <EnrollmentModal
          enrollment={editEnrollment}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchEnrollments() }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Șterge înscriere"
        description="Ești sigur că vrei să ștergi această înscriere?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
