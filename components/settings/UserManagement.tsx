'use client'
// components/settings/UserManagement.tsx
import { useState, useEffect } from 'react'
import { Users, Loader2, Search, Shield, GraduationCap, UserCheck } from 'lucide-react'

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  ADMIN: { label: 'Administrator', icon: Shield, color: 'text-red-600 bg-red-50 dark:bg-red-950' },
  TEACHER: { label: 'Trainer', icon: UserCheck, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  STUDENT: { label: 'Student', icon: GraduationCap, color: 'text-green-600 bg-green-50 dark:bg-green-950' },
}

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Fetch all users from multiple endpoints
    Promise.all([
      fetch('/api/students').then(r => r.json()),
      fetch('/api/trainers').then(r => r.json()),
    ]).then(([students, trainers]) => {
      const studentUsers = (students.data || []).map((s: any) => ({
        id: s.user?.id,
        username: s.user?.username,
        email: s.user?.email,
        role: 'STUDENT',
        name: `${s.firstName} ${s.lastName}`,
        entityId: s.studentId,
      }))
      const trainerUsers = (trainers.data || []).map((t: any) => ({
        id: t.user?.id,
        username: t.user?.username,
        email: t.user?.email,
        role: 'TEACHER',
        name: `${t.firstName} ${t.lastName}`,
        entityId: t.trainerId,
      }))
      setUsers([...trainerUsers, ...studentUsers])
      setLoading(false)
    })
  }, [])

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.username?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input className="search-input w-full" placeholder="Caută utilizator..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>{users.filter(u => u.role === 'TEACHER').length} traineri</span>
          <span>•</span>
          <span>{users.filter(u => u.role === 'STUDENT').length} studenți</span>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Utilizator</th>
                  <th>Rol</th>
                  <th>ID entitate</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {/* Admin user row */}
                <tr>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar w-8 h-8 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">A</div>
                      <div>
                        <p className="font-semibold text-foreground">admin</p>
                        <p className="text-xs text-muted-foreground">Administrator sistem</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge text-red-600 bg-red-50 dark:bg-red-950 flex items-center gap-1 w-fit">
                      <Shield className="w-3 h-3" />
                      Administrator
                    </span>
                  </td>
                  <td className="font-mono text-sm text-muted-foreground">—</td>
                  <td className="text-sm text-muted-foreground">admin@coursecrm.com</td>
                </tr>
                {filtered.map(user => {
                  const config = ROLE_CONFIG[user.role]
                  const Icon = config?.icon
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar w-8 h-8 text-xs">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge flex items-center gap-1 w-fit ${config?.color}`}>
                          {Icon && <Icon className="w-3 h-3" />}
                          {config?.label}
                        </span>
                      </td>
                      <td className="font-mono text-sm text-muted-foreground">{user.entityId}</td>
                      <td className="text-sm text-muted-foreground">{user.email || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        * Utilizatorii sunt gestionați prin secțiunile <strong>Studenți</strong> și <strong>Traineri</strong>. Fiecare student/trainer creat primește automat un cont de acces.
      </p>
    </div>
  )
}
