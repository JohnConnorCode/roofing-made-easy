'use client'

import { useRouter, useParams } from 'next/navigation'
import { useFunnelStore } from '@/stores/funnelStore'
import { StepContainer } from '@/components/funnel/step-container'
import { OptionCard } from '@/components/funnel/option-card'
import { Textarea } from '@/components/ui/textarea'
import type { JobType } from '@/lib/supabase/types'
import {
  Home,
  Wrench,
  Search,
  Settings,
  Droplets,
  HelpCircle,
} from 'lucide-react'
import { useState } from 'react'

const JOB_TYPES: { value: JobType; title: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'full_replacement',
    title: 'Full Roof Replacement',
    description: 'Replace entire roof with new materials',
    icon: <Home className="h-6 w-6" />,
  },
  {
    value: 'repair',
    title: 'Roof Repair',
    description: 'Fix specific issues or damaged areas',
    icon: <Wrench className="h-6 w-6" />,
  },
  {
    value: 'inspection',
    title: 'Roof Inspection',
    description: 'Professional assessment of roof condition',
    icon: <Search className="h-6 w-6" />,
  },
  {
    value: 'maintenance',
    title: 'Maintenance',
    description: 'Regular upkeep and preventive care',
    icon: <Settings className="h-6 w-6" />,
  },
  {
    value: 'gutter',
    title: 'Gutter Work',
    description: 'Install, repair, or clean gutters',
    icon: <Droplets className="h-6 w-6" />,
  },
  {
    value: 'other',
    title: 'Other',
    description: "Something else - tell us what you need",
    icon: <HelpCircle className="h-6 w-6" />,
  },
]

export default function JobTypePage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string

  const {
    jobType,
    jobDescription,
    setJobType,
    setJobDescription,
    setCurrentStep,
  } = useFunnelStore()

  const [isLoading, setIsLoading] = useState(false)
  const [showDescription, setShowDescription] = useState(jobType === 'other')

  const handleSelect = (type: JobType) => {
    setJobType(type)
    setShowDescription(type === 'other')
  }

  const handleNext = async () => {
    if (!jobType) return

    setIsLoading(true)
    try {
      await fetch(`/api/leads/${leadId}/intake`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intake: {
            job_type: jobType,
            job_description: jobDescription || null,
          },
          current_step: 3,
        }),
      })

      setCurrentStep(3)
      router.push(`/${leadId}/roof-details`)
    } catch (error) {
      console.error('Error saving job type:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/${leadId}/address`)
  }

  return (
    <StepContainer
      title="What type of roofing work do you need?"
      description="Select the option that best describes your project."
      onNext={handleNext}
      onBack={handleBack}
      isNextDisabled={!jobType || (jobType === 'other' && !jobDescription?.trim())}
      isLoading={isLoading}
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {JOB_TYPES.map((type) => (
            <OptionCard
              key={type.value}
              icon={type.icon}
              title={type.title}
              description={type.description}
              selected={jobType === type.value}
              onClick={() => handleSelect(type.value)}
            />
          ))}
        </div>

        {showDescription && (
          <Textarea
            label="Please describe what you need"
            placeholder="e.g., Roof leaking in master bedroom, need estimate for insurance claim"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="mt-4"
          />
        )}
      </div>
    </StepContainer>
  )
}
