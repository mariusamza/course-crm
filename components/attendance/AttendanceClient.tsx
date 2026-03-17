'use client'
// components/attendance/AttendanceClient.tsx
import { useState, useEffect, useCallback } from 'react'
import { CalendarDays, Plus, Loader2, CheckCircle2, XCircle, Clock, AlertCircle, BarChart2 } from 'lucide-react'
import { formatDate, STATUS_COLORS, STATUS_LABELS_RO } from '@/lib/utils'
import { SessionModal } from './SessionModal'
import { MarkAttendanceModal } from './MarkAttendanceModal'
import { useToast } from '@/hooks/useToast'

interface Props { userRole: string }

const STATUS_ICONS: Record<string, any> = {
  PRESENT: CheckCircle2,
  ABSENT: XCircle,
  LATE: Clock,
  LEAVE: AlertCircle,
}

export function AttendanceClient({ userRole }: Props) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'records' | 'stats'>('sessions')
  const [sessions, setSessions] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [loading, setLoading] = useState(true)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [markSession, setMarkSession] = useState<any>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [sessRes, recRes, crsRes] = await Promise.all([
        fetch(`/api/sessions${selectedCourse ? `?courseId=${selectedCourse}` : ''}`),
        fetch(`/api/attendance${selectedCourse ? `?courseId=${selectedCourse}` : ''}`),
        fetch('/api/courses'),
      ])
      const [sess, rec, crs] = await Promise.all([sessRes.json(), recRes.json(), crsRes.json()])
      setSessions(sess.data || [])
      setRecords(rec.data || [])
      setCourses(crs.data || [])
    } finally {
      setLoading(false)
    }
  }, [selectedCourse])

  useEffect(() => { fetchData() }, [fetchData])

  const deleteSession = async (id: string) => {
    if (!confirm('Ștergi sesiunea?')) return
    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
      toast({ title: 'Sesiune ștearsă' })
      fetchData()
    } catch {
      toast({ title: 'Eroare', variant: 'destructive' })
    }
  }

  // Stats computation
  const statsByCourse = courses.map(course => {
    const courseRecords = records.filter(r => r.session?.courseId === course.id)
    const total = courseRecords.length
    const present = courseRecords.filter(r => r.status === 'PRESENT').length
    const absent = courseRecords.filter(r => r.status === 'ABSENT').length
    const late = courseRecords.filter(r => r.status === 'LATE').length
    const rate = total > 0 ? Math.round((present / total) * 100) : 0
    return { course, total, present, absent, late, rate }
  }).filter(s => s.total > 0)

  const tabs = [
    { id: 'sessions', label: 'Sesiuni', icon: CalendarDays },
    { id: 'records', label: 'Înregistrări', icon: CheckCircle2 },
    { id: 'stats', label: 'Statistici', icon: BarChart2 },
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="page-title">Prezență</h1>
            <p className="text-sm text-muted-foreground">{sessions.length} sesiuni înregistrate</p>
          </div>
        </div>
        {userRole !== 'STUDENT' && (
          <button className="btn-primary" onClick={() => setShowSessionModal(true)}>
            <Plus className="w-4 h-4" />
            Sesiune nouă
          </button>
        )}
      </div>

      {/* Course filter */}
      <div className="flex items-center gap-3">
        <select
          className="form-input max-w-xs"
          value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}
        >
          <option value="">Toate cursurile</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Sessions tab */}
          {activeTab === 'sessions' && (
            <div className="card">
              <div className="overflow-x-auto">
                {sessions.length === 0 ? (
                  <div className="empty-state">
                    <CalendarDays className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="font-medium text-foreground">Nu s-au găsit sesiuni</p>
                    <p className="text-sm text-muted-foreground mt-1">Adaugă prima sesiune de curs</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Curs</th>
                        <th>Subiect</th>
                        <th>Ore</th>
                        <th>Prezențe</th>
                        {userRole !== 'STUDENT' && <th className="text-right">Acțiuni</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map(session => (
                        <tr key={session.id}>
                          <td className="font-semibold text-foreground">{formatDate(session.sessionDate)}</td>
                          <td>
                            <p className="font-medium text-foreground">{session.course?.name}</p>
                            <p className="text-xs font-mono text-muted-foreground">{session.course?.courseId}</p>
                          </td>
                          <td className="text-sm text-muted-foreground">{session.topic || '—'}</td>
                          <td className="text-sm text-muted-foreground font-mono">
                            {session.startTime} – {session.endTime}
                          </td>
                          <td>
                            <span className="badge bg-muted text-muted-foreground">
                              {session._count?.attendance || 0} studenți
                            </span>
                          </td>
                          {userRole !== 'STUDENT' && (
                            <td>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  className="btn-primary py-1.5 px-3 text-xs"
                                  onClick={() => setMarkSession(session)}
                                >
                                  Marchează prezența
                                </button>
                                <button
                                  className="btn-ghost p-2 text-destructive hover:bg-destructive/10"
                                  onClick={() => deleteSession(session.id)}
                                >
                                  ×
                                </button>
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
          )}

          {/* Records tab */}
          {activeTab === 'records' && (
            <div className="card">
              <div className="overflow-x-auto">
                {records.length === 0 ? (
                  <div className="empty-state">
                    <CheckCircle2 className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="font-medium text-foreground">Nu există înregistrări de prezență</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Curs</th>
                        <th>Sesiune</th>
                        <th>Status</th>
                        <th>Note</th>
                        <th>Marcat de</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map(rec => {
                        const Icon = STATUS_ICONS[rec.status]
                        return (
                          <tr key={rec.id}>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="avatar w-7 h-7 text-xs">
                                  {rec.student?.firstName?.[0]}{rec.student?.lastName?.[0]}
                                </div>
                                <span className="font-medium text-foreground text-sm">
                                  {rec.student?.firstName} {rec.student?.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="text-sm text-muted-foreground">{rec.session?.course?.name}</td>
                            <td>
                              <p className="text-sm text-foreground">{formatDate(rec.session?.sessionDate)}</p>
                              <p className="text-xs text-muted-foreground">{rec.session?.topic}</p>
                            </td>
                            <td>
                              <span className={`badge ${STATUS_COLORS[rec.status as keyof typeof STATUS_COLORS]} flex items-center gap-1 w-fit`}>
                                {Icon && <Icon className="w-3 h-3" />}
                                {STATUS_LABELS_RO[rec.status]}
                              </span>
                            </td>
                            <td className="text-sm text-muted-foreground">{rec.notes || '—'}</td>
                            <td className="text-sm text-muted-foreground font-mono">{rec.markedBy?.username}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Stats tab */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {statsByCourse.length === 0 ? (
                <div className="empty-state">
                  <BarChart2 className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="font-medium text-foreground">Nu există date statistice</p>
                </div>
              ) : (
                statsByCourse.map(({ course, total, present, absent, late, rate }) => (
                  <div key={course.id} className="card">
                    <div className="card-body">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-foreground">{course.name}</h3>
                          <p className="text-xs text-muted-foreground font-mono">{course.courseId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">{rate}%</p>
                          <p className="text-xs text-muted-foreground">rată prezență</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-muted rounded-full h-2.5 mb-4">
                        <div
                          className="bg-green-500 h-2.5 rounded-full transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        {[
                          { label: 'Total', value: total, color: 'text-foreground' },
                          { label: 'Prezenți', value: present, color: 'text-green-600' },
                          { label: 'Absenți', value: absent, color: 'text-red-600' },
                          { label: 'Întârziați', value: late, color: 'text-yellow-600' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="text-center">
                            <p className={`text-xl font-bold ${color}`}>{value}</p>
                            <p className="text-xs text-muted-foreground">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {showSessionModal && (
        <SessionModal
          onClose={() => setShowSessionModal(false)}
          onSave={() => { setShowSessionModal(false); fetchData() }}
          courses={courses}
        />
      )}

      {markSession && (
        <MarkAttendanceModal
          session={markSession}
          onClose={() => setMarkSession(null)}
          onSave={() => { setMarkSession(null); fetchData() }}
        />
      )}
    </div>
  )
}
