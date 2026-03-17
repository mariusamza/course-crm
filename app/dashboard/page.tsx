// app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardAdmin } from '@/components/dashboard/DashboardAdmin'
import { DashboardTeacher } from '@/components/dashboard/DashboardTeacher'
import { DashboardStudent } from '@/components/dashboard/DashboardStudent'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const role = session.user.role

  if (role === 'ADMIN') {
    const [
      totalStudents, totalTrainers, totalCourses, totalEnrollments,
      enrollmentsByStatus, coursesByStatus, recentStudents, recentCourses,
      financeStats,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.trainer.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.enrollment.groupBy({ by: ['status'], _count: true }),
      prisma.course.groupBy({ by: ['status'], _count: true }),
      prisma.student.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: true } }),
      prisma.course.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { trainer: true } }),
      prisma.finance.aggregate({ _sum: { totalAmount: true, paidAmount: true } }),
    ])

    const stats = {
      totalStudents,
      totalTrainers,
      totalCourses,
      totalEnrollments,
      enrollmentsByStatus: {
        interested: enrollmentsByStatus.find(e => e.status === 'INTERESTED')?._count || 0,
        following: enrollmentsByStatus.find(e => e.status === 'FOLLOWING')?._count || 0,
        finished: enrollmentsByStatus.find(e => e.status === 'FINISHED')?._count || 0,
      },
      coursesByStatus: {
        upcoming: coursesByStatus.find(c => c.status === 'UPCOMING')?._count || 0,
        ongoing: coursesByStatus.find(c => c.status === 'ONGOING')?._count || 0,
        completed: coursesByStatus.find(c => c.status === 'COMPLETED')?._count || 0,
      },
      totalRevenue: financeStats._sum.totalAmount || 0,
      collectedRevenue: financeStats._sum.paidAmount || 0,
    }

    return (
      <AppLayout>
        <DashboardAdmin
          stats={stats}
          recentStudents={JSON.parse(JSON.stringify(recentStudents))}
          recentCourses={JSON.parse(JSON.stringify(recentCourses))}
        />
      </AppLayout>
    )
  }

  if (role === 'TEACHER') {
    const trainer = await prisma.trainer.findUnique({
      where: { userId: session.user.id },
      include: {
        courses: {
          include: {
            enrollments: true,
            sessions: true,
          }
        }
      }
    })
    return (
      <AppLayout>
        <DashboardTeacher trainer={JSON.parse(JSON.stringify(trainer))} />
      </AppLayout>
    )
  }

  // Student dashboard
  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      enrollments: {
        include: { course: { include: { trainer: true } } }
      },
      attendance: {
        include: { session: { include: { course: true } } },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }
    }
  })
  return (
    <AppLayout>
      <DashboardStudent student={JSON.parse(JSON.stringify(student))} />
    </AppLayout>
  )
}
