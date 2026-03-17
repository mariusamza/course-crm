// app/finance/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { FinanceClient } from '@/components/finance/FinanceClient'

export default async function FinancePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')
  return (
    <AppLayout>
      <FinanceClient />
    </AppLayout>
  )
}
