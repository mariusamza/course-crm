// app/api/students/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  const where = search ? {
    OR: [
      { firstName: { contains: search, mode: 'insensitive' as const } },
      { lastName: { contains: search, mode: 'insensitive' as const } },
      { studentId: { contains: search, mode: 'insensitive' as const } },
      { cnp: { contains: search, mode: 'insensitive' as const } },
      { phone: { contains: search, mode: 'insensitive' as const } },
      { address: { contains: search, mode: 'insensitive' as const } },
      { guardianName: { contains: search, mode: 'insensitive' as const } },
    ]
  } : {}

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, email: true, role: true } },
        enrollments: { include: { course: true } },
        documents: { select: { id: true, name: true, type: true, mimeType: true, size: true, createdAt: true } },
        _count: { select: { notes: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ])

  return NextResponse.json({ data: students, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      firstName, lastName, cnp, phone, address, ciSeries, ciNumber,
      guardianName, guardianPhone, guardianEmail,
      username, email, password
    } = body

    // Generate student ID
    const count = await prisma.student.count()
    const studentId = `STU${String(count + 1).padStart(3, '0')}`

    const hashedPassword = await bcrypt.hash(password || 'student123', 10)

    const user = await prisma.user.create({
      data: {
        username,
        email: email || undefined,
        password: hashedPassword,
        role: 'STUDENT',
        student: {
          create: {
            studentId,
            firstName,
            lastName,
            cnp: cnp || undefined,
            phone: phone || undefined,
            address: address || undefined,
            ciSeries: ciSeries || undefined,
            ciNumber: ciNumber || undefined,
            guardianName: guardianName || undefined,
            guardianPhone: guardianPhone || undefined,
            guardianEmail: guardianEmail || undefined,
          }
        }
      },
      include: { student: true }
    })

    return NextResponse.json({ data: user.student }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Username, email sau CNP deja există' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Eroare la creare student' }, { status: 500 })
  }
}
