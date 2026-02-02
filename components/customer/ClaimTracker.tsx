'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { Shield, ChevronRight, Phone, Calendar } from 'lucide-react'
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
            className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
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

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              {STATUS_ORDER.slice(0, -1).map((status, index) => (
                <div
                  key={status}
                  className={cn(
                    'h-2 flex-1 rounded-full mx-0.5 first:ml-0 last:mr-0',
                    index <= currentStatusIndex
                      ? claim.status === 'denied' || claim.status === 'appealing'
                        ? 'bg-yellow-500'
                        : 'bg-[#3d7a5a]'
                      : 'bg-slate-700'
                  )}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Filed</span>
              <span>Inspection</span>
              <span>Review</span>
              <span>Settled</span>
            </div>
          </div>

          {/* Insurance company info */}
          {claim.insuranceCompany && (
            <div className="rounded-lg bg-[#1a1f2e] border border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Insurance Company</p>
                  <p className="text-slate-200 font-medium">{claim.insuranceCompany}</p>
                </div>
                {companyInfo && (
                  <a
                    href={`tel:${companyInfo.claimsPhone}`}
                    className="flex items-center gap-2 text-[#c9a25c] hover:text-[#d4b06c]"
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
            <div className="mt-4 rounded-lg bg-[#1a1f2e] border border-slate-700 p-4">
              <p className="text-sm text-slate-500 mb-2">Adjuster Information</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-200">{claim.adjusterName}</p>
                  {claim.adjusterPhone && (
                    <a
                      href={`tel:${claim.adjusterPhone}`}
                      className="text-sm text-[#c9a25c] hover:text-[#d4b06c]"
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
            <div className="mt-4 rounded-lg bg-[#3d7a5a]/10 border border-[#3d7a5a]/30 p-4">
              <p className="text-sm text-slate-400 mb-2">Claim Approved</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-[#3d7a5a]">
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
                  <div className="relative z-10 h-4 w-4 rounded-full bg-[#c9a25c] shrink-0 mt-0.5" />

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
