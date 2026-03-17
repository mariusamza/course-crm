'use client'
// components/students/StudentModal.tsx
import { useState } from 'react'
import { X, Loader2, User, Phone, MapPin, CreditCard, Users } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface Props {
  student?: any
  onClose: () => void
  onSave: () => void
}

export function StudentModal({ student, onClose, onSave }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'personal' | 'guardian' | 'account'>('personal')
  const [form, setForm] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    cnp: student?.cnp || '',
    phone: student?.phone || '',
    address: student?.address || '',
    ciSeries: student?.ciSeries || '',
    ciNumber: student?.ciNumber || '',
    guardianName: student?.guardianName || '',
    guardianPhone: student?.guardianPhone || '',
    guardianEmail: student?.guardianEmail || '',
    username: student?.user?.username || '',
    email: student?.user?.email || '',
    password: '',
  })

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = student ? `/api/students/${student.id}` : '/api/students'
      const method = student ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: student ? 'Student actualizat' : 'Student adăugat cu succes' })
      onSave()
    } catch (e: any) {
      toast({ title: e.message || 'Eroare', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'personal', label: 'Date personale', icon: User },
    { id: 'guardian', label: 'Tutore / Contact', icon: Users },
    { id: 'account', label: 'Cont acces', icon: CreditCard },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-bold text-foreground">
            {student ? 'Editează student' : 'Adaugă student nou'}
          </h2>
          <button className="btn-ghost p-2" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {activeTab === 'personal' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Prenume *</label>
                    <input className="form-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} required placeholder="Elena" />
                  </div>
                  <div>
                    <label className="form-label">Nume *</label>
                    <input className="form-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} required placeholder="Dumitrescu" />
                  </div>
                </div>
                <div>
                  <label className="form-label">CNP</label>
                  <input className="form-input font-mono" value={form.cnp} onChange={e => set('cnp', e.target.value)} placeholder="2980315120456" maxLength={13} />
                </div>
                <div>
                  <label className="form-label">Telefon</label>
                  <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0741 123 456" />
                </div>
                <div>
                  <label className="form-label">Adresă</label>
                  <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Str. Exemplu nr. 1, București" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Serie CI</label>
                    <input className="form-input font-mono uppercase" value={form.ciSeries} onChange={e => set('ciSeries', e.target.value.toUpperCase())} placeholder="RX" maxLength={4} />
                  </div>
                  <div>
                    <label className="form-label">Număr CI</label>
                    <input className="form-input font-mono" value={form.ciNumber} onChange={e => set('ciNumber', e.target.value)} placeholder="123456" maxLength={10} />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'guardian' && (
              <>
                <p className="text-sm text-muted-foreground">Informații opționale despre tutore sau persoana de contact.</p>
                <div>
                  <label className="form-label">Nume tutore / contact</label>
                  <input className="form-input" value={form.guardianName} onChange={e => set('guardianName', e.target.value)} placeholder="Ion Dumitrescu" />
                </div>
                <div>
                  <label className="form-label">Telefon tutore</label>
                  <input className="form-input" value={form.guardianPhone} onChange={e => set('guardianPhone', e.target.value)} placeholder="0721 111 222" />
                </div>
                <div>
                  <label className="form-label">Email tutore</label>
                  <input type="email" className="form-input" value={form.guardianEmail} onChange={e => set('guardianEmail', e.target.value)} placeholder="tutore@email.com" />
                </div>
              </>
            )}

            {activeTab === 'account' && (
              <>
                <p className="text-sm text-muted-foreground">Datele de autentificare pentru accesul studentului în sistem.</p>
                <div>
                  <label className="form-label">Utilizator *</label>
                  <input
                    className="form-input"
                    value={form.username}
                    onChange={e => set('username', e.target.value)}
                    required={!student}
                    disabled={!!student}
                    placeholder="elena.dumitrescu"
                  />
                  {student && <p className="text-xs text-muted-foreground mt-1">Utilizatorul nu poate fi modificat</p>}
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="elena@email.com" />
                </div>
                <div>
                  <label className="form-label">{student ? 'Parolă nouă (opțional)' : 'Parolă *'}</label>
                  <input
                    type="password"
                    className="form-input"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required={!student}
                    placeholder={student ? 'Lasă gol pentru a păstra parola curentă' : 'Minim 6 caractere'}
                    minLength={student ? 0 : 6}
                  />
                  {!student && <p className="text-xs text-muted-foreground mt-1">Parola implicită: student123</p>}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex justify-between flex-shrink-0 bg-card">
            <div className="flex gap-2">
              {tabs.map((tab, i) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-2 h-2 rounded-full transition-all ${activeTab === tab.id ? 'bg-primary w-4' : 'bg-muted-foreground/30'}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn-secondary" onClick={onClose}>Anulează</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {student ? 'Salvează' : 'Adaugă student'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
