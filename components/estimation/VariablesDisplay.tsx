'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RoofVariables } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface VariablesDisplayProps {
  variables: RoofVariables
  className?: string
  compact?: boolean
  showSlopes?: boolean
}

const VARIABLE_LABELS: Record<string, { label: string; unit: string; description: string }> = {
  SQ: { label: 'Total Squares', unit: 'SQ', description: '100 square feet' },
  SF: { label: 'Square Feet', unit: 'SF', description: 'Total area' },
  P: { label: 'Perimeter', unit: 'LF', description: 'Eave + Rake' },
  EAVE: { label: 'Eave', unit: 'LF', description: 'Horizontal edge' },
  R: { label: 'Ridge', unit: 'LF', description: 'Top edge' },
  VAL: { label: 'Valley', unit: 'LF', description: 'Inside corners' },
  HIP: { label: 'Hip', unit: 'LF', description: 'Outside corners' },
  RAKE: { label: 'Rake', unit: 'LF', description: 'Gable edges' },
  SKYLIGHT_COUNT: { label: 'Skylights', unit: 'EA', description: 'Skylight count' },
  CHIMNEY_COUNT: { label: 'Chimneys', unit: 'EA', description: 'Chimney count' },
  PIPE_COUNT: { label: 'Pipe Boots', unit: 'EA', description: 'Plumbing vents' },
  VENT_COUNT: { label: 'Roof Vents', unit: 'EA', description: 'Static vents' },
  GUTTER_LF: { label: 'Gutter', unit: 'LF', description: 'Gutter length' },
  DS_COUNT: { label: 'Downspouts', unit: 'EA', description: 'Downspout count' },
}

function VariableItem({
  name,
  value,
  compact,
}: {
  name: string
  value: number
  compact?: boolean
}) {
  const info = VARIABLE_LABELS[name] || { label: name, unit: '', description: '' }

  if (compact) {
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0">
        <span className="text-slate-400 text-sm">{info.label}</span>
        <span className="text-slate-200 font-medium">
          {typeof value === 'number' ? value.toLocaleString() : value} {info.unit}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-[#c9a25c] uppercase tracking-wide">
          {name}
        </span>
        <span className="text-xs text-slate-500">{info.unit}</span>
      </div>
      <div className="mt-1">
        <span className="text-2xl font-bold text-slate-100">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-1">{info.label}</p>
    </div>
  )
}

export function VariablesDisplay({
  variables,
  className,
  compact = false,
  showSlopes = false,
}: VariablesDisplayProps) {
  const mainVariables = ['SQ', 'SF', 'P', 'EAVE', 'R', 'VAL', 'HIP', 'RAKE']
  const featureVariables = ['SKYLIGHT_COUNT', 'CHIMNEY_COUNT', 'PIPE_COUNT', 'VENT_COUNT']
  const gutterVariables = ['GUTTER_LF', 'DS_COUNT']

  if (compact) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Roof Measurements</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <h4 className="text-xs font-semibold text-[#c9a25c] uppercase tracking-wide mb-2">
                Area & Edges
              </h4>
              {mainVariables.map((key) => (
                <VariableItem
                  key={key}
                  name={key}
                  value={variables[key as keyof RoofVariables] as number}
                  compact
                />
              ))}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#c9a25c] uppercase tracking-wide mb-2">
                Features
              </h4>
              {[...featureVariables, ...gutterVariables].map((key) => (
                <VariableItem
                  key={key}
                  name={key}
                  value={variables[key as keyof RoofVariables] as number}
                  compact
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Roof Variables</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main measurements */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">
            Area & Linear Measurements
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mainVariables.map((key) => (
              <VariableItem
                key={key}
                name={key}
                value={variables[key as keyof RoofVariables] as number}
              />
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">
            Roof Features
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {featureVariables.map((key) => (
              <VariableItem
                key={key}
                name={key}
                value={variables[key as keyof RoofVariables] as number}
              />
            ))}
          </div>
        </div>

        {/* Gutters */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">
            Gutter System
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {gutterVariables.map((key) => (
              <VariableItem
                key={key}
                name={key}
                value={variables[key as keyof RoofVariables] as number}
              />
            ))}
          </div>
        </div>

        {/* Per-slope variables */}
        {showSlopes && variables.slopes && Object.keys(variables.slopes).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">
              Per-Slope Measurements
            </h4>
            <div className="space-y-4">
              {Object.entries(variables.slopes).map(([key, slope]) => (
                <div key={key} className="bg-slate-800/30 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-[#c9a25c] mb-2">
                    {key} - Pitch {slope.PITCH}/12
                  </h5>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">SQ:</span>{' '}
                      <span className="text-slate-200">{slope.SQ}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Eave:</span>{' '}
                      <span className="text-slate-200">{slope.EAVE} LF</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Ridge:</span>{' '}
                      <span className="text-slate-200">{slope.RIDGE} LF</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Rake:</span>{' '}
                      <span className="text-slate-200">{slope.RAKE} LF</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
