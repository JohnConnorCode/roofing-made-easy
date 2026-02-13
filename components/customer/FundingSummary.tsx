'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import {
  DollarSign,
  Shield,
  HandHeart,
  CreditCard,
  ArrowRight,
} from 'lucide-react'

interface FundingSummaryProps {
  estimateAmount: number
  insuranceApproved?: number
  insuranceDeductible?: number
  insuranceStatus?: string
  hasInsuranceClaim: boolean
  eligibleProgramsBenefit: number
  programCount: number
  hasFinancingApp: boolean
  financingStatus?: string
}

function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  const monthlyRate = annualRate / 100 / 12
  if (monthlyRate === 0) return principal / months
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  )
}

export function FundingSummary({
  estimateAmount,
  insuranceApproved,
  insuranceDeductible = 0,
  insuranceStatus,
  hasInsuranceClaim,
  eligibleProgramsBenefit,
  programCount,
  hasFinancingApp,
}: FundingSummaryProps) {
  const insuranceNet = insuranceApproved
    ? Math.max(0, insuranceApproved - insuranceDeductible)
    : 0
  const assistanceCoverage = Math.min(
    eligibleProgramsBenefit,
    estimateAmount - insuranceNet
  )
  const remaining = Math.max(
    0,
    estimateAmount - insuranceNet - assistanceCoverage
  )
  const monthlyPayment =
    remaining > 0 ? calculateMonthlyPayment(remaining, 9.99, 60) : 0

  // Build bar segments
  const segments: Array<{ label: string; amount: number; color: string }> = []
  if (insuranceNet > 0) {
    segments.push({
      label: 'Insurance',
      amount: insuranceNet,
      color: 'bg-blue-400',
    })
  }
  if (assistanceCoverage > 0) {
    segments.push({
      label: 'Assistance',
      amount: assistanceCoverage,
      color: 'bg-pink-400',
    })
  }
  if (remaining > 0) {
    segments.push({
      label: 'Financing',
      amount: remaining,
      color: 'bg-[#c9a25c]',
    })
  }

  return (
    <Card variant="dark" className="border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#c9a25c]" />
          Funding Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Project cost */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Project Cost</span>
          <span className="text-xl font-bold text-slate-100">
            {formatCurrency(estimateAmount)}
          </span>
        </div>

        {/* Stacked bar */}
        {segments.length > 0 && (
          <div>
            <div className="h-3 w-full rounded-full bg-[#0c0f14] overflow-hidden flex">
              {segments.map((seg, i) => (
                <div
                  key={seg.label}
                  className={cn(
                    'h-full transition-all duration-500',
                    seg.color,
                    i === 0 && 'rounded-l-full',
                    i === segments.length - 1 && 'rounded-r-full'
                  )}
                  style={{
                    width: `${(seg.amount / estimateAmount) * 100}%`,
                  }}
                  title={`${seg.label}: ${formatCurrency(seg.amount)}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {segments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-1.5">
                  <div
                    className={cn('h-2.5 w-2.5 rounded-full', seg.color)}
                  />
                  <span className="text-xs text-slate-400">{seg.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Breakdown rows */}
        <div className="space-y-3 rounded-lg border border-slate-700 bg-[#0c0f14] p-4">
          {/* Insurance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-slate-300">Insurance</span>
            </div>
            {insuranceApproved ? (
              <span className="text-sm font-medium text-blue-400">
                {formatCurrency(insuranceNet)}
              </span>
            ) : hasInsuranceClaim ? (
              <span className="text-xs text-yellow-400">
                {insuranceStatus === 'filed' ? 'Pending' : insuranceStatus || 'Pending'}
              </span>
            ) : (
              <Link href="/portal/insurance">
                <span className="text-xs text-[#c9a25c] hover:underline cursor-pointer">
                  File a claim
                </span>
              </Link>
            )}
          </div>

          {/* Assistance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HandHeart className="h-4 w-4 text-pink-400" />
              <span className="text-sm text-slate-300">Assistance</span>
            </div>
            {programCount > 0 ? (
              <span className="text-sm font-medium text-pink-400">
                Up to {formatCurrency(assistanceCoverage)}
              </span>
            ) : (
              <Link href="/portal/assistance">
                <span className="text-xs text-[#c9a25c] hover:underline cursor-pointer">
                  Explore programs
                </span>
              </Link>
            )}
          </div>

          {/* Financing / Remaining */}
          <div className="flex items-center justify-between border-t border-slate-700 pt-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#c9a25c]" />
              <span className="text-sm font-medium text-slate-200">
                Remaining
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-[#c9a25c]">
                {formatCurrency(remaining)}
              </span>
              {monthlyPayment > 0 && (
                <p className="text-xs text-slate-500">
                  ~{formatCurrency(Math.round(monthlyPayment))}/mo
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        {remaining > 0 && !hasFinancingApp && (
          <Link href="/portal/financing">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#c9a25c]/40 text-[#c9a25c] hover:bg-[#c9a25c]/10"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Explore Financing for the Remaining Balance
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
