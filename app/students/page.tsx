export const dynamic = 'force-dynamic'

// app/students/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { StudentsClient } from '@/components/students/StudentsClient'

export default async function StudentsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role === 'STUDENT') redirect('/dashboard')

  return (
    <AppLayout>
      <StudentsClient userRole={session.user.role} />
    </AppLayout>
  )
}
