'use client'

import Image from 'next/image'
import { MapPin, Star, Sparkles, DollarSign } from 'lucide-react'
import { ScrollAnimate } from '@/components/scroll-animate'
import { useBusinessConfig } from '@/lib/config/business-provider'

function formatPrice(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return `$${n}`
}

export function WhyHomeowners() {
  const config = useBusinessConfig()
  const years = config.foundedYear
    ? new Date().getFullYear() - parseInt(config.foundedYear)
    : null
  const replacement = config.pricing.roofReplacement
  const priceLow = formatPrice(replacement.min)
  const priceHigh = formatPrice(replacement.max)
  const reviewRating = config.reviews.googleRating
  const reviewCount = config.reviews.googleReviewCount

  return (
    <section
      aria-label="Why homeowners pick us"
      className="py-24 md:py-32 bg-[#0c0f14] border-t border-slate-900 relative overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate>
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c]">
              Why homeowners pick us
            </p>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-slate-50 font-display leading-[1.05]">
              Straightforward when
              <br />
              nothing else about a roof is.
            </h2>
          </div>
        </ScrollAnimate>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:h-[640px]">
          {/* Large tile: real photo + local roots */}
          <ScrollAnimate
            delay={0}
            className="relative md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden border border-slate-800 group"
          >
            <Image
              src="/images/work/detail-architectural.webp"
              alt={`Completed architectural shingle roof in ${config.serviceArea.region}`}
              fill
              sizes="(min-width: 768px) 66vw, 100vw"
              className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f14] via-[#0c0f14]/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
              <div className="flex items-center gap-2 text-[#e6c588] text-xs font-medium uppercase tracking-widest mb-3">
                <MapPin className="h-3.5 w-3.5" />
                {config.serviceArea.region}
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-50 font-display leading-tight">
                {years ? `${years}+ years` : 'A lifetime'} fixing roofs
                <br />
                right here.
              </h3>
              <p className="mt-4 text-base text-slate-300 max-w-md">
                Not a national lead-gen site. Not a sales funnel dressed up as a contractor.
                A local crew that answers their own phone.
              </p>
            </div>
          </ScrollAnimate>

          {/* Price transparency tile */}
          <ScrollAnimate
            delay={100}
            className="relative rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-7 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-[#c9a25c]/10 blur-3xl" />
            <div className="relative">
              <DollarSign className="h-5 w-5 text-[#c9a25c] mb-4" />
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                Typical replacement
              </p>
              <p className="mt-2 text-4xl font-bold text-slate-50 font-display">
                {priceLow}<span className="text-slate-500">–</span>{priceHigh}
              </p>
            </div>
            <p className="relative mt-6 text-sm text-slate-400 leading-relaxed">
              Real ranges for a typical home in {config.address.city}.
              No low-ball bait. No surprise upsell.
            </p>
          </ScrollAnimate>

          {/* Insurance-savvy tile — contractors who know how to handle storm claims are genuinely rare */}
          <ScrollAnimate
            delay={200}
            className="relative rounded-2xl border border-[#c9a25c]/20 bg-[#c9a25c]/5 p-7 flex flex-col justify-between overflow-hidden"
          >
            <div className="relative">
              <Sparkles className="h-5 w-5 text-[#c9a25c] mb-4" />
              <h3 className="text-xl font-bold text-slate-50 font-display leading-snug">
                Storm claims, done right.
              </h3>
            </div>
            <p className="relative mt-5 text-sm text-slate-300 leading-relaxed">
              After hail or wind, we document the damage and meet the adjuster
              on-site. Included, not extra.
            </p>
          </ScrollAnimate>
        </div>

        {/* Optional social proof strip — only shown when we have real reviews */}
        {reviewRating && reviewCount && (
          <ScrollAnimate delay={300}>
            <div className="mt-10 flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#c9a25c] text-[#c9a25c]" />
                ))}
              </div>
              <p className="text-sm text-slate-300">
                <span className="text-slate-50 font-semibold">{reviewRating}/5</span>
                {' '}from {reviewCount}+ reviews across {config.serviceArea.region}.
              </p>
              <Sparkles className="ml-auto h-4 w-4 text-[#c9a25c]" />
            </div>
          </ScrollAnimate>
        )}
      </div>
    </section>
  )
}
