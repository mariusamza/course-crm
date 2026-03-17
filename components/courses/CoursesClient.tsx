'use client'
// components/courses/CoursesClient.tsx
import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Plus, Search, Pencil, Trash2, X, Loader2, Calendar, Users, Clock } from 'lucide-react'
import { formatDate, STATUS_COLORS, STATUS_LABELS_RO, DAYS_RO } from '@/lib/utils'
import { CourseModal } from './CourseModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/hooks/useToast'

interface Props {
  userRole: string
}

export function CoursesClient({ userRole }: Props) {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editCourse, setEditCourse] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/courses?${params}`)
      const data = await res.json()
      setCourses(data.data || [])
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    const timer = setTimeout(fetchCourses, 300)
    return () => clearTimeout(timer)
  }, [fetchCourses])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/courses/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ title: 'Curs șters' })
      fetchCourses()
    } catch {
      toast({ title: 'Eroare la ștergere', variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  const statusOptions = [
    { value: '', label: 'Toate' },
    { value: 'UPCOMING', label: 'Viitoare' },
    { value: 'ONGOING', label: 'În desfășurare' },
    { value: 'COMPLETED', label: 'Finalizate' },
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="page-title">Cursuri</h1>
            <p className="text-sm text-muted-foreground">{courses.length} cursuri</p>
          </div>
        </div>
        {userRole === 'ADMIN' && (
          <button className="btn-primary" onClick={() => { setEditCourse(null); setShowModal(true) }}>
            <Plus className="w-4 h-4" />
            Adaugă curs
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="search-input w-full"
              placeholder="Caută curs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch('')}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">Nu s-au găsit cursuri</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="card group hover:shadow-md transition-all duration-200">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge ${STATUS_COLORS[course.status as keyof typeof STATUS_COLORS]}`}>
                    {STATUS_LABELS_RO[course.status]}
                  </span>
                  {userRole === 'ADMIN' && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="btn-ghost p-1.5" onClick={() => { setEditCourse(course); setShowModal(true) }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="btn-ghost p-1.5 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(course.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-foreground text-base mb-1">{course.name}</h3>
                <p className="text-xs font-mono text-muted-foreground mb-3">{course.courseId}</p>

                {course.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formatDate(course.startDate)} — {formatDate(course.endDate)}</span>
                  </div>

                  {course.trainer && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="avatar w-5 h-5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                        {course.trainer.firstName[0]}
                      </div>
                      <span>{course.trainer.firstName} {course.trainer.lastName}</span>
                    </div>
                  )}

                  {course.weekDays?.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{course.weekDays.map((d: string) => DAYS_RO[d] || d).join(', ')}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{course._count?.enrollments || 0} studenți înscriși</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CourseModal
          course={editCourse}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchCourses() }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Șterge curs"
        description="Ești sigur că vrei să ștergi acest curs? Toate sesiunile, înscrierile și prezența vor fi șterse."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
