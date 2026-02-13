'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TrendingUp, DollarSign, ArrowRight } from 'lucide-react'

type IncomeRange =
  | 'under_30k'
  | '30k_50k'
  | '50k_75k'
  | '75k_100k'
  | '100k_150k'
  | 'over_150k'

interface AffordabilityAnalyzerProps {
  estimateAmount?: number
  incomeRange?: IncomeRange
}

const INCOME_MIDPOINTS: Record<IncomeRange, number> = {
  under_30k: 25000,
  '30k_50k': 40000,
  '50k_75k': 62500,
  '75k_100k': 87500,
  '100k_150k': 125000,
  over_150k: 175000,
}

const INCOME_LABELS: Record<IncomeRange, string> = {
  under_30k: 'Under $30k',
  '30k_50k': '$30k - $50k',
  '50k_75k': '$50k - $75k',
  '75k_100k': '$75k - $100k',
  '100k_150k': '$100k - $150k',
  over_150k: 'Over $150k',
}

const SCENARIOS = [
  { months: 36, label: '36 months (3 years)' },
  { months: 60, label: '60 months (5 years)' },
  { months: 120, label: '120 months (10 years)' },
] as const

const APR = 9.99

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

function getAffordabilityLevel(percentOfIncome: number): {
  label: string
  color: string
  barColor: string
  bgColor: string
} {
  if (percentOfIncome < 5) {
    return {
      label: 'Comfortable',
      color: 'text-emerald-400',
      barColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-500/20',
    }
  }
  if (percentOfIncome <= 10) {
    return {
      label: 'Manageable',
      color: 'text-amber-400',
      barColor: 'bg-amber-500',
      bgColor: 'bg-amber-500/20',
    }
  }
  return {
    label: 'Stretch',
    color: 'text-red-400',
    barColor: 'bg-red-500',
    bgColor: 'bg-red-500/20',
  }
}

export default function AffordabilityAnalyzer({
  estimateAmount,
  incomeRange,
}: AffordabilityAnalyzerProps) {
  if (!estimateAmount || !incomeRange) {
    return (
      <Card variant="dark" className="border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#c9a25c]/20">
              <TrendingUp className="h-5 w-5 text-[#c9a25c]" />
            </div>
            <CardTitle className="text-slate-100">
              Affordability Analyzer
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">
            Complete the financing form with your estimate amount and income
            range to see a personalized affordability analysis.
          </p>
          <div className="mt-4">
            <Link href="/financing">
              <Button
                variant="outline"
                size="sm"
                className="border-[#c9a25c]/40 text-[#c9a25c] hover:bg-[#c9a25c]/10"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Go to Financing Calculator
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const annualIncome = INCOME_MIDPOINTS[incomeRange]
  const monthlyIncome = annualIncome / 12

  const scenarios = SCENARIOS.map((scenario) => {
    const monthlyPayment = calculateMonthlyPayment(
      estimateAmount,
      APR,
      scenario.months
    )
    const percentOfIncome = (monthlyPayment / monthlyIncome) * 100
    const affordability = getAffordabilityLevel(percentOfIncome)

    return {
      ...scenario,
      monthlyPayment,
      percentOfIncome,
      affordability,
    }
  })

  const optimalScenario = scenarios.find(
    (s) => s.affordability.label === 'Comfortable'
  )
  const recommendation = optimalScenario
    ? `Based on your income range, the ${optimalScenario.months}-month plan fits comfortably`
    : `Consider a longer term or smaller project to keep payments manageable`

  return (
    <Card variant="dark" className="border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#c9a25c]/20">
            <TrendingUp className="h-5 w-5 text-[#c9a25c]" />
          </div>
          <div>
            <CardTitle className="text-slate-100">
              Affordability Analyzer
            </CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              {APR}% APR &middot; Income: {INCOME_LABELS[incomeRange]}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Estimate Summary */}
        <div className="flex items-center gap-2 rounded-lg bg-[#c9a25c]/10 border border-[#c9a25c]/20 px-4 py-3">
          <DollarSign className="h-5 w-5 text-[#c9a25c] flex-shrink-0" />
          <span className="text-sm text-slate-300">
            Estimate:{' '}
            <span className="font-semibold text-[#c9a25c]">
              ${estimateAmount.toLocaleString()}
            </span>
          </span>
        </div>

        {/* Scenario Cards */}
        <div className="space-y-4">
          {scenarios.map((scenario) => {
            // Cap the visual bar at 20% so it stays useful
            const barWidth = Math.min(scenario.percentOfIncome, 20) * 5

            return (
              <div
                key={scenario.months}
                className="rounded-lg border border-slate-700 bg-[#0c0f14] p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-200">
                    {scenario.label}
                  </span>
                  <span className="text-lg font-bold text-slate-100">
                    ${scenario.monthlyPayment.toFixed(2)}
                    <span className="text-xs font-normal text-slate-500">
                      /mo
                    </span>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-700 mb-2">
                  <div
                    className={cn(
                      'h-2.5 rounded-full transition-all duration-500',
                      scenario.affordability.barColor
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      scenario.affordability.color
                    )}
                  >
                    {scenario.affordability.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {scenario.percentOfIncome.toFixed(1)}% of monthly income
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recommendation */}
        <div className="rounded-lg bg-[#1a1f2e] border border-slate-700 p-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            <span className="font-semibold text-slate-100">
              Recommendation:
            </span>{' '}
            {recommendation}
          </p>
        </div>

        {/* Link to Compare */}
        <div className="pt-1">
          <Link href="/financing">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#c9a25c]/40 text-[#c9a25c] hover:bg-[#c9a25c]/10"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Compare All Scenarios
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
