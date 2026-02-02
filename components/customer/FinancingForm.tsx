'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, CheckCircle } from 'lucide-react'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Card className="border-[#3d7a5a]/30 bg-[#3d7a5a]/5">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#3d7a5a]/20 border border-[#3d7a5a]">
            <CheckCircle className="h-8 w-8 text-[#3d7a5a]" />
          </div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">
            Pre-Qualification Submitted
          </h3>
          <p className="text-slate-400 mb-4">
            Our team will review your information and connect you with financing options that match your needs.
            We&apos;ll be in touch within 1-2 business days.
          </p>
          <Button
            variant="outline"
            onClick={() => setSubmitted(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <DollarSign className="h-5 w-5 text-[#c9a25c]" />
          Financing Pre-Qualification
        </CardTitle>
        <CardDescription>
          Fill out this form to see if you qualify for financing. Our team will review your information
          and connect you with lenders that match your needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount requested */}
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

          {/* Credit range */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Estimated Credit Score Range
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

          {/* Annual income */}
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

          {/* Employment status */}
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

          {/* Monthly housing payment */}
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

          {/* Co-applicant */}
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

          <div className="pt-4 border-t border-slate-700">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
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
