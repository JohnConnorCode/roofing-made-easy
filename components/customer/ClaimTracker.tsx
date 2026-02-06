'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { Shield, Phone, Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import type { InsuranceClaimStatus, InsuranceClaimTimelineEvent } from '@/lib/supabase/types'
import { CLAIM_STATUS_LABELS, getInsuranceCompanyInfo } from '@/lib/data/insurance-resources'

interface ClaimTrackerProps {
  claim?: {
    id: string
    insuranceCompany?: string | null
    claimNumber?: string | null
    status: InsuranceClaimStatus
    dateOfLoss?: string | null
    causeOfLoss?: string | null
    timeline: InsuranceClaimTimelineEvent[]
    adjusterName?: string | null
    adjusterPhone?: string | null
    adjusterVisitDate?: string | null
    claimAmountApproved?: number | null
    deductible?: number | null
  }
  onUpdateStatus?: () => void
  onAddNote?: () => void
}

const STATUS_ORDER: InsuranceClaimStatus[] = [
  'not_started',
  'filed',
  'adjuster_scheduled',
  'adjuster_visited',
  'under_review',
  'approved',
  'settled',
]

const PROGRESS_STEPS = [
  { id: 'filed', label: 'Filed' },
  { id: 'adjuster_scheduled', label: 'Adjuster' },
  { id: 'adjuster_visited', label: 'Inspected' },
  { id: 'under_review', label: 'Review' },
  { id: 'approved', label: 'Decision' },
  { id: 'settled', label: 'Settled' },
]

export function ClaimTracker({ claim, onUpdateStatus, onAddNote }: ClaimTrackerProps) {
  if (!claim) {
    return (
      <Card className="border-slate-700">
        <CardContent className="py-8 text-center">
          <Shield className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-200 mb-2">No Claim Started</h3>
          <p className="text-slate-400 mb-4">
            Start tracking your insurance claim to stay organized and on top of deadlines.
          </p>
          <Button
            variant="primary"
            className="bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
            onClick={onUpdateStatus}
          >
            Start Tracking Claim
          </Button>
        </CardContent>
      </Card>
    )
  }

  const statusInfo = CLAIM_STATUS_LABELS[claim.status]
  const companyInfo = claim.insuranceCompany ? getInsuranceCompanyInfo(claim.insuranceCompany) : null
  const currentStatusIndex = STATUS_ORDER.indexOf(claim.status)

  return (
    <div className="space-y-6">
      {/* Status header */}
      <Card className="border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg text-slate-100">Claim Status</CardTitle>
              <p className={cn('text-sm font-medium mt-1', statusInfo.color)}>
                {statusInfo.label}
              </p>
            </div>
            {claim.claimNumber && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Claim #</p>
                <p className="text-sm font-mono text-slate-300">{claim.claimNumber}</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">{statusInfo.description}</p>

          {/* Progress steps */}
          <div className="mb-4">
            <div className="flex items-center">
              {PROGRESS_STEPS.map((step, index) => {
                const isDenied = claim.status === 'denied'
                const isAppealing = claim.status === 'appealing'
                const isBranched = isDenied || isAppealing

                // For denied/appealing, show progress up to under_review then branch
                const effectiveIndex = isBranched
                  ? STATUS_ORDER.indexOf('under_review')
                  : currentStatusIndex

                const isCompleted = index < effectiveIndex
                const isCurrent = index === effectiveIndex
                const isDecisionStep = step.id === 'under_review'

                // Special handling for decision step when denied/appealing
                const showDenied = isDecisionStep && isDenied
                const showAppealing = isDecisionStep && isAppealing

                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    {/* Step indicator */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-medium',
                        isCompleted
                          ? 'border-success bg-success text-white'
                          : showDenied
                          ? 'border-red-500 bg-red-500/10 text-red-400'
                          : showAppealing
                          ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                          : isCurrent
                          ? 'border-gold-light bg-gold-light/10 text-gold-light'
                          : 'border-slate-600 bg-slate-800 text-slate-500'
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : showDenied ? (
                          <XCircle className="h-4 w-4" />
                        ) : showAppealing ? (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={cn(
                        'text-[10px] mt-1 whitespace-nowrap',
                        isCompleted ? 'text-success' :
                        showDenied ? 'text-red-400' :
                        showAppealing ? 'text-yellow-400' :
                        isCurrent ? 'text-gold-light' : 'text-slate-500'
                      )}>
                        {showDenied ? 'Denied' : showAppealing ? 'Appealing' : step.label}
                      </span>
                    </div>
                    {/* Connecting line */}
                    {index < PROGRESS_STEPS.length - 1 && (
                      <div className={cn(
                        'h-0.5 flex-1 mx-1',
                        index < effectiveIndex ? 'bg-success' : 'bg-slate-700'
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Insurance company info */}
          {claim.insuranceCompany && (
            <div className="rounded-lg bg-slate-deep border border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Insurance Company</p>
                  <p className="text-slate-200 font-medium">{claim.insuranceCompany}</p>
                </div>
                {companyInfo && (
                  <a
                    href={`tel:${companyInfo.claimsPhone}`}
                    className="flex items-center gap-2 text-gold-light hover:text-gold-hover"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{companyInfo.claimsPhone}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Adjuster info */}
          {claim.adjusterName && (
            <div className="mt-4 rounded-lg bg-slate-deep border border-slate-700 p-4">
              <p className="text-sm text-slate-500 mb-2">Adjuster Information</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-200">{claim.adjusterName}</p>
                  {claim.adjusterPhone && (
                    <a
                      href={`tel:${claim.adjusterPhone}`}
                      className="text-sm text-gold-light hover:text-gold-hover"
                    >
                      {claim.adjusterPhone}
                    </a>
                  )}
                </div>
                {claim.adjusterVisitDate && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Scheduled Visit</p>
                    <p className="text-sm text-slate-300 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(claim.adjusterVisitDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Claim results */}
          {claim.claimAmountApproved !== null && claim.claimAmountApproved !== undefined && (
            <div className="mt-4 rounded-lg bg-success/10 border border-success/30 p-4">
              <p className="text-sm text-slate-400 mb-2">Claim Approved</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-success">
                    ${claim.claimAmountApproved.toLocaleString()}
                  </p>
                  {claim.deductible !== null && claim.deductible !== undefined && (
                    <p className="text-sm text-slate-500">
                      Deductible: ${claim.deductible.toLocaleString()}
                    </p>
                  )}
                </div>
                <p className="text-lg font-semibold text-slate-200">
                  Net: ${((claim.claimAmountApproved || 0) - (claim.deductible || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={onUpdateStatus}
            >
              Update Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={onAddNote}
            >
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {claim.timeline && claim.timeline.length > 0 && (
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="text-base text-slate-100">Claim Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {claim.timeline.map((event, index) => (
                <div key={index} className="relative flex gap-4 pb-4 last:pb-0">
                  {/* Connecting line */}
                  {index < claim.timeline.length - 1 && (
                    <div className="absolute left-[7px] top-4 h-full w-0.5 bg-slate-700" />
                  )}

                  {/* Dot */}
                  <div className="relative z-10 h-4 w-4 rounded-full bg-gold-light shrink-0 mt-0.5" />

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'text-sm font-medium',
                        CLAIM_STATUS_LABELS[event.status]?.color || 'text-slate-300'
                      )}>
                        {CLAIM_STATUS_LABELS[event.status]?.label || event.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    {event.notes && (
                      <p className="text-sm text-slate-400">{event.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
