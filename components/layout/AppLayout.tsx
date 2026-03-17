// components/layout/AppLayout.tsx
'use client'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, UserCheck, BookOpen, ClipboardList,
  CalendarDays, DollarSign, Settings, LogOut, Menu, X,
  GraduationCap, ChevronDown, Moon, Sun, Bell
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn, getInitials } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { href: '/students', icon: Users, label: 'Studenți', roles: ['ADMIN', 'TEACHER'] },
  { href: '/trainers', icon: UserCheck, label: 'Traineri', roles: ['ADMIN'] },
  { href: '/courses', icon: BookOpen, label: 'Cursuri', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { href: '/enrollments', icon: ClipboardList, label: 'Înscrieri', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { href: '/attendance', icon: CalendarDays, label: 'Prezență', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { href: '/finance', icon: DollarSign, label: 'Finanțe', roles: ['ADMIN'] },
  { href: '/settings', icon: Settings, label: 'Setări', roles: ['ADMIN'] },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const userRole = session?.user?.role || ''
  const filteredNav = navItems.filter(item => item.roles.includes(userRole))

  const initials = session?.user?.name
    ? getInitials(session.user.name.split(' ')[0], session.user.name.split(' ')[1] || '')
    : (session?.user?.username?.[0] || '?').toUpperCase()

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'sidebar transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm leading-tight">Course CRM</p>
            <p className="text-xs text-muted-foreground">Management cursuri</p>
          </div>
          <button
            className="ml-auto lg:hidden btn-ghost p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {userRole === 'ADMIN' ? 'Administrator' : userRole === 'TEACHER' ? 'Trainer' : 'Student'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-thin">
          {filteredNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-link', pathname.startsWith(item.href) && 'active')}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-border">
          <div className="relative">
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="avatar w-8 h-8 text-xs flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-foreground truncate">
                  {session?.user?.username || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.email || ''}
                </p>
              </div>
              <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')} />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden animate-fade-in">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Mod luminos' : 'Mod întunecat'}
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  <LogOut className="w-4 h-4" />
                  Deconectare
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-[260px]">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border px-6 flex items-center gap-4" style={{ height: 'var(--header-height)' }}>
          <button
            className="lg:hidden btn-ghost p-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground capitalize">
              {filteredNav.find(n => pathname.startsWith(n.href))?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2">
            <button
              className="btn-ghost p-2 hidden sm:flex"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
