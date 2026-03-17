export const dynamic = 'force-dynamic'

// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCourseStatus } from '@/lib/utils'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      trainer: true,
      enrollments: { include: { student: true } },
      sessions: { include: { attendance: { include: { student: true } } }, orderBy: { sessionDate: 'desc' } },
      finance: { include: { student: true, installments: true } },
    }
  })

  if (!course) return NextResponse.json({ error: 'Curs negăsit' }, { status: 404 })
  return NextResponse.json({ data: course })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, description, startDate, endDate, timeSlots, weekDays, trainerId } = body
    const status = getCourseStatus(startDate, endDate)

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json({ data: course })
  } catch (error) {
    return NextResponse.json({ error: 'Eroare la actualizare curs' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.course.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Curs șters cu succes' })
}
