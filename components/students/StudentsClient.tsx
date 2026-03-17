'use client'
// components/students/StudentsClient.tsx
import { useState, useEffect, useCallback } from 'react'
import { Users, Plus, Search, Pencil, Trash2, Eye, FileText, X, Loader2, ChevronDown } from 'lucide-react'
import { formatDate, STATUS_COLORS, STATUS_LABELS_RO } from '@/lib/utils'
import { StudentModal } from './StudentModal'
import { StudentDetailModal } from './StudentDetailModal'
import { useToast } from '@/hooks/useToast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface Props {
  userRole: string
}

export function StudentsClient({ userRole }: Props) {
  const [students, setStudents] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [editStudent, setEditStudent] = useState<any>(null)
  const [viewStudent, setViewStudent] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [sortField, setSortField] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const { toast } = useToast()

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/students?search=${encodeURIComponent(search)}`)
      const data = await res.json()
      setStudents(data.data || [])
      setTotal(data.total || 0)
    } catch {
      toast({ title: 'Eroare la încărcare', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(fetchStudents, 300)
    return () => clearTimeout(timer)
  }, [fetchStudents])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/students/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      toast({ title: 'Student șters cu succes' })
      fetchStudents()
    } catch (e: any) {
      toast({ title: e.message, variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  const sorted = [...students].sort((a, b) => {
    let av = a[sortField] ?? ''
    let bv = b[sortField] ?? ''
    if (sortField === 'name') { av = `${a.lastName} ${a.firstName}`; bv = `${b.lastName} ${b.firstName}` }
    return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
  })

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: string }) => (
    <ChevronDown className={`w-3.5 h-3.5 inline ml-1 transition-transform ${sortField === field && sortDir === 'asc' ? 'rotate-180' : ''} ${sortField !== field ? 'opacity-30' : ''}`} />
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="page-title">Studenți</h1>
            <p className="text-sm text-muted-foreground">{total} studenți înregistrați</p>
          </div>
        </div>
        {userRole === 'ADMIN' && (
          <button className="btn-primary" onClick={() => { setEditStudent(null); setShowModal(true) }}>
            <Plus className="w-4 h-4" />
            Adaugă student
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card">
        <div className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              className="search-input"
              placeholder="Caută după nume, ID, CNP, telefon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch('')}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="empty-state">
              <Users className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">Nu s-au găsit studenți</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? 'Încearcă altă căutare' : 'Adaugă primul student'}
              </p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('name')} className="cursor-pointer select-none hover:text-foreground">
                    Student <SortIcon field="name" />
                  </th>
                  <th onClick={() => toggleSort('studentId')} className="cursor-pointer select-none hover:text-foreground">
                    ID <SortIcon field="studentId" />
                  </th>
                  <th>Telefon</th>
                  <th>Înscrieri</th>
                  <th>Documente</th>
                  <th onClick={() => toggleSort('createdAt')} className="cursor-pointer select-none hover:text-foreground">
                    Data <SortIcon field="createdAt" />
                  </th>
                  <th className="text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar w-9 h-9 text-xs flex-shrink-0">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground">{student.user?.email || student.user?.username}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-sm text-muted-foreground">{student.studentId}</span>
                    </td>
                    <td className="text-sm text-muted-foreground">{student.phone || '—'}</td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {student.enrollments?.slice(0, 2).map((e: any) => (
                          <span key={e.id} className={`badge text-xs ${STATUS_COLORS[e.status as keyof typeof STATUS_COLORS]}`}>
                            {STATUS_LABELS_RO[e.status]}
                          </span>
                        ))}
                        {(student.enrollments?.length || 0) > 2 && (
                          <span className="badge bg-muted text-muted-foreground text-xs">+{student.enrollments.length - 2}</span>
                        )}
                        {(student.enrollments?.length || 0) === 0 && <span className="text-sm text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">{student.documents?.length || 0}</span>
                      </div>
                    </td>
                    <td className="text-sm text-muted-foreground">{formatDate(student.createdAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="btn-ghost p-2"
                          onClick={() => { setViewStudent(student); setShowDetail(true) }}
                          title="Detalii"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {userRole === 'ADMIN' && (
                          <>
                            <button
                              className="btn-ghost p-2"
                              onClick={() => { setEditStudent(student); setShowModal(true) }}
                              title="Editează"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="btn-ghost p-2 text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteId(student.id)}
                              title="Șterge"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <StudentModal
          student={editStudent}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchStudents() }}
        />
      )}

      {showDetail && viewStudent && (
        <StudentDetailModal
          studentId={viewStudent.id}
          onClose={() => { setShowDetail(false); setViewStudent(null) }}
          userRole={userRole}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Șterge student"
        description="Ești sigur că vrei să ștergi acest student? Toate datele asociate vor fi șterse."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
