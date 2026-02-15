'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import type { ChangeOrder } from '@/lib/jobs/billing-types'
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  FileEdit,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
} from 'lucide-react'

interface ChangeOrderListProps {
  jobId: string
  contractAmount: number
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; className: string; label: string }> = {
  pending: { icon: Clock, className: 'text-amber-600 bg-amber-100', label: 'Pending' },
  approved: { icon: CheckCircle, className: 'text-green-600 bg-green-100', label: 'Approved' },
  rejected: { icon: XCircle, className: 'text-red-600 bg-red-100', label: 'Rejected' },
}

export function ChangeOrderList({ jobId, contractAmount }: ChangeOrderListProps) {
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([])
  const [netDelta, setNetDelta] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const { showToast } = useToast()

  // Form state
  const [description, setDescription] = useState('')
  const [reason, setReason] = useState('')
  const [costDelta, setCostDelta] = useState('')

  const fetchChangeOrders = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/jobs/${jobId}/change-orders`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setChangeOrders(data.changeOrders || [])
      setNetDelta(data.netDelta || 0)
    } catch {
      showToast('Failed to load change orders', 'error')
    } finally {
      setLoading(false)
    }
  }, [jobId, showToast])

  useEffect(() => {
    fetchChangeOrders()
  }, [fetchChangeOrders])

  async function handleCreate() {
    if (!description.trim() || !costDelta) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/change-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          reason: reason.trim() || undefined,
          cost_delta: parseFloat(costDelta),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create')
      }
      setDescription('')
      setReason('')
      setCostDelta('')
      setShowForm(false)
      showToast('Change order created', 'success')
      await fetchChangeOrders()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create change order', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleApproval(co: ChangeOrder, status: 'approved' | 'rejected') {
    const action = status === 'approved' ? 'Approve' : 'Reject'
    const deltaStr = co.cost_delta >= 0 ? `+${formatCurrency(co.cost_delta)}` : formatCurrency(co.cost_delta)
    const confirmed = await confirm({
      title: `${action} Change Order`,
      description: status === 'approved'
        ? `Approve this change order? This will ${co.cost_delta >= 0 ? 'add' : 'subtract'} ${deltaStr} ${co.cost_delta >= 0 ? 'to' : 'from'} the contract.`
        : `Reject change order ${co.change_order_number}? The contract amount will not change.`,
      confirmText: action,
      variant: status === 'rejected' ? 'danger' : 'default',
    })
    if (!confirmed) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/change-orders/${co.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }
      showToast(`Change order ${status}`, 'success')
      await fetchChangeOrders()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update change order', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(co: ChangeOrder) {
    const confirmed = await confirm({
      title: 'Delete Change Order',
      description: `Delete change order ${co.change_order_number}? This cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (!confirmed) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/change-orders/${co.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }
      showToast('Change order deleted', 'success')
      await fetchChangeOrders()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete change order', 'error')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(co: ChangeOrder) {
    setEditingId(co.id)
    setDescription(co.description)
    setReason(co.reason || '')
    setCostDelta(co.cost_delta.toString())
  }

  function cancelEdit() {
    setEditingId(null)
    setDescription('')
    setReason('')
    setCostDelta('')
  }

  async function handleEdit(coId: string) {
    if (!description.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/change-orders/${coId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          reason: reason.trim() || undefined,
          cost_delta: costDelta ? parseFloat(costDelta) : undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }
      cancelEdit()
      showToast('Change order updated', 'success')
      await fetchChangeOrders()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update change order', 'error')
    } finally {
      setSaving(false)
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function formatUserName(user?: { first_name: string | null; last_name: string | null }): string {
    if (!user) return ''
    return `${user.first_name || ''} ${user.last_name || ''}`.trim()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-slate-200 rounded w-1/3" />
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Original Contract</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(contractAmount - netDelta)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Net Change</p>
            <p className={`text-xl font-bold ${netDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netDelta >= 0 ? '+' : ''}{formatCurrency(netDelta)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Updated Contract</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(contractAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Change Orders List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Change Orders ({changeOrders.length})
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Change Order
          </Button>
        </CardHeader>
        <CardContent>
          {/* Create Form */}
          {showForm && (
            <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div>
                <label htmlFor="co-description" className="sr-only">Description</label>
                <input
                  id="co-description"
                  type="text"
                  placeholder="Description *"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  aria-required="true"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                />
              </div>
              <div>
                <label htmlFor="co-reason" className="sr-only">Reason</label>
                <input
                  id="co-reason"
                  type="text"
                  placeholder="Reason (optional)"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="co-cost-delta" className="sr-only">Cost delta</label>
                  <input
                    id="co-cost-delta"
                    type="number"
                    step="0.01"
                    placeholder="Cost delta ($)"
                    value={costDelta}
                    onChange={e => setCostDelta(e.target.value)}
                    aria-required="true"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                  />
                </div>
                <Button size="sm" onClick={handleCreate} isLoading={saving} disabled={!description.trim() || !costDelta}>
                  Create
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-slate-500">Use positive values for additions, negative for reductions</p>
            </div>
          )}

          {/* List */}
          {changeOrders.length === 0 ? (
            <p className="text-slate-500 text-center py-6">No change orders yet</p>
          ) : (
            <div className="space-y-2">
              {changeOrders.map((co) => {
                const statusConfig = STATUS_CONFIG[co.status] || STATUS_CONFIG.pending
                const StatusIcon = statusConfig.icon
                const isPositive = co.cost_delta >= 0
                const isEditing = editingId === co.id

                if (isEditing) {
                  return (
                    <div key={co.id} className="p-3 rounded-lg border border-blue-200 bg-blue-50 space-y-2">
                      <div>
                        <label htmlFor={`edit-desc-${co.id}`} className="sr-only">Description</label>
                        <input
                          id={`edit-desc-${co.id}`}
                          type="text"
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          aria-required="true"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                        />
                      </div>
                      <div>
                        <label htmlFor={`edit-reason-${co.id}`} className="sr-only">Reason</label>
                        <input
                          id={`edit-reason-${co.id}`}
                          type="text"
                          placeholder="Reason"
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label htmlFor={`edit-delta-${co.id}`} className="sr-only">Cost delta</label>
                          <input
                            id={`edit-delta-${co.id}`}
                            type="number"
                            step="0.01"
                            value={costDelta}
                            onChange={e => setCostDelta(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                          />
                        </div>
                        <Button size="sm" onClick={() => handleEdit(co.id)} isLoading={saving}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={co.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-500">{co.change_order_number}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 truncate">{co.description}</p>
                      {co.reason && <p className="text-xs text-slate-500 mt-0.5">{co.reason}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-400">{formatDate(co.created_at)}</p>
                        {co.created_by_user && formatUserName(co.created_by_user) && (
                          <span className="text-xs text-slate-400">by {formatUserName(co.created_by_user)}</span>
                        )}
                      </div>
                      {co.status !== 'pending' && co.approved_by_user && formatUserName(co.approved_by_user) && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {co.status === 'approved' ? 'Approved' : 'Rejected'} by {formatUserName(co.approved_by_user)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className={`flex items-center gap-1 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {isPositive ? '+' : ''}{formatCurrency(co.cost_delta)}
                      </span>
                      {co.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(co)}
                            disabled={saving}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50"
                            aria-label={`Edit change order ${co.change_order_number}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApproval(co, 'approved')}
                            disabled={saving}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                            aria-label={`Approve change order ${co.change_order_number}`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApproval(co, 'rejected')}
                            disabled={saving}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                            aria-label={`Reject change order ${co.change_order_number}`}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(co)}
                            disabled={saving}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                            aria-label={`Delete change order ${co.change_order_number}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog />
    </div>
  )
}
