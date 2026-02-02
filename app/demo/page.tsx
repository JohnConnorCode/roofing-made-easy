'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { PricingTiers } from '@/components/estimate/PricingTiers'
import { VariablesDisplay } from '@/components/estimation/VariablesDisplay'
import { EstimateSummaryCard } from '@/components/estimation/EstimateSummaryCard'
import { demoEstimateList, type DemoEstimate } from '@/lib/data/demo-estimates'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  Home,
  Building2,
  Castle,
  ChevronDown,
  ChevronUp,
  Calculator,
  Check,
  Ruler,
  DollarSign,
} from 'lucide-react'

const DEMO_ICONS = {
  'small-home': Home,
  'medium-commercial': Building2,
  'large-complex': Castle,
}

function EstimateCard({
  estimate,
  isSelected,
  onSelect,
}: {
  estimate: DemoEstimate
  isSelected: boolean
  onSelect: () => void
}) {
  const Icon = DEMO_ICONS[estimate.id as keyof typeof DEMO_ICONS] || Home

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-xl border-2 transition-all duration-200 p-5',
        isSelected
          ? 'border-[#c9a25c] bg-[#c9a25c]/10 ring-2 ring-offset-2 ring-offset-[#161a23] ring-[#c9a25c]'
          : 'border-slate-700/50 bg-[#1a1f2e] hover:border-slate-600'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'h-12 w-12 rounded-lg flex items-center justify-center',
            isSelected ? 'bg-[#c9a25c]/20' : 'bg-slate-700'
          )}
        >
          <Icon className={cn('h-6 w-6', isSelected ? 'text-[#c9a25c]' : 'text-slate-400')} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-100">{estimate.name}</h3>
          <p className="text-sm text-slate-400 mt-0.5">{estimate.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {estimate.highlights.slice(0, 2).map((highlight, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-800/50 text-slate-400"
              >
                <Check className="h-3 w-3" />
                {highlight}
              </span>
            ))}
          </div>
          <div className="mt-3">
            <span
              className={cn(
                'text-2xl font-bold',
                isSelected ? 'text-[#c9a25c]' : 'text-slate-200'
              )}
            >
              {formatCurrency(estimate.totals.priceLikely)}
            </span>
            <span className="text-sm text-slate-500 ml-2">estimated</span>
          </div>
        </div>
      </div>
    </button>
  )
}

function LineItemBreakdown({ estimate }: { estimate: DemoEstimate }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Group line items by category
  const categories = estimate.lineItems.reduce((acc, item) => {
    const cat = item.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, typeof estimate.lineItems>)

  const categoryLabels: Record<string, string> = {
    tear_off: 'Tear-Off',
    underlayment: 'Underlayment',
    shingles: 'Shingles',
    flashing: 'Flashing',
    skylights: 'Skylights',
    ventilation: 'Ventilation',
    decking: 'Decking',
    disposal: 'Disposal',
  }

  return (
    <Card className="border-slate-700/50 bg-[#161a23]">
      <CardHeader
        className="cursor-pointer flex flex-row items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
          <Ruler className="h-5 w-5 text-[#c9a25c]" />
          Line Item Breakdown
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-slate-400">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-6">
            {Object.entries(categories).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-[#c9a25c] uppercase tracking-wide mb-3">
                  {categoryLabels[category] || category}
                </h4>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                    >
                      <div>
                        <span className="text-slate-200">{item.name}</span>
                        <span className="text-xs text-slate-500 ml-2">
                          {item.quantity_with_waste.toFixed(1)} {item.unit_type}
                        </span>
                      </div>
                      <span className="text-slate-300 font-medium">
                        {formatCurrency(item.line_total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-300">Line Items Subtotal</span>
              <span className="text-xl font-bold text-[#c9a25c]">
                {formatCurrency(estimate.totals.subtotal)}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default function DemoPage() {
  const [selectedId, setSelectedId] = useState<string>('small-home')
  const selectedEstimate = demoEstimateList.find((e) => e.id === selectedId) || demoEstimateList[0]

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SiteHeader />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c9a25c]/20 mb-6">
              <Calculator className="h-8 w-8 text-[#c9a25c]" />
            </div>
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              See Our Estimation System in Action
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              Explore detailed estimates for different roof types. Our advanced pricing engine
              calculates accurate costs based on real measurements and material choices.
            </p>
          </div>
        </div>
      </section>

      {/* Example Selector */}
      <section className="py-8 bg-[#0c0f14] border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-lg font-semibold text-slate-300 mb-4">Choose an Example</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {demoEstimateList.map((estimate) => (
              <EstimateCard
                key={estimate.id}
                estimate={estimate}
                isSelected={selectedId === estimate.id}
                onSelect={() => setSelectedId(estimate.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Selected Estimate Display */}
      <section className="py-12 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-2xl font-bold text-slate-100">{selectedEstimate.name}</h2>
              <span className="px-3 py-1 rounded-full bg-[#c9a25c]/20 text-[#c9a25c] text-sm">
                {selectedEstimate.roofType}
              </span>
            </div>
            <p className="text-slate-400">{selectedEstimate.description}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Roof Profile */}
            <div className="lg:col-span-1 space-y-6">
              <VariablesDisplay
                variables={selectedEstimate.variables}
                compact
                className="border-slate-700/50 bg-[#161a23]"
              />

              <Card className="border-slate-700/50 bg-[#161a23]">
                <CardHeader>
                  <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#c9a25c]" />
                    Roof Profile Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {selectedEstimate.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-[#3d7a5a]" />
                        <span className="text-slate-300">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Estimate Details */}
            <div className="lg:col-span-2 space-y-6">
              <EstimateSummaryCard
                {...selectedEstimate.totals}
                variant="compact"
                className="border-slate-700/50 bg-[#161a23]"
              />

              <LineItemBreakdown estimate={selectedEstimate} />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-12 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <PricingTiers tiers={selectedEstimate.tiers} />
        </div>
      </section>

      {/* How We Calculate */}
      <section className="py-16 bg-[#0c0f14] border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-4">
            How We Calculate Your Estimate
          </h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-12">
            Our pricing engine uses industry-standard Xactimate variables to ensure accurate,
            transparent estimates every time.
          </p>

          <div className="grid md:grid-cols-4 gap-6 stagger-children">
            {[
              {
                step: '1',
                title: 'Measure',
                desc: 'Precise roof measurements from satellite imagery or on-site inspection',
              },
              {
                step: '2',
                title: 'Calculate',
                desc: 'Variables like squares, linear feet, and feature counts are extracted',
              },
              {
                step: '3',
                title: 'Price',
                desc: 'Line items are priced using current material and labor rates',
              },
              {
                step: '4',
                title: 'Present',
                desc: 'Good/Better/Best options give you control over your investment',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#c9a25c]/20 text-[#c9a25c] font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#c9a25c]/10 to-[#0c0f14] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Ready to Get Your Free Estimate?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Answer a few questions about your roof and get an instant estimate in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Get Your Free Estimate
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Talk to an Expert
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 bg-[#0c0f14] border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { value: '500+', label: 'Roofs Completed' },
              { value: '4.9', label: 'Star Rating' },
              { value: '100%', label: 'Satisfaction Guarantee' },
              { value: '25+', label: 'Years Experience' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-[#c9a25c]">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
