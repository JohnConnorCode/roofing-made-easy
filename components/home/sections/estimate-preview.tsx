'use client'

import { useState } from 'react'
import { ArrowRight, Sparkles, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollAnimate } from '@/components/scroll-animate'
import { CountUp } from '@/components/ui/count-up'
import { useBusinessConfig } from '@/lib/config/business-provider'

const MATERIALS = [
  {
    label: '3-Tab Shingles',
    key: '3tab',
    costPerSq: 320,
    laborPerSq: 200,
    tier: 'Builder-grade',
  },
  {
    label: 'Architectural',
    key: 'arch',
    costPerSq: 420,
    laborPerSq: 230,
    tier: 'Most common',
  },
  {
    label: 'Standing Seam Metal',
    key: 'metal',
    costPerSq: 750,
    laborPerSq: 280,
    tier: 'Premium',
  },
] as const

const SIZES = [
  { label: '1,500 sq ft', key: 'sm', squares: 15, sub: 'Smaller ranch' },
  { label: '2,200 sq ft', key: 'md', squares: 22, sub: 'Typical family home' },
  { label: '3,000 sq ft', key: 'lg', squares: 30, sub: 'Larger two-story' },
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
    <section
      id="estimate-preview"
      aria-label="Estimate preview"
      className="relative py-24 md:py-32 bg-gradient-to-b from-[#0c0f14] via-[#0e1218] to-[#0c0f14] border-t border-slate-900 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-40"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 30% 0%, rgba(201,162,92,0.12), transparent 60%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* LEFT: Headline + context */}
          <div className="lg:col-span-5 lg:pt-6 lg:sticky lg:top-24">
            <ScrollAnimate>
              <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c]">
                <Sparkles className="h-3.5 w-3.5" />
                Try it with a sample roof
              </p>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold text-slate-50 font-display leading-[1.02] tracking-tight">
                Pick a material.
                <br />
                Pick a size.
                <br />
                <span className="bg-gradient-to-r from-[#e6c588] via-[#d4b06c] to-[#c9a25c] bg-clip-text text-transparent">
                  See the range.
                </span>
              </h2>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                This is the same pricing model we run on your actual roof.
                Change the inputs — the numbers move in real time.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#c9a25c] flex-shrink-0" />
                  <span>
                    Local {serviceArea.region} material & labor rates, updated
                    as the market moves.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#c9a25c] flex-shrink-0" />
                  <span>
                    Low–high range reflects real project variance, not a
                    &ldquo;starting at&rdquo; bait number.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#c9a25c] flex-shrink-0" />
                  <span>
                    On your real roof we add measurements, pitch, layers, and
                    any storm damage.
                  </span>
                </li>
              </ul>

              <div className="mt-10 hidden lg:block">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onGetStarted}
                  disabled={isCreating}
                  className="btn-press shadow-xl glow-gold"
                >
                  {isCreating ? 'Starting\u2026' : 'Run it on my roof'}
                  {!isCreating && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                <p className="mt-3 text-xs text-slate-500 max-w-xs">
                  Two minutes. Free. Walk away with a PDF you can share or
                  hand to an adjuster.
                </p>
              </div>
            </ScrollAnimate>
          </div>

          {/* RIGHT: Interactive calculator */}
          <div className="lg:col-span-7">
            <ScrollAnimate delay={100}>
              <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#141925] via-[#11151e] to-[#0e1218] p-5 md:p-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] card-inner-glow">
                {/* Material selector — card style */}
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-[0.15em]">
                      Material
                    </label>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                      Tap to switch
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {MATERIALS.map((mat, i) => {
                      const active = i === materialIdx
                      return (
                        <button
                          key={mat.key}
                          onClick={() => setMaterialIdx(i)}
                          className={`group relative text-left rounded-xl border px-3 py-3 transition-all ${
                            active
                              ? 'border-[#c9a25c] bg-[#c9a25c]/10 shadow-[0_0_0_1px_rgba(201,162,92,0.35)]'
                              : 'border-slate-700/60 bg-slate-900/40 hover:border-[#c9a25c]/40 hover:bg-slate-900/70'
                          }`}
                        >
                          <div
                            className={`text-[10px] uppercase tracking-widest font-medium ${
                              active ? 'text-[#e6c588]' : 'text-slate-500'
                            }`}
                          >
                            {mat.tier}
                          </div>
                          <div
                            className={`mt-1 text-sm font-semibold leading-tight ${
                              active ? 'text-slate-50' : 'text-slate-300'
                            }`}
                          >
                            {mat.label}
                          </div>
                          <div
                            className={`mt-2 text-[11px] tabular-nums ${
                              active ? 'text-[#c9a25c]' : 'text-slate-500'
                            }`}
                          >
                            ${mat.costPerSq + mat.laborPerSq + TEAROFF_PER_SQ}/sq
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Size selector */}
                <div className="mt-5">
                  <div className="flex items-baseline justify-between mb-3">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-[0.15em]">
                      Roof size
                    </label>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                      Square footage
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {SIZES.map((size, i) => {
                      const active = i === sizeIdx
                      return (
                        <button
                          key={size.key}
                          onClick={() => setSizeIdx(i)}
                          className={`text-left rounded-xl border px-3 py-3 transition-all ${
                            active
                              ? 'border-[#c9a25c] bg-[#c9a25c]/10 shadow-[0_0_0_1px_rgba(201,162,92,0.35)]'
                              : 'border-slate-700/60 bg-slate-900/40 hover:border-[#c9a25c]/40 hover:bg-slate-900/70'
                          }`}
                        >
                          <div
                            className={`text-sm font-semibold ${
                              active ? 'text-slate-50' : 'text-slate-300'
                            }`}
                          >
                            {size.label}
                          </div>
                          <div
                            className={`mt-1 text-[11px] ${
                              active ? 'text-[#c9a25c]' : 'text-slate-500'
                            }`}
                          >
                            {size.sub}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Estimate headline */}
                <div className="mt-7 rounded-2xl border border-[#c9a25c]/25 bg-gradient-to-br from-[#0c0f14] to-[#10151f] p-6 md:p-7 relative overflow-hidden">
                  <div
                    className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#c9a25c]/10 blur-3xl pointer-events-none"
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#c9a25c] font-medium">
                          Most likely
                        </div>
                        <div className="mt-1 text-[2.75rem] md:text-[3.5rem] leading-none font-bold font-display tabular-nums text-slate-50">
                          $
                          <CountUp
                            end={est.likely}
                            key={`likely-${materialIdx}-${sizeIdx}`}
                            duration={600}
                          />
                        </div>
                        <div className="mt-2 text-sm text-slate-400">
                          {SIZES[sizeIdx].label} &bull; {MATERIALS[materialIdx].label}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                          <MapPin className="h-3 w-3 text-[#c9a25c]" />
                          {serviceArea.region}
                        </div>
                        <div className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
                          Local pricing
                        </div>
                      </div>
                    </div>

                    {/* Range bar */}
                    <div className="mt-6">
                      <div className="flex justify-between text-[11px] uppercase tracking-widest text-slate-500 mb-2">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                      <div className="relative h-2.5 rounded-full bg-slate-800/70 overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500/60 via-[#c9a25c]/80 to-red-500/60 transition-[width] duration-500"
                          style={{ width: '100%' }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border-2 border-[#c9a25c] shadow-[0_0_10px_rgba(201,162,92,0.6)] transition-all duration-500"
                          style={{ left: `calc(${likelyPos}% - 8px)` }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-sm tabular-nums">
                        <span className="text-slate-300 font-semibold">
                          $
                          <CountUp
                            end={est.low}
                            key={`low-${materialIdx}-${sizeIdx}`}
                            duration={600}
                          />
                        </span>
                        <span className="text-slate-300 font-semibold">
                          $
                          <CountUp
                            end={est.high}
                            key={`high-${materialIdx}-${sizeIdx}`}
                            duration={600}
                          />
                        </span>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="mt-6 pt-5 border-t border-slate-800/80">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3 font-medium">
                        How the number is built
                      </div>
                      <div className="space-y-2.5">
                        <BreakdownRow
                          label="Tear-off & disposal"
                          amount={est.tearoff}
                          total={est.likely}
                        />
                        <BreakdownRow
                          label={MATERIALS[materialIdx].label}
                          amount={est.material}
                          total={est.likely}
                        />
                        <BreakdownRow
                          label="Labor & installation"
                          amount={est.labor}
                          total={est.likely}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-center text-[11px] text-slate-500">
                  Sample figures for illustration. Your real estimate uses
                  your roof&rsquo;s actual specifics.
                </p>
              </div>

              {/* Mobile CTA (desktop CTA is in left column) */}
              <div className="mt-6 lg:hidden">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onGetStarted}
                  disabled={isCreating}
                  className="w-full btn-press shadow-xl glow-gold"
                >
                  {isCreating ? 'Starting\u2026' : 'Run it on my roof'}
                  {!isCreating && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Two minutes. Free. Walk away with a PDF.
                </p>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </div>
    </section>
  )
}

function BreakdownRow({
  label,
  amount,
  total,
}: {
  label: string
  amount: number
  total: number
}) {
  const percent = Math.round((amount / total) * 100)
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm text-slate-400 truncate">{label}</span>
        <span className="text-sm tabular-nums text-slate-200 font-medium flex-shrink-0 ml-3">
          ${amount.toLocaleString()}
        </span>
      </div>
      <div className="h-[3px] rounded-full bg-slate-800/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#c9a25c]/70 to-[#c9a25c]/30 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
