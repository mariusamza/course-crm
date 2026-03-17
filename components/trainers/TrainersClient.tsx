'use client'
// components/trainers/TrainersClient.tsx
import { useState, useEffect, useCallback } from 'react'
import { UserCheck, Plus, Search, Pencil, Trash2, X, Loader2, BookOpen } from 'lucide-react'
import { STATUS_COLORS, STATUS_LABELS_RO } from '@/lib/utils'
import { TrainerModal } from './TrainerModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/hooks/useToast'

export function TrainersClient() {
  const [trainers, setTrainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTrainer, setEditTrainer] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchTrainers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/trainers?search=${encodeURIComponent(search)}`)
      const data = await res.json()
      setTrainers(data.data || [])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(fetchTrainers, 300)
    return () => clearTimeout(timer)
  }, [fetchTrainers])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/trainers/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Trainer șters' })
      fetchTrainers()
    } catch (e: any) {
      toast({ title: e.message, variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="page-title">Traineri</h1>
            <p className="text-sm text-muted-foreground">{trainers.length} traineri înregistrați</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => { setEditTrainer(null); setShowModal(true) }}>
          <Plus className="w-4 h-4" />
          Adaugă trainer
        </button>
      </div>

      <div className="card">
        <div className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="search-input"
              placeholder="Caută trainer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch('')}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : trainers.length === 0 ? (
            <div className="empty-state">
              <UserCheck className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">Nu s-au găsit traineri</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trainer</th>
                  <th>ID</th>
                  <th>Contact</th>
                  <th>Cursuri asignate</th>
                  <th className="text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((trainer) => (
                  <tr key={trainer.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar w-9 h-9 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex-shrink-0">
                          {trainer.firstName[0]}{trainer.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{trainer.firstName} {trainer.lastName}</p>
                          <p className="text-xs text-muted-foreground">{trainer.user?.username}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="font-mono text-sm text-muted-foreground">{trainer.trainerId}</span></td>
                    <td>
                      <p className="text-sm text-muted-foreground">{trainer.phone || '—'}</p>
                      <p className="text-xs text-muted-foreground">{trainer.email || ''}</p>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{trainer._count?.courses || 0}</span>
                        <div className="flex gap-1 flex-wrap">
                          {trainer.courses?.slice(0, 2).map((c: any) => (
                            <span key={c.id} className={`badge text-xs ${STATUS_COLORS[c.status as keyof typeof STATUS_COLORS]}`}>
                              {c.name.substring(0, 15)}{c.name.length > 15 ? '…' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button className="btn-ghost p-2" onClick={() => { setEditTrainer(trainer); setShowModal(true) }}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className={`btn-ghost p-2 text-destructive hover:bg-destructive/10 ${trainer._count?.courses > 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                          onClick={() => trainer._count?.courses === 0 && setDeleteId(trainer.id)}
                          title={trainer._count?.courses > 0 ? 'Nu poți șterge un trainer cu cursuri asignate' : 'Șterge'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <TrainerModal
          trainer={editTrainer}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchTrainers() }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Șterge trainer"
        description="Ești sigur că vrei să ștergi acest trainer?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
