'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { DollarSign, Calculator, ArrowRight } from 'lucide-react'

interface ClaimValueEstimatorProps {
  estimateAmount?: number
}

type CoverageType = 'rcv' | 'acv'

const DEDUCTIBLE_PRESETS = [500, 1000, 2500]

const FINANCING_RATE = 9.99
const FINANCING_TERM_MONTHS = 60

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

export default function ClaimValueEstimator({ estimateAmount = 0 }: ClaimValueEstimatorProps) {
  const [deductible, setDeductible] = useState(1000)
  const [customDeductible, setCustomDeductible] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [coverageType, setCoverageType] = useState<CoverageType>('rcv')
  const [depreciationPercent, setDepreciationPercent] = useState(20)

  const effectiveDeductible = isCustom
    ? Math.max(0, Number(customDeductible) || 0)
    : deductible

  const calculations = useMemo(() => {
    const total = Math.max(0, estimateAmount)
    const depreciationAmount =
      coverageType === 'acv'
        ? Math.round(total * (depreciationPercent / 100))
        : 0
    const afterDepreciation = total - depreciationAmount
    const insurancePayout = Math.max(0, afterDepreciation - effectiveDeductible)
    const outOfPocket = total - insurancePayout
    const financingAmount = outOfPocket
    const monthlyPayment =
      financingAmount > 0
        ? calculateMonthlyPayment(financingAmount, FINANCING_RATE, FINANCING_TERM_MONTHS)
        : 0

    return {
      total,
      depreciationAmount,
      afterDepreciation,
      insurancePayout,
      outOfPocket,
      financingAmount,
      monthlyPayment,
    }
  }, [estimateAmount, effectiveDeductible, coverageType, depreciationPercent])

  function handlePresetClick(preset: number) {
    setDeductible(preset)
    setIsCustom(false)
    setCustomDeductible('')
  }

  function handleCustomClick() {
    setIsCustom(true)
  }

  function handleCustomChange(value: string) {
    const sanitized = value.replace(/[^0-9]/g, '')
    setCustomDeductible(sanitized)
  }

  return (
    <Card variant="dark" className="bg-[#1a1f2e] border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c9a25c]/20">
            <Calculator className="h-5 w-5 text-[#c9a25c]" />
          </div>
          <CardTitle className="text-slate-100">Claim Value Estimator</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Deductible Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Deductible
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DEDUCTIBLE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium transition-all border',
                    !isCustom && deductible === preset
                      ? 'bg-[#c9a25c]/20 border-[#c9a25c] text-[#c9a25c]'
                      : 'bg-[#0c0f14] border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                  )}
                >
                  {formatCurrency(preset)}
                </button>
              ))}
              <button
                type="button"
                onClick={handleCustomClick}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm font-medium transition-all border',
                  isCustom
                    ? 'bg-[#c9a25c]/20 border-[#c9a25c] text-[#c9a25c]'
                    : 'bg-[#0c0f14] border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                )}
              >
                Custom
              </button>
            </div>
            {isCustom && (
              <div className="mt-2 relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={customDeductible}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  placeholder="Enter amount"
                  className={cn(
                    'w-full rounded-lg border bg-[#0c0f14] border-slate-700 pl-9 pr-4 py-2.5',
                    'text-sm text-slate-200',
                    'focus:outline-none focus:ring-2 focus:ring-[#c9a25c]/50 focus:border-[#c9a25c]',
                    'placeholder:text-slate-600'
                  )}
                />
              </div>
            )}
          </div>

          {/* Coverage Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Coverage Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCoverageType('rcv')}
                className={cn(
                  'rounded-lg px-4 py-3 text-sm font-medium transition-all border text-left',
                  coverageType === 'rcv'
                    ? 'bg-[#c9a25c]/20 border-[#c9a25c] text-[#c9a25c]'
                    : 'bg-[#0c0f14] border-slate-700 text-slate-400 hover:border-slate-500'
                )}
              >
                <span className="block font-semibold">RCV</span>
                <span className="block text-xs mt-0.5 opacity-70">
                  Replacement Cost Value
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCoverageType('acv')}
                className={cn(
                  'rounded-lg px-4 py-3 text-sm font-medium transition-all border text-left',
                  coverageType === 'acv'
                    ? 'bg-[#c9a25c]/20 border-[#c9a25c] text-[#c9a25c]'
                    : 'bg-[#0c0f14] border-slate-700 text-slate-400 hover:border-slate-500'
                )}
              >
                <span className="block font-semibold">ACV</span>
                <span className="block text-xs mt-0.5 opacity-70">
                  Actual Cash Value
                </span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {coverageType === 'rcv'
                ? 'RCV covers the full cost to replace with new, equivalent materials.'
                : 'ACV deducts depreciation based on your roof\'s age and condition.'}
            </p>
          </div>

          {/* ACV Depreciation Slider */}
          {coverageType === 'acv' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">
                  Depreciation
                </label>
                <span className="text-sm font-semibold text-[#c9a25c]">
                  {depreciationPercent}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={depreciationPercent}
                onChange={(e) => setDepreciationPercent(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700 accent-[#c9a25c]"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>
          )}

          {/* Breakdown */}
          <div className="rounded-lg border border-slate-700 bg-[#0c0f14] p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Estimate Total</span>
              <span className="text-slate-200 font-medium">
                {formatCurrency(calculations.total)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Deductible</span>
              <span className="text-red-400 font-medium">
                -{formatCurrency(effectiveDeductible)}
              </span>
            </div>

            {coverageType === 'acv' && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">
                  Depreciation ({depreciationPercent}%)
                </span>
                <span className="text-red-400 font-medium">
                  -{formatCurrency(calculations.depreciationAmount)}
                </span>
              </div>
            )}

            <div className="border-t border-slate-700 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 font-semibold">
                  Expected Insurance Payout
                </span>
                <span className="text-green-400 font-bold text-base">
                  {formatCurrency(calculations.insurancePayout)}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Your Out-of-Pocket</span>
              <span className="text-slate-200 font-medium">
                {formatCurrency(calculations.outOfPocket)}
              </span>
            </div>
          </div>

          {/* Financing Bridge */}
          {calculations.outOfPocket > 0 && calculations.total > 0 && (
            <div className="rounded-lg border border-[#c9a25c]/30 bg-[#c9a25c]/5 p-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-[#c9a25c] mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">
                    If insurance covers{' '}
                    <span className="font-semibold text-green-400">
                      {formatCurrency(calculations.insurancePayout)}
                    </span>{' '}
                    of your{' '}
                    <span className="font-semibold text-slate-100">
                      {formatCurrency(calculations.total)}
                    </span>{' '}
                    project, financing the remaining{' '}
                    <span className="font-semibold text-[#c9a25c]">
                      {formatCurrency(calculations.outOfPocket)}
                    </span>{' '}
                    would cost approximately{' '}
                    <span className="font-semibold text-slate-100">
                      {formatCurrency(Math.round(calculations.monthlyPayment))}/month
                    </span>{' '}
                    <span className="text-xs text-slate-500">
                      ({FINANCING_RATE}% APR, {FINANCING_TERM_MONTHS} months)
                    </span>
                  </p>
                  <Link href={`/financing?estimate=${calculations.outOfPocket}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#c9a25c] text-[#c9a25c] hover:bg-[#c9a25c]/10"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Explore Financing Options
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
