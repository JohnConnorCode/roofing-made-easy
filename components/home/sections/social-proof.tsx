'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ScrollAnimate } from '@/components/scroll-animate'
import { HOMEPAGE_GUIDES } from '@/lib/data/homepage-guides'

/**
 * "Guides" section — surfaces value-forward pricing guides in the homepage
 * slot where drone photos used to live. The photo gallery was moved to
 * `work-gallery.tsx` for reuse on About / Services.
 */
export function SocialProof() {
  return (
    <section
      aria-label="Pricing guides"
      className="py-24 md:py-32 bg-[#0c0f14] border-t border-slate-900"
    >
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate>
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c]">
              Guides
            </p>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-slate-50 font-display leading-[1.02] tracking-tight">
              Know what you&rsquo;re
              <br />
              <span className="bg-gradient-to-r from-[#e6c588] via-[#d4b06c] to-[#c9a25c] bg-clip-text text-transparent">
                looking at.
              </span>
            </h2>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-xl">
              Plain-English breakdowns built from the same local pricing the
              tool uses &mdash; so you can spot a fair number from a mile away.
            </p>
          </div>
        </ScrollAnimate>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {HOMEPAGE_GUIDES.map((guide, idx) => {
            const Icon = guide.icon
            return (
              <ScrollAnimate key={guide.href} delay={idx * 80}>
                <Link
                  href={guide.href}
                  className="group relative flex h-full flex-col rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#141925] via-[#11151e] to-[#0e1218] p-7 transition-all duration-300 hover:border-[#c9a25c]/40 hover:shadow-[0_20px_60px_-30px_rgba(201,162,92,0.35)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a25c]/10 border border-[#c9a25c]/25 text-[#c9a25c]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-slate-500 group-hover:text-[#c9a25c] transition-colors">
                      {guide.eyebrow}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl md:text-2xl font-semibold text-slate-50 font-display leading-snug">
                    {guide.title}
                  </h3>

                  <p className="mt-3 text-sm text-slate-400 leading-relaxed flex-grow">
                    {guide.body}
                  </p>

                  <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full border border-slate-700/70 bg-slate-900/60 px-2.5 py-1 text-[11px] font-medium text-slate-300 tabular-nums">
                      {guide.meta}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#c9a25c] group-hover:gap-2 transition-all">
                      Read guide
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </ScrollAnimate>
            )
          })}
        </div>

        <ScrollAnimate delay={300}>
          <div className="mt-10 flex items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-900/30 px-6 py-4">
            <p className="text-sm text-slate-400">
              More breakdowns, storm-season checklists, and adjuster playbooks
              on the blog.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#c9a25c] hover:text-[#e6c588] transition-colors flex-shrink-0"
            >
              All guides
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </ScrollAnimate>
      </div>
    </section>
  )
}
