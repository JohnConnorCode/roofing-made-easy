'use client'

import { useRouter, useParams } from 'next/navigation'
import { useFunnelStore, type RoofIssue } from '@/stores/funnelStore'
import { StepContainer } from '@/components/funnel/step-container'
import { MultiSelectCard } from '@/components/funnel/multi-select-card'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import {
  AlertTriangle,
  Droplets,
  Leaf,
  ArrowDown,
  Shield,
  Wind,
  Snowflake,
  CloudLightning,
  CircleHelp,
  Layers,
} from 'lucide-react'

const ISSUES: { value: RoofIssue; title: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'missing_shingles',
    title: 'Missing Shingles',
    description: 'Bare spots visible on roof',
    icon: <Layers className="h-5 w-5" />,
  },
  {
    value: 'damaged_shingles',
    title: 'Damaged/Curling Shingles',
    description: 'Cracked, curled, or buckling',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    value: 'leaks',
    title: 'Active Leaks',
    description: 'Water coming through ceiling',
    icon: <Droplets className="h-5 w-5" />,
  },
  {
    value: 'moss_algae',
    title: 'Moss or Algae Growth',
    description: 'Green or dark streaks',
    icon: <Leaf className="h-5 w-5" />,
  },
  {
    value: 'sagging',
    title: 'Sagging Areas',
    description: 'Roof deck appears to dip',
    icon: <ArrowDown className="h-5 w-5" />,
  },
  {
    value: 'flashing',
    title: 'Flashing Damage',
    description: 'Metal around vents/chimneys',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    value: 'gutter_damage',
    title: 'Gutter Problems',
    description: 'Damaged or clogged gutters',
    icon: <Wind className="h-5 w-5" />,
  },
  {
    value: 'ventilation',
    title: 'Poor Ventilation',
    description: 'Attic too hot or humid',
    icon: <Wind className="h-5 w-5" />,
  },
  {
    value: 'ice_dams',
    title: 'Ice Dam Damage',
    description: 'Ice buildup in winter',
    icon: <Snowflake className="h-5 w-5" />,
  },
  {
    value: 'storm_damage',
    title: 'Storm Damage',
    description: 'Hail, wind, or fallen debris',
    icon: <CloudLightning className="h-5 w-5" />,
  },
  {
    value: 'other',
    title: 'Other Issue',
    description: 'Something else',
    icon: <CircleHelp className="h-5 w-5" />,
  },
]

export default function IssuesPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string
  const isDemoMode = leadId.startsWith('demo-')

  const {
    issues,
    issuesDescription,
    toggleIssue,
    setIssuesDescription,
    setCurrentStep,
  } = useFunnelStore()

  const [isLoading, setIsLoading] = useState(false)

  const handleNext = async () => {
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
                issues: issues,
                issues_description: issuesDescription || null,
              },
              current_step: 5,
            }),
          })
        } catch (apiError) {
          // API save failed, continue with local data
        }
      }

      setCurrentStep(5)
      router.push(`/${leadId}/photos`)
    } catch (error) {
      // Error handling - continue with navigation
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/${leadId}/roof-details`)
  }

  return (
    <StepContainer
      title="Are there any visible issues?"
      description="Select all that apply. This helps us understand the scope of work."
      onNext={handleNext}
      onBack={handleBack}
      isLoading={isLoading}
      nextLabel={issues.length === 0 ? 'Skip' : 'Continue'}
    >
      <div className="space-y-6">
        <div className="grid gap-2 md:grid-cols-2">
          {ISSUES.map((issue) => (
            <MultiSelectCard
              key={issue.value}
              icon={issue.icon}
              title={issue.title}
              description={issue.description}
              selected={issues.includes(issue.value)}
              onClick={() => toggleIssue(issue.value)}
            />
          ))}
        </div>

        {issues.length > 0 && (
          <Textarea
            label="Additional details (optional)"
            placeholder="Describe any issues in more detail..."
            value={issuesDescription}
            onChange={(e) => setIssuesDescription(e.target.value)}
          />
        )}
      </div>
    </StepContainer>
  )
}
