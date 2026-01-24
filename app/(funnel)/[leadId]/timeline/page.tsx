'use client'

import { useRouter, useParams } from 'next/navigation'
import { useFunnelStore } from '@/stores/funnelStore'
import { StepContainer } from '@/components/funnel/step-container'
import { OptionCard } from '@/components/funnel/option-card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import type { TimelineUrgency } from '@/lib/supabase/types'
import { useState } from 'react'
import {
  AlertCircle,
  Clock,
  Calendar,
  CalendarRange,
  Infinity,
  Search,
} from 'lucide-react'

const TIMELINE_OPTIONS: {
  value: TimelineUrgency
  title: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    value: 'emergency',
    title: 'Emergency',
    description: 'Need help within 24-48 hours',
    icon: <AlertCircle className="h-6 w-6" />,
  },
  {
    value: 'asap',
    title: 'As Soon As Possible',
    description: 'Within the next week',
    icon: <Clock className="h-6 w-6" />,
  },
  {
    value: 'within_month',
    title: 'Within a Month',
    description: 'In the next 30 days',
    icon: <Calendar className="h-6 w-6" />,
  },
  {
    value: 'within_3_months',
    title: 'Within 3 Months',
    description: 'Planning ahead',
    icon: <CalendarRange className="h-6 w-6" />,
  },
  {
    value: 'flexible',
    title: 'Flexible',
    description: 'No rush, whenever works',
    icon: <Infinity className="h-6 w-6" />,
  },
  {
    value: 'just_exploring',
    title: 'Just Exploring',
    description: 'Getting information for future',
    icon: <Search className="h-6 w-6" />,
  },
]

export default function TimelinePage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string
  const isDemoMode = leadId.startsWith('demo-')

  const {
    timelineUrgency,
    hasInsuranceClaim,
    insuranceCompany,
    claimNumber,
    setTimeline,
    setCurrentStep,
  } = useFunnelStore()

  const [isLoading, setIsLoading] = useState(false)

  const handleNext = async () => {
    if (!timelineUrgency) return

    setIsLoading(true)
    try {
      // Try API save (non-blocking)
      if (!isDemoMode) {
        try {
          await fetch(`/api/leads/${leadId}/intake`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              intake: {
                timeline_urgency: timelineUrgency,
                has_insurance_claim: hasInsuranceClaim,
                insurance_company: insuranceCompany || null,
                claim_number: claimNumber || null,
              },
              current_step: 7,
            }),
          })
        } catch (apiError) {
          // API error is non-blocking - data is saved in local store
        }
      }

      setCurrentStep(7)
      router.push(`/${leadId}/contact`)
    } catch (error) {
      // Error handling - continue with navigation
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/${leadId}/photos`)
  }

  return (
    <StepContainer
      title="When do you need this done?"
      description="This helps us prioritize and schedule appropriately."
      onNext={handleNext}
      onBack={handleBack}
      isNextDisabled={!timelineUrgency}
      isLoading={isLoading}
    >
      <div className="space-y-8">
        {/* Timeline options */}
        <div className="grid gap-3 md:grid-cols-2">
          {TIMELINE_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              icon={option.icon}
              title={option.title}
              description={option.description}
              selected={timelineUrgency === option.value}
              onClick={() => setTimeline({ timelineUrgency: option.value })}
            />
          ))}
        </div>

        {/* Insurance claim section */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <Checkbox
            label="This is related to an insurance claim"
            description="Check this if you've filed or plan to file an insurance claim"
            checked={hasInsuranceClaim}
            onChange={(e) => setTimeline({ hasInsuranceClaim: e.target.checked })}
          />

          {hasInsuranceClaim && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input
                label="Insurance Company"
                placeholder="e.g., State Farm"
                value={insuranceCompany}
                onChange={(e) => setTimeline({ insuranceCompany: e.target.value })}
              />
              <Input
                label="Claim Number (if known)"
                placeholder="Claim number"
                value={claimNumber}
                onChange={(e) => setTimeline({ claimNumber: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>
    </StepContainer>
  )
}
