'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollAnimate } from '@/components/scroll-animate'
import { CountUp } from '@/components/ui/count-up'
import { useBusinessConfig } from '@/lib/config/business-provider'

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

interface EstimatePreviewProps {
  onGetStarted: () => void
  isCreating: boolean
}

export function EstimatePreview({ onGetStarted, isCreating }: EstimatePreviewProps) {
  const [materialIdx, setMaterialIdx] = useState(1)
  const [sizeIdx, setSizeIdx] = useState(1)
  const est = calcEstimate(materialIdx, sizeIdx)
  const { serviceArea } = useBusinessConfig()

  const range = est.high - est.low
  const likelyPos = ((est.likely - est.low) / range) * 100

  return (
    <section id="estimate-preview" aria-label="Estimate preview" className="py-24 md:py-32 bg-gradient-to-b from-[#0c0f14] via-[#0e1218] to-[#0c0f14] border-t border-slate-900">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate>
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c]">
              Try it with a sample roof
            </p>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-slate-50 font-display leading-[1.05]">
              Pick a material.
              <br />
              Pick a size. See the range.
            </h2>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-xl">
              This is the same pricing model we run on your actual roof.
              Numbers move in real time.
            </p>
          </div>
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
                  <div className="text-sm text-slate-400">{serviceArea.region}</div>
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

            <p className="mt-5 text-center text-xs text-slate-500">
              Sample figures for illustration. Your real estimate uses your roof&rsquo;s specifics.
            </p>
          </div>
        </ScrollAnimate>

        <div className="mt-14 flex flex-col sm:flex-row sm:items-center gap-4 max-w-2xl mx-auto">
          <Button
            variant="primary"
            size="lg"
            onClick={onGetStarted}
            disabled={isCreating}
            className="btn-press flex-shrink-0"
          >
            {isCreating ? 'Starting\u2026' : 'Run it on my roof'}
            {!isCreating && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
          <p className="text-sm text-slate-500">
            You get a PDF you can keep, share, or hand to an adjuster.
          </p>
        </div>
      </div>
    </section>
  )
}
