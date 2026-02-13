'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CheckSquare, Camera, Square } from 'lucide-react'

interface DetectedIssue {
  issue: string
  confidence: number
  description?: string
}

interface DamageDocGuideProps {
  detectedIssues?: DetectedIssue[]
}

/**
 * Maps internal damage detection keys to insurance-friendly terminology
 * with documentation guidance for each damage type.
 */
const ISSUE_TERMINOLOGY: Record<string, string> = {
  missing_shingles: 'Missing Shingles - document the number and location',
  cracked_shingles: 'Cracked Shingles - photograph each crack with close-up',
  curling_shingles: 'Curling/Buckling Shingles - show the extent of curling',
  granule_loss: 'Granule Loss - photograph gutters and bare spots',
  hail_damage: 'Hail Impact Marks - mark and photograph individual strikes',
  wind_damage: 'Wind Damage - document lifted or displaced materials',
  flashing_damage: 'Flashing Damage - photograph around vents, chimneys, valleys',
  ponding_water: 'Ponding Water - photograph standing water areas',
  sagging: 'Structural Sagging - photograph from multiple angles',
  moss_algae: 'Moss/Algae Growth - document extent of biological growth',
  gutter_damage: 'Gutter Damage - photograph dents, separations, blockages',
  vent_damage: 'Vent/Pipe Boot Damage - close-up of each damaged vent',
  soffit_damage: 'Soffit/Fascia Damage - photograph rot or detachment',
  ice_dam: 'Ice Dam Damage - document ridges and water intrusion',
  tree_damage: 'Tree/Debris Impact - photograph debris and impact zone',
  leak_stain: 'Interior Water Stains - photograph ceiling and wall stains',
}

const GENERAL_CHECKLIST = [
  {
    label: 'Wide shots of full roof from all sides',
    detail: 'Stand back far enough to capture the entire roof slope in each photo',
  },
  {
    label: 'Close-ups of each damaged area',
    detail: 'Get within 2-3 feet of each damage point for clear detail',
  },
  {
    label: 'Interior damage (water stains, peeling paint)',
    detail: 'Check ceilings, walls, and attic for signs of water intrusion',
  },
  {
    label: 'Collateral damage (gutters, vents, skylights)',
    detail: 'Damage to surrounding components supports the scope of the claim',
  },
  {
    label: 'Date-stamped photos',
    detail: 'Enable timestamp on your phone camera or use a date marker',
  },
  {
    label: 'Before/after photos if available',
    detail: 'Previous inspection photos or real estate listing images are valuable',
  },
]

function getInsuranceTerminology(issueKey: string): string {
  const normalized = issueKey.toLowerCase().replace(/[\s-]+/g, '_')
  return ISSUE_TERMINOLOGY[normalized] || issueKey.replace(/_/g, ' ')
}

export default function DamageDocGuide({ detectedIssues }: DamageDocGuideProps) {
  const hasIssues = detectedIssues && detectedIssues.length > 0

  const additionalPhotos = useMemo(() => {
    if (!hasIssues) return []

    const detectedKeys = new Set(
      detectedIssues.map((i) => i.issue.toLowerCase().replace(/[\s-]+/g, '_'))
    )

    return GENERAL_CHECKLIST.filter((item) => {
      const itemKey = item.label.toLowerCase()
      return !Array.from(detectedKeys).some((key) => itemKey.includes(key.replace(/_/g, ' ')))
    })
  }, [detectedIssues, hasIssues])

  return (
    <Card variant="dark" className="bg-[#1a1f2e] border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c9a25c]/20">
            <Camera className="h-5 w-5 text-[#c9a25c]" />
          </div>
          <CardTitle className="text-slate-100">Damage Documentation Guide</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {hasIssues ? (
          <div className="space-y-6">
            {/* Detected Issues Section */}
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-400" />
                Damage Already Detected
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Based on your uploaded photos, these issues have been identified. Ensure thorough documentation for each.
              </p>
              <ul className="space-y-2">
                {detectedIssues.map((item, index) => (
                  <li
                    key={index}
                    className={cn(
                      'rounded-lg border bg-[#0c0f14] p-3',
                      item.confidence >= 0.8
                        ? 'border-green-500/30'
                        : item.confidence >= 0.5
                          ? 'border-yellow-500/30'
                          : 'border-slate-700'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <CheckSquare className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-sm text-slate-200 font-medium block">
                            {getInsuranceTerminology(item.issue)}
                          </span>
                          {item.description && (
                            <span className="text-xs text-slate-500 block mt-1">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0',
                          item.confidence >= 0.8
                            ? 'bg-green-500/20 text-green-400'
                            : item.confidence >= 0.5
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-slate-700 text-slate-400'
                        )}
                      >
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Recommended Photos */}
            {additionalPhotos.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-[#c9a25c]" />
                  Also Photograph
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Additional documentation to strengthen your claim.
                </p>
                <ul className="space-y-2">
                  {additionalPhotos.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 rounded-lg border border-slate-700 bg-[#0c0f14] p-3"
                    >
                      <Square className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-slate-300 font-medium block">
                          {item.label}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {item.detail}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          /* General Documentation Checklist */
          <div>
            <p className="text-sm text-slate-400 mb-4">
              Thorough documentation is the most important factor in a successful insurance claim.
              Use this checklist to ensure you capture everything.
            </p>
            <ul className="space-y-2">
              {GENERAL_CHECKLIST.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 rounded-lg border border-slate-700 bg-[#0c0f14] p-3"
                >
                  <Square className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm text-slate-300 font-medium block">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {item.detail}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
