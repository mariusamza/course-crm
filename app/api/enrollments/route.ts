export const dynamic = 'force-dynamic'

// app/api/enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId') || ''
  const studentId = searchParams.get('studentId') || ''
  const status = searchParams.get('status') || ''

  let where: any = {}
  if (courseId) where.courseId = courseId
  if (studentId) where.studentId = studentId
  if (status) where.status = status

  if (session.user.role === 'TEACHER' && session.user.trainerId) {
    where.course = { trainerId: session.user.trainerId }
  }
  if (session.user.role === 'STUDENT' && session.user.studentId) {
    where.studentId = session.user.studentId
  }

  const enrollments = await prisma.enrollment.findMany({
    where,
    include: {
      student: true,
      course: { include: { trainer: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: enrollments })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { studentId, courseId, status, notes } = body

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        status: status || 'INTERESTED',
        notes: notes || null,
        enrollmentDate: new Date(),
        completionDate: status === 'FINISHED' ? new Date() : null,
      },
      include: { student: true, course: true }
    })

    return NextResponse.json({ data: enrollment }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Studentul este deja înscris la acest curs' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Eroare la creare înscriere' }, { status: 500 })
  }
}
