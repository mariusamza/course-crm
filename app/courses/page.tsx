export const dynamic = 'force-dynamic'

// app/courses/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { CoursesClient } from '@/components/courses/CoursesClient'

export default async function CoursesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  return (
    <AppLayout>
      <CoursesClient userRole={session.user.role} />
    </AppLayout>
  )
}
