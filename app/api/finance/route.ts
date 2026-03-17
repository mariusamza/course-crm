// app/api/finance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get('studentId') || ''
  const courseId = searchParams.get('courseId') || ''
  const status = searchParams.get('status') || ''

  let where: any = {}
  if (studentId) where.studentId = studentId
  if (courseId) where.courseId = courseId
  if (status) where.status = status

  const records = await prisma.finance.findMany({
    where,
    include: {
      student: true,
      course: true,
      installments: { orderBy: { dueDate: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate stats
  const stats = await prisma.finance.aggregate({
    _sum: { totalAmount: true, paidAmount: true },
    _count: true,
  })

  const overdueCount = await prisma.paymentInstallment.count({
    where: {
      status: 'PENDING',
      dueDate: { lt: new Date() }
    }
  })

  return NextResponse.json({
    data: records,
    stats: {
      totalRevenue: stats._sum.totalAmount || 0,
      collectedRevenue: stats._sum.paidAmount || 0,
      pendingRevenue: (stats._sum.totalAmount || 0) - (stats._sum.paidAmount || 0),
      totalRecords: stats._count,
      overdueCount,
    }
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { studentId, courseId, totalAmount, advanceAmount, notes } = body

    const finance = await prisma.finance.create({
      data: {
        studentId,
        courseId,
        totalAmount: parseFloat(totalAmount),
        paidAmount: parseFloat(advanceAmount || 0),
        advanceAmount: parseFloat(advanceAmount || 0),
        status: advanceAmount >= totalAmount ? 'PAID' : advanceAmount > 0 ? 'PARTIAL' : 'PENDING',
        notes: notes || null,
      },
      include: { student: true, course: true, installments: true }
    })

    return NextResponse.json({ data: finance }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Există deja un record financiar pentru acest student și curs' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Eroare la creare record financiar' }, { status: 500 })
  }
}
