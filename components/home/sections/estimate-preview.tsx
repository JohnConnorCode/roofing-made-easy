'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowRight, FileDown, Share2, LayoutDashboard, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollAnimate } from '@/components/scroll-animate'
import { CountUp } from '@/components/ui/count-up'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'

const SAMPLE_ESTIMATES = [
  {
    city: 'Tupelo', size: '2,200 sq ft', material: 'Architectural Shingles',
    low: 12400, likely: 14100, high: 15800,
    lineItems: [
      { label: 'Tear-off & Disposal', amount: 2800 },
      { label: 'GAF Timberline HDZ', amount: 6200 },
      { label: 'Labor & Installation', amount: 5100 },
    ],
  },
  {
    city: 'Oxford', size: '1,800 sq ft', material: '3-Tab Shingles',
    low: 8200, likely: 9500, high: 11200,
    lineItems: [
      { label: 'Tear-off & Disposal', amount: 1900 },
      { label: '3-Tab Shingles', amount: 3800 },
      { label: 'Labor & Installation', amount: 3800 },
    ],
  },
  {
    city: 'Starkville', size: '3,100 sq ft', material: 'Standing Seam Metal',
    low: 22000, likely: 26500, high: 31000,
    lineItems: [
      { label: 'Tear-off & Disposal', amount: 4200 },
      { label: 'Standing Seam Panels', amount: 14500 },
      { label: 'Labor & Installation', amount: 7800 },
    ],
  },
  {
    city: 'Columbus', size: '2,500 sq ft', material: 'Architectural Shingles',
    low: 14000, likely: 16200, high: 18500,
    lineItems: [
      { label: 'Tear-off & Disposal', amount: 3200 },
      { label: 'GAF Timberline HDZ', amount: 7200 },
      { label: 'Labor & Installation', amount: 5800 },
    ],
  },
]

const BADGES = [
  { icon: FileDown, label: 'PDF Download' },
  { icon: Share2, label: 'Shareable Link' },
  { icon: LayoutDashboard, label: 'Portal Access' },
  { icon: Calculator, label: 'Financing Calculator' },
]

interface EstimatePreviewProps {
  onGetStarted: () => void
  isCreating: boolean
}

export function EstimatePreview({ onGetStarted, isCreating }: EstimatePreviewProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)
  const transitionTimer = useRef<NodeJS.Timeout | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const goToIndex = (next: number) => {
    if (next === activeIndex) return
    setPrevIndex(activeIndex)
    setActiveIndex(next)
    if (transitionTimer.current) clearTimeout(transitionTimer.current)
    transitionTimer.current = setTimeout(() => setPrevIndex(null), 350)
  }

  useEffect(() => {
    if (prefersReducedMotion) return
    const interval = setInterval(() => {
      goToIndex((activeIndex + 1) % SAMPLE_ESTIMATES.length)
    }, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, prefersReducedMotion])

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current)
    }
  }, [])

  const renderCard = (est: typeof SAMPLE_ESTIMATES[number], index: number, isFading: boolean) => {
    const range = est.high - est.low
    const likelyPos = ((est.likely - est.low) / range) * 100

    return (
      <div
        key={`card-${index}-${isFading ? 'prev' : 'active'}`}
        className={`bg-[#1a1f2e] border border-[#c9a25c]/20 rounded-2xl p-6 md:p-8 shadow-gold-glow card-inner-glow transition-opacity duration-300 ${
          isFading ? 'absolute inset-0 opacity-0' : 'relative opacity-100'
        }`}
      >
        {/* Location & details */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-slate-500">Sample Estimate</div>
            <div className="text-lg font-bold text-slate-100">{est.city}, MS</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">{est.size}</div>
            <div className="text-sm text-slate-300">{est.material}</div>
          </div>
        </div>

        {/* Price range bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">Low</span>
            <span className="text-[#c9a25c] font-semibold">Most Likely</span>
            <span className="text-slate-500">High</span>
          </div>
          <div className="relative h-3 rounded-full bg-slate-700/50 overflow-hidden">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-600/60 via-[#c9a25c]/80 to-red-500/60" />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#c9a25c] shadow-lg z-10"
              style={{ left: `calc(${likelyPos}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-slate-300 font-semibold">
              $<CountUp end={est.low} key={`low-${index}`} duration={800} />
            </span>
            <span className="text-xl font-bold text-slate-100">
              $<CountUp end={est.likely} key={`likely-${index}`} duration={800} />
            </span>
            <span className="text-slate-300 font-semibold">
              $<CountUp end={est.high} key={`high-${index}`} duration={800} />
            </span>
          </div>
        </div>

        {/* Line-item peek */}
        <div className="mt-4 pt-4 border-t border-slate-700/40">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Sample Breakdown</div>
          <div className="space-y-1.5">
            {est.lineItems.map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-slate-400">{item.label}</span>
                <span className="text-slate-300 font-medium">${item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {SAMPLE_ESTIMATES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? 'bg-[#c9a25c] w-6' : 'bg-slate-600 hover:bg-slate-500'}`}
              aria-label={`View ${SAMPLE_ESTIMATES[i].city} estimate`}
            />
          ))}
        </div>
      </div>
    )
  }

  const activeEst = SAMPLE_ESTIMATES[activeIndex]
  const prevEst = prevIndex !== null ? SAMPLE_ESTIMATES[prevIndex] : null

  return (
    <section id="estimate-preview" className="py-16 md:py-24 bg-mesh-dark">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
            See What You&apos;ll Get
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            A detailed, data-backed estimate — not a vague range from a lead-gen site.
          </p>
        </ScrollAnimate>

        <ScrollAnimate delay={100}>
          <div className="max-w-xl mx-auto">
            {/* Crossfade container */}
            <div className="relative">
              {prevEst && renderCard(prevEst, prevIndex!, true)}
              {renderCard(activeEst, activeIndex, false)}
            </div>

            {/* Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-[#1a1f2e] border border-slate-700/50 rounded-xl px-3 py-2.5">
                  <Icon className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
                  <span className="text-xs text-slate-300">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimate>

        <div className="mt-10 text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onGetStarted}
            disabled={isCreating}
            className="btn-press"
          >
            {isCreating ? 'Starting...' : 'See Yours in 2 Minutes'}
            {!isCreating && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>
      </div>
    </section>
  )
}
