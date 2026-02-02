'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MATERIALS_BY_TYPE } from '@/lib/data/estimate-content'
import type { RoofMaterial } from '@/lib/supabase/types'
import { Package, Layers, Wind, Wrench } from 'lucide-react'

interface MaterialsListProps {
  roofMaterial: RoofMaterial | null
}

const MATERIAL_ICONS = {
  primary: Package,
  underlayment: Layers,
  ventilation: Wind,
  accessories: Wrench,
}

export function MaterialsList({ roofMaterial }: MaterialsListProps) {
  const materials = MATERIALS_BY_TYPE[roofMaterial || 'default']

  const materialEntries = [
    { key: 'primary', label: 'Primary Material', ...materials.primary },
    { key: 'underlayment', label: 'Underlayment', ...materials.underlayment },
    { key: 'ventilation', label: 'Ventilation', ...materials.ventilation },
    { key: 'accessories', label: 'Accessories', ...materials.accessories },
  ] as const

  return (
    <Card className="border-slate-700/50 bg-[#161a23]">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#c9a25c]/20 text-[#c9a25c] text-sm font-semibold">
            3
          </span>
          Materials & Specifications
        </CardTitle>
        <p className="text-slate-400 text-sm mt-1">
          Quality materials from trusted manufacturers
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {materialEntries.map((material) => {
            const Icon = MATERIAL_ICONS[material.key]
            return (
              <div
                key={material.key}
                className="p-4 rounded-lg bg-[#1a1f2e] border border-slate-700/30"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">
                    <div className="h-10 w-10 rounded-lg bg-[#c9a25c]/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#c9a25c]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {material.label}
                    </p>
                    <h4 className="font-semibold text-slate-100">{material.name}</h4>
                    <p className="text-sm text-slate-400">{material.description}</p>
                    {material.brand && (
                      <p className="text-xs text-[#c9a25c]">{material.brand}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quality note */}
        <div className="mt-6 flex items-start gap-3 p-4 rounded-lg border border-[#3d7a5a]/30 bg-[#3d7a5a]/5">
          <div className="shrink-0">
            <div className="h-8 w-8 rounded-full bg-[#3d7a5a]/20 flex items-center justify-center">
              <svg
                className="h-4 w-4 text-[#3d7a5a]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-100">Quality Guarantee</p>
            <p className="text-sm text-slate-400">
              We only use premium materials from manufacturers who stand behind their products.
              All materials come with full manufacturer warranties.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
