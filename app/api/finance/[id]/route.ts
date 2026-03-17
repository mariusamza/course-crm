export const dynamic = 'force-dynamic'

// app/api/finance/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function calcStatus(total: number, paid: number): 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' {
  if (paid >= total) return 'PAID'
  if (paid > 0) return 'PARTIAL'
  return 'PENDING'
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { totalAmount, notes } = body

  const finance = await prisma.finance.findUnique({ where: { id: params.id } })
  if (!finance) return NextResponse.json({ error: 'Record negăsit' }, { status: 404 })

  const updated = await prisma.finance.update({
    where: { id: params.id },
    data: {
      totalAmount: parseFloat(totalAmount),
      status: calcStatus(parseFloat(totalAmount), finance.paidAmount),
      notes: notes || null,
    },
    include: { student: true, course: true, installments: true }
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.finance.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Record financiar șters' })
}
