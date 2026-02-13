'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCustomerStore } from '@/stores/customerStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import {
  FinancingForm,
  type FinancingFormData,
  EstimateSummary,
  ProgressTimeline,
  type TimelineStep,
  Breadcrumbs,
} from '@/components/customer'
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Shield,
  Sparkles,
  ArrowRight,
  HandHeart,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { FinancingStatus } from '@/lib/supabase/types'
import { getPhoneDisplay, getPhoneLink } from '@/lib/config/business'
import AffordabilityAnalyzer from '@/components/financing/AffordabilityAnalyzer'
import { AiAdvisorChat } from '@/components/shared/AiAdvisorChat'

const STATUS_CONFIG: Record<FinancingStatus, { icon: typeof Clock; color: string; bgColor: string; label: string; description: string }> = {
  interested: {
    icon: Clock,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    label: 'Submitted',
    description: 'Your pre-qualification request has been submitted. Our team will review it shortly.',
  },
  contacted: {
    icon: Phone,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    label: 'In Contact',
    description: 'Our team is working on your request and will be in touch soon.',
  },
  pre_qualified: {
    icon: CheckCircle,
    color: 'text-gold-light',
    bgColor: 'bg-gold-light/10',
    label: 'Pre-Qualified',
    description: "Great news! You've been pre-qualified. We're connecting you with lenders.",
  },
  applied: {
    icon: Clock,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    label: 'Application Submitted',
    description: 'Your application has been submitted to a lender and is under review.',
  },
  approved: {
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10',
    label: 'Approved!',
    description: 'Congratulations! Your financing has been approved.',
  },
  denied: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    label: 'Not Approved',
    description: "Unfortunately, this application wasn't approved. We can help you explore other options.",
  },
  withdrawn: {
    icon: AlertCircle,
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/10',
    label: 'Withdrawn',
    description: 'This application has been withdrawn.',
  },
}

export default function FinancingPage() {
  const { showToast } = useToast()
  const {
    linkedLeads,
    selectedLeadId,
    financingApplications,
    addFinancingApplication,
    insuranceClaims,
  } = useCustomerStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scenarios, setScenarios] = useState<Array<{
    name: string
    termMonths: number
    estimatedRate: number
    monthlyPayment: number
    totalInterest: number
    recommendation: string
  }> | null>(null)
  const [scenarioSummary, setScenarioSummary] = useState<string | null>(null)
  const [scenarioLoading, setScenarioLoading] = useState(false)

  // Get current lead data
  const currentLead = linkedLeads.find((l) => l.lead_id === selectedLeadId)
  const estimate = currentLead?.lead?.estimate
  const property = currentLead?.lead?.property

  // Get existing financing application for this lead
  const existingApplication = financingApplications.find((f) => f.lead_id === selectedLeadId)

  const handleSubmit = async (formData: FinancingFormData) => {
    if (!selectedLeadId) {
      showToast('Please select a property first', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/customer/financing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadId,
          ...formData,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit')
      }

      const data = await response.json()
      addFinancingApplication(data)
      showToast('Pre-qualification submitted successfully!', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to submit', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateScenarios = async () => {
    if (!estimate) return
    setScenarioLoading(true)
    try {
      const existingClaim = insuranceClaims.find((c) => c.lead_id === selectedLeadId)
      const response = await fetch('/api/customer/financing/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimateAmount: estimate.price_likely,
          creditRange: existingApplication?.credit_range || 'good',
          insurancePayoutAmount: existingClaim?.claim_amount_approved || undefined,
          state: property?.state || 'MS',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setScenarios(data.data.scenarios)
        setScenarioSummary(data.data.summary)
      }
    } catch {
      // Silently fail - AI scenarios are optional
    } finally {
      setScenarioLoading(false)
    }
  }

  // Build status timeline
  const getStatusSteps = (status: FinancingStatus): TimelineStep[] => {
    const steps: TimelineStep[] = [
      { id: 'submitted', label: 'Submitted', status: 'completed' },
      { id: 'review', label: 'Under Review', status: 'upcoming' },
      { id: 'prequalified', label: 'Pre-Qualified', status: 'upcoming' },
      { id: 'applied', label: 'Applied', status: 'upcoming' },
      { id: 'decision', label: 'Decision', status: 'upcoming' },
    ]

    const statusMap: Record<FinancingStatus, number> = {
      interested: 0,
      contacted: 1,
      pre_qualified: 2,
      applied: 3,
      approved: 4,
      denied: 4,
      withdrawn: -1,
    }

    const currentIndex = statusMap[status]
    return steps.map((step, index) => ({
      ...step,
      status: index < currentIndex ? 'completed' :
              index === currentIndex ? 'current' : 'upcoming',
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/portal' },
          { label: 'Financing' },
        ]} />
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Financing Options</h1>
          <p className="text-slate-400">Pre-qualify for financing for your roofing project</p>
        </div>
      </div>

      {/* Current estimate summary */}
      {estimate && (
        <EstimateSummary
          estimate={{
            priceLow: estimate.price_low,
            priceLikely: estimate.price_likely,
            priceHigh: estimate.price_high,
          }}
          property={{
            address: property?.street_address || undefined,
            city: property?.city || undefined,
            state: property?.state || undefined,
          }}
          compact
          showActions={false}
        />
      )}

      {/* Existing application status */}
      {existingApplication && (
        <Card className={cn('border-slate-700', STATUS_CONFIG[existingApplication.status].bgColor)}>
          <CardHeader>
            <div className="flex items-center gap-3">
              {(() => {
                const StatusIcon = STATUS_CONFIG[existingApplication.status].icon
                return (
                  <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full',
                    STATUS_CONFIG[existingApplication.status].bgColor
                  )}>
                    <StatusIcon className={cn('h-6 w-6', STATUS_CONFIG[existingApplication.status].color)} />
                  </div>
                )
              })()}
              <div>
                <CardTitle className={cn('text-lg', STATUS_CONFIG[existingApplication.status].color)}>
                  {STATUS_CONFIG[existingApplication.status].label}
                </CardTitle>
                <CardDescription>
                  {STATUS_CONFIG[existingApplication.status].description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress timeline */}
            <ProgressTimeline
              steps={getStatusSteps(existingApplication.status)}
              orientation="horizontal"
            />

            {/* Application details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
              <div>
                <p className="text-xs text-slate-500">Amount Requested</p>
                <p className="text-slate-200 font-medium">
                  {formatCurrency(existingApplication.amount_requested)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Credit Range</p>
                <p className="text-slate-200 font-medium capitalize">
                  {existingApplication.credit_range.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Employment</p>
                <p className="text-slate-200 font-medium capitalize">
                  {existingApplication.employment_status.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Submitted</p>
                <p className="text-slate-200 font-medium">
                  {new Date(existingApplication.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Approval details */}
            {existingApplication.status === 'approved' && existingApplication.pre_approved_amount && (
              <div className="rounded-lg bg-success/10 border border-success/30 p-4">
                <p className="text-sm text-success font-medium mb-2">Approved Terms</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Pre-Approved Amount</p>
                    <p className="text-xl font-bold text-success">
                      {formatCurrency(existingApplication.pre_approved_amount)}
                    </p>
                  </div>
                  {existingApplication.approved_rate && (
                    <div>
                      <p className="text-xs text-slate-500">Rate</p>
                      <p className="text-lg font-semibold text-slate-200">
                        {existingApplication.approved_rate}%
                      </p>
                    </div>
                  )}
                  {existingApplication.approved_term_months && (
                    <div>
                      <p className="text-xs text-slate-500">Term</p>
                      <p className="text-lg font-semibold text-slate-200">
                        {existingApplication.approved_term_months} months
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lender info */}
            {existingApplication.lender_name && (
              <div className="rounded-lg bg-slate-deep border border-slate-700 p-4">
                <p className="text-sm text-slate-500 mb-2">Your Lender</p>
                <p className="text-slate-200 font-medium">{existingApplication.lender_name}</p>
                {existingApplication.lender_contact && (
                  <p className="text-sm text-slate-400">{existingApplication.lender_contact}</p>
                )}
              </div>
            )}

            {/* Contact CTA */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                leftIcon={<Phone className="h-4 w-4" />}
                onClick={() => {
                  window.location.href = getPhoneLink()
                }}
              >
                Questions? Call {getPhoneDisplay()}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financing form (only show if no existing application) */}
      {!existingApplication && (
        <>
          {/* Compact benefits banner */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-deep border border-slate-700 p-3 text-center">
              <DollarSign className="h-5 w-5 text-gold-light mx-auto mb-1" />
              <p className="text-sm font-medium text-slate-200">Affordable Payments</p>
              <p className="text-xs text-slate-500">Fits your budget</p>
            </div>
            <div className="rounded-lg bg-slate-deep border border-slate-700 p-3 text-center">
              <Shield className="h-5 w-5 text-gold-light mx-auto mb-1" />
              <p className="text-sm font-medium text-slate-200">Protect Now</p>
              <p className="text-xs text-slate-500">Don&apos;t wait for worse</p>
            </div>
            <div className="rounded-lg bg-slate-deep border border-slate-700 p-3 text-center">
              <CheckCircle className="h-5 w-5 text-gold-light mx-auto mb-1" />
              <p className="text-sm font-medium text-slate-200">Multiple Options</p>
              <p className="text-xs text-slate-500">Best rates for you</p>
            </div>
          </div>

          <FinancingForm
            estimatedAmount={estimate?.price_likely}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </>
      )}

      {/* AI Payment Scenarios */}
      {estimate && (
        <Card variant="dark" className="border-slate-700">
          <CardHeader>
            <CardTitle className="text-base text-slate-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold-light" />
              AI Payment Scenarios
            </CardTitle>
            <CardDescription>
              Get personalized payment scenarios based on your estimate and credit profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!scenarios ? (
              <Button
                variant="primary"
                className="w-full bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
                leftIcon={<Sparkles className="h-4 w-4" />}
                isLoading={scenarioLoading}
                onClick={handleGenerateScenarios}
              >
                Generate Payment Scenarios
              </Button>
            ) : (
              <div className="space-y-4">
                {scenarioSummary && (
                  <p className="text-sm text-slate-400">{scenarioSummary}</p>
                )}
                <div className="grid gap-3">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.termMonths}
                      className="rounded-lg bg-slate-800 border border-slate-700 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-200">{scenario.name}</span>
                        <span className="text-xs text-slate-500">{scenario.termMonths / 12} years at {scenario.estimatedRate}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500">Monthly Payment</p>
                          <p className="text-lg font-bold text-gold-light">{formatCurrency(scenario.monthlyPayment)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Total Interest</p>
                          <p className="text-slate-300">{formatCurrency(scenario.totalInterest)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{scenario.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Affordability Analyzer */}
      {estimate && existingApplication && (
        <AffordabilityAnalyzer
          estimateAmount={estimate.price_likely}
          incomeRange={existingApplication.income_range}
        />
      )}

      {/* AI Financing Advisor */}
      <AiAdvisorChat
        topic="financing"
        leadId={selectedLeadId || undefined}
        suggestedQuestions={[
          'What monthly payment can I realistically afford?',
          'Should I finance or pay cash?',
          'How does a new roof affect my home value?',
          'What credit score do I need for the best rates?',
        ]}
      />

      {/* Cross-links */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/portal/insurance">
          <Card variant="dark" className="border-slate-700 hover:border-gold-light/30 transition-colors h-full cursor-pointer">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-gold-light flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200">Have Insurance?</p>
                <p className="text-xs text-slate-500">Your payout can reduce what you finance</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/portal/assistance">
          <Card variant="dark" className="border-slate-700 hover:border-gold-light/30 transition-colors h-full cursor-pointer">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <HandHeart className="h-5 w-5 text-gold-light flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200">Need Help Covering Costs?</p>
                <p className="text-xs text-slate-500">Check grants and assistance programs</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
