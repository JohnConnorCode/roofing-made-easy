import { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { FAQAccordion } from '@/components/faq/faq-accordion'
import { CTASection } from '@/components/shared/cta-section'
import {
  CheckCircle,
  ArrowRight,
  DollarSign,
  Home,
  Shield,
  Calendar,
  TrendingDown,
  AlertTriangle,
  Ruler,
  Layers,
  CloudRain,
} from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Roof Replacement Cost in Mississippi (2026) | Price Guide'
  const description =
    'How much does a roof replacement cost in Mississippi? Average costs range from $8,000 to $25,000 depending on size, material, and complexity. Get detailed pricing by material type, roof size, and factors that affect your total cost.'
  const url = `${BASE_URL}/pricing/roof-replacement-cost`
  const ogImageUrl = `${BASE_URL}/api/og?type=service&title=${encodeURIComponent('Roof Replacement Cost')}&subtitle=${encodeURIComponent('2026 Mississippi Price Guide')}`

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
    },
    keywords: [
      'roof replacement cost',
      'roof replacement cost Mississippi',
      'how much does a roof replacement cost',
      'cost to replace a roof',
      'new roof cost',
      'roof replacement price',
      'average roof replacement cost',
      'roof replacement cost per square foot',
      'residential roof replacement',
      'asphalt shingle roof cost',
      'metal roof replacement cost',
      'roof replacement estimate',
      'Mississippi roofing prices',
      'roof replacement 2026',
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
          alt: 'Roof Replacement Cost Guide - Mississippi 2026',
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

const faqItems = [
  {
    question: 'How much does it cost to replace a roof on a 2,000 sq ft house?',
    answer:
      'For a 2,000 square foot home in Mississippi, roof replacement typically costs between $8,000 and $28,000. The wide range depends primarily on your choice of material. Standard architectural shingles run $8,000 to $12,000, while standing seam metal roofing can reach $20,000 to $28,000. Most Mississippi homeowners choosing architectural shingles pay between $9,000 and $11,000 for a straightforward replacement with tear-off included.',
  },
  {
    question: 'How long does a roof replacement take?',
    answer:
      'Most residential roof replacements in Mississippi take 1 to 3 days for a standard asphalt shingle roof. Metal roof installations typically take 3 to 5 days. Factors that can extend the timeline include severe weather delays, complex roof geometry with many valleys and dormers, structural repairs discovered during tear-off, and the need for full deck replacement. Your contractor should provide a timeline estimate specific to your project before work begins.',
  },
  {
    question: 'Does homeowners insurance cover roof replacement?',
    answer:
      'Homeowners insurance typically covers roof replacement when the damage is caused by a covered peril such as hail, wind, falling trees, or fire. It generally does not cover replacement due to normal wear and aging. In Mississippi, where severe storms and hurricanes are common, many roof replacements qualify for insurance coverage. File your claim promptly after storm damage, document everything with photos, and consider having your contractor present during the adjuster inspection to ensure all damage is identified.',
  },
  {
    question: 'Should I repair or replace my roof?',
    answer:
      'Consider replacement if your roof is more than 15-20 years old (for asphalt shingles), has damage covering more than 30% of the surface, shows signs of structural sagging, or has recurring leaks in multiple areas. Repairs make more sense for localized damage on a newer roof, isolated missing shingles after a storm, or minor flashing issues. A good rule of thumb: if repair costs exceed 50% of replacement cost, replacement is the better investment.',
  },
  {
    question: 'What is the best roofing material for Mississippi?',
    answer:
      'Architectural shingles are the most popular choice in Mississippi, offering the best balance of cost, durability, and weather resistance. They handle Mississippi\'s heat, humidity, and severe storms well, with wind ratings up to 130 mph. For homeowners seeking maximum longevity, standing seam metal roofing is an excellent choice that withstands hurricane-force winds and lasts 40-60 years, though it costs roughly twice as much upfront. Metal shingles offer a middle ground with traditional aesthetics and superior storm performance.',
  },
  {
    question: 'Can I finance my roof replacement?',
    answer:
      'Yes, most roofing contractors in Mississippi offer financing options. Common choices include contractor-arranged financing with terms from 12 to 84 months, home equity loans or HELOCs from your bank, personal loans, and credit cards for smaller projects. Some contractors offer promotional 0% interest periods. If your replacement is due to storm damage, your insurance payout can significantly reduce the amount you need to finance. Always compare APR rates and total cost of financing before committing.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

const materialData = [
  {
    material: '3-Tab Asphalt',
    costPerSqFt: '$3-4',
    totalCost: '$6,000-$8,000',
    lifespan: '12-15 yrs',
    value: 'Budget-friendly',
  },
  {
    material: 'Architectural Shingles',
    costPerSqFt: '$4-6',
    totalCost: '$8,000-$12,000',
    lifespan: '18-22 yrs',
    value: 'Best value',
    highlight: true,
  },
  {
    material: 'Premium Shingles',
    costPerSqFt: '$6-8',
    totalCost: '$12,000-$16,000',
    lifespan: '20-25 yrs',
    value: 'Curb appeal',
  },
  {
    material: 'Standing Seam Metal',
    costPerSqFt: '$10-14',
    totalCost: '$20,000-$28,000',
    lifespan: '40-60 yrs',
    value: 'Lowest lifecycle cost',
  },
  {
    material: 'Metal Shingles',
    costPerSqFt: '$8-12',
    totalCost: '$16,000-$24,000',
    lifespan: '35-50 yrs',
    value: 'Traditional look',
  },
  {
    material: 'Corrugated Metal',
    costPerSqFt: '$6-9',
    totalCost: '$12,000-$18,000',
    lifespan: '30-45 yrs',
    value: 'Rural/value',
  },
]

const sizeData = [
  { size: '1,000 sq ft', range: '$4,000-$14,000' },
  { size: '1,500 sq ft', range: '$6,000-$21,000' },
  { size: '2,000 sq ft', range: '$8,000-$28,000' },
  { size: '2,500 sq ft', range: '$10,000-$35,000' },
  { size: '3,000 sq ft', range: '$12,000-$42,000' },
]

const costFactors = [
  {
    icon: TrendingDown,
    title: 'Roof Pitch',
    description:
      'Low-slope roofs (4/12 or less) are the easiest and cheapest to work on. Moderate pitch (5/12 to 8/12) adds 10-15% to labor costs due to safety equipment needs. Steep roofs (9/12 and above) can add 25-50% to labor costs because crews need specialized harnesses, scaffolding, and work at a significantly slower pace.',
  },
  {
    icon: Home,
    title: 'Number of Stories',
    description:
      'Single-story homes are the most affordable to re-roof because materials can be staged at ground level. Two-story homes add $500-$1,500 to the total due to increased lift requirements and safety considerations. Three-story or split-level homes cost even more, sometimes adding 20-30% to the base labor rate.',
  },
  {
    icon: Layers,
    title: 'Roof Complexity',
    description:
      'A simple gable roof costs less than a complex roof with multiple valleys, dormers, skylights, and chimneys. Each valley adds $200-$500 for proper flashing. Skylights require $150-$400 each for new flashing kits. Chimneys need $200-$600 for step and counter flashing. The more penetrations and angles your roof has, the higher the labor and material costs.',
  },
  {
    icon: Ruler,
    title: 'Tear-Off Requirements',
    description:
      'If your existing roof has a single layer of shingles, tear-off typically adds $1-2 per square foot. Multiple layers (some older homes have 2-3 layers) cost $2-4 per square foot to remove and dispose of. Mississippi building code allows a maximum of two layers, but most contractors recommend tearing down to the deck for the best results and warranty coverage.',
  },
  {
    icon: AlertTriangle,
    title: 'Deck Repair',
    description:
      'Once old shingles are removed, the plywood or OSB decking underneath may need repair or replacement. Minor repairs cost $1-3 per square foot. In Mississippi, humidity and storm damage can cause hidden rot that is only visible after tear-off. Budget an additional $500-$2,000 for potential deck work, though many roofs need little to no repair.',
  },
  {
    icon: Shield,
    title: 'Permits and Inspection',
    description:
      'Most Mississippi municipalities require a building permit for roof replacement, typically costing $100-$500 depending on your county. Some areas also require a post-installation inspection. Your contractor should handle the permit process, but verify this upfront. Permitted work ensures your replacement meets local building codes and protects your insurance coverage.',
  },
  {
    icon: Calendar,
    title: 'Time of Year',
    description:
      'Roofing demand in Mississippi peaks from late spring through summer, when contractors charge premium rates. Fall (September through November) offers the best combination of fair weather and lower demand, often resulting in 5-15% savings. Winter months can be cheaper still, but Mississippi rain and occasional freezes may delay the project. Avoid scheduling right after major storms when contractors are overwhelmed.',
  },
]

const savingsTips = [
  {
    title: 'Get Multiple Quotes',
    description:
      'Always collect at least three written quotes from licensed, insured contractors. Compare not just price, but warranty terms, material brands, and included services like tear-off and cleanup. The lowest bid is not always the best value if it skips important steps.',
  },
  {
    title: 'Consider Timing',
    description:
      'Schedule your replacement during fall or early winter when demand drops. Contractors often offer 5-15% discounts during their slower months to keep crews busy. Avoid the rush after major storms when prices spike and scheduling becomes difficult.',
  },
  {
    title: 'Check Insurance Coverage',
    description:
      'If your roof has any storm damage, file an insurance claim before paying out of pocket. Mississippi sees frequent hail and wind events. Even older damage that you have not yet claimed may be covered. A qualified roofer can help identify storm damage you might have missed.',
  },
  {
    title: 'Explore Financing Options',
    description:
      'Many contractors offer 0% promotional financing for 12-24 months. Compare these with home equity loans, which often have lower long-term rates. Some Mississippi homeowners use FHA Title I loans specifically designed for home improvements, with terms up to 20 years.',
  },
  {
    title: 'Match Materials to Your Plans',
    description:
      'If you plan to sell your home within 5 years, premium materials may not deliver a full return. Architectural shingles offer the best resale value relative to cost. Conversely, if you plan to stay long-term, investing in metal roofing can eliminate the need for another replacement in your lifetime.',
  },
]

const relatedPages = [
  {
    href: '/pricing/metal-roof-cost',
    title: 'Metal Roof Cost Guide',
    description: 'Detailed pricing for standing seam, metal shingles, and corrugated metal roofing in Mississippi.',
  },
  {
    href: '/pricing/roof-repair-cost',
    title: 'Roof Repair Cost Guide',
    description: 'Average repair costs for leaks, missing shingles, flashing issues, and storm damage fixes.',
  },
  {
    href: '/pricing',
    title: 'Full Pricing Guide',
    description: 'Complete breakdown of all roofing costs including installation, materials, and labor rates.',
  },
  {
    href: '/services/roof-replacement',
    title: 'Our Replacement Services',
    description: 'Learn about our full roof replacement process, warranties, and what to expect on project day.',
  },
]

export default function RoofReplacementCostPage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <SiteHeader />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { name: 'Pricing Guide', href: '/pricing' },
          { name: 'Roof Replacement Cost', href: '/pricing/roof-replacement-cost' },
        ]}
      />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-100 md:text-5xl lg:text-6xl animate-slide-up">
            How Much Does a Roof Replacement Cost in Mississippi?
          </h1>
          <p className="mt-6 text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto animate-slide-up delay-100">
            The average Mississippi homeowner pays between{' '}
            <span className="text-[#c9a25c] font-semibold">$8,000 and $25,000</span>{' '}
            for a full roof replacement on a typical home. Your actual cost depends on roof size,
            material choice, pitch, complexity, and local labor rates. This guide breaks down
            every factor so you know exactly what to expect.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 justify-center animate-slide-up delay-200">
            <div className="flex items-center gap-2 bg-[#1a1f2e] border border-slate-700 rounded-lg px-5 py-3">
              <DollarSign className="h-5 w-5 text-[#c9a25c]" />
              <span className="text-slate-300 text-sm">Average: $8,000-$25,000</span>
            </div>
            <div className="flex items-center gap-2 bg-[#1a1f2e] border border-slate-700 rounded-lg px-5 py-3">
              <Home className="h-5 w-5 text-[#c9a25c]" />
              <span className="text-slate-300 text-sm">Based on 2,000 sq ft home</span>
            </div>
            <div className="flex items-center gap-2 bg-[#1a1f2e] border border-slate-700 rounded-lg px-5 py-3">
              <Calendar className="h-5 w-5 text-[#c9a25c]" />
              <span className="text-slate-300 text-sm">Updated for 2026</span>
            </div>
          </div>
          <div className="mt-10 animate-slide-up delay-300">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] font-semibold px-8 py-4 rounded-lg transition-all btn-press hover:shadow-lg hover:shadow-[#c9a25c]/20"
            >
              Get Your Exact Price in 60 Seconds
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Cost by Material Type */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Roof Replacement Cost by Material Type
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Material choice is the single biggest factor in your roof replacement cost.
              Here is what each option costs for a typical 2,000 square foot Mississippi home,
              including labor and tear-off.
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#c9a25c]/30">
                  <th className="text-left py-4 px-4 text-[#c9a25c] font-semibold text-sm uppercase tracking-wider">Material</th>
                  <th className="text-left py-4 px-4 text-[#c9a25c] font-semibold text-sm uppercase tracking-wider">Cost / Sq Ft</th>
                  <th className="text-left py-4 px-4 text-[#c9a25c] font-semibold text-sm uppercase tracking-wider">2,000 Sq Ft Home</th>
                  <th className="text-left py-4 px-4 text-[#c9a25c] font-semibold text-sm uppercase tracking-wider">Lifespan</th>
                  <th className="text-left py-4 px-4 text-[#c9a25c] font-semibold text-sm uppercase tracking-wider">ROI / Value</th>
                </tr>
              </thead>
              <tbody>
                {materialData.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-slate-700/50 ${
                      row.highlight
                        ? 'bg-[#c9a25c]/10 border-l-2 border-l-[#c9a25c]'
                        : 'hover:bg-[#1a1f2e]/50'
                    }`}
                  >
                    <td className="py-4 px-4 text-slate-100 font-medium">
                      {row.material}
                      {row.highlight && (
                        <span className="ml-2 text-xs bg-[#c9a25c]/20 text-[#c9a25c] px-2 py-0.5 rounded-full">
                          Most Popular
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300">{row.costPerSqFt}</td>
                    <td className="py-4 px-4 text-slate-100 font-semibold">{row.totalCost}</td>
                    <td className="py-4 px-4 text-slate-300">{row.lifespan}</td>
                    <td className="py-4 px-4 text-slate-400">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {materialData.map((row, i) => (
              <div
                key={i}
                className={`rounded-xl border p-5 ${
                  row.highlight
                    ? 'bg-[#c9a25c]/10 border-[#c9a25c]/30'
                    : 'bg-[#1a1f2e] border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-slate-100 font-semibold">{row.material}</h3>
                  {row.highlight && (
                    <span className="text-xs bg-[#c9a25c]/20 text-[#c9a25c] px-2 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Cost/Sq Ft</span>
                    <p className="text-slate-300 font-medium">{row.costPerSqFt}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">2,000 Sq Ft</span>
                    <p className="text-slate-100 font-semibold">{row.totalCost}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Lifespan</span>
                    <p className="text-slate-300">{row.lifespan}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Value</span>
                    <p className="text-slate-400">{row.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-slate-500 text-center">
            * Prices include materials, labor, tear-off, and disposal. Based on 2026 Mississippi averages.
            Actual costs vary by location, contractor, and project specifics.
          </p>
        </div>
      </section>

      {/* Cost by Roof Size */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Roof Replacement Cost by Home Size
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Your roof size is typically 1.0x to 1.5x your home&apos;s square footage, depending on
              pitch and overhangs. These ranges cover everything from budget asphalt shingles to
              premium metal roofing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {sizeData.map((item, i) => (
              <div
                key={i}
                className={`rounded-xl border text-center p-6 transition-colors ${
                  i === 2
                    ? 'bg-[#c9a25c]/10 border-[#c9a25c]/30'
                    : 'bg-[#1a1f2e] border-slate-700 hover:border-slate-600'
                }`}
              >
                <p className="text-slate-400 text-sm mb-1">Home Size</p>
                <p className="text-slate-100 font-bold text-lg">{item.size}</p>
                <div className="my-3 h-px bg-slate-700" />
                <p className="text-slate-400 text-sm mb-1">Cost Range</p>
                <p className="text-[#c9a25c] font-bold text-lg">{item.range}</p>
                {i === 2 && (
                  <p className="mt-2 text-xs text-[#c9a25c]">Most Common</p>
                )}
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-slate-500 text-center">
            Ranges include all material types from basic 3-tab asphalt to standing seam metal.
            Most Mississippi homeowners with architectural shingles fall in the lower-middle portion of each range.
          </p>
        </div>
      </section>

      {/* Cost Factors */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Cost Factors That Affect Your Price
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Beyond material and size, several factors can push your roof replacement cost
              higher or lower. Understanding these helps you budget accurately and avoid surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {costFactors.map((factor, i) => {
              const Icon = factor.icon
              return (
                <div
                  key={i}
                  className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-lg bg-[#c9a25c]/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#c9a25c]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100 mb-2">
                        {factor.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed text-sm">
                        {factor.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mississippi-Specific Context */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Roof Replacement Pricing in Mississippi
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Mississippi homeowners benefit from lower labor costs than the national average,
              but severe weather requirements can offset some of those savings.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-[#c9a25c]/10 flex items-center justify-center mb-4">
                <DollarSign className="h-5 w-5 text-[#c9a25c]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">
                Lower Than National Average
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Mississippi roofing labor rates run 10-20% below the national average due to
                lower cost of living. Material costs are closer to national prices since most
                manufacturers use standardized distribution pricing. The net result is that a
                roof replacement in Mississippi typically costs 8-15% less than the same project
                in states like Texas, Florida, or Georgia. However, contractors in Mississippi
                must use materials rated for high-wind zones and severe weather, which can
                narrow the gap.
              </p>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-[#c9a25c]/10 flex items-center justify-center mb-4">
                <CloudRain className="h-5 w-5 text-[#c9a25c]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">
                Storm Damage and Insurance
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Mississippi experiences frequent severe weather, including hailstorms,
                tornadoes, and the occasional hurricane. Many roof replacements are partially
                or fully covered by homeowners insurance when storm damage is documented.
                After a major weather event, have your roof inspected promptly and file claims
                within your policy&apos;s timeframe. Insurance adjusters in Mississippi are
                familiar with local storm patterns and typically approve legitimate claims.
                Be aware that some policies have separate wind or hail deductibles, often
                1-2% of your home&apos;s insured value.
              </p>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-[#c9a25c]/10 flex items-center justify-center mb-4">
                <Calendar className="h-5 w-5 text-[#c9a25c]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">
                Best Time to Replace in MS
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Fall is the ideal season for roof replacement in Mississippi, specifically
                September through November. The brutal summer heat (often 95+ degrees) makes
                summer installations harder on crews and can affect shingle adhesion. Spring
                brings unpredictable rain that causes delays. Fall offers moderate temperatures
                in the 60s and 70s, lower humidity, and fewer weather delays. Contractors
                also have more availability after the busy summer season, meaning you may
                secure better pricing and faster scheduling. If you can plan ahead, booking
                your replacement for October often yields the best combination of price,
                weather, and contractor availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Save */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              How to Save on Roof Replacement
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              A roof replacement is a major investment. These strategies can help you reduce
              costs without cutting corners on quality or workmanship.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savingsTips.map((tip, i) => (
              <div
                key={i}
                className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-slate-100">{tip.title}</h3>
                </div>
                <p className="text-slate-400 leading-relaxed text-sm pl-8">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Pages / Internal Links */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              More Roofing Price Guides
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Explore our other detailed pricing guides to compare options and make
              an informed decision about your roofing project.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedPages.map((page, i) => (
              <Link
                key={i}
                href={page.href}
                className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5 hover:border-[#c9a25c]/50 transition-colors group"
              >
                <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-[#c9a25c] transition-colors">
                  {page.title}
                </h3>
                <p className="text-sm text-slate-400 mb-3">{page.description}</p>
                <span className="inline-flex items-center gap-1 text-sm text-[#c9a25c] font-medium">
                  Read guide
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-slate-400">
              Common questions about roof replacement costs in Mississippi.
            </p>
          </div>

          <FAQAccordion items={faqItems} />
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Get Your Exact Replacement Cost in 60 Seconds"
        description="Answer a few quick questions about your roof and get a personalized cost estimate instantly. No phone calls, no pressure, no obligation."
        primaryLabel="Get Free Estimate"
        primaryHref="/"
        showPhone={true}
      />

      <SiteFooter />
    </div>
  )
}
