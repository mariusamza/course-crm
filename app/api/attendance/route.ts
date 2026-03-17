export const dynamic = 'force-dynamic'

// app/api/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId') || ''
  const studentId = searchParams.get('studentId') || ''
  const courseId = searchParams.get('courseId') || ''

  let where: any = {}
  if (sessionId) where.sessionId = sessionId
  if (studentId) where.studentId = studentId
  if (courseId) where.session = { courseId }
  if (session.user.role === 'STUDENT' && session.user.studentId) {
    where.studentId = session.user.studentId
  }

  const records = await prisma.attendance.findMany({
    where,
    include: {
      student: true,
      session: { include: { course: true } },
      markedBy: { select: { username: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: records })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { records } = body // Array of { sessionId, studentId, status, notes }

  try {
    const created = await Promise.all(
      records.map(async (r: any) => {
        return prisma.attendance.upsert({
          where: { sessionId_studentId: { sessionId: r.sessionId, studentId: r.studentId } },
          create: {
            sessionId: r.sessionId,
            studentId: r.studentId,
            status: r.status,
            notes: r.notes || null,
            markedById: session.user.id,
          },
          update: {
            status: r.status,
            notes: r.notes || null,
            markedById: session.user.id,
          }
        })
      })
    )
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Eroare la salvare prezență' }, { status: 500 })
  }
}
