'use client'
// components/finance/FinanceClient.tsx
import { useState, useEffect, useCallback } from 'react'
import { DollarSign, Plus, Search, X, Loader2, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { formatDate, formatCurrency, STATUS_COLORS, STATUS_LABELS_RO } from '@/lib/utils'
import { FinanceModal } from './FinanceModal'
import { InstallmentModal } from './InstallmentModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/hooks/useToast'

export function FinanceClient() {
  const [records, setRecords] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [installmentRecord, setInstallmentRecord] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/finance?${params}`)
      const data = await res.json()
      setRecords(data.data || [])
      setStats(data.stats || {})
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/finance/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ title: 'Record șters' })
      fetchData()
    } catch {
      toast({ title: 'Eroare', variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  const markInstallmentPaid = async (financeId: string, installmentId: string) => {
    try {
      const res = await fetch(`/api/finance/${financeId}/installments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ installmentId, status: 'PAID' }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Rată marcată ca plătită' })
      fetchData()
    } catch {
      toast({ title: 'Eroare', variant: 'destructive' })
    }
  }

  const filtered = records.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return `${r.student?.firstName} ${r.student?.lastName}`.toLowerCase().includes(q) ||
      r.course?.name.toLowerCase().includes(q)
  })

  const statusOptions = [
    { value: '', label: 'Toate' },
    { value: 'PENDING', label: 'În așteptare' },
    { value: 'PARTIAL', label: 'Parțial' },
    { value: 'PAID', label: 'Plătit' },
    { value: 'OVERDUE', label: 'Restanță' },
  ]

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="page-title">Finanțe</h1>
            <p className="text-sm text-muted-foreground">{records.length} recorduri financiare</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Adaugă record
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Venituri totale', value: formatCurrency(stats.totalRevenue || 0), color: 'text-foreground' },
          { label: 'Colectat', value: formatCurrency(stats.collectedRevenue || 0), color: 'text-green-600' },
          { label: 'În așteptare', value: formatCurrency(stats.pendingRevenue || 0), color: 'text-orange-600' },
          { label: 'Rate restante', value: stats.overdueCount || 0, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card">
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className="search-input w-full" placeholder="Caută student sau curs..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch('')}><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map(opt => (
              <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Records */}
      <div className="card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <DollarSign className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">Nu există recorduri financiare</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Student</th>
                  <th>Curs</th>
                  <th>Total</th>
                  <th>Plătit</th>
                  <th>Restant</th>
                  <th>Status</th>
                  <th className="text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(rec => (
                  <>
                    <tr key={rec.id} className="cursor-pointer" onClick={() => setExpanded(expanded === rec.id ? null : rec.id)}>
                      <td className="w-8">
                        {expanded === rec.id
                          ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar w-7 h-7 text-xs">{rec.student?.firstName?.[0]}{rec.student?.lastName?.[0]}</div>
                          <span className="font-medium text-foreground text-sm">{rec.student?.firstName} {rec.student?.lastName}</span>
                        </div>
                      </td>
                      <td className="text-sm text-muted-foreground">{rec.course?.name}</td>
                      <td className="font-semibold text-foreground">{formatCurrency(rec.totalAmount)}</td>
                      <td className="text-green-600 font-semibold">{formatCurrency(rec.paidAmount)}</td>
                      <td className="text-orange-600 font-semibold">{formatCurrency(rec.totalAmount - rec.paidAmount)}</td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[rec.status as keyof typeof STATUS_COLORS]}`}>
                          {STATUS_LABELS_RO[rec.status]}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="btn-ghost p-1.5 text-xs"
                            onClick={() => setInstallmentRecord(rec)}
                            title="Adaugă rată"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            className="btn-ghost p-1.5 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(rec.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Installments expansion */}
                    {expanded === rec.id && (
                      <tr key={`${rec.id}-exp`}>
                        <td colSpan={8} className="bg-muted/20 px-8 py-4">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Rate de plată</p>
                            {rec.installments?.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Nu există rate definite</p>
                            ) : (
                              rec.installments.map((inst: any) => (
                                <div key={inst.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <p className="font-semibold text-foreground">{formatCurrency(inst.amount)}</p>
                                      <p className="text-xs text-muted-foreground">Scadent: {formatDate(inst.dueDate)}</p>
                                    </div>
                                    <span className={`badge ${STATUS_COLORS[inst.status as keyof typeof STATUS_COLORS]}`}>
                                      {STATUS_LABELS_RO[inst.status]}
                                    </span>
                                    {inst.paidDate && (
                                      <span className="text-xs text-muted-foreground">Plătit: {formatDate(inst.paidDate)}</span>
                                    )}
                                    <span className="text-xs text-muted-foreground">{STATUS_LABELS_RO[inst.method]}</span>
                                  </div>
                                  {inst.status !== 'PAID' && (
                                    <button
                                      className="btn-primary py-1.5 px-3 text-xs"
                                      onClick={() => markInstallmentPaid(rec.id, inst.id)}
                                    >
                                      Marchează plătit
                                    </button>
                                  )}
                                </div>
                              ))
                            )}
                            <button
                              className="btn-secondary text-xs py-1.5 mt-2"
                              onClick={() => setInstallmentRecord(rec)}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Adaugă rată
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <FinanceModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchData() }}
        />
      )}

      {installmentRecord && (
        <InstallmentModal
          finance={installmentRecord}
          onClose={() => setInstallmentRecord(null)}
          onSave={() => { setInstallmentRecord(null); fetchData() }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Șterge record financiar"
        description="Ești sigur? Toate ratele asociate vor fi șterse."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
