'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { BILLING_TEMPLATES } from '@/lib/jobs/billing-types'
import type { BillingSchedule } from '@/lib/jobs/billing-types'
import { JOB_STATUS_LABELS } from '@/lib/jobs/types'
import {
  DollarSign,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'

interface BillingScheduleCardProps {
  jobId: string
  contractAmount: number
}

export function BillingScheduleCard({ jobId, contractAmount }: BillingScheduleCardProps) {
  const [milestones, setMilestones] = useState<BillingSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsRecalc, setNeedsRecalc] = useState(false)
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const { showToast } = useToast()

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/jobs/${jobId}/billing-schedule`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setMilestones(data.milestones || [])

      // Check if amounts need recalculation
      if (data.milestones?.length > 0) {
        const totalExpected = data.milestones.reduce(
          (sum: number, m: BillingSchedule) => sum + (contractAmount * m.percentage / 100), 0
        )
        const totalActual = data.milestones.reduce(
          (sum: number, m: BillingSchedule) => sum + m.amount, 0
        )
        setNeedsRecalc(Math.abs(totalExpected - totalActual) > 0.01)
      }
    } catch {
      setError('Failed to load billing schedule')
    } finally {
      setLoading(false)
    }
  }, [jobId, contractAmount])

  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  async function handleSetupTemplate(templateName: string) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/billing-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: templateName }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create schedule')
      }
      showToast(`Billing schedule set up with ${templateName} template`, 'success')
      await fetchSchedule()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set up billing')
    } finally {
      setSaving(false)
    }
  }

  async function handleRecalculate() {
    const confirmed = await confirm({
      title: 'Recalculate Billing Schedule',
      description: 'This will recalculate all milestone amounts based on the current contract amount. Existing invoices will not be affected.',
      confirmText: 'Recalculate',
      variant: 'warning',
    })
    if (!confirmed) return

    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/billing-schedule`, { method: 'PUT' })
      if (!res.ok) throw new Error('Failed to recalculate')
      setNeedsRecalc(false)
      showToast('Billing schedule recalculated', 'success')
      await fetchSchedule()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to recalculate')
    } finally {
      setSaving(false)
    }
  }

  function getInvoiceStatus(milestone: BillingSchedule) {
    if (!milestone.invoice) return { label: 'No Invoice', icon: Clock, className: 'text-slate-400', linkable: false }
    const inv = milestone.invoice
    if (inv.status === 'paid') return { label: 'Paid', icon: CheckCircle, className: 'text-green-600', linkable: true }
    if (inv.status === 'sent' || inv.status === 'viewed') return { label: 'Sent', icon: FileText, className: 'text-blue-600', linkable: true }
    return { label: 'Draft', icon: FileText, className: 'text-slate-500', linkable: true }
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Billing Schedule
        </CardTitle>
        {needsRecalc && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            isLoading={saving}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Recalculate
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {needsRecalc && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Contract amount has changed. Recalculate to update milestone amounts.
          </div>
        )}

        {milestones.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 mb-4">No billing schedule set up yet</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {BILLING_TEMPLATES.map((template) => (
                <Button
                  key={template.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetupTemplate(template.name)}
                  isLoading={saving}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone) => {
              const invStatus = getInvoiceStatus(milestone)
              const InvIcon = invStatus.icon

              return (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {milestone.milestone_name}
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">
                      {milestone.percentage}%
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 shrink-0">
                      {JOB_STATUS_LABELS[milestone.trigger_status] || milestone.trigger_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-medium text-slate-900">
                      {formatCurrency(milestone.amount)}
                    </span>
                    {invStatus.linkable && milestone.invoice ? (
                      <Link
                        href={`/admin/invoices/${milestone.invoice.id}`}
                        className={`flex items-center gap-1 text-xs hover:underline ${invStatus.className}`}
                      >
                        <InvIcon className="h-3.5 w-3.5" />
                        {invStatus.label}
                      </Link>
                    ) : (
                      <span className={`flex items-center gap-1 text-xs ${invStatus.className}`}>
                        <InvIcon className="h-3.5 w-3.5" />
                        {invStatus.label}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Total row */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-sm font-medium text-slate-700">Total</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(milestones.reduce((sum, m) => sum + m.amount, 0))}
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <ConfirmDialog />
    </Card>
  )
}
