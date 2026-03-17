// app/api/sessions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { sessionDate, startTime, endTime, topic, notes } = body

  const updated = await prisma.courseSession.update({
    where: { id: params.id },
    data: {
      sessionDate: new Date(sessionDate),
      startTime,
      endTime,
      topic: topic || null,
      notes: notes || null,
    }
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.courseSession.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Sesiune ștearsă' })
}
