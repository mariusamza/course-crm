export const dynamic = 'force-dynamic'

// app/api/trainers/route.ts
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

  const where = search ? {
    OR: [
      { firstName: { contains: search, mode: 'insensitive' as const } },
      { lastName: { contains: search, mode: 'insensitive' as const } },
      { trainerId: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
    ]
  } : {}

  const trainers = await prisma.trainer.findMany({
    where,
    include: {
      user: { select: { id: true, username: true, email: true } },
      _count: { select: { courses: true } },
      courses: { select: { id: true, name: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: trainers })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { firstName, lastName, phone, email, bio, username, password } = body

    const count = await prisma.trainer.count()
    const trainerId = `TRN${String(count + 1).padStart(3, '0')}`
    const hashedPassword = await bcrypt.hash(password || 'teacher123', 10)

    const user = await prisma.user.create({
      data: {
        username,
        email: email || undefined,
        password: hashedPassword,
        role: 'TEACHER',
        trainer: {
          create: {
            trainerId,
            firstName,
            lastName,
            phone: phone || undefined,
            email: email || undefined,
            bio: bio || undefined,
          }
        }
      },
      include: { trainer: true }
    })

    return NextResponse.json({ data: user.trainer }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Username sau email deja există' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Eroare la creare trainer' }, { status: 500 })
  }
}
