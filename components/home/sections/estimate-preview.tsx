'use client'

import { useState } from 'react'
import { ArrowRight, FileText, Share2, LayoutDashboard, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollAnimate } from '@/components/scroll-animate'
import { CountUp } from '@/components/ui/count-up'

const MATERIALS = [
  { label: '3-Tab Shingles', key: '3tab', costPerSq: 320, laborPerSq: 200 },
  { label: 'Architectural', key: 'arch', costPerSq: 420, laborPerSq: 230 },
  { label: 'Standing Seam Metal', key: 'metal', costPerSq: 750, laborPerSq: 280 },
] as const

const SIZES = [
  { label: '1,500 sq ft', key: 'sm', squares: 15 },
  { label: '2,200 sq ft', key: 'md', squares: 22 },
  { label: '3,000 sq ft', key: 'lg', squares: 30 },
] as const

const TEAROFF_PER_SQ = 130

function calcEstimate(materialIdx: number, sizeIdx: number) {
  const mat = MATERIALS[materialIdx]
  const size = SIZES[sizeIdx]
  const tearoff = TEAROFF_PER_SQ * size.squares
  const material = mat.costPerSq * size.squares
  const labor = mat.laborPerSq * size.squares
  const likely = tearoff + material + labor
  const low = Math.round(likely * 0.88)
  const high = Math.round(likely * 1.12)
  return { low, likely, high, tearoff, material, labor }
}

const BADGES = [
  { icon: FileText, label: 'PDF Download' },
  { icon: Share2, label: 'Shareable Link' },
  { icon: LayoutDashboard, label: 'Customer Portal' },
  { icon: Calculator, label: 'Financing Tools' },
]

interface EstimatePreviewProps {
  onGetStarted: () => void
  isCreating: boolean
}

export function EstimatePreview({ onGetStarted, isCreating }: EstimatePreviewProps) {
  const [materialIdx, setMaterialIdx] = useState(1)
  const [sizeIdx, setSizeIdx] = useState(1)
  const est = calcEstimate(materialIdx, sizeIdx)

  const range = est.high - est.low
  const likelyPos = ((est.likely - est.low) / range) * 100

  return (
    <section id="estimate-preview" aria-label="Estimate preview" className="py-16 md:py-24 bg-mesh-dark">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
            See Your Estimate in Action
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Pick a material and roof size. Watch the numbers update instantly &mdash; just like the real thing.
          </p>
        </ScrollAnimate>

        <ScrollAnimate delay={100}>
          <div className="max-w-2xl mx-auto">
            {/* Interactive controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Material</label>
                <div className="flex gap-2">
                  {MATERIALS.map((mat, i) => (
                    <button
                      key={mat.key}
                      onClick={() => setMaterialIdx(i)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        i === materialIdx
                          ? 'bg-[#c9a25c] text-[#0c0f14] shadow-lg'
                          : 'bg-[#1a1f2e] text-slate-400 border border-slate-700/50 hover:border-[#c9a25c]/30 hover:text-slate-300'
                      }`}
                    >
                      {mat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Roof Size</label>
                <div className="flex gap-2">
                  {SIZES.map((size, i) => (
                    <button
                      key={size.key}
                      onClick={() => setSizeIdx(i)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        i === sizeIdx
                          ? 'bg-[#c9a25c] text-[#0c0f14] shadow-lg'
                          : 'bg-[#1a1f2e] text-slate-400 border border-slate-700/50 hover:border-[#c9a25c]/30 hover:text-slate-300'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Estimate card */}
            <div className="bg-[#1a1f2e] border border-[#c9a25c]/20 rounded-2xl p-6 md:p-8 shadow-gold-glow card-inner-glow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-slate-400">Your Estimate</div>
                  <div className="text-lg font-bold text-slate-100">
                    {SIZES[sizeIdx].label} &bull; {MATERIALS[materialIdx].label}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">NE Mississippi</div>
                  <div className="text-sm text-slate-300">Local pricing</div>
                </div>
              </div>

              {/* Price range bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Low</span>
                  <span className="text-[#c9a25c] font-semibold">Most Likely</span>
                  <span className="text-slate-400">High</span>
                </div>
                <div className="relative h-3 rounded-full bg-slate-700/50 overflow-hidden">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-600/60 via-[#c9a25c]/80 to-red-500/60" />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#c9a25c] shadow-lg z-10 transition-all duration-500"
                    style={{ left: `calc(${likelyPos}% - 8px)` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-slate-300 font-semibold">
                    $<CountUp end={est.low} key={`low-${materialIdx}-${sizeIdx}`} duration={600} />
                  </span>
                  <span className="text-xl font-bold text-slate-100">
                    $<CountUp end={est.likely} key={`likely-${materialIdx}-${sizeIdx}`} duration={600} />
                  </span>
                  <span className="text-slate-300 font-semibold">
                    $<CountUp end={est.high} key={`high-${materialIdx}-${sizeIdx}`} duration={600} />
                  </span>
                </div>
              </div>

              {/* Line-item breakdown */}
              <div className="mt-4 pt-4 border-t border-slate-700/40">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Breakdown</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tear-off & Disposal</span>
                    <span className="text-slate-300 font-medium">${est.tearoff.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{MATERIALS[materialIdx].label}</span>
                    <span className="text-slate-300 font-medium">${est.material.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Labor & Installation</span>
                    <span className="text-slate-300 font-medium">${est.labor.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimate document mockup */}
            <div className="mt-6 bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-5 md:p-6">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">What you get</div>
              <div className="flex gap-4 items-start">
                {/* Mini document preview */}
                <div className="hidden sm:block flex-shrink-0 w-28 bg-white rounded-lg p-2.5 shadow-md">
                  <div className="h-2 w-16 bg-[#c9a25c] rounded mb-2" />
                  <div className="h-1.5 w-full bg-slate-200 rounded mb-1" />
                  <div className="h-1.5 w-20 bg-slate-200 rounded mb-2.5" />
                  <div className="h-1 w-full bg-slate-100 rounded mb-0.5" />
                  <div className="h-1 w-full bg-slate-100 rounded mb-0.5" />
                  <div className="h-1 w-14 bg-slate-100 rounded mb-2" />
                  <div className="flex gap-1 mb-2">
                    <div className="h-3 flex-1 bg-emerald-100 rounded" />
                    <div className="h-3 flex-1 bg-[#c9a25c]/20 rounded" />
                    <div className="h-3 flex-1 bg-red-100 rounded" />
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded mb-0.5" />
                  <div className="h-1 w-full bg-slate-100 rounded mb-0.5" />
                  <div className="h-1 w-10 bg-slate-100 rounded" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold text-slate-100">A professional PDF estimate</span> you can
                    share with contractors, your insurance adjuster, or family. Includes material
                    breakdown, labor costs, and a price range backed by local market data.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {BADGES.map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-2 bg-ink/50 rounded-lg px-3 py-2">
                        <Icon className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
                        <span className="text-xs text-slate-300">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
            {isCreating ? 'Starting...' : 'Get My Free Estimate'}
            {!isCreating && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
          <p className="mt-3 text-sm text-slate-400">Tailored to your roof, your area, your materials</p>
        </div>
      </div>
    </section>
  )
}
