'use client'
// components/dashboard/DashboardStudent.tsx
import { BookOpen, ClipboardList, CheckCircle, Clock } from 'lucide-react'
import { formatDate, STATUS_COLORS, STATUS_LABELS_RO } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  student: any
}

export function DashboardStudent({ student }: Props) {
  if (!student) {
    return (
      <div className="empty-state">
        <p className="text-muted-foreground">Profilul de student nu a fost găsit.</p>
      </div>
    )
  }

  const activeEnrollments = student.enrollments.filter((e: any) => e.status === 'FOLLOWING').length
  const finishedEnrollments = student.enrollments.filter((e: any) => e.status === 'FINISHED').length
  const presentCount = student.attendance.filter((a: any) => a.status === 'PRESENT').length
  const attendanceRate = student.attendance.length > 0
    ? Math.round((presentCount / student.attendance.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Bun venit, {student.firstName}!</h2>
        <p className="text-muted-foreground mt-1">Urmărește progresul tău academic</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cursuri înscrise', value: student.enrollments.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: 'Cursuri active', value: activeEnrollments, icon: ClipboardList, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
          { label: 'Cursuri absolvite', value: finishedEnrollments, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
          { label: 'Rată prezență', value: `${attendanceRate}%`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
        ].map((card) => (
          <div key={card.label} className="stat-card">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* My courses */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-foreground">Cursurile mele</h2>
          <Link href="/enrollments" className="text-sm text-primary hover:underline">Vezi toate</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Curs</th>
                <th>Status</th>
                <th>Trainer</th>
                <th>Data înscrierii</th>
              </tr>
            </thead>
            <tbody>
              {student.enrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">Nu ești înscris la niciun curs</td>
                </tr>
              ) : (
                student.enrollments.map((enrollment: any) => (
                  <tr key={enrollment.id}>
                    <td>
                      <p className="font-medium text-foreground">{enrollment.course.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{enrollment.course.courseId}</p>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[enrollment.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS_RO[enrollment.status]}
                      </span>
                    </td>
                    <td className="text-sm text-muted-foreground">
                      {enrollment.course.trainer
                        ? `${enrollment.course.trainer.firstName} ${enrollment.course.trainer.lastName}`
                        : '—'}
                    </td>
                    <td className="text-sm text-muted-foreground">{formatDate(enrollment.enrollmentDate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent attendance */}
      {student.attendance.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-foreground">Prezență recentă</h2>
            <Link href="/attendance" className="text-sm text-primary hover:underline">Vezi toate</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sesiune</th>
                  <th>Curs</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {student.attendance.slice(0, 5).map((record: any) => (
                  <tr key={record.id}>
                    <td className="font-medium text-foreground">{record.session.topic || 'Sesiune'}</td>
                    <td className="text-sm text-muted-foreground">{record.session.course?.name}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[record.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS_RO[record.status]}
                      </span>
                    </td>
                    <td className="text-sm text-muted-foreground">{formatDate(record.session.sessionDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
