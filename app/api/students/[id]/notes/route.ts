// app/api/students/[id]/notes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Conținut obligatoriu' }, { status: 400 })

  const note = await prisma.studentNote.create({
    data: {
      content,
      studentId: params.id,
      authorId: session.user.id,
    },
    include: { author: { select: { username: true, role: true } } }
  })

  return NextResponse.json({ data: note }, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { noteId } = await req.json()
  const note = await prisma.studentNote.findUnique({ where: { id: noteId } })

  if (!note) return NextResponse.json({ error: 'Notă negăsită' }, { status: 404 })
  if (note.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Nu ai permisiunea să ștergi această notă' }, { status: 403 })
  }

  await prisma.studentNote.delete({ where: { id: noteId } })
  return NextResponse.json({ message: 'Notă ștearsă' })
}
