// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCourseStatus } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const trainerId = searchParams.get('trainerId') || ''

  let where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { courseId: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status
  if (trainerId) where.trainerId = trainerId

  // For teachers, only show their courses
  if (session.user.role === 'TEACHER' && session.user.trainerId) {
    where.trainerId = session.user.trainerId
  }

  // For students, only show courses they're enrolled in
  if (session.user.role === 'STUDENT' && session.user.studentId) {
    where.enrollments = { some: { studentId: session.user.studentId } }
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      trainer: true,
      _count: { select: { enrollments: true, sessions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: courses })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, description, startDate, endDate, timeSlots, weekDays, trainerId } = body

    const count = await prisma.course.count()
    const courseId = `CRS${String(count + 1).padStart(3, '0')}`
    const status = getCourseStatus(startDate, endDate)

    const course = await prisma.course.create({
      data: {
        courseId,
        name,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        timeSlots,
        weekDays,
        trainerId: trainerId || null,
      },
      include: { trainer: true }
    })

    return NextResponse.json({ data: course }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Eroare la creare curs' }, { status: 500 })
  }
}
