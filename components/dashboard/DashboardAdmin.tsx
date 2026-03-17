'use client'
// components/dashboard/DashboardAdmin.tsx
import { Users, UserCheck, BookOpen, ClipboardList, TrendingUp, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS_RO } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  stats: {
    totalStudents: number
    totalTrainers: number
    totalCourses: number
    totalEnrollments: number
    enrollmentsByStatus: { interested: number; following: number; finished: number }
    coursesByStatus: { upcoming: number; ongoing: number; completed: number }
    totalRevenue: number
    collectedRevenue: number
  }
  recentStudents: any[]
  recentCourses: any[]
}

export function DashboardAdmin({ stats, recentStudents, recentCourses }: Props) {
  const statCards = [
    { label: 'Studenți', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', href: '/students' },
    { label: 'Traineri', value: stats.totalTrainers, icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', href: '/trainers' },
    { label: 'Cursuri', value: stats.totalCourses, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', href: '/courses' },
    { label: 'Înscrieri', value: stats.totalEnrollments, icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', href: '/enrollments' },
  ]

  const pendingRevenue = stats.totalRevenue - stats.collectedRevenue

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="stat-card group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Revenue + enrollments row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue card */}
        <div className="stat-card lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Venituri totale</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Colectat</span>
              <span className="font-semibold text-green-600">{formatCurrency(stats.collectedRevenue)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${stats.totalRevenue > 0 ? (stats.collectedRevenue / stats.totalRevenue) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">În așteptare</span>
              <span className="font-semibold text-orange-600">{formatCurrency(pendingRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Enrollments by status */}
        <div className="stat-card lg:col-span-1">
          <p className="text-sm font-semibold text-muted-foreground mb-4">Înscrieri după status</p>
          <div className="space-y-3">
            {[
              { label: 'Interesați', value: stats.enrollmentsByStatus.interested, status: 'INTERESTED' },
              { label: 'Înscriși', value: stats.enrollmentsByStatus.following, status: 'FOLLOWING' },
              { label: 'Absolvenți', value: stats.enrollmentsByStatus.finished, status: 'FINISHED' },
            ].map(({ label, value, status }) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`badge ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`}>{label}</span>
                </div>
                <span className="font-bold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Courses by status */}
        <div className="stat-card lg:col-span-1">
          <p className="text-sm font-semibold text-muted-foreground mb-4">Cursuri după status</p>
          <div className="space-y-3">
            {[
              { label: 'Viitoare', value: stats.coursesByStatus.upcoming, status: 'UPCOMING' },
              { label: 'În desfășurare', value: stats.coursesByStatus.ongoing, status: 'ONGOING' },
              { label: 'Finalizate', value: stats.coursesByStatus.completed, status: 'COMPLETED' },
            ].map(({ label, value, status }) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`badge ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`}>{label}</span>
                </div>
                <span className="font-bold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent students */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-foreground">Studenți recenți</h2>
            <Link href="/students" className="text-sm text-primary hover:underline">Vezi toți</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>ID</th>
                  <th>Data înregistrării</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar w-8 h-8 text-xs">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground">{student.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-sm text-muted-foreground">{student.studentId}</td>
                    <td className="text-sm text-muted-foreground">{formatDate(student.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent courses */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-foreground">Cursuri recente</h2>
            <Link href="/courses" className="text-sm text-primary hover:underline">Vezi toate</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Curs</th>
                  <th>Status</th>
                  <th>Trainer</th>
                </tr>
              </thead>
              <tbody>
                {recentCourses.map((course) => (
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
                    <td className="text-sm text-muted-foreground">
                      {course.trainer ? `${course.trainer.firstName} ${course.trainer.lastName}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
