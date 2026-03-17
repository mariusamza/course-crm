// app/api/students/[id]/documents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, type, fileData, mimeType, size } = body

  // Max 10 documents per student
  const count = await prisma.studentDocument.count({ where: { studentId: params.id } })
  if (count >= 10) {
    return NextResponse.json({ error: 'Maxim 10 documente per student' }, { status: 400 })
  }

  const doc = await prisma.studentDocument.create({
    data: { name, type, fileData, mimeType, size, studentId: params.id }
  })

  return NextResponse.json({ data: { ...doc, fileData: undefined } }, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { docId } = await req.json()
  await prisma.studentDocument.delete({ where: { id: docId } })
  return NextResponse.json({ message: 'Document șters' })
}

// GET single document (with file data for download)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const docId = searchParams.get('docId')

  if (docId) {
    const doc = await prisma.studentDocument.findUnique({ where: { id: docId } })
    if (!doc) return NextResponse.json({ error: 'Document negăsit' }, { status: 404 })
    return NextResponse.json({ data: doc })
  }

  const docs = await prisma.studentDocument.findMany({
    where: { studentId: params.id },
    select: { id: true, name: true, type: true, mimeType: true, size: true, createdAt: true }
  })
  return NextResponse.json({ data: docs })
}
