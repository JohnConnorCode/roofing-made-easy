import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, Clock, DollarSign, Wind } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { ScrollAnimate } from '@/components/scroll-animate'
import { StartFunnelButton } from '@/components/funnel/start-funnel-button'
import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { getAllMaterials, MATERIAL_COMPARISON } from '@/lib/data/roofing-materials'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export const metadata: Metadata = {
  title: 'Roofing Materials Guide — Northeast Mississippi | Smart Roof Pricing',
  description:
    'Compare asphalt shingles, metal roofing, and impact-resistant shingles for Northeast Mississippi. Lifespan, cost, warranty, hail and wind ratings — all in one place.',
  metadataBase: new URL(BASE_URL),
  alternates: { canonical: `${BASE_URL}/roofing-materials` },
  openGraph: {
    title: 'Roofing Materials Guide | Smart Roof Pricing',
    description:
      'Compare roofing materials for Mississippi homes. Cost, lifespan, warranty, storm performance — the information you need to make a confident decision.',
    url: `${BASE_URL}/roofing-materials`,
    siteName: 'Smart Roof Pricing',
    type: 'article',
  },
}

const DECISION_QUESTIONS = [
  {
    question: "How long do you plan to own the home?",
    options: [
      { label: "Under 10 years", recommendation: "Asphalt shingles", slug: "asphalt-shingles", why: "Lower upfront cost; you'll recoup the value at sale without the premium of metal." },
      { label: "10-20 years", recommendation: "Class 4 impact shingles", slug: "impact-resistant-shingles", why: "Insurance discount pays back the upgrade cost, and you get a better-warranted roof." },
      { label: "20+ years", recommendation: "Standing seam metal", slug: "metal-roofing", why: "Long-term total cost favors metal. One installation for the life of your ownership." },
    ],
  },
  {
    question: "Has your roof ever been damaged by hail or wind?",
    options: [
      { label: "Yes — filed an insurance claim", recommendation: "Class 4 impact shingles", slug: "impact-resistant-shingles", why: "Reduces future claim frequency. Most MS carriers offer significant discount." },
      { label: "No damage yet, but I'm concerned", recommendation: "Class 4 impact shingles", slug: "impact-resistant-shingles", why: "Proactive protection + insurance discount starting on day one." },
      { label: "Not concerned about hail", recommendation: "Asphalt shingles", slug: "asphalt-shingles", why: "Standard architectural shingles perform well in normal conditions." },
    ],
  },
]

export default function RoofingMaterialsPage() {
  const materials = getAllMaterials()

  return (
    <div className="min-h-screen bg-[#0c0f14]">
      <SiteHeader />
      <Breadcrumbs items={[{ name: 'Roofing Materials', href: '/roofing-materials' }]} />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <Image
          src="/images/services/roof-replacement.jpg"
          alt="Residential roof replacement in Northeast Mississippi"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0f14]/85 via-[#0c0f14]/70 to-[#0c0f14]" />
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#c9a25c]/30 bg-[#c9a25c]/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#e6c588] mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a25c]" />
            Northeast Mississippi
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50 font-display leading-[1.0] tracking-tight max-w-3xl mb-6">
            The roofing material decides
            <br />
            <span className="bg-gradient-to-r from-[#e6c588] via-[#d4b06c] to-[#c9a25c] bg-clip-text text-transparent">
              everything else.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-8">
            Lifespan, cost, storm performance, insurance premium — the material choice drives all of them. Here&apos;s how the main options stack up for Mississippi homes.
          </p>
          <StartFunnelButton className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] font-semibold px-6 py-3 rounded-lg transition-all text-sm">
            Get my material estimate
            <ArrowRight className="h-4 w-4" />
          </StartFunnelButton>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16 md:py-20 bg-[#0c0f14] border-t border-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-2">Compare</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 font-display tracking-tight mb-4">
              All materials at a glance
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mb-10">
              Per-square-foot installed cost is for Northeast Mississippi labor rates. Lifespan is real-world expectation, not manufacturer maximum.
            </p>
          </ScrollAnimate>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Material', 'Lifespan', 'Installed Cost/sq ft', 'Wind', 'Hail (UL 2218)', 'Maintenance', 'Best For'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATERIAL_COMPARISON.map((m, i) => (
                  <tr key={i} className="border-b border-slate-800/40 hover:bg-[#141925] transition-colors">
                    <td className="py-4 px-4">
                      {m.href ? (
                        <Link href={m.href} className="font-medium text-slate-100 hover:text-[#e6c588] transition-colors">
                          {m.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-slate-100">{m.name}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300">{m.lifespan}</td>
                    <td className="py-4 px-4 text-[#e6c588] font-medium tabular-nums">{m.cost}</td>
                    <td className="py-4 px-4 text-slate-400 text-xs">{m.wind}</td>
                    <td className="py-4 px-4 text-slate-400 text-xs">{m.hail}</td>
                    <td className="py-4 px-4 text-slate-400 text-xs">{m.maintenance}</td>
                    <td className="py-4 px-4 text-slate-400 text-xs">{m.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {MATERIAL_COMPARISON.map((m, i) => (
              <div key={i} className="rounded-xl border border-slate-800/80 bg-[#141925] p-5">
                <div className="flex items-start justify-between mb-3">
                  {m.href ? (
                    <Link href={m.href} className="font-medium text-slate-100 hover:text-[#e6c588] transition-colors">
                      {m.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-slate-100">{m.name}</span>
                  )}
                  <span className="text-[#e6c588] text-sm font-medium tabular-nums">{m.cost}/sf</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Lifespan</span>
                    <p className="text-slate-300 mt-0.5">{m.lifespan}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Best for</span>
                    <p className="text-slate-300 mt-0.5">{m.bestFor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Decision guide */}
      <section className="py-16 md:py-20 bg-[#0a0d12] border-t border-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-2">Decision guide</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 font-display tracking-tight mb-4">
              Two questions that narrow it down
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mb-12">
              Most material decisions come down to ownership horizon and storm history. Here&apos;s the logic.
            </p>
          </ScrollAnimate>

          <div className="grid md:grid-cols-2 gap-6">
            {DECISION_QUESTIONS.map((dq, qi) => (
              <ScrollAnimate key={qi} delay={qi * 80}>
                <div className="rounded-2xl border border-slate-800/80 bg-[#141925] p-7">
                  <p className="text-base font-semibold text-slate-100 mb-5">{dq.question}</p>
                  <div className="space-y-3">
                    {dq.options.map((opt, oi) => (
                      <Link
                        key={oi}
                        href={`/roofing-materials/${opt.slug}`}
                        className="group flex items-start gap-3 rounded-xl border border-slate-800/60 bg-[#0c0f14] p-4 hover:border-[#c9a25c]/30 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">{opt.label}</p>
                          <p className="text-xs text-[#c9a25c] mt-1">→ {opt.recommendation}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{opt.why}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-[#c9a25c] flex-shrink-0 mt-0.5 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      {/* Material guide tiles */}
      <section className="py-16 md:py-20 bg-[#0c0f14] border-t border-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-2">Deep dives</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 font-display tracking-tight mb-4">
              Material guides
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mb-12">
              Each guide covers types, trade-offs, installation quality markers, Mississippi performance, and real cost math.
            </p>
          </ScrollAnimate>

          <div className="grid md:grid-cols-3 gap-5">
            {materials.map((m, i) => (
              <ScrollAnimate key={m.slug} delay={i * 80}>
                <Link
                  href={`/roofing-materials/${m.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 aspect-[4/3]"
                >
                  <Image
                    src={m.image}
                    alt={m.name}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-[1400ms] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f14] via-[#0c0f14]/50 to-transparent" />
                  <div className="relative z-10 mt-auto p-6">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#e6c588] font-medium mb-2">
                      {m.eyebrow}
                    </p>
                    <h3 className="text-xl font-bold text-slate-50 font-display leading-snug mb-2">{m.name}</h3>
                    <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#c9a25c]" />
                        {m.stats.lifespan}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-[#c9a25c]" />
                        {m.stats.cost}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#c9a25c] group-hover:gap-1.5 transition-all">
                      Full guide <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-14 bg-[#0a0d12] border-t border-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate>
            <div className="rounded-2xl border border-[#c9a25c]/20 bg-gradient-to-br from-[#c9a25c]/10 to-transparent p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#c9a25c] mb-2">Pricing tool</p>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-50 font-display mb-2">
                  Know what your material choice actually costs.
                </h2>
                <p className="text-slate-400 max-w-xl">
                  Get a line-by-line estimate based on your home size, pitch, and chosen material — built from current Northeast Mississippi labor and material rates.
                </p>
              </div>
              <div className="flex-shrink-0">
                <StartFunnelButton className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] font-semibold px-6 py-3.5 rounded-lg transition-all text-sm">
                  Get my free estimate
                  <ArrowRight className="h-4 w-4" />
                </StartFunnelButton>
                <p className="text-xs text-slate-500 mt-2 text-center">2 minutes · Free PDF</p>
              </div>
            </div>
          </ScrollAnimate>
        </div>
      </section>

      <SiteFooter />
      <div className="h-[60px] lg:hidden" aria-hidden="true" />
    </div>
  )
}
