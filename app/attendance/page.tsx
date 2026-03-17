export const dynamic = 'force-dynamic'

// app/attendance/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { AttendanceClient } from '@/components/attendance/AttendanceClient'

export default async function AttendancePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  return (
    <AppLayout>
      <AttendanceClient userRole={session.user.role} />
    </AppLayout>
  )
}
