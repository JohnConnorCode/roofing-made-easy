'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { Calculator, ArrowRight, CheckCircle } from 'lucide-react'

interface EligibleProgram {
  name: string
  maxBenefitAmount?: number
  programType: string
}

interface BenefitCalculatorProps {
  estimateAmount?: number
  eligiblePrograms?: EligibleProgram[]
}

/** Sort priority: federal and nonprofit grants first, then state, then utility, then everything else. */
const TYPE_SORT_ORDER: Record<string, number> = {
  federal: 0,
  nonprofit: 1,
  state: 2,
  local: 3,
  utility: 4,
}

const TYPE_BADGE_STYLES: Record<string, string> = {
  federal: 'bg-blue-400/10 text-blue-400',
  nonprofit: 'bg-pink-400/10 text-pink-400',
  state: 'bg-purple-400/10 text-purple-400',
  local: 'bg-green-400/10 text-green-400',
  utility: 'bg-yellow-400/10 text-yellow-400',
}

const TYPE_BAR_COLORS: Record<string, string> = {
  federal: 'bg-blue-400',
  nonprofit: 'bg-pink-400',
  state: 'bg-purple-400',
  local: 'bg-green-400',
  utility: 'bg-yellow-400',
}

function formatTypeLabel(programType: string): string {
  switch (programType) {
    case 'federal':
      return 'Federal Grant'
    case 'nonprofit':
      return 'Nonprofit'
    case 'state':
      return 'State Program'
    case 'local':
      return 'Local Program'
    case 'utility':
      return 'Utility Rebate'
    default:
      return programType.charAt(0).toUpperCase() + programType.slice(1)
  }
}

interface WaterfallRow {
  name: string
  programType: string
  amount: number
  runningTotal: number
}

export default function BenefitCalculator({
  estimateAmount,
  eligiblePrograms,
}: BenefitCalculatorProps) {
  const hasData = estimateAmount !== undefined && estimateAmount > 0 && eligiblePrograms && eligiblePrograms.length > 0

  const { rows, remaining, totalCovered } = useMemo(() => {
    if (!hasData) {
      return { rows: [] as WaterfallRow[], remaining: 0, totalCovered: 0 }
    }

    const sorted = [...eligiblePrograms].sort((a, b) => {
      const orderA = TYPE_SORT_ORDER[a.programType] ?? 99
      const orderB = TYPE_SORT_ORDER[b.programType] ?? 99
      return orderA - orderB
    })

    const waterfallRows: WaterfallRow[] = []
    let runningTotal = estimateAmount

    for (const program of sorted) {
      if (runningTotal <= 0) break
      const benefit = program.maxBenefitAmount ?? 0
      if (benefit <= 0) continue

      const appliedAmount = Math.min(benefit, runningTotal)
      runningTotal = runningTotal - appliedAmount

      waterfallRows.push({
        name: program.name,
        programType: program.programType,
        amount: appliedAmount,
        runningTotal,
      })
    }

    return {
      rows: waterfallRows,
      remaining: Math.max(runningTotal, 0),
      totalCovered: estimateAmount - Math.max(runningTotal, 0),
    }
  }, [estimateAmount, eligiblePrograms, hasData])

  // Empty state: no programs or no estimate provided
  if (!hasData) {
    return (
      <Card variant="dark" className="border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c9a25c]/20">
              <Calculator className="h-5 w-5 text-[#c9a25c]" />
            </div>
            <CardTitle className="text-slate-100">Benefit Calculator</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-slate-600 bg-[#0c0f14] p-8 text-center">
            <Calculator className="mx-auto h-10 w-10 text-slate-600 mb-4" />
            <p className="text-slate-300 font-medium mb-2">
              See how much assistance could cover
            </p>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Complete your eligibility filters and get an estimate to see a
              breakdown of how programs can reduce your out-of-pocket cost.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const fullyCovered = remaining <= 0

  return (
    <Card variant="dark" className="border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c9a25c]/20">
            <Calculator className="h-5 w-5 text-[#c9a25c]" />
          </div>
          <CardTitle className="text-slate-100">Benefit Calculator</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stacked bar visualization */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Coverage breakdown</span>
            <span className="text-slate-400">
              {formatCurrency(totalCovered)} of {formatCurrency(estimateAmount)}
            </span>
          </div>
          <div className="h-4 w-full rounded-full bg-[#0c0f14] overflow-hidden flex">
            {rows.map((row, index) => {
              const widthPercent = (row.amount / estimateAmount) * 100
              return (
                <div
                  key={index}
                  className={cn(
                    'h-full transition-all duration-500',
                    TYPE_BAR_COLORS[row.programType] ?? 'bg-slate-500',
                    index === 0 ? 'rounded-l-full' : '',
                    fullyCovered && index === rows.length - 1 ? 'rounded-r-full' : ''
                  )}
                  style={{ width: `${widthPercent}%` }}
                  title={`${row.name}: ${formatCurrency(row.amount)}`}
                />
              )
            })}
            {remaining > 0 && (
              <div
                className="h-full bg-[#c9a25c]/30 rounded-r-full"
                style={{ width: `${(remaining / estimateAmount) * 100}%` }}
                title={`Remaining: ${formatCurrency(remaining)}`}
              />
            )}
          </div>
        </div>

        {/* Waterfall rows */}
        <div className="space-y-0 rounded-xl border border-slate-700 overflow-hidden">
          {/* Project cost row */}
          <div className="flex items-center justify-between bg-[#0c0f14] px-4 py-3 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <span className="font-medium text-slate-100">Project Cost</span>
            </div>
            <span className="font-semibold text-slate-100 tabular-nums">
              {formatCurrency(estimateAmount)}
            </span>
          </div>

          {/* Program rows */}
          {rows.map((row, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-[#1a1f2e] hover:bg-[#1e2436] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'h-2.5 w-2.5 rounded-full flex-shrink-0',
                    TYPE_BAR_COLORS[row.programType] ?? 'bg-slate-500'
                  )}
                />
                <span className="text-slate-300 truncate text-sm">{row.name}</span>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full flex-shrink-0',
                    TYPE_BADGE_STYLES[row.programType] ?? 'bg-slate-400/10 text-slate-400'
                  )}
                >
                  {formatTypeLabel(row.programType)}
                </span>
              </div>
              <span className="font-medium text-red-400 tabular-nums flex-shrink-0 ml-4">
                -{formatCurrency(row.amount)}
              </span>
            </div>
          ))}

          {/* Remaining row */}
          <div
            className={cn(
              'flex items-center justify-between px-4 py-3',
              fullyCovered
                ? 'bg-[#3d7a5a]/10'
                : 'bg-[#c9a25c]/5'
            )}
          >
            <span className="font-semibold text-slate-100">Remaining</span>
            <span
              className={cn(
                'font-bold text-lg tabular-nums',
                fullyCovered ? 'text-[#3d7a5a]' : 'text-[#c9a25c]'
              )}
            >
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6">
          {fullyCovered ? (
            <div className="flex items-center gap-3 rounded-lg border border-[#3d7a5a]/30 bg-[#3d7a5a]/10 px-4 py-3">
              <CheckCircle className="h-5 w-5 text-[#3d7a5a] flex-shrink-0" />
              <p className="text-sm text-[#3d7a5a] font-medium">
                These programs could fully cover your project!
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-[#c9a25c]/20 bg-[#c9a25c]/5 px-4 py-3">
              <p className="text-sm text-slate-300">
                Bridge the remaining{' '}
                <span className="font-semibold text-[#c9a25c]">
                  {formatCurrency(remaining)}
                </span>{' '}
                with affordable financing.
              </p>
              <Link href="/portal/financing">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#c9a25c]/40 text-[#c9a25c] hover:bg-[#c9a25c]/10"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Explore Financing
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
