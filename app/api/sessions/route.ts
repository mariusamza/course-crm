// app/api/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId') || ''

  const sessions = await prisma.courseSession.findMany({
    where: courseId ? { courseId } : {},
    include: {
      course: true,
      _count: { select: { attendance: true } },
    },
    orderBy: { sessionDate: 'desc' },
  })

  return NextResponse.json({ data: sessions })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { courseId, sessionDate, startTime, endTime, topic, notes } = body

    const courseSession = await prisma.courseSession.create({
      data: {
        courseId,
        sessionDate: new Date(sessionDate),
        startTime,
        endTime,
        topic: topic || null,
        notes: notes || null,
      },
      include: { course: true }
    })

    return NextResponse.json({ data: courseSession }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Eroare la creare sesiune' }, { status: 500 })
  }
}
