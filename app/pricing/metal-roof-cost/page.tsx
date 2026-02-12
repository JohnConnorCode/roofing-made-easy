import { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { FAQAccordion } from '@/components/faq/faq-accordion'
import { CTASection } from '@/components/shared/cta-section'
import { FAQSchema } from '@/components/seo/json-ld'
import {
  ArrowRight,
  CheckCircle,
  DollarSign,
  Shield,
  Zap,
  Thermometer,
  Clock,
  Home,
  TrendingUp,
  Scale,
} from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

const FAQ_ITEMS = [
  {
    question: 'How much does a metal roof cost compared to shingles?',
    answer:
      'A metal roof typically costs $8-14 per square foot installed, while asphalt shingles cost $4-7 per square foot. For a 2,000 sq ft Mississippi home, that translates to roughly $16,000-$28,000 for metal versus $8,000-$14,000 for shingles. However, metal roofs last 2-3 times longer and offer significant savings on energy bills, insurance premiums, and maintenance over their lifetime, often making them the more affordable choice over 30 years.',
  },
  {
    question: 'Is a metal roof worth the extra cost?',
    answer:
      'For most Mississippi homeowners, yes. The higher upfront cost is offset by a 40-60 year lifespan (vs. 15-20 years for shingles), energy savings of $150-$300 per year on cooling, insurance discounts of 10-35%, virtually zero maintenance costs, and increased home value of 1-6%. Over a 30-year period, a metal roof can save $15,000-$25,000 compared to replacing asphalt shingles twice.',
  },
  {
    question: 'How long does a metal roof last in Mississippi?',
    answer:
      'Metal roofs in Mississippi typically last 40-60 years depending on the material and installation quality. Standing seam metal roofs can last 50-60+ years, while metal shingles and corrugated panels typically last 30-50 years. Mississippi\'s hot, humid climate is actually well-suited for metal roofing because metal resists moisture damage, algae growth, and heat degradation better than asphalt shingles.',
  },
  {
    question: 'Do metal roofs make noise when it rains?',
    answer:
      'Modern metal roof installations are no louder than asphalt shingles during rain. The key is proper installation with solid sheathing (plywood or OSB decking) and quality underlayment beneath the metal panels. These layers act as sound barriers. In fact, many Mississippi homeowners report they cannot tell the difference in noise levels between their metal roof and their previous shingle roof.',
  },
  {
    question: 'Can you put a metal roof over shingles?',
    answer:
      'In many cases, yes. Installing a metal roof over existing shingles is allowed by most Mississippi building codes as long as there is only one existing layer of shingles and the roof decking is in good condition. This approach saves $1,000-$3,000 in tear-off and disposal costs. However, a professional inspection is recommended to ensure the existing structure can support the additional weight and that there are no hidden moisture issues.',
  },
  {
    question: 'Do metal roofs increase home value?',
    answer:
      'Yes. Studies consistently show metal roofs increase home value by 1-6%, with an average resale value increase of about $35,000-$45,000 on a mid-range home. In Mississippi specifically, metal roofs are increasingly desirable because buyers recognize the energy savings, storm protection, and low maintenance benefits. Homes with metal roofs also tend to sell faster in the Mississippi market.',
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Metal Roof Cost in Mississippi (2026) | Pricing Guide'
  const description =
    'How much does a metal roof cost in Mississippi? Standing seam $10-14/sq ft, metal shingles $8-12/sq ft, corrugated panels $6-9/sq ft. Compare metal vs asphalt costs, energy savings, and insurance discounts. Get your free estimate in 60 seconds.'
  const url = `${BASE_URL}/pricing/metal-roof-cost`
  const ogImageUrl = `${BASE_URL}/api/og?type=service&title=${encodeURIComponent('Metal Roof Cost')}&subtitle=${encodeURIComponent('2026 Mississippi Pricing Guide')}`

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
    },
    keywords: [
      'metal roof cost',
      'metal roof cost Mississippi',
      'how much does a metal roof cost',
      'standing seam metal roof cost',
      'metal roof price per square foot',
      'metal vs shingle roof cost',
      'metal roof installation cost',
      'metal roof cost calculator',
      'metal roofing prices Mississippi',
      'metal roof replacement cost',
      'corrugated metal roof cost',
      'metal shingle roof cost',
      'metal roof energy savings',
      'metal roof insurance discount Mississippi',
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: 'Smart Roof Pricing',
      locale: 'en_US',
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Metal Roof Cost in Mississippi - 2026 Pricing Guide',
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@smartroofpricing',
      site: '@smartroofpricing',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default function MetalRoofCostPage() {
  return (
    <div className="min-h-screen bg-[#0c0f14]">
      {/* FAQ Schema */}
      <FAQSchema items={FAQ_ITEMS} />

      <SiteHeader />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { name: 'Pricing Guide', href: '/pricing' },
          { name: 'Metal Roof Cost', href: '/pricing/metal-roof-cost' },
        ]}
      />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-4xl">
            <p className="text-[#c9a25c] font-semibold text-sm uppercase tracking-wide mb-4">
              2026 Mississippi Pricing Guide
            </p>
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl lg:text-6xl leading-tight">
              How Much Does a Metal Roof Cost in Mississippi?
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed max-w-3xl">
              The typical Mississippi homeowner pays between{' '}
              <span className="text-slate-100 font-semibold">$12,000 and $28,000</span>{' '}
              for a metal roof installation on an average-sized home. Actual cost depends on
              metal type, roof size, and complexity. Here is what to expect in 2026.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#c9a25c] hover:bg-[#b5893a] text-[#0c0f14] font-semibold px-8 py-4 rounded-lg transition-all"
              >
                Get Your Free Estimate
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Quick price summary cards */}
            <div className="mt-12 grid sm:grid-cols-3 gap-4">
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
                <p className="text-sm text-slate-400 mb-1">Standing Seam</p>
                <p className="text-2xl font-bold text-slate-100">$10-14<span className="text-sm font-normal text-slate-400">/sq ft</span></p>
              </div>
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
                <p className="text-sm text-slate-400 mb-1">Metal Shingles</p>
                <p className="text-2xl font-bold text-slate-100">$8-12<span className="text-sm font-normal text-slate-400">/sq ft</span></p>
              </div>
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
                <p className="text-sm text-slate-400 mb-1">Corrugated Panels</p>
                <p className="text-2xl font-bold text-slate-100">$6-9<span className="text-sm font-normal text-slate-400">/sq ft</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metal Roof Types & Pricing */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Metal Roof Types &amp; Pricing Breakdown
          </h2>
          <p className="text-slate-400 mb-12 max-w-3xl">
            Not all metal roofs are created equal. The three main types vary significantly in price,
            appearance, and performance. Here is how they compare for Mississippi homes.
          </p>

          <div className="space-y-8">
            {/* Standing Seam */}
            <div className="bg-[#161a23] border border-slate-700 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#c9a25c]/20 border border-[#c9a25c]/30 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#c9a25c]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">Standing Seam Metal</h3>
                      <p className="text-[#c9a25c] font-semibold">$10-14 per sq ft installed</p>
                    </div>
                  </div>
                  <p className="text-slate-300 mb-6">
                    Standing seam is the premium metal roofing option and the most popular choice among
                    Mississippi homeowners looking for long-term value. The raised seams interlock to create
                    a watertight barrier that conceals all fasteners from the elements.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Concealed fasteners for a sleek, modern look</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Best wind resistance (140+ mph rated)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Longest lifespan: 40-60 years</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">No exposed screws to loosen or leak</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Best energy efficiency with cool-metal coatings</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Highest resale value of all metal types</span>
                    </div>
                  </div>
                </div>
                <div className="md:w-48 bg-[#0c0f14] border border-slate-700 rounded-xl p-5 text-center flex-shrink-0">
                  <p className="text-sm text-slate-400 mb-1">Typical Home Cost</p>
                  <p className="text-2xl font-bold text-slate-100">$20K-$28K</p>
                  <p className="text-xs text-slate-400 mt-1">2,000 sq ft home</p>
                </div>
              </div>
            </div>

            {/* Metal Shingles */}
            <div className="bg-[#161a23] border border-slate-700 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#c9a25c]/20 border border-[#c9a25c]/30 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-[#c9a25c]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">Metal Shingles &amp; Tiles</h3>
                      <p className="text-[#c9a25c] font-semibold">$8-12 per sq ft installed</p>
                    </div>
                  </div>
                  <p className="text-slate-300 mb-6">
                    Metal shingles are designed to look like traditional roofing materials -- slate, wood shake,
                    or clay tile -- while delivering the durability and longevity of metal. They are an excellent
                    middle-ground option for homeowners who want metal performance without the industrial look.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Mimics traditional shingle/slate/shake appearance</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">HOA-friendly design options</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">35-50 year lifespan</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Wide range of colors and profiles</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Easier to repair individual shingles</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Good wind resistance (110+ mph rated)</span>
                    </div>
                  </div>
                </div>
                <div className="md:w-48 bg-[#0c0f14] border border-slate-700 rounded-xl p-5 text-center flex-shrink-0">
                  <p className="text-sm text-slate-400 mb-1">Typical Home Cost</p>
                  <p className="text-2xl font-bold text-slate-100">$16K-$24K</p>
                  <p className="text-xs text-slate-400 mt-1">2,000 sq ft home</p>
                </div>
              </div>
            </div>

            {/* Corrugated Panels */}
            <div className="bg-[#161a23] border border-slate-700 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#c9a25c]/20 border border-[#c9a25c]/30 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-[#c9a25c]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">Corrugated &amp; Ribbed Panels</h3>
                      <p className="text-[#c9a25c] font-semibold">$6-9 per sq ft installed</p>
                    </div>
                  </div>
                  <p className="text-slate-300 mb-6">
                    Corrugated and ribbed metal panels are the most affordable metal roofing option. Popular
                    across rural Mississippi for their straightforward installation and honest durability, they
                    have become increasingly popular on modern farmhouse-style homes statewide.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Most affordable metal roofing option</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Agricultural and farmhouse aesthetic</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">30-45 year lifespan</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Fast installation reduces labor costs</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Lightweight -- works on most structures</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">Easy to install over existing roofing</span>
                    </div>
                  </div>
                </div>
                <div className="md:w-48 bg-[#0c0f14] border border-slate-700 rounded-xl p-5 text-center flex-shrink-0">
                  <p className="text-sm text-slate-400 mb-1">Typical Home Cost</p>
                  <p className="text-2xl font-bold text-slate-100">$12K-$18K</p>
                  <p className="text-xs text-slate-400 mt-1">2,000 sq ft home</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metal vs Asphalt: 30-Year Cost Comparison */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Metal vs Asphalt Shingles: 30-Year Cost Comparison
          </h2>
          <p className="text-slate-400 mb-12 max-w-3xl">
            The sticker price of a metal roof is higher, but the total cost of ownership over 30 years
            tells a completely different story. Here is a side-by-side comparison for a typical 2,000 sq ft
            Mississippi home.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Asphalt Column */}
            <div className="bg-[#0c0f14] border border-slate-700 rounded-2xl overflow-hidden">
              <div className="bg-slate-700/50 px-8 py-5">
                <h3 className="text-xl font-bold text-slate-100">Asphalt Shingles</h3>
                <p className="text-slate-400 text-sm">30-year total cost of ownership</p>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-slate-300">Initial installation</span>
                  <span className="text-slate-100 font-semibold">$12,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <div>
                    <span className="text-slate-300">Replacement at year 18</span>
                    <p className="text-xs text-slate-400">Shingles last 15-20 years in MS heat</p>
                  </div>
                  <span className="text-slate-100 font-semibold">$14,400</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <div>
                    <span className="text-slate-300">Maintenance &amp; repairs</span>
                    <p className="text-xs text-slate-400">Storm damage, granule loss, leaks</p>
                  </div>
                  <span className="text-slate-100 font-semibold">$3,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <div>
                    <span className="text-slate-300">Extra cooling costs</span>
                    <p className="text-xs text-slate-400">Asphalt absorbs and radiates heat</p>
                  </div>
                  <span className="text-slate-100 font-semibold">$6,000</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-lg font-bold text-slate-100">30-Year Total</span>
                  <span className="text-2xl font-bold text-red-400">~$35,400</span>
                </div>
              </div>
            </div>

            {/* Metal Column */}
            <div className="bg-[#0c0f14] border border-[#c9a25c]/30 rounded-2xl overflow-hidden relative">
              <div className="absolute top-4 right-4 bg-[#c9a25c] text-[#0c0f14] text-xs font-bold px-3 py-1 rounded-full">
                SAVES $25,900
              </div>
              <div className="bg-[#c9a25c]/20 px-8 py-5">
                <h3 className="text-xl font-bold text-slate-100">Standing Seam Metal</h3>
                <p className="text-[#c9a25c] text-sm">30-year total cost of ownership</p>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-slate-300">Initial installation</span>
                  <span className="text-slate-100 font-semibold">$22,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <div>
                    <span className="text-slate-300">Replacement</span>
                    <p className="text-xs text-slate-400">Not needed -- lasts 40-60 years</p>
                  </div>
                  <span className="text-[#3d7a5a] font-semibold">$0</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <div>
                    <span className="text-slate-300">Maintenance &amp; repairs</span>
                    <p className="text-xs text-slate-400">Minimal -- no granules, no rot</p>
                  </div>
                  <span className="text-slate-100 font-semibold">$1,500</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <div>
                    <span className="text-slate-300">Energy savings (30 years)</span>
                    <p className="text-xs text-slate-400">Reflects heat, lowers AC bills</p>
                  </div>
                  <span className="text-[#3d7a5a] font-semibold">-$8,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <div>
                    <span className="text-slate-300">Insurance savings (30 years)</span>
                    <p className="text-xs text-slate-400">10-35% premium reduction</p>
                  </div>
                  <span className="text-[#3d7a5a] font-semibold">-$6,000</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-lg font-bold text-slate-100">30-Year Total</span>
                  <span className="text-2xl font-bold text-[#3d7a5a]">~$9,500</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-[#1a1f2e] border border-[#c9a25c]/20 rounded-xl p-6 text-center">
            <p className="text-slate-300">
              <span className="text-[#c9a25c] font-bold">Bottom line:</span>{' '}
              A metal roof costs roughly $10,000 more upfront but saves approximately{' '}
              <span className="text-slate-100 font-semibold">$25,900 over 30 years</span>{' '}
              compared to asphalt shingles when you factor in replacements, energy bills, insurance,
              and maintenance.
            </p>
          </div>
        </div>
      </section>

      {/* Mississippi Climate Advantages */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Why Metal Roofs Are Ideal for Mississippi&apos;s Climate
          </h2>
          <p className="text-slate-400 mb-12 max-w-3xl">
            Mississippi&apos;s combination of extreme heat, high humidity, and severe storm activity makes
            metal roofing an especially smart investment. Here is why metal outperforms every other
            roofing material in our state.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#161a23] border border-slate-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-[#c9a25c]/20 border border-[#c9a25c]/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#c9a25c]" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">
                Superior Storm Resistance
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Mississippi sits in Dixie Alley, the southern tornado corridor. Metal roofs are rated for
                140+ mph winds and resist impact damage from hail far better than asphalt shingles. After
                severe storms, metal roofs are often the only ones in the neighborhood still intact.
              </p>
            </div>

            <div className="bg-[#161a23] border border-slate-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-[#c9a25c]/20 border border-[#c9a25c]/30 rounded-lg flex items-center justify-center mb-4">
                <Thermometer className="w-6 h-6 text-[#c9a25c]" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">
                Reflects Heat, Cuts AC Bills
              </h3>
              <p className="text-slate-400 leading-relaxed">
                With Mississippi summers regularly hitting 95+ degrees, metal&apos;s reflective surface reduces
                cooling costs by 10-25%. Cool-metal coatings bounce solar energy away from your home instead
                of absorbing it the way dark asphalt shingles do.
              </p>
            </div>

            <div className="bg-[#161a23] border border-slate-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-[#c9a25c]/20 border border-[#c9a25c]/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#c9a25c]" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">
                Resists Humidity Damage
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Mississippi&apos;s high humidity causes algae, moss, and rot on traditional roofing. Metal
                is completely immune to these issues. No black streaks, no wood rot, no moisture-related
                degradation -- even after decades of Mississippi humidity.
              </p>
            </div>

            <div className="bg-[#161a23] border border-slate-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-[#c9a25c]/20 border border-[#c9a25c]/30 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#c9a25c]" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">
                Handles Temperature Extremes
              </h3>
              <p className="text-slate-400 leading-relaxed">
                From 100-degree summers to occasional winter ice, metal expands and contracts without
                cracking, curling, or losing adhesion. Asphalt shingles in Mississippi often deteriorate
                faster than their rated lifespan due to thermal cycling.
              </p>
            </div>

            <div className="bg-[#161a23] border border-slate-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-[#c9a25c]/20 border border-[#c9a25c]/30 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-[#c9a25c]" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">
                Insurance Discounts
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Many Mississippi insurance companies offer premium discounts of 10-35% for metal roofs.
                Given Mississippi&apos;s high homeowner&apos;s insurance rates due to storm risk, this
                discount alone can save hundreds of dollars every year.
              </p>
            </div>

            <div className="bg-[#161a23] border border-slate-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-[#c9a25c]/20 border border-[#c9a25c]/30 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-[#c9a25c]" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">
                Decades Less Maintenance
              </h3>
              <p className="text-slate-400 leading-relaxed">
                While asphalt shingles need regular inspections, patching, and eventual replacement every
                15-20 years, a properly installed metal roof requires almost no maintenance for its entire
                40-60 year lifespan. That means fewer contractor visits and no surprise repair bills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Energy Savings & Insurance Discounts */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Energy Savings &amp; Insurance Discounts in Mississippi
          </h2>
          <p className="text-slate-400 mb-12 max-w-3xl">
            Beyond the roof itself, metal delivers ongoing financial benefits that make the
            cost difference disappear faster than you might expect.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-[#0c0f14] border border-slate-700 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-[#c9a25c]/20 border border-[#c9a25c]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Thermometer className="w-7 h-7 text-[#c9a25c]" />
              </div>
              <p className="text-3xl font-bold text-slate-100 mb-2">$150-$300</p>
              <p className="text-slate-400 text-sm">Annual cooling savings</p>
              <p className="text-slate-300 text-sm mt-3">
                Metal reflects solar radiation instead of absorbing it, reducing the load on your
                AC system during Mississippi&apos;s 5+ months of intense heat.
              </p>
            </div>

            <div className="bg-[#0c0f14] border border-slate-700 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-[#c9a25c]/20 border border-[#c9a25c]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-[#c9a25c]" />
              </div>
              <p className="text-3xl font-bold text-slate-100 mb-2">$100-$400</p>
              <p className="text-slate-400 text-sm">Annual insurance savings</p>
              <p className="text-slate-300 text-sm mt-3">
                Many Mississippi insurers reduce premiums 10-35% for impact-resistant metal roofs.
                With Mississippi&apos;s high insurance rates, this adds up quickly.
              </p>
            </div>

            <div className="bg-[#0c0f14] border border-[#c9a25c]/30 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-[#c9a25c]/20 border border-[#c9a25c]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale className="w-7 h-7 text-[#c9a25c]" />
              </div>
              <p className="text-3xl font-bold text-[#c9a25c] mb-2">$250-$700</p>
              <p className="text-slate-400 text-sm">Combined annual savings</p>
              <p className="text-slate-300 text-sm mt-3">
                At $250-$700 per year in combined savings, the $10,000 cost difference between metal
                and asphalt pays for itself in <span className="text-slate-100 font-semibold">10-15 years</span>.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#c9a25c]/20 to-[#c9a25c]/5 border border-[#c9a25c]/30 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-[#c9a25c] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">
                  The Break-Even Math
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  A metal roof costs roughly $10,000 more than asphalt shingles upfront. With combined
                  annual savings of $250-$700, the metal roof pays for that difference in 10-15 years.
                  After that, you are saving money every single year -- and your roof still has 25-45 years
                  of life remaining. Meanwhile, the asphalt homeowner is paying for their second roof.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metal Roof Cost Factors */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Factors That Affect Metal Roof Cost
          </h2>
          <p className="text-slate-400 mb-12 max-w-3xl">
            No two metal roof installations cost the same. These are the main factors that
            determine where your project falls within the price range.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#161a23] border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-3">Roof Size &amp; Complexity</h3>
              <p className="text-slate-400 leading-relaxed">
                Larger roofs cost more in materials but less per square foot due to economies of scale.
                Complex roof lines with multiple valleys, dormers, and penetrations (vents, skylights,
                chimneys) add 15-30% to the total cost due to additional labor and flashing.
              </p>
            </div>

            <div className="bg-[#161a23] border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-3">Metal Type &amp; Gauge</h3>
              <p className="text-slate-400 leading-relaxed">
                Galvalume steel is the most affordable, followed by aluminum, then copper and zinc.
                Thicker gauges (24-gauge vs 29-gauge) cost more but resist denting and last longer.
                For Mississippi storm country, we recommend 26-gauge or thicker.
              </p>
            </div>

            <div className="bg-[#161a23] border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-3">Panel Profile</h3>
              <p className="text-slate-400 leading-relaxed">
                Standing seam (concealed fastener) costs 30-50% more than exposed fastener panels.
                The premium is worth it for homes -- concealed fasteners eliminate leak points and
                last significantly longer without maintenance.
              </p>
            </div>

            <div className="bg-[#161a23] border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-3">Underlayment Quality</h3>
              <p className="text-slate-400 leading-relaxed">
                High-temperature synthetic underlayment is essential under metal in Mississippi&apos;s
                heat. Premium underlayment costs $500-$1,500 more than basic felt paper but prevents
                moisture issues and extends the roof system&apos;s lifespan.
              </p>
            </div>

            <div className="bg-[#161a23] border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-3">Existing Roof Removal</h3>
              <p className="text-slate-400 leading-relaxed">
                Tear-off of existing shingles adds $1,000-$3,000 to the project. While metal can
                sometimes be installed over one layer of shingles, a complete tear-off allows inspection
                of the roof deck and ensures the longest-lasting installation.
              </p>
            </div>

            <div className="bg-[#161a23] border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-3">Installation Expertise</h3>
              <p className="text-slate-400 leading-relaxed">
                Metal roofing requires specialized skills different from shingle installation. Experienced
                metal roofers charge more per hour but deliver proper installation that prevents oil
                canning, thermal bridging, and fastener issues that plague DIY and novice installations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Links Section */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            More Roofing Cost Resources
          </h2>
          <p className="text-slate-400 mb-8 max-w-3xl">
            Explore our other pricing guides and resources to make an informed roofing decision.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/pricing/roof-replacement-cost"
              className="group bg-[#1a1f2e] border border-slate-700 hover:border-[#c9a25c]/50 rounded-xl p-6 transition-colors"
            >
              <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-[#c9a25c] transition-colors">
                Roof Replacement Cost Guide
              </h3>
              <p className="text-sm text-slate-400">
                Complete breakdown of roof replacement costs in Mississippi for all materials.
              </p>
            </Link>

            <Link
              href="/pricing/roof-repair-cost"
              className="group bg-[#1a1f2e] border border-slate-700 hover:border-[#c9a25c]/50 rounded-xl p-6 transition-colors"
            >
              <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-[#c9a25c] transition-colors">
                Roof Repair Cost Guide
              </h3>
              <p className="text-sm text-slate-400">
                Typical repair costs for leaks, storm damage, flashing, and more.
              </p>
            </Link>

            <Link
              href="/pricing"
              className="group bg-[#1a1f2e] border border-slate-700 hover:border-[#c9a25c]/50 rounded-xl p-6 transition-colors"
            >
              <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-[#c9a25c] transition-colors">
                Full Pricing Guide
              </h3>
              <p className="text-sm text-slate-400">
                Overview of all roofing costs including materials, labor, and project types.
              </p>
            </Link>

            <Link
              href="/services/roof-replacement"
              className="group bg-[#1a1f2e] border border-slate-700 hover:border-[#c9a25c]/50 rounded-xl p-6 transition-colors"
            >
              <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-[#c9a25c] transition-colors">
                Roof Replacement Service
              </h3>
              <p className="text-sm text-slate-400">
                Learn about our professional roof replacement process and what to expect.
              </p>
            </Link>

            <Link
              href="/blog/asphalt-vs-metal-roofing"
              className="group bg-[#1a1f2e] border border-slate-700 hover:border-[#c9a25c]/50 rounded-xl p-6 transition-colors"
            >
              <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-[#c9a25c] transition-colors">
                Asphalt vs Metal Roofing
              </h3>
              <p className="text-sm text-slate-400">
                In-depth comparison of asphalt shingles and metal roofing for Mississippi homes.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-bold text-slate-100 mb-4 text-center">
            Frequently Asked Questions About Metal Roof Cost
          </h2>
          <p className="text-slate-400 mb-10 text-center max-w-2xl mx-auto">
            Get answers to the most common questions Mississippi homeowners ask about
            metal roofing costs, installation, and value.
          </p>

          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Get Your Metal Roof Price in 60 Seconds"
        description="Answer a few quick questions about your home and get an instant metal roof estimate. No contractors calling, no pressure -- just honest pricing."
        primaryLabel="Get Free Metal Roof Estimate"
        primaryHref="/"
      />

      <SiteFooter />
    </div>
  )
}
