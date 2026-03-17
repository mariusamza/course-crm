export const dynamic = 'force-dynamic'

// app/api/students/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, username: true, email: true, role: true } },
      enrollments: { include: { course: { include: { trainer: true } } } },
      documents: true,
      notes: { include: { author: { select: { username: true, role: true } } }, orderBy: { createdAt: 'desc' } },
      attendance: {
        include: { session: { include: { course: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      finance: { include: { course: true, installments: true } },
    }
  })

  if (!student) return NextResponse.json({ error: 'Student negăsit' }, { status: 404 })
  return NextResponse.json({ data: student })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      firstName, lastName, cnp, phone, address, ciSeries, ciNumber,
      guardianName, guardianPhone, guardianEmail,
      email, password
    } = body

    const student = await prisma.student.findUnique({ where: { id: params.id }, include: { user: true } })
    if (!student) return NextResponse.json({ error: 'Student negăsit' }, { status: 404 })

    // Update student
    const updated = await prisma.student.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        cnp: cnp || null,
        phone: phone || null,
        address: address || null,
        ciSeries: ciSeries || null,
        ciNumber: ciNumber || null,
        guardianName: guardianName || null,
        guardianPhone: guardianPhone || null,
        guardianEmail: guardianEmail || null,
      }
    })

    // Update user email/password if provided
    if (email || password) {
      const userUpdate: any = {}
      if (email) userUpdate.email = email
      if (password) userUpdate.password = await bcrypt.hash(password, 10)
      await prisma.user.update({ where: { id: student.userId }, data: userUpdate })
    }

    return NextResponse.json({ data: updated })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'CNP sau email deja există' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Eroare la actualizare' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const student = await prisma.student.findUnique({ where: { id: params.id } })
  if (!student) return NextResponse.json({ error: 'Student negăsit' }, { status: 404 })

  // Cascade delete via user (student is deleted with user)
  await prisma.user.delete({ where: { id: student.userId } })

  return NextResponse.json({ message: 'Student șters cu succes' })
}
