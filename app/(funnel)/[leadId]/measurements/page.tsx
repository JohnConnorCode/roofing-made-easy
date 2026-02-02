'use client'

import { useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useFunnelStore } from '@/stores/funnelStore'
import { StepContainer } from '@/components/funnel/step-container'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { RoofVariables } from '@/lib/supabase/types'
import {
  calculateVariablesFromDimensions,
  getPitchMultiplier,
  getEmptyVariables,
} from '@/lib/estimation/variables'

const PITCH_OPTIONS = [
  { value: '0', label: 'Flat (0/12)' },
  { value: '2', label: 'Low (2/12)' },
  { value: '3', label: 'Low (3/12)' },
  { value: '4', label: 'Standard (4/12)' },
  { value: '5', label: 'Standard (5/12)' },
  { value: '6', label: 'Standard (6/12)' },
  { value: '7', label: 'Steep (7/12)' },
  { value: '8', label: 'Steep (8/12)' },
  { value: '9', label: 'Steep (9/12)' },
  { value: '10', label: 'Very Steep (10/12)' },
  { value: '12', label: 'Very Steep (12/12)' },
]

interface SimpleMeasurements {
  lengthFt: number
  widthFt: number
  pitch: number
  skylights: number
  chimneys: number
  pipeBoots: number
}

export default function MeasurementsPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string
  const isDemoMode = leadId.startsWith('demo-')

  const {
    roofSizeSqft,
    hasSkylights,
    hasChimneys,
    roofPitch,
    setRoofVariables,
    setCurrentStep,
  } = useFunnelStore()

  // Initialize from existing data
  const estimatedLength = roofSizeSqft ? Math.sqrt(roofSizeSqft) : 50
  const pitchMap: Record<string, number> = {
    flat: 1,
    low: 3,
    medium: 5,
    steep: 8,
    very_steep: 12,
  }

  const [measurements, setMeasurements] = useState<SimpleMeasurements>({
    lengthFt: Math.round(estimatedLength),
    widthFt: Math.round(estimatedLength * 0.7),
    pitch: pitchMap[roofPitch || 'medium'] || 5,
    skylights: hasSkylights ? 1 : 0,
    chimneys: hasChimneys ? 1 : 0,
    pipeBoots: 2,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Calculate current values
  const pitchMultiplier = getPitchMultiplier(measurements.pitch)
  const estimatedSqFt = Math.round(
    measurements.lengthFt * measurements.widthFt * pitchMultiplier
  )
  const estimatedSquares = (estimatedSqFt / 100).toFixed(1)

  const updateMeasurement = (key: keyof SimpleMeasurements, value: number) => {
    setMeasurements((prev) => ({ ...prev, [key]: value }))
  }

  const calculateVariables = useCallback((): RoofVariables => {
    return calculateVariablesFromDimensions({
      lengthFt: measurements.lengthFt,
      widthFt: measurements.widthFt,
      pitch: measurements.pitch,
      skylights: measurements.skylights,
      chimneys: measurements.chimneys,
      pipeBoots: measurements.pipeBoots,
      vents: Math.ceil(estimatedSqFt / 500),
      downspouts: Math.ceil(measurements.lengthFt / 20),
    })
  }, [measurements, estimatedSqFt])

  const handleNext = async () => {
    setIsLoading(true)

    try {
      const variables = calculateVariables()
      setRoofVariables(variables)

      // Save to API
      if (!isDemoMode) {
        try {
          await fetch(`/api/leads/${leadId}/sketch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              total_squares: variables.SQ,
              total_sqft: variables.SF,
              total_perimeter_lf: variables.P,
              total_eave_lf: variables.EAVE,
              total_ridge_lf: variables.R,
              total_valley_lf: variables.VAL,
              total_hip_lf: variables.HIP,
              total_rake_lf: variables.RAKE,
              skylight_count: variables.SKYLIGHT_COUNT,
              chimney_count: variables.CHIMNEY_COUNT,
              pipe_boot_count: variables.PIPE_COUNT,
              vent_count: variables.VENT_COUNT,
              gutter_lf: variables.GUTTER_LF,
              downspout_count: variables.DS_COUNT,
              measurement_source: 'manual',
            }),
          })
        } catch (apiError) {
          // Non-blocking - continue even if API fails
          console.warn('Failed to save sketch:', apiError)
        }
      }

      setCurrentStep(7) // Move to estimate step
      router.push(`/${leadId}/estimate`)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/${leadId}/timeline`)
  }

  const handleSkip = () => {
    // Skip detailed measurements, use basic calculation
    setCurrentStep(7)
    router.push(`/${leadId}/estimate`)
  }

  return (
    <StepContainer
      title="Roof Measurements"
      description="Help us calculate a more accurate estimate by entering your roof dimensions."
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Calculate Estimate"
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Quick estimate preview */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-800 font-medium">
                  Estimated Roof Size
                </p>
                <p className="text-3xl font-bold text-amber-900">
                  {estimatedSquares} Squares
                </p>
                <p className="text-sm text-amber-700">
                  ({estimatedSqFt.toLocaleString()} sq ft)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-amber-800">Pitch Factor</p>
                <p className="text-xl font-semibold text-amber-900">
                  {pitchMultiplier.toFixed(2)}x
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic dimensions */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Basic Dimensions
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Measure your home&apos;s footprint (not the roof itself). We&apos;ll
            calculate the actual roof area based on the pitch.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Building Length (ft)"
              type="number"
              min={10}
              max={500}
              value={measurements.lengthFt.toString()}
              onChange={(e) =>
                updateMeasurement('lengthFt', parseInt(e.target.value) || 0)
              }
              hint="Longest side"
            />
            <Input
              label="Building Width (ft)"
              type="number"
              min={10}
              max={500}
              value={measurements.widthFt.toString()}
              onChange={(e) =>
                updateMeasurement('widthFt', parseInt(e.target.value) || 0)
              }
              hint="Shortest side"
            />
            <Select
              label="Roof Pitch"
              options={PITCH_OPTIONS}
              value={measurements.pitch.toString()}
              onChange={(v) => updateMeasurement('pitch', parseInt(v))}
            />
          </div>
        </div>

        {/* Roof features */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Roof Features
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Skylights"
              type="number"
              min={0}
              max={20}
              value={measurements.skylights.toString()}
              onChange={(e) =>
                updateMeasurement('skylights', parseInt(e.target.value) || 0)
              }
            />
            <Input
              label="Chimneys"
              type="number"
              min={0}
              max={10}
              value={measurements.chimneys.toString()}
              onChange={(e) =>
                updateMeasurement('chimneys', parseInt(e.target.value) || 0)
              }
            />
            <Input
              label="Pipe/Vent Boots"
              type="number"
              min={0}
              max={30}
              value={measurements.pipeBoots.toString()}
              onChange={(e) =>
                updateMeasurement('pipeBoots', parseInt(e.target.value) || 0)
              }
              hint="Plumbing vents on roof"
            />
          </div>
        </div>

        {/* Advanced toggle */}
        <div className="pt-4">
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm"
          >
            {showAdvanced ? 'Hide' : 'Show'} Calculated Values
          </Button>

          {showAdvanced && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {(() => {
                    const vars = calculateVariables()
                    return (
                      <>
                        <div>
                          <p className="text-slate-500">Perimeter</p>
                          <p className="font-medium">{vars.P} LF</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Eave</p>
                          <p className="font-medium">{vars.EAVE} LF</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Ridge</p>
                          <p className="font-medium">{vars.R} LF</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Rake</p>
                          <p className="font-medium">{vars.RAKE} LF</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Est. Gutter</p>
                          <p className="font-medium">{vars.GUTTER_LF} LF</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Downspouts</p>
                          <p className="font-medium">{vars.DS_COUNT} EA</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Roof Vents</p>
                          <p className="font-medium">{vars.VENT_COUNT} EA</p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Skip option */}
        <div className="text-center pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-2">
            Not sure about your measurements?
          </p>
          <Button variant="ghost" onClick={handleSkip} className="text-sm">
            Skip - Use Basic Estimate
          </Button>
        </div>
      </div>
    </StepContainer>
  )
}
