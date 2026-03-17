export const dynamic = 'force-dynamic'

// app/enrollments/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { EnrollmentsClient } from '@/components/enrollments/EnrollmentsClient'

export default async function EnrollmentsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  return (
    <AppLayout>
      <EnrollmentsClient userRole={session.user.role} />
    </AppLayout>
  )
}
