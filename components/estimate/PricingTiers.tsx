'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { PricingTier, TierLevel } from '@/lib/estimation/pricing-tiers'
import { calculateMonthlyPayment } from '@/lib/estimation/pricing-tiers'
import { Check, Star, Sparkles, Shield } from 'lucide-react'

interface PricingTiersProps {
  tiers: PricingTier[]
  onSelectTier?: (tier: TierLevel) => void
  selectedTier?: TierLevel
}

const TIER_ICONS = {
  good: Shield,
  better: Star,
  best: Sparkles,
}

const TIER_COLORS = {
  good: {
    bg: 'bg-slate-800',
    border: 'border-slate-600',
    badge: 'bg-slate-700 text-slate-300',
    accent: 'text-slate-300',
  },
  better: {
    bg: 'bg-[#c9a25c]/10',
    border: 'border-[#c9a25c]',
    badge: 'bg-[#c9a25c] text-[#0c0f14]',
    accent: 'text-[#c9a25c]',
  },
  best: {
    bg: 'bg-[#3d7a5a]/10',
    border: 'border-[#3d7a5a]',
    badge: 'bg-[#3d7a5a] text-white',
    accent: 'text-[#3d7a5a]',
  },
}

export function PricingTiers({ tiers, onSelectTier, selectedTier }: PricingTiersProps) {
  const [activeTier, setActiveTier] = useState<TierLevel>(selectedTier || 'better')

  const handleSelectTier = (tier: TierLevel) => {
    setActiveTier(tier)
    onSelectTier?.(tier)
  }

  return (
    <Card className="border-slate-700/50 bg-[#161a23]">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#c9a25c]/20 text-[#c9a25c] text-sm font-semibold">
            4
          </span>
          Investment Options
        </CardTitle>
        <p className="text-slate-400 text-sm mt-1">
          Choose the package that best fits your needs and budget
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {/* Tier cards - mobile scrollable, desktop grid */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 -mx-2 px-2">
          {tiers.map((tier) => {
            const Icon = TIER_ICONS[tier.level]
            const colors = TIER_COLORS[tier.level]
            const isActive = activeTier === tier.level
            const monthlyPayment = calculateMonthlyPayment(tier.priceLikely)

            return (
              <div
                key={tier.level}
                className={cn(
                  'relative flex-shrink-0 w-[280px] md:w-auto rounded-xl border-2 transition-all duration-200',
                  colors.bg,
                  isActive ? colors.border : 'border-slate-700/50',
                  isActive && 'ring-2 ring-offset-2 ring-offset-[#161a23]',
                  isActive && tier.level === 'better' && 'ring-[#c9a25c]',
                  isActive && tier.level === 'best' && 'ring-[#3d7a5a]',
                  isActive && tier.level === 'good' && 'ring-slate-500'
                )}
              >
                {/* Recommended badge */}
                {tier.isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', colors.badge)}>
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center',
                        tier.level === 'good' && 'bg-slate-700',
                        tier.level === 'better' && 'bg-[#c9a25c]/20',
                        tier.level === 'best' && 'bg-[#3d7a5a]/20'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', colors.accent)} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">{tier.name}</h3>
                      <p className="text-xs text-slate-400">{tier.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className={cn('text-3xl font-bold', colors.accent)}>
                        {formatCurrency(tier.priceLikely)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Range: {formatCurrency(tier.priceLow)} - {formatCurrency(tier.priceHigh)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      ~{formatCurrency(monthlyPayment)}/mo with financing
                    </p>
                  </div>

                  {/* Material */}
                  <div className="mb-4 p-3 rounded-lg bg-[#0c0f14]/50">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Material</p>
                    <p className="text-sm font-medium text-slate-100">{tier.material.name}</p>
                    <p className="text-xs text-slate-400">{tier.material.warranty}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-4">
                    {tier.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className={cn('h-4 w-4 shrink-0 mt-0.5', colors.accent)} />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                    {tier.features.length > 5 && (
                      <li className="text-xs text-slate-500 pl-6">
                        +{tier.features.length - 5} more features
                      </li>
                    )}
                  </ul>

                  {/* Select button */}
                  <Button
                    variant={isActive ? 'primary' : 'outline'}
                    size="lg"
                    className={cn(
                      'w-full',
                      isActive && tier.level === 'better' &&
                        'bg-[#c9a25c] hover:bg-[#b5893a] text-[#0c0f14]',
                      isActive && tier.level === 'best' &&
                        'bg-[#3d7a5a] hover:bg-[#2d5a4a] text-white',
                      isActive && tier.level === 'good' &&
                        'bg-slate-600 hover:bg-slate-500 text-white',
                      !isActive && 'border-slate-600 text-slate-300 hover:bg-slate-800'
                    )}
                    onClick={() => handleSelectTier(tier.level)}
                  >
                    {isActive ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Price range explanation */}
        <div className="mt-6 p-4 rounded-lg bg-[#1a1f2e] border border-slate-700/50">
          <p className="text-sm text-slate-400">
            <span className="text-[#c9a25c] font-medium">About these prices:</span> Estimates
            are based on the information you provided. Your final price will be confirmed after
            an on-site inspection where we can assess the full scope of work needed.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
