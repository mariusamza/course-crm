// app/login/page.tsx
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Utilizator sau parolă incorectă')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const loginAsDemo = async (role: string) => {
    const accounts: Record<string, { username: string; password: string }> = {
      admin: { username: 'admin', password: 'admin123' },
      teacher: { username: 'ion.popescu', password: 'teacher123' },
      student: { username: 'elena.dumitrescu', password: 'student123' },
    }
    const account = accounts[role]
    setUsername(account.username)
    setPassword(account.password)
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { ...account, redirect: false })
    if (result?.error) {
      setError('Eroare la autentificare demo')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary items-center justify-center mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Course CRM</h1>
          <p className="text-muted-foreground text-sm mt-1">Autentifică-te în contul tău</p>
        </div>

        {/* Form card */}
        <div className="card shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Utilizator</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="form-label">Parolă</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full justify-center"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Se autentifică...' : 'Autentifică-te'}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-center text-muted-foreground mb-3 font-medium uppercase tracking-wider">Conturi demo</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'admin', label: 'Admin', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800' },
                  { role: 'teacher', label: 'Trainer', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' },
                  { role: 'student', label: 'Student', color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800' },
                ].map(({ role, label, color }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => loginAsDemo(role)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all hover:shadow-sm disabled:opacity-50 ${color}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
