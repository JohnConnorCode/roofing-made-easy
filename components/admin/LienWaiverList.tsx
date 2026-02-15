'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import type { LienWaiver } from '@/lib/jobs/billing-types'
import {
  Plus,
  Shield,
  Download,
  CheckCircle,
  Send,
  Pencil,
  Trash2,
} from 'lucide-react'

interface LienWaiverListProps {
  jobId: string
}

const STATUS_CONFIG: Record<string, { className: string; label: string }> = {
  draft: { className: 'text-slate-600 bg-slate-100', label: 'Draft' },
  sent: { className: 'text-blue-600 bg-blue-100', label: 'Sent' },
  signed: { className: 'text-green-600 bg-green-100', label: 'Signed' },
}

const TYPE_CONFIG: Record<string, { className: string; label: string }> = {
  conditional: { className: 'text-amber-700 bg-amber-100', label: 'Conditional' },
  unconditional: { className: 'text-purple-700 bg-purple-100', label: 'Unconditional' },
}

export function LienWaiverList({ jobId }: LienWaiverListProps) {
  const [waivers, setWaivers] = useState<LienWaiver[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const { showToast } = useToast()

  // Form state
  const [waiverType, setWaiverType] = useState<'conditional' | 'unconditional'>('conditional')
  const [throughDate, setThroughDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [claimantName, setClaimantName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [propertyDescription, setPropertyDescription] = useState('')

  const fetchWaivers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/jobs/${jobId}/lien-waivers`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setWaivers(data.waivers || [])
    } catch {
      showToast('Failed to load lien waivers', 'error')
    } finally {
      setLoading(false)
    }
  }, [jobId, showToast])

  useEffect(() => {
    fetchWaivers()
  }, [fetchWaivers])

  function resetForm() {
    setWaiverType('conditional')
    setThroughDate(new Date().toISOString().split('T')[0])
    setAmount('')
    setClaimantName('')
    setOwnerName('')
    setPropertyDescription('')
  }

  async function handleCreate() {
    if (!amount) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/lien-waivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waiver_type: waiverType,
          through_date: throughDate,
          amount: parseFloat(amount),
          claimant_name: claimantName || undefined,
          owner_name: ownerName || undefined,
          property_description: propertyDescription || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create')
      }
      resetForm()
      setShowForm(false)
      showToast('Lien waiver created', 'success')
      await fetchWaivers()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create waiver', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusUpdate(waiver: LienWaiver, status: 'sent' | 'signed') {
    const action = status === 'sent' ? 'Mark as Sent' : 'Mark as Signed'
    const confirmed = await confirm({
      title: action,
      description: status === 'sent'
        ? 'Mark this lien waiver as sent? This indicates it has been delivered to the recipient.'
        : 'Mark this lien waiver as signed? This indicates the waiver has been executed.',
      confirmText: action,
    })
    if (!confirmed) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/lien-waivers/${waiver.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }
      showToast(`Waiver marked as ${status}`, 'success')
      await fetchWaivers()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update waiver', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(waiver: LienWaiver) {
    const confirmed = await confirm({
      title: 'Delete Lien Waiver',
      description: 'Delete this draft lien waiver? This cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (!confirmed) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/lien-waivers/${waiver.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }
      showToast('Lien waiver deleted', 'success')
      await fetchWaivers()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete waiver', 'error')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(waiver: LienWaiver) {
    setEditingId(waiver.id)
    setWaiverType(waiver.waiver_type)
    setThroughDate(waiver.through_date)
    setAmount(waiver.amount.toString())
    setClaimantName(waiver.claimant_name || '')
    setOwnerName(waiver.owner_name || '')
    setPropertyDescription(waiver.property_description || '')
  }

  function cancelEdit() {
    setEditingId(null)
    resetForm()
  }

  async function handleEdit(waiverId: string) {
    if (!amount) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/lien-waivers/${waiverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waiver_type: waiverType,
          through_date: throughDate,
          amount: parseFloat(amount),
          claimant_name: claimantName || undefined,
          owner_name: ownerName || undefined,
          property_description: propertyDescription || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }
      cancelEdit()
      showToast('Lien waiver updated', 'success')
      await fetchWaivers()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update waiver', 'error')
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
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Lien Waivers ({waivers.length})
        </CardTitle>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Create Waiver
        </Button>
      </CardHeader>
      <CardContent>
        {/* Create Form */}
        {showForm && (
          <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="lw-type" className="text-xs text-slate-500 mb-1 block">Waiver Type</label>
                <select
                  id="lw-type"
                  value={waiverType}
                  onChange={e => setWaiverType(e.target.value as 'conditional' | 'unconditional')}
                  aria-required="true"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                >
                  <option value="conditional">Conditional</option>
                  <option value="unconditional">Unconditional</option>
                </select>
              </div>
              <div>
                <label htmlFor="lw-through-date" className="text-xs text-slate-500 mb-1 block">Through Date</label>
                <input
                  id="lw-through-date"
                  type="date"
                  value={throughDate}
                  onChange={e => setThroughDate(e.target.value)}
                  aria-required="true"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lw-amount" className="sr-only">Amount</label>
              <input
                id="lw-amount"
                type="number"
                step="0.01"
                placeholder="Amount ($) *"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                aria-required="true"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="lw-claimant" className="sr-only">Claimant name</label>
                <input
                  id="lw-claimant"
                  type="text"
                  placeholder="Claimant name"
                  value={claimantName}
                  onChange={e => setClaimantName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                />
              </div>
              <div>
                <label htmlFor="lw-owner" className="sr-only">Owner name</label>
                <input
                  id="lw-owner"
                  type="text"
                  placeholder="Owner name"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lw-property" className="sr-only">Property description</label>
              <input
                id="lw-property"
                type="text"
                placeholder="Property description"
                value={propertyDescription}
                onChange={e => setPropertyDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} isLoading={saving} disabled={!amount}>
                Create
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* List */}
        {waivers.length === 0 ? (
          <p className="text-slate-500 text-center py-6">No lien waivers yet</p>
        ) : (
          <div className="space-y-2">
            {waivers.map((waiver) => {
              const statusCfg = STATUS_CONFIG[waiver.status] || STATUS_CONFIG.draft
              const typeCfg = TYPE_CONFIG[waiver.waiver_type] || TYPE_CONFIG.conditional
              const isEditing = editingId === waiver.id

              if (isEditing) {
                return (
                  <div key={waiver.id} className="p-3 rounded-lg border border-blue-200 bg-blue-50 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor={`edit-type-${waiver.id}`} className="text-xs text-slate-500 mb-1 block">Type</label>
                        <select
                          id={`edit-type-${waiver.id}`}
                          value={waiverType}
                          onChange={e => setWaiverType(e.target.value as 'conditional' | 'unconditional')}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                        >
                          <option value="conditional">Conditional</option>
                          <option value="unconditional">Unconditional</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`edit-date-${waiver.id}`} className="text-xs text-slate-500 mb-1 block">Through Date</label>
                        <input
                          id={`edit-date-${waiver.id}`}
                          type="date"
                          value={throughDate}
                          onChange={e => setThroughDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor={`edit-amount-${waiver.id}`} className="sr-only">Amount</label>
                      <input
                        id={`edit-amount-${waiver.id}`}
                        type="number"
                        step="0.01"
                        placeholder="Amount ($)"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        aria-required="true"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor={`edit-claimant-${waiver.id}`} className="sr-only">Claimant</label>
                        <input
                          id={`edit-claimant-${waiver.id}`}
                          type="text"
                          placeholder="Claimant"
                          value={claimantName}
                          onChange={e => setClaimantName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                        />
                      </div>
                      <div>
                        <label htmlFor={`edit-owner-${waiver.id}`} className="sr-only">Owner</label>
                        <input
                          id={`edit-owner-${waiver.id}`}
                          type="text"
                          placeholder="Owner"
                          value={ownerName}
                          onChange={e => setOwnerName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(waiver.id)} isLoading={saving}>
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
                <div key={waiver.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeCfg.className}`}>
                        {typeCfg.label}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                      {waiver.invoice && (
                        <Link
                          href={`/admin/invoices/${waiver.invoice.id}`}
                          className="text-xs text-gold-dark hover:text-gold hover:underline"
                        >
                          {waiver.invoice.invoice_number}
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-slate-900">{formatCurrency(waiver.amount)}</span>
                      <span className="text-slate-500">Through {formatDate(waiver.through_date)}</span>
                    </div>
                    {waiver.created_by_user && formatUserName(waiver.created_by_user) && (
                      <p className="text-xs text-slate-400 mt-0.5">Created by {formatUserName(waiver.created_by_user)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <button
                      onClick={() => window.open(`/api/admin/jobs/${jobId}/lien-waivers/${waiver.id}/pdf`, '_blank')}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                      aria-label="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {waiver.status === 'draft' && (
                      <>
                        <button
                          onClick={() => startEdit(waiver)}
                          disabled={saving}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50"
                          aria-label="Edit lien waiver"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(waiver, 'sent')}
                          disabled={saving}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded disabled:opacity-50"
                          aria-label="Mark as sent"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(waiver)}
                          disabled={saving}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          aria-label="Delete lien waiver"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {waiver.status === 'sent' && (
                      <button
                        onClick={() => handleStatusUpdate(waiver, 'signed')}
                        disabled={saving}
                        className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded disabled:opacity-50"
                        aria-label="Mark as signed"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    {waiver.status === 'signed' && (
                      <span className="p-1.5 text-green-500">
                        <CheckCircle className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      <ConfirmDialog />
    </Card>
  )
}
