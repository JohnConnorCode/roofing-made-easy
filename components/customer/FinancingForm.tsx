'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { DollarSign, CheckCircle, ChevronDown, Shield, Clock, ArrowRight } from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'
import Link from 'next/link'
import type { CreditRange, IncomeRange, EmploymentStatus } from '@/lib/supabase/types'

interface FinancingFormProps {
  estimatedAmount?: number
  onSubmit: (data: FinancingFormData) => Promise<void>
  isLoading?: boolean
}

export interface FinancingFormData {
  amountRequested: number
  creditRange: CreditRange
  incomeRange: IncomeRange
  employmentStatus: EmploymentStatus
  monthlyHousingPayment?: number
  coApplicant: boolean
}

const CREDIT_RANGES: { value: CreditRange; label: string; description: string }[] = [
  { value: 'excellent', label: 'Excellent (750+)', description: 'Best rates available' },
  { value: 'good', label: 'Good (700-749)', description: 'Competitive rates' },
  { value: 'fair', label: 'Fair (650-699)', description: 'Standard rates' },
  { value: 'poor', label: 'Poor (600-649)', description: 'Limited options' },
  { value: 'very_poor', label: 'Below 600', description: 'Specialized programs' },
]

const INCOME_RANGES: { value: IncomeRange; label: string }[] = [
  { value: 'under_30k', label: 'Under $30,000' },
  { value: '30k_50k', label: '$30,000 - $50,000' },
  { value: '50k_75k', label: '$50,000 - $75,000' },
  { value: '75k_100k', label: '$75,000 - $100,000' },
  { value: '100k_150k', label: '$100,000 - $150,000' },
  { value: 'over_150k', label: 'Over $150,000' },
]

const EMPLOYMENT_STATUSES: { value: EmploymentStatus; label: string }[] = [
  { value: 'employed_full_time', label: 'Employed Full-Time' },
  { value: 'employed_part_time', label: 'Employed Part-Time' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'other', label: 'Other' },
]

const POST_SUBMIT_STEPS = [
  { label: 'Submitted', completed: true },
  { label: 'Under Review', completed: false },
  { label: 'Pre-Qualified', completed: false },
  { label: 'Connected with Lender', completed: false },
]

export function FinancingForm({ estimatedAmount, onSubmit, isLoading }: FinancingFormProps) {
  const [formData, setFormData] = useState<FinancingFormData>({
    amountRequested: estimatedAmount || 10000,
    creditRange: 'good',
    incomeRange: '50k_75k',
    employmentStatus: 'employed_full_time',
    monthlyHousingPayment: undefined,
    coApplicant: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMoreFields, setShowMoreFields] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await onSubmit(formData)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.')
    }
  }

  if (submitted) {
    return (
      <Card variant="dark" className="border-success/30 bg-success/5">
        <CardContent className="pt-6 pb-6">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20 border border-success">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              Pre-Qualification Submitted
            </h3>
          </div>

          {/* Mini timeline */}
          <div className="flex items-center justify-between mb-6 px-4">
            {POST_SUBMIT_STEPS.map((step, index) => (
              <div key={step.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                    step.completed
                      ? 'bg-success text-white'
                      : 'bg-slate-700 text-slate-400 border border-slate-600'
                  )}>
                    {step.completed ? <CheckCircle className="h-3.5 w-3.5" /> : index + 1}
                  </div>
                  <span className={cn(
                    'text-[10px] mt-1 whitespace-nowrap',
                    step.completed ? 'text-success' : 'text-slate-500'
                  )}>
                    {step.label}
                  </span>
                </div>
                {index < POST_SUBMIT_STEPS.length - 1 && (
                  <div className={cn(
                    'h-0.5 flex-1 mx-2',
                    step.completed ? 'bg-success' : 'bg-slate-700'
                  )} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <Clock className="h-4 w-4" />
              Typically 1-2 business days
            </div>

            <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-3">
              <p className="text-sm text-slate-400">
                While you wait, explore insurance options to maximize your savings.
              </p>
              <Link
                href="/portal/insurance"
                className="inline-flex items-center gap-1 text-sm font-medium text-gold-light hover:text-gold-hover mt-1"
              >
                <Shield className="h-3.5 w-3.5" />
                Check Insurance Options
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="dark" className="border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <DollarSign className="h-5 w-5 text-gold-light" />
          Financing Pre-Qualification
        </CardTitle>
        <CardDescription>
          Start with just 2 fields. Add more details for better results.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Stage 1: Essential fields (always visible) */}
          <div>
            <Input
              type="number"
              label="Amount Needed"
              value={formData.amountRequested}
              onChange={(e) => setFormData({ ...formData, amountRequested: parseInt(e.target.value) || 0 })}
              min={1000}
              max={100000}
              step={500}
              required
              hint={estimatedAmount ? `Your estimate is ${formatCurrency(estimatedAmount)}` : undefined}
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
              Estimated Credit Score Range
              <Tooltip content="This is a soft inquiry and won't affect your credit score." />
            </label>
            <Select
              value={formData.creditRange}
              onChange={(value) => setFormData({ ...formData, creditRange: value as CreditRange })}
              options={CREDIT_RANGES.map((r) => ({
                value: r.value,
                label: r.label,
              }))}
            />
            <p className="mt-1.5 text-sm text-slate-500">
              {CREDIT_RANGES.find((r) => r.value === formData.creditRange)?.description}
            </p>
          </div>

          {/* Stage 2: Additional fields (collapsed by default) */}
          {!showMoreFields ? (
            <button
              type="button"
              onClick={() => setShowMoreFields(true)}
              className="flex items-center gap-2 text-sm text-gold-light hover:text-gold-hover transition-colors w-full justify-center py-2 rounded-lg border border-dashed border-slate-700 hover:border-gold-light/30"
            >
              <ChevronDown className="h-4 w-4" />
              More details for better results
            </button>
          ) : (
            <div className="space-y-6 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500">Additional details help us find better rates for you.</p>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Annual Household Income
                </label>
                <Select
                  value={formData.incomeRange}
                  onChange={(value) => setFormData({ ...formData, incomeRange: value as IncomeRange })}
                  options={INCOME_RANGES.map((r) => ({
                    value: r.value,
                    label: r.label,
                  }))}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Employment Status
                </label>
                <Select
                  value={formData.employmentStatus}
                  onChange={(value) => setFormData({ ...formData, employmentStatus: value as EmploymentStatus })}
                  options={EMPLOYMENT_STATUSES.map((s) => ({
                    value: s.value,
                    label: s.label,
                  }))}
                />
              </div>

              <div>
                <Input
                  type="number"
                  label="Monthly Housing Payment (optional)"
                  placeholder="1500"
                  value={formData.monthlyHousingPayment || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    monthlyHousingPayment: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  min={0}
                  step={50}
                  hint="Include mortgage/rent, property tax, and insurance"
                />
              </div>

              <div>
                <Checkbox
                  name="coApplicant"
                  label="I have a co-applicant who will apply with me"
                  checked={formData.coApplicant}
                  onChange={(e) => setFormData({ ...formData, coApplicant: e.target.checked })}
                />
                <p className="mt-1 ml-6 text-sm text-slate-500">
                  Adding a co-applicant may improve your approval chances and rates
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-700">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
            >
              Check My Options
            </Button>
            <p className="mt-3 text-xs text-slate-500 text-center">
              This is a soft inquiry and will not affect your credit score.
              Your information is kept confidential and secure.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
