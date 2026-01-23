'use client'

import { useRouter, useParams } from 'next/navigation'
import { useFunnelStore } from '@/stores/funnelStore'
import { StepContainer } from '@/components/funnel/step-container'
import { OptionCard } from '@/components/funnel/option-card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { RoofMaterial, RoofPitch } from '@/lib/supabase/types'
import { useState } from 'react'

const ROOF_MATERIALS: { value: RoofMaterial; title: string; description: string }[] = [
  { value: 'asphalt_shingle', title: 'Asphalt Shingle', description: 'Most common, affordable option' },
  { value: 'metal', title: 'Metal', description: 'Durable, energy efficient' },
  { value: 'tile', title: 'Tile', description: 'Clay or concrete, long-lasting' },
  { value: 'slate', title: 'Slate', description: 'Natural stone, premium option' },
  { value: 'wood_shake', title: 'Wood Shake', description: 'Natural cedar, rustic look' },
  { value: 'flat_membrane', title: 'Flat/Membrane', description: 'TPO, EPDM, or modified bitumen' },
  { value: 'unknown', title: "I'm Not Sure", description: "We'll help identify it" },
]

const ROOF_PITCHES: { value: RoofPitch; label: string }[] = [
  { value: 'flat', label: 'Flat (0-2/12)' },
  { value: 'low', label: 'Low Slope (3-4/12)' },
  { value: 'medium', label: 'Medium (5-7/12)' },
  { value: 'steep', label: 'Steep (8-10/12)' },
  { value: 'very_steep', label: 'Very Steep (11+/12)' },
  { value: 'unknown', label: "I'm Not Sure" },
]

const STORIES_OPTIONS = [
  { value: '1', label: '1 Story' },
  { value: '2', label: '2 Stories' },
  { value: '3', label: '3+ Stories' },
]

export default function RoofDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string
  const isDemoMode = leadId.startsWith('demo-')

  const {
    roofMaterial,
    roofAgeYears,
    roofSizeSqft,
    stories,
    roofPitch,
    hasSkylights,
    hasChimneys,
    hasSolarPanels,
    setRoofDetails,
    setCurrentStep,
  } = useFunnelStore()

  const [isLoading, setIsLoading] = useState(false)

  const handleNext = async () => {
    if (!roofMaterial) return

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
                roof_material: roofMaterial,
                roof_age_years: roofAgeYears,
                roof_size_sqft: roofSizeSqft,
                stories,
                roof_pitch: roofPitch,
                has_skylights: hasSkylights,
                has_chimneys: hasChimneys,
                has_solar_panels: hasSolarPanels,
              },
              current_step: 4,
            }),
          })
        } catch (apiError) {
          console.log('API save failed, continuing with local data')
        }
      }

      setCurrentStep(4)
      router.push(`/${leadId}/issues`)
    } catch (error) {
      console.error('Error saving roof details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/${leadId}/job-type`)
  }

  return (
    <StepContainer
      title="Tell us about your roof"
      description="This helps us provide a more accurate estimate."
      onNext={handleNext}
      onBack={handleBack}
      isNextDisabled={!roofMaterial}
      isLoading={isLoading}
    >
      <div className="space-y-8">
        {/* Roof Material */}
        <div>
          <h3 className="mb-3 text-lg font-medium text-slate-900">What type of roof do you have?</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {ROOF_MATERIALS.map((material) => (
              <OptionCard
                key={material.value}
                title={material.title}
                description={material.description}
                selected={roofMaterial === material.value}
                onClick={() => setRoofDetails({ roofMaterial: material.value })}
              />
            ))}
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Approximate roof age (years)"
            type="number"
            placeholder="e.g., 15"
            value={roofAgeYears?.toString() || ''}
            onChange={(e) =>
              setRoofDetails({ roofAgeYears: e.target.value ? parseInt(e.target.value) : null })
            }
            min={0}
            max={100}
          />

          <Input
            label="Approximate size (sq ft)"
            type="number"
            placeholder="e.g., 2000"
            value={roofSizeSqft?.toString() || ''}
            onChange={(e) =>
              setRoofDetails({ roofSizeSqft: e.target.value ? parseInt(e.target.value) : null })
            }
            hint="Leave blank if unknown"
            min={100}
            max={50000}
          />

          <Select
            label="Number of stories"
            options={STORIES_OPTIONS}
            value={stories.toString()}
            onChange={(value) => setRoofDetails({ stories: parseInt(value) })}
          />

          <Select
            label="Roof pitch/slope"
            options={[{ value: '', label: 'Select pitch' }, ...ROOF_PITCHES]}
            value={roofPitch || ''}
            onChange={(value) => setRoofDetails({ roofPitch: value as RoofPitch })}
          />
        </div>

        {/* Features */}
        <div>
          <h3 className="mb-3 text-lg font-medium text-slate-900">Does your roof have any of these?</h3>
          <div className="space-y-3">
            <Checkbox
              label="Skylights"
              checked={hasSkylights}
              onChange={(e) => setRoofDetails({ hasSkylights: e.target.checked })}
            />
            <Checkbox
              label="Chimneys"
              checked={hasChimneys}
              onChange={(e) => setRoofDetails({ hasChimneys: e.target.checked })}
            />
            <Checkbox
              label="Solar panels"
              checked={hasSolarPanels}
              onChange={(e) => setRoofDetails({ hasSolarPanels: e.target.checked })}
            />
          </div>
        </div>
      </div>
    </StepContainer>
  )
}
