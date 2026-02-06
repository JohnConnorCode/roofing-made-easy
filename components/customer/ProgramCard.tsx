'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { ExternalLink, Phone, CheckCircle, XCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { AssistanceProgramData } from '@/lib/data/assistance-programs'
import { PROGRAM_TYPE_LABELS, APPLICATION_STATUS_LABELS } from '@/lib/data/assistance-programs'
import type { ApplicationStatus } from '@/lib/supabase/types'

interface ProgramCardProps {
  program: AssistanceProgramData
  eligibilityStatus?: {
    eligible: boolean
    reasons?: string[]
  }
  applicationStatus?: ApplicationStatus
  onApply?: () => void
  onTrack?: () => void
  compact?: boolean
  expandable?: boolean
}

export function ProgramCard({
  program,
  eligibilityStatus,
  applicationStatus,
  onApply,
  onTrack,
  compact = false,
  expandable = false,
}: ProgramCardProps) {
  const [expanded, setExpanded] = useState(false)
  const typeInfo = PROGRAM_TYPE_LABELS[program.programType]
  const appStatusInfo = applicationStatus ? APPLICATION_STATUS_LABELS[applicationStatus] : null

  if (compact) {
    return (
      <Card className={cn(
        'border-slate-700 transition-all hover:border-slate-600',
        eligibilityStatus?.eligible === true && 'border-success/30',
        eligibilityStatus?.eligible === false && 'border-red-500/20 opacity-60'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{typeInfo.icon}</span>
                <h4 className="font-medium text-slate-100 truncate">{program.name}</h4>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2">{program.description}</p>
              {program.maxBenefitAmount && (
                <p className="text-sm text-gold-light mt-1">
                  Up to {formatCurrency(program.maxBenefitAmount)}
                </p>
              )}
            </div>
            <div className="shrink-0">
              {eligibilityStatus?.eligible === true && (
                <CheckCircle className="h-5 w-5 text-success" />
              )}
              {eligibilityStatus?.eligible === false && (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              {eligibilityStatus === undefined && (
                <HelpCircle className="h-5 w-5 text-slate-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Expandable collapsed mode
  if (expandable && !expanded) {
    return (
      <Card
        className={cn(
          'border-slate-700 transition-all hover:border-slate-600 cursor-pointer',
          eligibilityStatus?.eligible === true && 'border-success/30',
          eligibilityStatus?.eligible === false && 'border-red-500/20 opacity-60'
        )}
        onClick={() => setExpanded(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-lg shrink-0">{typeInfo.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-slate-100 truncate">{program.name}</h4>
              <div className="flex items-center gap-3 mt-0.5">
                {program.maxBenefitAmount && (
                  <span className="text-sm text-gold-light">
                    Up to {formatCurrency(program.maxBenefitAmount)}
                  </span>
                )}
                {program.state && (
                  <span className="text-xs text-slate-500">{program.state}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {eligibilityStatus?.eligible === true && (
                <CheckCircle className="h-4 w-4 text-success" />
              )}
              {eligibilityStatus?.eligible === false && (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              {applicationStatus ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 text-xs"
                  onClick={(e) => { e.stopPropagation(); onTrack?.() }}
                >
                  Track
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0 text-xs"
                  onClick={(e) => { e.stopPropagation(); onApply?.() }}
                  disabled={eligibilityStatus?.eligible === false}
                >
                  Apply
                </Button>
              )}
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      'border-slate-700',
      eligibilityStatus?.eligible === true && 'border-success/30 bg-success/5',
      eligibilityStatus?.eligible === false && 'border-red-500/20'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                'text-xs font-medium px-2 py-1 rounded-full',
                typeInfo.color
              )}>
                {typeInfo.icon} {typeInfo.label}
              </span>
              {program.state && (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                  {program.state}
                </span>
              )}
            </div>
            <CardTitle className="text-lg text-slate-100">{program.name}</CardTitle>
            {program.programCode && (
              <p className="text-xs text-slate-500 font-mono">{program.programCode}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {appStatusInfo && (
              <span className={cn('text-sm font-medium', appStatusInfo.color)}>
                {appStatusInfo.label}
              </span>
            )}
            {expandable && (
              <button
                onClick={() => setExpanded(false)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-slate-400">{program.description}</p>

        {/* Benefits */}
        <div className="rounded-lg bg-slate-deep border border-slate-700 p-3">
          <p className="text-xs text-slate-500 mb-1">Benefits</p>
          <p className="text-sm text-slate-300">{program.benefits}</p>
          {program.maxBenefitAmount && (
            <p className="text-lg font-semibold text-gold-light mt-2">
              Up to {formatCurrency(program.maxBenefitAmount)}
            </p>
          )}
        </div>

        {/* Eligibility status */}
        {eligibilityStatus && (
          <div className={cn(
            'rounded-lg p-3 border',
            eligibilityStatus.eligible
              ? 'bg-success/10 border-success/30'
              : 'bg-red-500/10 border-red-500/20'
          )}>
            <div className="flex items-center gap-2 mb-1">
              {eligibilityStatus.eligible ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              <p className={cn(
                'text-sm font-medium',
                eligibilityStatus.eligible ? 'text-success' : 'text-red-400'
              )}>
                {eligibilityStatus.eligible ? 'You may be eligible' : 'May not qualify'}
              </p>
            </div>
            {eligibilityStatus.reasons && eligibilityStatus.reasons.length > 0 && (
              <ul className="text-xs text-slate-400 ml-6 list-disc">
                {eligibilityStatus.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Required documents */}
        {program.requiredDocuments.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2">Required Documents</p>
            <ul className="text-sm text-slate-400 space-y-1">
              {program.requiredDocuments.slice(0, 4).map((doc, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gold-light">&bull;</span>
                  {doc}
                </li>
              ))}
              {program.requiredDocuments.length > 4 && (
                <li className="text-slate-500 italic">
                  +{program.requiredDocuments.length - 4} more...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Tips */}
        {program.tips && (
          <div className="rounded-lg bg-gold-light/10 border border-gold-light/20 p-3">
            <p className="text-xs text-gold-light font-medium mb-1">Tip</p>
            <p className="text-sm text-slate-300">{program.tips}</p>
          </div>
        )}

        {/* Contact info */}
        {(program.contactPhone || program.applicationUrl) && (
          <div className="flex items-center gap-4 pt-2 border-t border-slate-700">
            {program.contactPhone && (
              <a
                href={`tel:${program.contactPhone}`}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
              >
                <Phone className="h-4 w-4" />
                {program.contactPhone}
              </a>
            )}
            {program.applicationUrl && (
              <a
                href={program.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gold-light hover:text-gold-hover"
              >
                <ExternalLink className="h-4 w-4" />
                Apply Online
              </a>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {applicationStatus ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={onTrack}
            >
              Track Application
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="flex-1 bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
              onClick={onApply}
              disabled={eligibilityStatus?.eligible === false}
            >
              Start Application
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
