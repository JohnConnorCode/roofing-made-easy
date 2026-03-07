'use client'

import { Star, Quote, ArrowRight } from 'lucide-react'
import { ScrollAnimate } from '@/components/scroll-animate'

export function FeaturedTestimonial() {
  return (
    <section aria-label="Customer story" className="py-14 md:py-20 bg-ink border-t border-slate-800">
      <div className="mx-auto max-w-4xl px-4">
        <ScrollAnimate>
          <div className="relative bg-[#1a1f2e] border border-[#c9a25c]/20 rounded-2xl p-6 md:p-10 card-inner-glow">
            <Quote className="absolute top-6 right-6 md:top-8 md:right-8 h-12 w-12 text-[#c9a25c]/10" />

            <div className="flex items-center gap-1.5 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-[#c9a25c] text-[#c9a25c] star-glow" />
              ))}
            </div>

            <blockquote className="text-lg md:text-xl text-slate-200 leading-relaxed mb-6 max-w-3xl">
              &ldquo;After that bad storm came through Lee County last spring, I had no idea what a new
              roof should cost. I used Smart Roof Pricing and had a full estimate in about two minutes.
              Farrell Roofing handled the insurance claim from there, and the new impact-resistant roof
              was up in three days. Already been through two more storms without a single issue.&rdquo;
            </blockquote>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#c9a25c] flex items-center justify-center text-sm font-bold text-[#0c0f14]">
                  BJ
                </div>
                <div>
                  <p className="font-semibold text-slate-100">Bobby Ray Johnson</p>
                  <p className="text-sm text-slate-400">Tupelo, MS &bull; Storm Damage Repair</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-400">
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-400">$18,200</div>
                  <div>Insurance covered</div>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div className="text-center">
                  <div className="text-lg font-bold text-[#c9a25c]">$0</div>
                  <div>Out of pocket</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ArrowRight className="h-4 w-4 text-[#c9a25c]" />
                <span>
                  Estimate in 2 minutes. Insurance claim handled. New impact-resistant roof installed in 3 days.
                </span>
              </div>
            </div>
          </div>
        </ScrollAnimate>
      </div>
    </section>
  )
}
