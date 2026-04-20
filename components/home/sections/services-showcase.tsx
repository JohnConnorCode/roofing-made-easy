'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ScrollAnimate } from '@/components/scroll-animate'

interface ServiceCard {
  slug: string
  eyebrow: string
  title: string
  description: string
  priceRange: string
  timeframe?: string
  image: string
  alt: string
}

const FEATURED: ServiceCard = {
  slug: 'roof-replacement',
  eyebrow: 'Full replacement',
  title: 'New roof, done right.',
  description:
    'Tear-off, decking, underlayment, and the shingle or metal system you pick. The whole job, priced line by line.',
  priceRange: '$8k–$25k typical',
  timeframe: '1–3 days',
  image: '/images/services/roof-replacement.jpg',
  alt: 'Completed residential shingle roof replacement in Northeast Mississippi',
}

const SECONDARY: ServiceCard[] = [
  {
    slug: 'roof-repair',
    eyebrow: 'Repair',
    title: 'Fix what\u2019s failing.',
    description:
      'Leaks, shingle damage, flashing, valleys. Targeted repair for roofs with real life left.',
    priceRange: '$300–$3k typical',
    timeframe: 'Same day – 1 day',
    image: '/images/services/roof-repair.jpg',
    alt: 'Roof repair in progress on residential shingles',
  },
  {
    slug: 'emergency-repair',
    eyebrow: 'Storm & emergency',
    title: 'Damage now, documented right.',
    description:
      'Hail, wind, fallen limbs. Same-day tarping, drone documentation, and claim-ready evidence.',
    priceRange: 'Varies by damage',
    timeframe: 'Same-day response',
    image: '/images/services/storm-damage-repair.jpg',
    alt: 'Storm-damaged roof with wind and hail impact',
  },
]

const TERTIARY: ServiceCard[] = [
  {
    slug: 'gutters',
    eyebrow: 'Gutters & drainage',
    title: 'Water has to go somewhere.',
    description:
      'Seamless aluminum, copper, or half-round. Installed, sized, and sloped for Mississippi rain.',
    priceRange: '$1k–$5k typical',
    image: '/images/services/metal-roofing.jpg',
    alt: 'Seamless metal gutter installation',
  },
  {
    slug: 'roof-inspection',
    eyebrow: 'Inspection',
    title: 'Know what you\u2019re sitting under.',
    description:
      'Drone + hands-on assessment with a written report. Perfect before a sale, a claim, or a big rain.',
    priceRange: '$150–$400',
    image: '/images/services/roof-inspection.jpg',
    alt: 'Roof inspection with detailed assessment',
  },
  {
    slug: 'roof-maintenance',
    eyebrow: 'Maintenance',
    title: 'Catch it small, not big.',
    description:
      'Annual tune-ups, sealant checks, gutter clear-out. Extends the life of the roof you already have.',
    priceRange: '$200–$500/yr',
    image: '/images/work/replacement-after.webp',
    alt: 'Well-maintained residential roof after professional service',
  },
]

export function ServicesShowcase() {
  return (
    <section
      aria-label="Roofing services"
      className="relative py-24 md:py-32 bg-[#0c0f14] border-t border-slate-900 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-40"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(201,162,92,0.08), transparent 60%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4">
        <ScrollAnimate>
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c]">
              Services
            </p>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-slate-50 font-display leading-[1.02] tracking-tight">
              Whatever your roof needs,
              <br />
              <span className="bg-gradient-to-r from-[#e6c588] via-[#d4b06c] to-[#c9a25c] bg-clip-text text-transparent">
                priced and explained.
              </span>
            </h2>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-xl">
              Six core services, every one priced on the same transparent model.
              Get a fair number, then decide what&rsquo;s next.
            </p>
          </div>
        </ScrollAnimate>

        {/* Featured + secondary row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
          {/* Featured */}
          <ScrollAnimate className="lg:col-span-7" delay={0}>
            <Link
              href={`/services/${FEATURED.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-800/80 aspect-[4/3] lg:aspect-auto lg:min-h-[520px]"
            >
              <Image
                src={FEATURED.image}
                alt={FEATURED.alt}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover transition-transform duration-[1800ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f14] via-[#0c0f14]/60 to-[#0c0f14]/20" />
              <div className="relative z-10 mt-auto p-7 md:p-10">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#e6c588] font-medium">
                  {FEATURED.eyebrow}
                </p>
                <h3 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-50 font-display leading-[1.05] tracking-tight">
                  {FEATURED.title}
                </h3>
                <p className="mt-4 text-base md:text-lg text-slate-200 leading-relaxed max-w-lg">
                  {FEATURED.description}
                </p>
                <div className="mt-6 flex items-center gap-4 flex-wrap">
                  <span className="inline-flex items-center rounded-full border border-[#c9a25c]/30 bg-[#c9a25c]/10 px-3 py-1 text-xs font-medium text-[#e6c588] tabular-nums">
                    {FEATURED.priceRange}
                  </span>
                  {FEATURED.timeframe && (
                    <span className="text-xs text-slate-400">
                      {FEATURED.timeframe}
                    </span>
                  )}
                  <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-[#c9a25c] group-hover:gap-2 transition-all">
                    Learn more &amp; price it
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          </ScrollAnimate>

          {/* Two stacked secondary */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-5">
            {SECONDARY.map((s, i) => (
              <ScrollAnimate key={s.slug} delay={100 + i * 60}>
                <ServiceTile service={s} />
              </ScrollAnimate>
            ))}
          </div>
        </div>

        {/* Tertiary row */}
        <div className="mt-4 md:mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {TERTIARY.map((s, i) => (
            <ScrollAnimate key={s.slug} delay={200 + i * 60}>
              <ServiceTile service={s} compact />
            </ScrollAnimate>
          ))}
        </div>

        {/* Bottom strip */}
        <ScrollAnimate delay={400}>
          <div className="mt-10 flex items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-900/30 px-6 py-4">
            <p className="text-sm text-slate-400">
              Every service priced with the same local-rate model you saw up top.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#c9a25c] hover:text-[#e6c588] transition-colors flex-shrink-0"
            >
              All services
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </ScrollAnimate>
      </div>
    </section>
  )
}

function ServiceTile({
  service,
  compact = false,
}: {
  service: ServiceCard
  compact?: boolean
}) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 ${
        compact ? 'aspect-[4/3]' : 'aspect-[4/3] lg:aspect-auto lg:min-h-[250px]'
      }`}
    >
      <Image
        src={service.image}
        alt={service.alt}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-[1400ms] group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f14] via-[#0c0f14]/55 to-transparent" />
      <div className="relative z-10 mt-auto p-5 md:p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#e6c588] font-medium">
          {service.eyebrow}
        </p>
        <h3 className="mt-2 text-lg md:text-xl font-semibold text-slate-50 font-display leading-snug">
          {service.title}
        </h3>
        <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed line-clamp-2">
          {service.description}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#c9a25c] tabular-nums font-medium">
            {service.priceRange}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#c9a25c] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  )
}
