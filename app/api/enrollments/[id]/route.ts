// app/api/enrollments/[id]/route.ts
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
  const { status, notes } = body

  const enrollment = await prisma.enrollment.update({
    where: { id: params.id },
    data: {
      status,
      notes: notes || null,
      completionDate: status === 'FINISHED' ? new Date() : null,
    },
    include: { student: true, course: true }
  })

  return NextResponse.json({ data: enrollment })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.enrollment.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Înscriere ștearsă' })
}
