export const dynamic = 'force-dynamic'

// app/trainers/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { TrainersClient } from '@/components/trainers/TrainersClient'

export default async function TrainersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <AppLayout>
      <TrainersClient />
    </AppLayout>
  )
}
