'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressTimeline, type TimelineStep } from './ProgressTimeline'
import { Hammer, Calendar, DollarSign } from 'lucide-react'
import type { CustomerJob } from '@/stores/customerStore'

// All customer-visible timeline steps (matches job_status enum minus 'closed').
// 'pending_deposit' is the first step for jobs that require a deposit — the
// customer sees "Deposit" with an amount, and the gate lifts automatically
// once the payment webhook records it.
const JOB_TIMELINE_STEPS = [
  { status: 'pending_deposit', label: 'Deposit' },
  { status: 'pending_start', label: 'Scheduling' },
  { status: 'materials_ordered', label: 'Materials Ordered' },
  { status: 'scheduled', label: 'Scheduled' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'inspection_pending', label: 'Inspection' },
  { status: 'punch_list', label: 'Punch List' },
  { status: 'completed', label: 'Completed' },
  { status: 'warranty_active', label: 'Warranty Active' },
] as const

const STATUS_ORDER = JOB_TIMELINE_STEPS.map((s) => s.status)

function formatDate(dateStr: string | null): string | undefined {
  if (!dateStr) return undefined
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function buildTimelineSteps(job: CustomerJob): TimelineStep[] {
  // 'closed' is a terminal state — treat as equivalent to warranty_active (everything done)
  const effectiveStatus = job.status === 'closed' ? 'warranty_active' : job.status
  const currentIndex = STATUS_ORDER.indexOf(effectiveStatus as typeof STATUS_ORDER[number])

  return JOB_TIMELINE_STEPS.map((step, index) => {
    let status: TimelineStep['status'] = 'upcoming'

    if (currentIndex === -1) {
      // Unknown status — show first step as current so timeline isn't blank
      if (index === 0) status = 'current'
    } else if (index < currentIndex) {
      status = 'completed'
    } else if (index === currentIndex) {
      status = 'current'
    }

    // Try to find a date for this step from job fields
    let date: string | undefined
    if (step.status === 'scheduled' && job.scheduled_start) {
      date = formatDate(job.scheduled_start)
    } else if (step.status === 'completed' && job.actual_end) {
      date = formatDate(job.actual_end)
    } else if (step.status === 'in_progress' && job.actual_start) {
      date = formatDate(job.actual_start)
    }

    // Fall back to status history for the date
    const historyEntry = job.status_history.find((h) => h.new_status === step.status)
    if (!date && historyEntry) {
      date = formatDate(historyEntry.created_at)
    }

    return {
      id: step.status,
      label: step.label,
      status,
      date,
    }
  })
}

interface JobProgressProps {
  job: CustomerJob
  compact?: boolean
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function JobProgress({ job, compact = false }: JobProgressProps) {
  const steps = buildTimelineSteps(job)

  // Recent status updates (last 3)
  const recentUpdates = job.status_history.slice(0, 3)

  const awaitingDeposit = job.status === 'pending_deposit' && job.deposit_required

  if (compact) {
    return (
      <Card variant="dark" className="border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Hammer className="h-5 w-5 text-gold-light" />
              Project Progress
            </CardTitle>
            <span className="text-xs text-slate-400">{job.job_number}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {awaitingDeposit && (
            <div className="flex items-center gap-2 rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              <DollarSign className="h-3.5 w-3.5 text-amber-300" />
              <span>
                {job.deposit_amount
                  ? `Waiting for ${formatCurrency(job.deposit_amount)} deposit`
                  : 'Waiting for deposit'}
              </span>
            </div>
          )}
          <ProgressTimeline steps={steps} orientation="horizontal" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="dark" className="border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Hammer className="h-5 w-5 text-gold-light" />
            Project Progress
          </CardTitle>
          <span className="text-xs text-slate-400">{job.job_number}</span>
        </div>
        {job.property_address && (
          <p className="text-sm text-slate-400 mt-1">{job.property_address}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deposit gate — shown first when job is waiting on payment so the
            customer knows exactly what's blocking the schedule. */}
        {awaitingDeposit && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-amber-500/20 p-2">
                <DollarSign className="h-4 w-4 text-amber-300" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-100">Waiting for deposit</p>
                <p className="mt-1 text-sm text-amber-100/80">
                  {job.deposit_amount
                    ? `Pay your ${formatCurrency(job.deposit_amount)} deposit to start scheduling.`
                    : 'Pay your deposit to start scheduling.'}{' '}
                  We&apos;ll reach out as soon as it&apos;s received.
                </p>
              </div>
            </div>
          </div>
        )}

        <ProgressTimeline steps={steps} orientation="horizontal" />

        {/* Scheduled dates */}
        {(job.scheduled_start || job.scheduled_end) && (
          <div className="flex items-center gap-4 text-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            {job.scheduled_start && (
              <span className="text-slate-400">
                Start: <span className="text-slate-200">{formatDate(job.scheduled_start)}</span>
              </span>
            )}
            {job.scheduled_end && (
              <span className="text-slate-400">
                End: <span className="text-slate-200">{formatDate(job.scheduled_end)}</span>
              </span>
            )}
          </div>
        )}

        {/* Recent updates */}
        {recentUpdates.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Recent Updates
            </p>
            <div className="space-y-2">
              {recentUpdates.map((update) => (
                <div
                  key={update.id}
                  className="flex items-start gap-3 text-sm rounded-lg bg-slate-800/50 px-3 py-2"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-gold-light mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-300">
                      Status changed to{' '}
                      <span className="text-gold-light font-medium">
                        {update.new_status.replace(/_/g, ' ')}
                      </span>
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {formatDate(update.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
