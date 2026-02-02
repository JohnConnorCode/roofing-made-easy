'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { EstimateMacro, MacroRoofType, MacroJobType } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface MacroSelectorProps {
  roofType?: MacroRoofType
  jobType?: MacroJobType
  onSelect: (macro: EstimateMacro) => void
  selectedMacroId?: string
  className?: string
}

const ROOF_TYPE_LABELS: Record<MacroRoofType, string> = {
  asphalt_shingle: 'Asphalt Shingle',
  metal_standing_seam: 'Metal Standing Seam',
  metal_corrugated: 'Metal Corrugated',
  tile_concrete: 'Concrete Tile',
  tile_clay: 'Clay Tile',
  slate: 'Slate',
  wood_shake: 'Wood Shake',
  flat_tpo: 'TPO Flat',
  flat_epdm: 'EPDM Flat',
  flat_modified_bitumen: 'Modified Bitumen',
  any: 'Any Roof Type',
}

const JOB_TYPE_LABELS: Record<MacroJobType, string> = {
  full_replacement: 'Full Replacement',
  repair: 'Repair',
  overlay: 'Overlay',
  partial_replacement: 'Partial Replacement',
  storm_damage: 'Storm Damage',
  insurance_claim: 'Insurance Claim',
  maintenance: 'Maintenance',
  gutter_only: 'Gutter Only',
  any: 'Any Job Type',
}

function MacroCard({
  macro,
  selected,
  onSelect,
}: {
  macro: EstimateMacro
  selected: boolean
  onSelect: () => void
}) {
  return (
    <Card
      variant={selected ? 'selected' : 'selectable'}
      className="cursor-pointer"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-100">{macro.name}</h4>
            {macro.description && (
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                {macro.description}
              </p>
            )}
          </div>
          {macro.is_default && (
            <span className="bg-[#c9a25c] text-slate-900 text-xs font-semibold px-2 py-0.5 rounded">
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
            {ROOF_TYPE_LABELS[macro.roof_type]}
          </span>
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
            {JOB_TYPE_LABELS[macro.job_type]}
          </span>
          {macro.usage_count > 0 && (
            <span className="text-xs text-slate-500 ml-auto">
              Used {macro.usage_count}x
            </span>
          )}
        </div>
        {macro.tags && macro.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {macro.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function MacroSelector({
  roofType,
  jobType,
  onSelect,
  selectedMacroId,
  className,
}: MacroSelectorProps) {
  const [macros, setMacros] = useState<EstimateMacro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'replacement' | 'repair' | 'other'>('all')

  useEffect(() => {
    async function fetchMacros() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (roofType && roofType !== 'any') {
          params.set('roof_type', roofType)
        }
        if (jobType && jobType !== 'any') {
          params.set('job_type', jobType)
        }

        const response = await fetch(`/api/macros?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch macros')
        }

        const data = await response.json()
        setMacros(data.macros || [])
      } catch (err) {
        console.error('Error fetching macros:', err)
        setError('Failed to load estimate templates')
      } finally {
        setLoading(false)
      }
    }

    fetchMacros()
  }, [roofType, jobType])

  const filteredMacros = macros.filter((macro) => {
    if (filter === 'all') return true
    if (filter === 'replacement') {
      return ['full_replacement', 'overlay', 'partial_replacement'].includes(macro.job_type)
    }
    if (filter === 'repair') {
      return ['repair', 'storm_damage', 'insurance_claim'].includes(macro.job_type)
    }
    return ['maintenance', 'gutter_only', 'any'].includes(macro.job_type)
  })

  // Sort: default first, then by usage count
  const sortedMacros = [...filteredMacros].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1
    if (!a.is_default && b.is_default) return 1
    return b.usage_count - a.usage_count
  })

  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle>Select Estimate Template</CardTitle>
          <CardDescription>Loading templates...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle>Select Estimate Template</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Select Estimate Template</CardTitle>
        <CardDescription>
          Choose a pre-built template to start your estimate. Templates include
          standard line items for the selected job type.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['all', 'replacement', 'repair', 'other'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' && 'All'}
              {f === 'replacement' && 'Replacement'}
              {f === 'repair' && 'Repair'}
              {f === 'other' && 'Other'}
            </Button>
          ))}
        </div>

        {/* Macros grid */}
        {sortedMacros.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            No templates found for the selected filters
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sortedMacros.map((macro) => (
              <MacroCard
                key={macro.id}
                macro={macro}
                selected={selectedMacroId === macro.id}
                onSelect={() => onSelect(macro)}
              />
            ))}
          </div>
        )}

        {/* Empty state for creating custom */}
        <div className="border border-dashed border-slate-700 rounded-lg p-4 text-center">
          <p className="text-slate-400 text-sm">
            Or start with a blank estimate and add line items manually
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => onSelect({ id: '', name: 'Blank Estimate' } as EstimateMacro)}
          >
            Start Blank
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
