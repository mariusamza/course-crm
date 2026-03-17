'use client'
// components/dashboard/DashboardTeacher.tsx
import { BookOpen, Users, CalendarDays, TrendingUp } from 'lucide-react'
import { formatDate, STATUS_COLORS, STATUS_LABELS_RO } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  trainer: any
}

export function DashboardTeacher({ trainer }: Props) {
  if (!trainer) {
    return (
      <div className="empty-state">
        <p className="text-muted-foreground">Profilul de trainer nu a fost găsit.</p>
      </div>
    )
  }

  const totalStudents = trainer.courses.reduce((acc: number, c: any) => acc + c.enrollments.length, 0)
  const totalSessions = trainer.courses.reduce((acc: number, c: any) => acc + c.sessions.length, 0)
  const activeCourses = trainer.courses.filter((c: any) => c.status === 'ONGOING').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Bun venit, {trainer.firstName}!</h2>
        <p className="text-muted-foreground mt-1">Iată o privire de ansamblu asupra cursurilor tale</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cursuri totale', value: trainer.courses.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: 'Cursuri active', value: activeCourses, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
          { label: 'Studenți totali', value: totalStudents, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
          { label: 'Sesiuni totale', value: totalSessions, icon: CalendarDays, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
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
          <Link href="/courses" className="text-sm text-primary hover:underline">Vezi toate</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Curs</th>
                <th>Status</th>
                <th>Studenți</th>
                <th>Sesiuni</th>
                <th>Dată start</th>
              </tr>
            </thead>
            <tbody>
              {trainer.courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">Nu ai cursuri asignate</td>
                </tr>
              ) : (
                trainer.courses.map((course: any) => (
                  <tr key={course.id}>
                    <td>
                      <p className="font-medium text-foreground">{course.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{course.courseId}</p>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[course.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS_RO[course.status]}
                      </span>
                    </td>
                    <td className="font-semibold">{course.enrollments.length}</td>
                    <td className="font-semibold">{course.sessions.length}</td>
                    <td className="text-sm text-muted-foreground">{formatDate(course.startDate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
