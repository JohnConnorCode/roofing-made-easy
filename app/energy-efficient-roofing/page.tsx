import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPostsByCategory } from '@/lib/data/blog'
import { BUSINESS_CONFIG } from '@/lib/config/business'
import { getPhoneDisplay, getPhoneLink } from '@/lib/config/business'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { BreadcrumbSchema } from '@/components/seo/list-schema'
import { FAQSchema } from '@/components/seo/json-ld'
import {
  Phone,
  ArrowRight,
  Zap,
  Thermometer,
  Sun,
  DollarSign,
  Wind,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export const metadata: Metadata = {
  title: `Energy Efficient Roofing in Mississippi | Cut Cooling Costs | ${BUSINESS_CONFIG.name}`,
  description: `Mississippi homeowners pay some of the highest cooling bills in the US. The right roofing materials and attic setup can cut cooling costs 15–25%. Radiant barriers, cool roofs, ENERGY STAR shingles, and proper ventilation — what actually works in the Mississippi heat.`,
  keywords: [
    'energy efficient roofing Mississippi',
    'cool roof Mississippi',
    'radiant barrier Mississippi',
    'ENERGY STAR shingles Mississippi',
    'reduce cooling costs Mississippi',
    'energy saving roof Mississippi',
    'metal roof energy savings Mississippi',
    'attic ventilation Mississippi cooling',
  ],
  openGraph: {
    title: `Energy Efficient Roofing | ${BUSINESS_CONFIG.serviceArea.region} | ${BUSINESS_CONFIG.name}`,
    description: `Cut cooling costs with the right roof. Radiant barriers, cool roof coatings, reflective shingles, and proper ventilation for Mississippi's brutal summers.`,
    url: `${BASE_URL}/energy-efficient-roofing`,
    siteName: BUSINESS_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=service&title=Energy%20Efficient%20Roofing&subtitle=Cut%20Cooling%20Costs%20%E2%80%A2%20Mississippi%20Heat%20%E2%80%A2%20Radiant%20Barriers`,
        width: 1200,
        height: 630,
        alt: 'Energy Efficient Roofing — Mississippi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Energy Efficient Roofing | ${BUSINESS_CONFIG.name}`,
    description: `Cut cooling costs with the right roofing materials and attic setup for Mississippi's climate.`,
  },
  alternates: {
    canonical: `${BASE_URL}/energy-efficient-roofing`,
  },
}

export const revalidate = 3600

const FAQ_ITEMS = [
  {
    question: 'How much can an energy-efficient roof actually save in Mississippi?',
    answer: 'Studies on Mississippi and Gulf Coast homes show 10–25% reductions in cooling costs with reflective roofing materials. The savings are higher in Mississippi than northern states because cooling loads dominate — you\'re running AC 6+ months per year. A radiant barrier in the attic alone can reduce attic temperatures by 20–30°F, which directly reduces the load on your AC system. For a home spending $250/month on cooling, that\'s $300–750/year in savings.',
  },
  {
    question: 'Does a metal roof really save money on cooling costs?',
    answer: 'Yes — but the color matters more than the material. A light-colored or unpainted galvalume metal roof reflects 70%+ of solar radiation. A dark painted metal roof reflects less than some light-colored asphalt shingles. The advantage metal has is emissivity — it re-radiates absorbed heat faster than asphalt. In Mississippi, a light-colored standing seam metal roof over proper ventilation and a radiant barrier is the highest-performing combination for cooling efficiency.',
  },
  {
    question: 'What is a radiant barrier and does it work in Mississippi?',
    answer: 'A radiant barrier is a reflective foil (usually aluminum) installed in the attic rafters or on the underside of the roof deck. It reflects radiant heat downward before it can heat your attic air. In hot, sunny climates like Mississippi, they\'re well-documented by the DOE — expect 7–17% cooling savings depending on your current attic insulation and ventilation. They work best when combined with proper soffit-to-ridge ventilation and adequate attic insulation (R-38 minimum in Mississippi per IECC 2021).',
  },
  {
    question: 'What are ENERGY STAR shingles and are they worth it in Mississippi?',
    answer: 'ENERGY STAR-certified shingles meet EPA solar reflectance standards — at least 0.25 initial reflectance and 0.15 after 3 years of weathering. In Mississippi, they qualify for potential utility rebates (check Entergy Mississippi and TVA programs) and can reduce roof surface temperatures by 50–60°F versus standard dark shingles. The premium is typically $0.10–0.30/sq ft over standard shingles. Payback period in Mississippi is usually 3–6 years through energy savings alone.',
  },
  {
    question: 'Should I combine solar panels with an energy-efficient roof replacement?',
    answer: 'If you\'re replacing your roof anyway, it\'s the ideal time to plan for solar — install a solar-ready roof (specific attachment points, conduit runs) even if you\'re not installing panels immediately. Mississippi has decent solar production (4.5–5.0 peak sun hours/day) but relatively low utility rates, so solar payback is longer than in California. However, federal ITC (30% tax credit through 2032) and no net metering cap in Mississippi changes the economics significantly. Get both quotes together.',
  },
]

const SOLUTIONS = [
  {
    icon: Sun,
    title: 'Reflective shingles',
    saving: 'up to 15% cooling',
    href: '/blog/energy-star-shingles-mississippi',
    body: 'ENERGY STAR-rated asphalt shingles reflect solar heat instead of absorbing it. Available in most popular colors.',
  },
  {
    icon: Zap,
    title: 'Radiant barriers',
    saving: 'up to 17% cooling',
    href: '/blog/radiant-barrier-mississippi-attic-roof',
    body: 'Foil lining in the attic rafters blocks radiant heat transfer. Best ROI of any single upgrade in Mississippi.',
  },
  {
    icon: Wind,
    title: 'Attic ventilation',
    saving: 'reduces attic temp 20–30°F',
    href: '/blog/attic-ventilation-mississippi-guide',
    body: 'Proper soffit-to-ridge airflow keeps heat from building up and extends shingle life by years.',
  },
  {
    icon: BarChart3,
    title: 'Cool roof coatings',
    saving: 'up to 20% cooling (flat roofs)',
    href: '/blog/cool-roof-coatings-mississippi-energy-savings',
    body: 'White elastomeric coating on flat or low-slope roofs — reflects up to 85% of solar radiation.',
  },
  {
    icon: Thermometer,
    title: 'Metal roofing',
    saving: 'up to 25% vs. dark asphalt',
    href: '/roofing-materials/metal-roofing',
    body: 'Light-colored metal roofs have the highest solar reflectance and best long-term energy performance.',
  },
  {
    icon: DollarSign,
    title: 'Solar-ready roofing',
    saving: 'prepares for 30% ITC',
    href: '/blog/solar-ready-roofing-mississippi',
    body: 'Install conduit and attachment points during replacement so future solar panels mount without re-roofing.',
  },
]

export default async function EnergyEfficientRoofingPage() {
  const energyPosts = await getPostsByCategory('Energy & Efficiency').catch(() => [])

  const breadcrumbs = [
    { name: 'Home', url: BASE_URL },
    { name: 'Energy-Efficient Roofing', url: `${BASE_URL}/energy-efficient-roofing` },
  ]

  return (
    <div className="min-h-screen bg-gradient-dark">
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema items={FAQ_ITEMS} />

      <SiteHeader />
      <Breadcrumbs items={[{ name: 'Energy-Efficient Roofing', href: '/energy-efficient-roofing' }]} />

      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-[#0c0f14]">
        <div className="absolute inset-0">
          <Image
            src="/images/work/large-residential.webp"
            alt="Energy-efficient roof installation in Mississippi showing light-colored reflective shingles"
            fill
            className="object-cover object-center opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f14] via-[#0c0f14]/80 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c] mb-4">
              Energy-Efficient Roofing · Northeast Mississippi
            </p>
            <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.05] font-bold tracking-tight text-slate-50 font-display mb-6">
              Mississippi summers.<br />
              Cut what you pay to cool your home.
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
              Mississippi homeowners run AC more than almost any state. The right roof — materials, color, ventilation, and attic treatment — is the single biggest lever you have on cooling costs. Here&apos;s what actually works.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Get efficiency estimate
                </Button>
              </Link>
              <a href={getPhoneLink()}>
                <Button variant="outline" size="lg" className="border-slate-600 text-slate-300" leftIcon={<Phone className="h-4 w-4" />}>
                  {getPhoneDisplay()}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mississippi context */}
      <section className="py-14 bg-[#161a23] border-y border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { stat: '6–7 mo', label: 'Cooling season in Mississippi', sub: 'vs. 3–4 months in the Midwest' },
              { stat: '50–60°F', label: 'Roof surface temp reduction', sub: 'from dark to reflective shingles' },
              { stat: '30%', label: 'Federal ITC on solar through 2032', sub: 'Plan solar-ready at replacement time' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-[#141925] p-6">
                <div className="text-4xl font-bold text-[#c9a25c] mb-2">{item.stat}</div>
                <div className="text-sm font-medium text-slate-200 mb-1">{item.label}</div>
                <div className="text-xs text-slate-500">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions grid */}
      <section className="py-20 md:py-28 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-4">What actually works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 font-display mb-12">
            Six proven upgrades for Mississippi homes.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SOLUTIONS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group rounded-2xl border border-slate-800/80 bg-[#141925] p-6 hover:border-[#c9a25c]/30 transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/20 flex items-center justify-center flex-shrink-0">
                    <s.icon className="h-4 w-4 text-[#c9a25c]" />
                  </div>
                  <span className="text-xs text-[#c9a25c] font-mono">{s.saving}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2 group-hover:text-[#c9a25c] transition-colors">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
                <div className="mt-4 text-xs text-[#c9a25c]">Full guide →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog posts */}
      {energyPosts.length > 0 && (
        <section className="py-20 md:py-28 bg-[#161a23] border-t border-slate-800">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-3">Energy & efficiency guides</p>
                <h2 className="text-3xl font-bold text-slate-50">Every efficiency topic, in depth.</h2>
              </div>
              <Link href="/blog" className="text-sm text-[#c9a25c] hover:text-[#e6c588] transition-colors hidden sm:flex items-center gap-1">
                All articles <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {energyPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl border border-slate-800/80 bg-[#141925] p-6 hover:border-[#c9a25c]/30 transition-all hover:-translate-y-0.5"
                >
                  <div className="text-xs font-medium text-[#c9a25c] mb-3 uppercase tracking-wider">
                    {post.readTime} min read
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 leading-snug mb-3 group-hover:text-[#c9a25c] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-[#c9a25c]">
                    Read guide <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-[#0c0f14] border-t border-slate-900">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-4">Common questions</p>
          <h2 className="text-3xl font-bold text-slate-50 mb-10">Energy efficiency FAQ</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-[#141925] p-6">
                <h3 className="text-base font-semibold text-slate-100 mb-3">{faq.question}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-links */}
      <section className="py-12 bg-[#161a23] border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { href: '/roofing-materials/metal-roofing', label: 'Metal roofing guide', desc: 'Most energy-efficient material available' },
              { href: '/roofing-materials/asphalt-shingles', label: 'Asphalt shingle options', desc: 'ENERGY STAR and impact-resistant options' },
              { href: '/roof-maintenance', label: 'Roof maintenance', desc: 'Keep ventilation and efficiency working' },
              { href: '/services/roof-inspection', label: 'Efficiency inspection', desc: 'Assess ventilation and insulation gaps' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-slate-800 bg-[#141925] p-4 hover:border-[#c9a25c]/40 transition-colors group"
              >
                <div className="text-sm font-semibold text-[#c9a25c] mb-1 group-hover:text-[#e6c588] transition-colors">
                  {link.label} →
                </div>
                <div className="text-xs text-slate-500">{link.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-[#161a23] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Zap className="h-8 w-8 text-[#c9a25c] mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
            Know what your new roof will cost to cool.
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Get a material-specific estimate that factors in energy performance — not just upfront price.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                variant="primary"
                size="xl"
                className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Get free estimate
              </Button>
            </Link>
            <a href={getPhoneLink()}>
              <Button variant="outline" size="xl" className="border-slate-600 text-slate-300" leftIcon={<Phone className="h-5 w-5" />}>
                Call {getPhoneDisplay()}
              </Button>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
