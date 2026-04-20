import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function FounderStrip() {
  return (
    <section className="py-16 md:py-20 bg-[#0a0d12] border-y border-slate-900">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16">

          {/* Initials avatars */}
          <div className="flex -space-x-3 flex-shrink-0">
            {['RF', 'BF'].map((initials) => (
              <div
                key={initials}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c9a25c] to-[#9a7432] border-2 border-[#0a0d12] flex items-center justify-center"
              >
                <span className="text-sm font-bold text-[#0c0f14]">{initials}</span>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="flex-1">
            <p className="text-slate-100 text-lg md:text-xl leading-relaxed font-medium max-w-2xl">
              "We've watched homeowners get quoted $22,000 for a roof that should run $13,000. The information to know the difference exists — it just wasn't available to them. That's why this tool exists."
            </p>
            <p className="mt-3 text-sm text-slate-500">
              — Robert Farrell, Smart Roof Pricing ·{' '}
              <span className="text-slate-400">Farrell Roofing, Fulton MS</span>
            </p>
          </div>

          {/* Link */}
          <div className="flex-shrink-0">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#c9a25c] hover:text-[#e6c588] transition-colors group"
            >
              Our story
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
