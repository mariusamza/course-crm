export const dynamic = 'force-dynamic'

// app/api/finance/[id]/installments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function recalcFinance(financeId: string) {
  const installments = await prisma.paymentInstallment.findMany({ where: { financeId } })
  const paidAmount = installments
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount, 0)

  const finance = await prisma.finance.findUnique({ where: { id: financeId } })
  if (!finance) return

  let status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' = 'PENDING'
  if (paidAmount >= finance.totalAmount) status = 'PAID'
  else if (paidAmount > 0) status = 'PARTIAL'

  await prisma.finance.update({
    where: { id: financeId },
    data: { paidAmount, status }
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { amount, dueDate, method, notes } = body

  const installment = await prisma.paymentInstallment.create({
    data: {
      financeId: params.id,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      method: method || 'CASH',
      status: 'PENDING',
      notes: notes || null,
    }
  })

  return NextResponse.json({ data: installment }, { status: 201 })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { installmentId, status, paidDate, method, notes } = body

  const installment = await prisma.paymentInstallment.update({
    where: { id: installmentId },
    data: {
      status,
      paidDate: status === 'PAID' ? (paidDate ? new Date(paidDate) : new Date()) : null,
      method: method || undefined,
      notes: notes || null,
    }
  })

  await recalcFinance(params.id)
  return NextResponse.json({ data: installment })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { installmentId } = await req.json()
  await prisma.paymentInstallment.delete({ where: { id: installmentId } })
  await recalcFinance(params.id)

  return NextResponse.json({ message: 'Rată ștearsă' })
}
