'use client'
// components/students/StudentDetailModal.tsx
import { useState, useEffect } from 'react'
import { X, Loader2, FileText, StickyNote, Plus, Trash2, Download, Upload, User, BookOpen } from 'lucide-react'
import { formatDate, STATUS_COLORS, STATUS_LABELS_RO } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

interface Props {
  studentId: string
  onClose: () => void
  userRole: string
}

export function StudentDetailModal({ studentId, onClose, userRole }: Props) {
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'enrollments' | 'documents' | 'notes'>('profile')
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const { toast } = useToast()

  const fetchStudent = async () => {
    try {
      const res = await fetch(`/api/students/${studentId}`)
      const data = await res.json()
      setStudent(data.data)
    } catch {
      toast({ title: 'Eroare la încărcare', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStudent() }, [studentId])

  const addNote = async () => {
    if (!newNote.trim()) return
    setAddingNote(true)
    try {
      const res = await fetch(`/api/students/${studentId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
      })
      if (!res.ok) throw new Error()
      setNewNote('')
      toast({ title: 'Notă adăugată' })
      fetchStudent()
    } catch {
      toast({ title: 'Eroare la adăugare notă', variant: 'destructive' })
    } finally {
      setAddingNote(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/notes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Notă ștearsă' })
      fetchStudent()
    } catch {
      toast({ title: 'Eroare la ștergere', variant: 'destructive' })
    }
  }

  const uploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Fișierul depășește 10MB', variant: 'destructive' })
      return
    }
    setUploadingDoc(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        const res = await fetch(`/api/students/${studentId}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            type: file.name.toLowerCase().includes('ci') ? 'ci' : 'other',
            fileData: base64,
            mimeType: file.type,
            size: file.size,
          }),
        })
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error)
        }
        toast({ title: 'Document încărcat' })
        fetchStudent()
        setUploadingDoc(false)
      }
      reader.readAsDataURL(file)
    } catch (e: any) {
      toast({ title: e.message || 'Eroare la încărcare document', variant: 'destructive' })
      setUploadingDoc(false)
    }
    e.target.value = ''
  }

  const downloadDocument = async (docId: string, name: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/documents?docId=${docId}`)
      const data = await res.json()
      const doc = data.data
      const link = document.createElement('a')
      link.href = `data:${doc.mimeType};base64,${doc.fileData}`
      link.download = name
      link.click()
    } catch {
      toast({ title: 'Eroare la descărcare', variant: 'destructive' })
    }
  }

  const deleteDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/documents`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Document șters' })
      fetchStudent()
    } catch {
      toast({ title: 'Eroare la ștergere', variant: 'destructive' })
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'enrollments', label: `Înscrieri (${student?.enrollments?.length || 0})`, icon: BookOpen },
    { id: 'documents', label: `Documente (${student?.documents?.length || 0})`, icon: FileText },
    { id: 'notes', label: `Note (${student?.notes?.length || 0})`, icon: StickyNote },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          {student && (
            <div className="flex items-center gap-3">
              <div className="avatar w-10 h-10 text-sm">
                {student.firstName[0]}{student.lastName[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{student.firstName} {student.lastName}</h2>
                <p className="text-sm text-muted-foreground font-mono">{student.studentId}</p>
              </div>
            </div>
          )}
          <button className="btn-ghost p-2 ml-auto" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !student ? (
            <p className="text-center text-muted-foreground py-12">Eroare la încărcare date</p>
          ) : (
            <>
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: 'Prenume', value: student.firstName },
                    { label: 'Nume', value: student.lastName },
                    { label: 'CNP', value: student.cnp, mono: true },
                    { label: 'Telefon', value: student.phone },
                    { label: 'Adresă', value: student.address },
                    { label: 'Serie CI', value: student.ciSeries, mono: true },
                    { label: 'Număr CI', value: student.ciNumber, mono: true },
                    { label: 'Utilizator', value: student.user?.username, mono: true },
                    { label: 'Email', value: student.user?.email },
                  ].map(({ label, value, mono }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                      <p className={`text-sm text-foreground ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
                    </div>
                  ))}
                  {(student.guardianName || student.guardianPhone || student.guardianEmail) && (
                    <div className="sm:col-span-2 pt-4 border-t border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tutore / Contact</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { label: 'Nume', value: student.guardianName },
                          { label: 'Telefon', value: student.guardianPhone },
                          { label: 'Email', value: student.guardianEmail },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                            <p className="text-sm text-foreground">{value || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'enrollments' && (
                <div className="space-y-3">
                  {student.enrollments?.length === 0 ? (
                    <div className="empty-state">
                      <BookOpen className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Nicio înscriere</p>
                    </div>
                  ) : (
                    student.enrollments.map((enr: any) => (
                      <div key={enr.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                        <div>
                          <p className="font-semibold text-foreground">{enr.course.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {enr.course.trainer ? `${enr.course.trainer.firstName} ${enr.course.trainer.lastName}` : 'Fără trainer'} • Înscris: {formatDate(enr.enrollmentDate)}
                          </p>
                        </div>
                        <span className={`badge ${STATUS_COLORS[enr.status as keyof typeof STATUS_COLORS]}`}>
                          {STATUS_LABELS_RO[enr.status]}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {userRole === 'ADMIN' && (
                    <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all ${uploadingDoc ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {uploadingDoc ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                      <div>
                        <p className="text-sm font-medium text-foreground">Încarcă document</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, PDF • Max 10MB</p>
                      </div>
                      <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.pdf" onChange={uploadDocument} disabled={uploadingDoc} />
                    </label>
                  )}

                  {student.documents?.length === 0 ? (
                    <div className="empty-state">
                      <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Niciun document</p>
                    </div>
                  ) : (
                    student.documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                        <FileText className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(doc.size / 1024).toFixed(1)} KB • {formatDate(doc.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button className="btn-ghost p-2" onClick={() => downloadDocument(doc.id, doc.name)} title="Descarcă">
                            <Download className="w-4 h-4" />
                          </button>
                          {userRole === 'ADMIN' && (
                            <button className="btn-ghost p-2 text-destructive hover:bg-destructive/10" onClick={() => deleteDocument(doc.id)} title="Șterge">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Adaugă o notă internă..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button className="btn-primary" onClick={addNote} disabled={addingNote || !newNote.trim()}>
                        {addingNote && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Plus className="w-4 h-4" />
                        Adaugă notă
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {student.notes?.length === 0 ? (
                      <div className="empty-state">
                        <StickyNote className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Nicio notă</p>
                      </div>
                    ) : (
                      student.notes.map((note: any) => (
                        <div key={note.id} className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                                {note.author?.username}
                              </span>
                              <span className="text-xs text-muted-foreground">{formatDate(note.createdAt, 'dd MMM yyyy HH:mm')}</span>
                            </div>
                            <button
                              className="btn-ghost p-1 text-destructive hover:bg-destructive/10"
                              onClick={() => deleteNote(note.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
