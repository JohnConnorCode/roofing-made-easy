import { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { FAQAccordion } from '@/components/faq/faq-accordion'
import { CTASection } from '@/components/shared/cta-section'
import { BUSINESS_CONFIG } from '@/lib/config/business'
import {
  ArrowRight,
  CheckCircle,
  DollarSign,
  Home,
  Shield,
  Clock,
  Wrench,
  AlertTriangle,
  Layers,
  Ruler,
  Mountain,
  Building2,
  Hammer,
  CloudRain,
} from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

// ---------------------------------------------------------------------------
// FAQ Data
// ---------------------------------------------------------------------------

const pricingFAQs = [
  {
    question: 'How much does a new roof cost in Mississippi?',
    answer:
      'The average cost of a new roof in Mississippi ranges from $8,000 to $25,000 for a standard residential home. The final price depends on your roof size, material choice, pitch, complexity, and whether a full tear-off is needed. Asphalt shingle roofs tend to fall on the lower end, while standing seam metal roofs cost more upfront but last significantly longer. Our free instant estimate tool can give you a personalized price range in about 60 seconds.',
  },
  {
    question: 'What is the average cost to replace a roof on a 2,000 sq ft house?',
    answer:
      'For a 2,000 square foot home in Mississippi, a full roof replacement typically costs between $10,000 and $18,000 with architectural asphalt shingles, or $18,000 to $28,000 with standing seam metal roofing. These ranges assume a standard gable roof with moderate pitch. Factors like steep slopes, multiple stories, and the number of penetrations (vents, skylights, chimneys) can push the price higher. Keep in mind that your roof area is usually larger than your home\'s square footage due to overhangs and roof pitch.',
  },
  {
    question: 'Are metal roofs more expensive than shingles?',
    answer:
      'Yes, metal roofs have a higher upfront cost -- typically 2 to 3 times more than asphalt shingles. However, metal roofs last 40 to 60 years compared to 15 to 25 years for shingles, require less maintenance, and offer better energy efficiency. When you factor in the longer lifespan, a metal roof often costs less per year of service. Metal roofs also withstand Mississippi\'s severe weather better and may qualify for insurance discounts. Read our detailed comparison in the Metal Roof Cost Guide.',
  },
  {
    question: 'Does insurance cover roof replacement?',
    answer:
      'Homeowner\'s insurance typically covers roof replacement when the damage is caused by a covered peril such as hail, wind, fallen trees, or fire. Normal wear and tear, neglect, and age-related deterioration are generally not covered. In Mississippi, storm damage claims are common due to our severe weather season. If you believe you have storm damage, document it thoroughly with photos and contact your insurance company promptly. We offer free storm damage inspections to help you assess whether filing a claim makes sense.',
  },
  {
    question: 'How can I get an accurate roof price?',
    answer:
      'The most accurate way to get your roof price is to use our free instant estimate tool, which factors in your specific roof size, material preferences, location, and condition. For a detailed quote, we recommend scheduling a free on-site inspection where we measure your roof precisely, assess the decking condition, count penetrations, and evaluate any special requirements. Our estimates include all materials, labor, permits, and cleanup -- no hidden fees.',
  },
  {
    question: 'What time of year is cheapest for roof work?',
    answer:
      'Late fall and winter (November through February) are generally the most affordable times for roof work in Mississippi. Demand is lower during these months, so contractors often offer competitive pricing to keep crews busy. Spring and summer are peak roofing season -- especially after storm season -- when demand drives prices up and wait times increase. If your roof isn\'t an emergency, scheduling during the off-season can save you 10-15% on labor costs.',
  },
]

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export function generateMetadata(): Metadata {
  const title = 'Roofing Prices & Cost Guide | Mississippi 2026'
  const description =
    'How much does a roof cost in Mississippi? Complete 2026 pricing guide for roof replacement, repair, and materials. Compare asphalt shingles vs metal roofing costs per square foot. Get a free instant estimate.'

  return {
    title,
    description,
    keywords: [
      'roof cost',
      'roofing prices',
      'how much does a roof cost',
      'roof replacement cost Mississippi',
      'metal roof cost',
      'shingle roof price',
      'roof repair cost',
      'roofing cost per square foot',
      'new roof cost 2026',
      `${BUSINESS_CONFIG.address.city} roofing prices`,
      `${BUSINESS_CONFIG.address.state} roof cost`,
    ],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/pricing`,
      siteName: BUSINESS_CONFIG.name,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: `${BASE_URL}/api/og?type=service&title=Roofing%20Prices%20%26%20Cost%20Guide&subtitle=Mississippi%202026%20%E2%80%A2%20Materials%20%E2%80%A2%20Services%20%E2%80%A2%20Factors`,
          width: 1200,
          height: 630,
          alt: `${BUSINESS_CONFIG.name} Pricing Guide`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description:
        'Complete Mississippi roofing cost guide for 2026. Compare materials, services, and get a free instant estimate.',
    },
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
    alternates: {
      canonical: `${BASE_URL}/pricing`,
    },
  }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function PricingPage() {
  // Build FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pricingFAQs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <SiteHeader />

      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ name: 'Pricing Guide', href: '/pricing' }]} />

      {/* ================================================================= */}
      {/* Hero Section */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#c9a25c]/10 border border-[#c9a25c]/30 rounded-full px-4 py-1.5 text-sm text-[#c9a25c] mb-6">
              <DollarSign className="h-4 w-4" />
              Updated for 2026
            </div>
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl">
              How Much Does a Roof Cost in Mississippi?
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed">
              Your complete guide to roofing prices in {BUSINESS_CONFIG.serviceArea.region}.
              Whether you need a full{' '}
              <Link href="/services/roof-replacement" className="text-[#c9a25c] hover:underline">
                roof replacement
              </Link>
              , a quick{' '}
              <Link href="/services/roof-repair" className="text-[#c9a25c] hover:underline">
                repair
              </Link>
              , or just want to understand material costs, this pricing guide breaks down every
              factor that determines what you will pay.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] font-semibold px-8 py-4 rounded-lg transition-all hover:shadow-lg hover:shadow-[#c9a25c]/20"
              >
                Get Your Free Estimate
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* Cost by Service Type */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Roofing Costs by Service Type
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Pricing varies significantly depending on the type of work your roof needs. Here are
              typical price ranges for {BUSINESS_CONFIG.serviceArea.region} homeowners in 2026.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Home className="h-7 w-7" />,
                title: 'Roof Replacement',
                price: '$8,000 - $25,000',
                description:
                  'Complete tear-off and installation of a new roofing system. Price depends on material, roof size, and complexity.',
                href: '/services/roof-replacement',
                linkText: 'Replacement Details',
              },
              {
                icon: <Wrench className="h-7 w-7" />,
                title: 'Roof Repair',
                price: '$300 - $3,000',
                description:
                  'Fix leaks, replace damaged shingles, seal flashing, and address localized issues before they spread.',
                href: '/services/roof-repair',
                linkText: 'Repair Details',
              },
              {
                icon: <Shield className="h-7 w-7" />,
                title: 'Roof Inspection',
                price: '$150 - $400',
                description:
                  'Comprehensive evaluation of your roof condition, identifying issues and estimating remaining lifespan.',
                href: '/services/roof-inspection',
                linkText: 'Inspection Details',
              },
              {
                icon: <Layers className="h-7 w-7" />,
                title: 'Gutters & Drainage',
                price: '$1,000 - $5,000',
                description:
                  'Gutter installation, replacement, and drainage system improvements to protect your roof and foundation.',
                href: '/services/gutters',
                linkText: 'Gutter Details',
              },
              {
                icon: <Clock className="h-7 w-7" />,
                title: 'Roof Maintenance',
                price: '$200 - $500/year',
                description:
                  'Annual maintenance programs including cleaning, minor repairs, and preventive care to extend roof life.',
                href: '/services/roof-maintenance',
                linkText: 'Maintenance Details',
              },
              {
                icon: <AlertTriangle className="h-7 w-7" />,
                title: 'Emergency Repair',
                price: 'Starting at $350',
                description:
                  'Urgent response for storm damage, active leaks, and fallen debris. Available 24/7 for emergency situations.',
                href: '/services/emergency-repair',
                linkText: 'Emergency Details',
              },
            ].map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 hover:border-[#c9a25c]/50 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] text-[#0c0f14] mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-1">{service.title}</h3>
                <p className="text-2xl font-bold text-[#c9a25c] mb-3">{service.price}</p>
                <p className="text-slate-400 text-sm mb-4">{service.description}</p>
                <span className="inline-flex items-center gap-1 text-sm text-[#c9a25c] group-hover:gap-2 transition-all">
                  {service.linkText}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Prices reflect typical ranges for {BUSINESS_CONFIG.serviceArea.region} as of 2026.
            Your actual cost depends on roof size, materials, and site conditions.{' '}
            <Link href="/" className="text-[#c9a25c] hover:underline">
              Get a personalized estimate
            </Link>{' '}
            for your specific home.
          </p>
        </div>
      </section>

      {/* ================================================================= */}
      {/* Cost by Material Type */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Roofing Material Costs Compared
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Material choice is one of the biggest factors in your roof price. Compare costs per
              square foot, expected lifespan, and long-term value for the most popular roofing
              materials in {BUSINESS_CONFIG.address.state}.
            </p>
          </div>

          {/* Asphalt Shingles Group */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#c9a25c]" />
              Asphalt Shingles
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  material: '3-Tab Asphalt Shingles',
                  cost: '$3 - $4 / sq ft',
                  lifespan: '12 - 15 years',
                  best: 'Budget-friendly option',
                  notes:
                    'The most affordable roofing material. Lighter weight and thinner profile. Good for rental properties or tight budgets.',
                },
                {
                  material: 'Architectural Shingles',
                  cost: '$4 - $6 / sq ft',
                  lifespan: '18 - 22 years',
                  best: 'Best overall value',
                  notes:
                    'The most popular choice for Mississippi homes. Dimensional appearance, better wind resistance, and longer manufacturer warranties.',
                },
                {
                  material: 'Premium Designer Shingles',
                  cost: '$6 - $8 / sq ft',
                  lifespan: '20 - 25 years',
                  best: 'Upscale appearance',
                  notes:
                    'Luxury look that mimics slate or cedar shake. Enhanced impact resistance and the best manufacturer warranties available for shingles.',
                },
              ].map((item) => (
                <div
                  key={item.material}
                  className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6"
                >
                  <h4 className="text-lg font-semibold text-slate-100 mb-3">{item.material}</h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Cost per sq ft</span>
                      <span className="text-[#c9a25c] font-semibold">{item.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Expected lifespan</span>
                      <span className="text-slate-100 font-medium">{item.lifespan}</span>
                    </div>
                  </div>
                  <div className="bg-[#0c0f14] rounded-lg px-3 py-2 mb-3">
                    <span className="text-xs text-[#3d7a5a] font-medium">{item.best}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{item.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Metal Roofing Group */}
          <div>
            <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#c9a25c]" />
              Metal Roofing
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  material: 'Corrugated Metal',
                  cost: '$6 - $9 / sq ft',
                  lifespan: '30 - 45 years',
                  best: 'Entry-level metal',
                  notes:
                    'An affordable way to get metal roofing benefits. Exposed fastener system means slightly more maintenance than concealed-fastener options.',
                },
                {
                  material: 'Metal Shingles',
                  cost: '$8 - $12 / sq ft',
                  lifespan: '35 - 50 years',
                  best: 'Traditional look, metal durability',
                  notes:
                    'Designed to look like standard shingles while providing metal performance. Easier to repair individual panels. Good wind and hail resistance.',
                },
                {
                  material: 'Standing Seam Metal',
                  cost: '$10 - $14 / sq ft',
                  lifespan: '40 - 60 years',
                  best: 'Premium long-term investment',
                  notes:
                    'Concealed fastener system eliminates leak points. Superior weather resistance, energy efficiency, and the longest lifespan of any residential roofing material.',
                },
              ].map((item) => (
                <div
                  key={item.material}
                  className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6"
                >
                  <h4 className="text-lg font-semibold text-slate-100 mb-3">{item.material}</h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Cost per sq ft</span>
                      <span className="text-[#c9a25c] font-semibold">{item.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Expected lifespan</span>
                      <span className="text-slate-100 font-medium">{item.lifespan}</span>
                    </div>
                  </div>
                  <div className="bg-[#0c0f14] rounded-lg px-3 py-2 mb-3">
                    <span className="text-xs text-[#3d7a5a] font-medium">{item.best}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{item.notes}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 mb-4">
              Not sure which material is right for your home? Read our in-depth comparison.
            </p>
            <Link
              href="/blog/asphalt-vs-metal-roofing"
              className="inline-flex items-center gap-2 text-[#c9a25c] hover:underline text-sm font-medium"
            >
              Asphalt vs Metal Roofing: Full Comparison
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* Cost Factors */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              What Affects Your Roof Price?
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              No two roofs are the same. Understanding these cost factors helps you anticipate your
              final price and make informed decisions about your roofing project.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Ruler className="h-6 w-6" />,
                title: 'Roof Size (Square Footage)',
                description:
                  'The single biggest factor in roof cost. A larger roof requires more materials and labor. Roofing is priced per "square" (100 sq ft). A typical Mississippi home has 15 to 25 squares of roofing area. Remember that roof area is larger than your home\'s floor plan due to overhangs and slope.',
              },
              {
                icon: <Mountain className="h-6 w-6" />,
                title: 'Roof Pitch and Slope',
                description:
                  'Steeper roofs cost more because they require additional safety equipment, take longer to install, and use more materials to cover the same footprint. A standard 4/12 to 6/12 pitch is typical. Anything above 8/12 is considered steep and adds 15-25% to labor costs.',
              },
              {
                icon: <Building2 className="h-6 w-6" />,
                title: 'Number of Stories',
                description:
                  'Multi-story homes cost more to roof because materials must be carried higher, safety requirements increase, and staging takes longer. Expect a 10-20% premium for two-story homes compared to single-story ranch-style houses.',
              },
              {
                icon: <Layers className="h-6 w-6" />,
                title: 'Roof Complexity',
                description:
                  'Valleys, dormers, skylights, chimneys, vent pipes, and hip-and-ridge transitions all add complexity. Each penetration and intersection requires custom flashing and careful waterproofing. A simple gable roof costs less than a complex hip roof with multiple dormers.',
              },
              {
                icon: <Hammer className="h-6 w-6" />,
                title: 'Tear-Off and Deck Repair',
                description:
                  'If your old roof needs to be torn off (most do), that adds $1,000 to $3,000 in labor and disposal. If the underlying decking has water damage or rot, repairs add $50 to $100 per sheet of plywood replaced. Multiple existing layers cost more to remove.',
              },
              {
                icon: <DollarSign className="h-6 w-6" />,
                title: 'Material Choice',
                description:
                  'From budget-friendly 3-tab shingles at $3/sq ft to premium standing seam metal at $14/sq ft, your material choice can triple the total cost. Higher-end materials come with longer warranties, better weather resistance, and improved energy efficiency.',
              },
              {
                icon: <CloudRain className="h-6 w-6" />,
                title: 'Mississippi Weather Considerations',
                description:
                  'Our region experiences severe thunderstorms, hail, high humidity, and occasional tropical weather. Choosing impact-resistant shingles or metal roofing designed for high winds (130+ mph rating) may cost more upfront but prevents expensive storm damage repairs down the road.',
              },
              {
                icon: <Clock className="h-6 w-6" />,
                title: 'Seasonal Demand and Timing',
                description:
                  'Roofing prices fluctuate with demand. Post-storm seasons see higher prices due to material shortages and contractor availability. Scheduling your project during the quieter winter months (November through February) can save 10-15% on labor costs.',
              },
            ].map((factor) => (
              <div
                key={factor.title}
                className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#c9a25c]/10 text-[#c9a25c]">
                    {factor.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">{factor.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{factor.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-[#1a1f2e] border border-[#c9a25c]/30 rounded-xl p-6 text-center">
            <p className="text-slate-300">
              Want to know exactly how these factors affect <em>your</em> roof? Our free estimate
              tool accounts for all of these variables to give you a personalized price range in
              under 60 seconds.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-4 text-[#c9a25c] hover:underline font-medium"
            >
              Try the Free Estimate Tool
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* Quick Cost Reference Table */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Mississippi Roof Cost at a Glance
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Quick reference for common home sizes with architectural shingles (the most popular
              choice in {BUSINESS_CONFIG.address.state}).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-3 px-4 text-slate-400 text-sm font-medium">Home Size</th>
                  <th className="py-3 px-4 text-slate-400 text-sm font-medium">Approx. Roof Area</th>
                  <th className="py-3 px-4 text-slate-400 text-sm font-medium">Shingle Cost</th>
                  <th className="py-3 px-4 text-slate-400 text-sm font-medium">Metal Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  { home: '1,000 sq ft', roof: '~1,200 sq ft', shingle: '$5,500 - $8,500', metal: '$10,000 - $17,000' },
                  { home: '1,500 sq ft', roof: '~1,800 sq ft', shingle: '$8,000 - $12,000', metal: '$15,000 - $25,000' },
                  { home: '2,000 sq ft', roof: '~2,400 sq ft', shingle: '$10,000 - $18,000', metal: '$18,000 - $34,000' },
                  { home: '2,500 sq ft', roof: '~3,000 sq ft', shingle: '$13,000 - $22,000', metal: '$24,000 - $42,000' },
                  { home: '3,000 sq ft', roof: '~3,600 sq ft', shingle: '$16,000 - $25,000', metal: '$28,000 - $50,000' },
                ].map((row) => (
                  <tr key={row.home} className="hover:bg-[#1a1f2e] transition-colors">
                    <td className="py-3 px-4 text-slate-100 font-medium">{row.home}</td>
                    <td className="py-3 px-4 text-slate-400">{row.roof}</td>
                    <td className="py-3 px-4 text-[#c9a25c] font-semibold">{row.shingle}</td>
                    <td className="py-3 px-4 text-[#c9a25c] font-semibold">{row.metal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-500 text-center">
            Estimates assume a standard gable roof with moderate pitch (4/12 to 6/12). Actual
            prices vary based on roof complexity, number of stories, and current material costs.
          </p>
        </div>
      </section>

      {/* ================================================================= */}
      {/* Pricing Subpage Links */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Detailed Pricing Guides
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Dive deeper into specific cost breakdowns for the most common roofing projects.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                href: '/pricing/roof-replacement-cost',
                title: 'Roof Replacement Cost Guide',
                description:
                  'Complete breakdown of replacement costs including tear-off, materials, labor, permits, and disposal. Learn what drives the price and how to budget for a full roof replacement.',
                icon: <Home className="h-7 w-7" />,
              },
              {
                href: '/pricing/metal-roof-cost',
                title: 'Metal Roof Cost Guide',
                description:
                  'Standing seam, metal shingles, and corrugated metal pricing compared. Understand the upfront investment, long-term savings, energy benefits, and insurance advantages.',
                icon: <Shield className="h-7 w-7" />,
              },
              {
                href: '/pricing/roof-repair-cost',
                title: 'Roof Repair Cost Guide',
                description:
                  'From minor leak repairs to major storm damage restoration. See what common repairs cost and learn when it makes more sense to repair versus replace your roof.',
                icon: <Wrench className="h-7 w-7" />,
              },
            ].map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group bg-[#1a1f2e] border border-slate-700 rounded-2xl p-8 hover:border-[#c9a25c]/50 transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] text-[#0c0f14] mb-6">
                  {guide.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">{guide.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{guide.description}</p>
                <span className="inline-flex items-center gap-1 text-sm text-[#c9a25c] font-medium group-hover:gap-2 transition-all">
                  Read Full Guide
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* Tips to Save Money */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              How to Save Money on Your Roof
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Smart strategies that Mississippi homeowners use to reduce roofing costs without
              cutting corners on quality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Schedule in the Off-Season',
                detail:
                  'Book your project between November and February when demand is lower. Contractors often offer 10-15% discounts to keep crews working during slower months.',
              },
              {
                title: 'Get Multiple Quotes',
                detail:
                  'Compare at least three estimates from licensed, insured contractors. Our free instant estimate gives you a baseline to compare against in-person quotes.',
              },
              {
                title: 'Check Your Insurance',
                detail:
                  'If your roof has storm damage, your homeowner\'s insurance may cover most of the replacement cost. Get a free inspection to assess storm damage before filing.',
              },
              {
                title: 'Consider Financing',
                detail:
                  'Spreading costs over time with a low-interest roofing loan can make a higher-quality roof affordable. We offer flexible financing options.',
              },
              {
                title: 'Invest in Quality Materials',
                detail:
                  'A slightly more expensive material that lasts 20 years longer saves money in the long run. Calculate your cost-per-year, not just the upfront price.',
              },
              {
                title: 'Maintain Your Current Roof',
                detail:
                  'Regular maintenance extends your roof\'s life by years, delaying replacement costs. Annual inspections catch small issues before they become expensive repairs.',
              },
            ].map((tip) => (
              <div
                key={tip.title}
                className="flex items-start gap-3"
              >
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5 text-[#3d7a5a]" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 mb-1">{tip.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{tip.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-slate-500">
            <Link href="/financing" className="text-[#c9a25c] hover:underline">
              Explore financing options
            </Link>{' '}
            or{' '}
            <Link href="/insurance-help" className="text-[#c9a25c] hover:underline">
              learn about insurance claims
            </Link>{' '}
            for your roofing project.
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* Local Service Area Callout */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-100 md:text-3xl mb-4">
                  Serving {BUSINESS_CONFIG.serviceArea.region}
                </h2>
                <p className="text-slate-400 leading-relaxed mb-4">
                  We provide roofing services throughout{' '}
                  {BUSINESS_CONFIG.serviceArea.region}, including{' '}
                  <Link href="/tupelo-roofing" className="text-[#c9a25c] hover:underline">
                    Tupelo
                  </Link>
                  , Oxford, Corinth, Starkville, Columbus, and surrounding communities within a{' '}
                  {BUSINESS_CONFIG.serviceArea.radiusMiles}-mile radius.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Local pricing matters. Material costs, permit requirements, and labor rates vary
                  across Mississippi. Our estimates are calibrated for your specific area so you get
                  realistic pricing, not generic national averages.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/service-areas"
                  className="flex items-center justify-between bg-[#0c0f14] rounded-lg px-5 py-4 hover:bg-[#161a23] transition-colors group"
                >
                  <span className="text-slate-100 font-medium">View All Service Areas</span>
                  <ArrowRight className="h-4 w-4 text-[#c9a25c] group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/tupelo-roofing"
                  className="flex items-center justify-between bg-[#0c0f14] rounded-lg px-5 py-4 hover:bg-[#161a23] transition-colors group"
                >
                  <span className="text-slate-100 font-medium">Tupelo Roofing Prices</span>
                  <ArrowRight className="h-4 w-4 text-[#c9a25c] group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-between bg-[#0c0f14] rounded-lg px-5 py-4 hover:bg-[#161a23] transition-colors group"
                >
                  <span className="text-slate-100 font-medium">Contact Us</span>
                  <ArrowRight className="h-4 w-4 text-[#c9a25c] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* FAQ Section */}
      {/* ================================================================= */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Frequently Asked Questions About Roofing Costs
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Answers to the most common pricing questions from {BUSINESS_CONFIG.serviceArea.region}{' '}
              homeowners.
            </p>
          </div>

          <FAQAccordion items={pricingFAQs} />
        </div>
      </section>

      {/* ================================================================= */}
      {/* CTA Section */}
      {/* ================================================================= */}
      <CTASection
        title="Get Your Exact Roof Price in 60 Seconds"
        description="Our free instant estimate tool factors in your roof size, material preferences, location, and condition to give you a personalized price range. No email required, no sales pressure -- just honest pricing."
        variant="default"
      />

      <SiteFooter />
    </div>
  )
}
