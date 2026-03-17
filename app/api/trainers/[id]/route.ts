// app/api/trainers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { firstName, lastName, phone, email, bio, password } = body

    const trainer = await prisma.trainer.findUnique({ where: { id: params.id } })
    if (!trainer) return NextResponse.json({ error: 'Trainer negăsit' }, { status: 404 })

    const updated = await prisma.trainer.update({
      where: { id: params.id },
      data: { firstName, lastName, phone: phone || null, email: email || null, bio: bio || null }
    })

    if (email || password) {
      const userUpdate: any = {}
      if (email) userUpdate.email = email
      if (password) userUpdate.password = await bcrypt.hash(password, 10)
      await prisma.user.update({ where: { id: trainer.userId }, data: userUpdate })
    }

    return NextResponse.json({ data: updated })
  } catch (error: any) {
    return NextResponse.json({ error: 'Eroare la actualizare' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const trainer = await prisma.trainer.findUnique({
    where: { id: params.id },
    include: { _count: { select: { courses: true } } }
  })

  if (!trainer) return NextResponse.json({ error: 'Trainer negăsit' }, { status: 404 })

  if (trainer._count.courses > 0) {
    return NextResponse.json({
      error: 'Nu poți șterge un trainer cu cursuri active. Dezasignează cursurile mai întâi.'
    }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: trainer.userId } })
  return NextResponse.json({ message: 'Trainer șters cu succes' })
}
