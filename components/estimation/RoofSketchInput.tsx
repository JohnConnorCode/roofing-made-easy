'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import type { RoofVariables } from '@/lib/supabase/types'
import { calculateVariablesFromDimensions, getPitchMultiplier } from '@/lib/estimation/variables'
import { cn } from '@/lib/utils'

interface RoofSketchInputProps {
  initialVariables?: Partial<RoofVariables>
  onVariablesChange: (variables: RoofVariables) => void
  className?: string
  mode?: 'simple' | 'detailed'
}

interface SimpleMeasurements {
  lengthFt: number
  widthFt: number
  pitch: number
  stories: number
  skylights: number
  chimneys: number
  pipeBoots: number
  vents: number
  gutterLf: number
  downspouts: number
}

const PITCH_OPTIONS = [
  { value: 0, label: 'Flat (0/12)' },
  { value: 2, label: 'Low (2/12)' },
  { value: 3, label: 'Low (3/12)' },
  { value: 4, label: 'Standard (4/12)' },
  { value: 5, label: 'Standard (5/12)' },
  { value: 6, label: 'Standard (6/12)' },
  { value: 7, label: 'Steep (7/12)' },
  { value: 8, label: 'Steep (8/12)' },
  { value: 9, label: 'Steep (9/12)' },
  { value: 10, label: 'Very Steep (10/12)' },
  { value: 12, label: 'Very Steep (12/12)' },
]

export function RoofSketchInput({
  initialVariables,
  onVariablesChange,
  className,
  mode = 'simple',
}: RoofSketchInputProps) {
  const [measurements, setMeasurements] = useState<SimpleMeasurements>({
    lengthFt: 50,
    widthFt: 30,
    pitch: 5,
    stories: 1,
    skylights: initialVariables?.SKYLIGHT_COUNT ?? 0,
    chimneys: initialVariables?.CHIMNEY_COUNT ?? 0,
    pipeBoots: initialVariables?.PIPE_COUNT ?? 2,
    vents: initialVariables?.VENT_COUNT ?? 0,
    gutterLf: 0, // Auto-calculated
    downspouts: 2,
  })

  const [showAdvanced, setShowAdvanced] = useState(mode === 'detailed')

  const calculateAndUpdate = useCallback(
    (newMeasurements: SimpleMeasurements) => {
      const variables = calculateVariablesFromDimensions({
        lengthFt: newMeasurements.lengthFt,
        widthFt: newMeasurements.widthFt,
        pitch: newMeasurements.pitch,
        stories: newMeasurements.stories,
        skylights: newMeasurements.skylights,
        chimneys: newMeasurements.chimneys,
        pipeBoots: newMeasurements.pipeBoots,
        vents: newMeasurements.vents,
        gutterLf: newMeasurements.gutterLf || undefined,
        downspouts: newMeasurements.downspouts,
      })
      onVariablesChange(variables)
    },
    [onVariablesChange]
  )

  const updateMeasurement = (key: keyof SimpleMeasurements, value: number) => {
    const newMeasurements = { ...measurements, [key]: value }
    setMeasurements(newMeasurements)
    calculateAndUpdate(newMeasurements)
  }

  const pitchMultiplier = getPitchMultiplier(measurements.pitch)
  const estimatedSqFt = Math.round(
    measurements.lengthFt * measurements.widthFt * pitchMultiplier
  )
  const estimatedSquares = (estimatedSqFt / 100).toFixed(2)

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Roof Measurements</CardTitle>
        <CardDescription>
          Enter your roof dimensions to calculate variables for the estimate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Dimensions */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">
            Basic Dimensions
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Length (ft)
              </label>
              <Input
                type="number"
                min={10}
                max={500}
                value={measurements.lengthFt}
                onChange={(e) =>
                  updateMeasurement('lengthFt', parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Width (ft)
              </label>
              <Input
                type="number"
                min={10}
                max={500}
                value={measurements.widthFt}
                onChange={(e) =>
                  updateMeasurement('widthFt', parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Roof Pitch
              </label>
              <Select
                value={measurements.pitch.toString()}
                onChange={(v) => updateMeasurement('pitch', parseInt(v))}
                options={PITCH_OPTIONS.map((opt) => ({
                  value: opt.value.toString(),
                  label: opt.label,
                }))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Stories
              </label>
              <Select
                value={measurements.stories.toString()}
                onChange={(v) => updateMeasurement('stories', parseInt(v))}
                options={[
                  { value: '1', label: '1 Story' },
                  { value: '2', label: '2 Stories' },
                  { value: '3', label: '3+ Stories' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Calculated Preview */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Estimated Roof Area</p>
              <p className="text-2xl font-bold text-[#c9a25c]">
                {estimatedSquares} Squares
              </p>
              <p className="text-sm text-slate-500">
                ({estimatedSqFt.toLocaleString()} sq ft @ {measurements.pitch}/12 pitch)
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Pitch Multiplier</p>
              <p className="text-lg font-semibold text-slate-200">
                {pitchMultiplier.toFixed(3)}x
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-300">
              Roof Features
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Skylights
              </label>
              <Input
                type="number"
                min={0}
                max={20}
                value={measurements.skylights}
                onChange={(e) =>
                  updateMeasurement('skylights', parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Chimneys
              </label>
              <Input
                type="number"
                min={0}
                max={10}
                value={measurements.chimneys}
                onChange={(e) =>
                  updateMeasurement('chimneys', parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Pipe Boots
              </label>
              <Input
                type="number"
                min={0}
                max={30}
                value={measurements.pipeBoots}
                onChange={(e) =>
                  updateMeasurement('pipeBoots', parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Roof Vents
              </label>
              <Input
                type="number"
                min={0}
                max={20}
                value={measurements.vents}
                onChange={(e) =>
                  updateMeasurement('vents', parseInt(e.target.value) || 0)
                }
              />
            </div>
          </div>
        </div>

        {/* Advanced: Gutters */}
        {showAdvanced && (
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">
              Gutter System
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Gutter Length (LF)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={1000}
                  value={measurements.gutterLf || ''}
                  placeholder="Auto"
                  onChange={(e) =>
                    updateMeasurement('gutterLf', parseFloat(e.target.value) || 0)
                  }
                />
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty for auto-calc
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Downspouts
                </label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={measurements.downspouts}
                  onChange={(e) =>
                    updateMeasurement('downspouts', parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Presets */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">
            Quick Presets
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Small Home', length: 40, width: 25, pitch: 4 },
              { name: 'Medium Home', length: 50, width: 30, pitch: 5 },
              { name: 'Large Home', length: 70, width: 40, pitch: 6 },
              { name: 'Ranch', length: 80, width: 35, pitch: 4 },
              { name: 'Two-Story', length: 45, width: 35, pitch: 8 },
            ].map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMeasurements = {
                    ...measurements,
                    lengthFt: preset.length,
                    widthFt: preset.width,
                    pitch: preset.pitch,
                  }
                  setMeasurements(newMeasurements)
                  calculateAndUpdate(newMeasurements)
                }}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
