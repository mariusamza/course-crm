'use client'
// components/settings/SettingsClient.tsx
import { useState } from 'react'
import { Settings, Palette, Users, Database, Sun, Moon, Monitor, Info } from 'lucide-react'
import { useTheme } from 'next-themes'
import { UserManagement } from './UserManagement'

const tabs = [
  { id: 'appearance', label: 'Aspect', icon: Palette },
  { id: 'users', label: 'Utilizatori', icon: Users },
  { id: 'system', label: 'Sistem', icon: Info },
]

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState('appearance')
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h1 className="page-title">Setări</h1>
          <p className="text-sm text-muted-foreground">Configurare sistem</p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-border gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appearance */}
      {activeTab === 'appearance' && (
        <div className="max-w-lg space-y-6">
          <div className="card card-body">
            <h3 className="font-semibold text-foreground mb-4">Temă interfață</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Luminos', icon: Sun },
                { value: 'dark', label: 'Întunecat', icon: Moon },
                { value: 'system', label: 'Sistem', icon: Monitor },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    theme === value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30 bg-background'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${theme === value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${theme === value ? 'text-primary' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card card-body">
            <h3 className="font-semibold text-foreground mb-2">Paletă culori</h3>
            <p className="text-sm text-muted-foreground mb-4">Culorile sistemului sunt definite prin variabile CSS în fișierul globals.css</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'Primary', class: 'bg-primary' },
                { name: 'Secondary', class: 'bg-secondary border border-border' },
                { name: 'Success', class: 'bg-green-500' },
                { name: 'Danger', class: 'bg-destructive' },
                { name: 'Warning', class: 'bg-yellow-500' },
                { name: 'Info', class: 'bg-blue-500' },
                { name: 'Muted', class: 'bg-muted border border-border' },
                { name: 'Card', class: 'bg-card border border-border' },
              ].map(({ name, class: cls }) => (
                <div key={name} className="flex flex-col items-center gap-1.5">
                  <div className={`w-full h-10 rounded-lg ${cls}`} />
                  <p className="text-xs text-muted-foreground">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && <UserManagement />}

      {/* System */}
      {activeTab === 'system' && (
        <div className="max-w-lg space-y-4">
          <div className="card card-body">
            <h3 className="font-semibold text-foreground mb-4">Informații sistem</h3>
            <div className="space-y-3">
              {[
                { label: 'Versiune aplicație', value: '1.0.0' },
                { label: 'Framework', value: 'Next.js 14' },
                { label: 'Bază de date', value: 'PostgreSQL (Supabase)' },
                { label: 'ORM', value: 'Prisma 5' },
                { label: 'Autentificare', value: 'NextAuth.js 4' },
                { label: 'UI', value: 'Tailwind CSS + Lucide React' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-body">
            <h3 className="font-semibold text-foreground mb-2">Conturi demo</h3>
            <div className="space-y-2">
              {[
                { role: 'Admin', username: 'admin', password: 'admin123', color: 'text-red-600 bg-red-50 dark:bg-red-950' },
                { role: 'Trainer', username: 'ion.popescu', password: 'teacher123', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
                { role: 'Student', username: 'elena.dumitrescu', password: 'student123', color: 'text-green-600 bg-green-50 dark:bg-green-950' },
              ].map(({ role, username, password, color }) => (
                <div key={role} className={`flex items-center justify-between p-3 rounded-lg ${color}`}>
                  <div>
                    <p className="text-sm font-semibold">{role}</p>
                    <p className="text-xs font-mono opacity-70">{username} / {password}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
