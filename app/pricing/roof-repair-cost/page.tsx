import { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { FAQAccordion } from '@/components/faq/faq-accordion'
import { CTASection } from '@/components/shared/cta-section'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Shield,
  Clock,
  Wrench,
  ArrowRight,
  Phone,
  FileText,
  Camera,
  CloudRain,
} from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

const faqItems = [
  {
    question: 'How much does it cost to fix a roof leak?',
    answer:
      'Most roof leak repairs in Mississippi cost between $300 and $1,000 depending on the source and severity. A simple shingle repair may only run $200-$400, while fixing a leak caused by damaged flashing or a deteriorated valley can cost $500-$1,000. If the leak has caused underlying deck damage or mold, costs can climb higher. The best approach is to address leaks quickly before they cause secondary water damage to insulation, ceilings, or structural framing.',
  },
  {
    question: 'Is it worth repairing an old roof?',
    answer:
      'It depends on the roof\'s age and overall condition. If your roof is under 15 years old and the damage is localized to a small area (less than 30% of the total surface), repairs are almost always the more cost-effective choice. However, if the roof is over 20 years old, has multiple leak points, or shows widespread deterioration like curling shingles, granule loss, and sagging, a full replacement will likely save you more money in the long run. A good rule of thumb: if the repair cost exceeds 50% of a full replacement, replacement is the smarter investment.',
  },
  {
    question: 'Does homeowners insurance cover roof repairs?',
    answer:
      'Homeowners insurance typically covers roof damage caused by sudden, accidental events like storms, hail, fallen trees, and wind. It generally does not cover damage from normal wear and tear, deferred maintenance, or gradual deterioration. Your policy will have a deductible (often $1,000-$2,500) that you pay out of pocket before coverage kicks in. To maximize your claim, document the damage with photos immediately, file your claim promptly, and get a professional inspection report to support your case.',
  },
  {
    question: 'How long does a roof repair take?',
    answer:
      'Most residential roof repairs can be completed in 1 to 4 hours for straightforward issues like replacing damaged shingles, resealing flashing, or fixing a vent boot. More extensive repairs involving structural deck work, large valley repairs, or chimney flashing replacement may take a full day. Emergency tarping can usually be done within 1-2 hours of arrival. Weather conditions and roof accessibility (steep pitch, multiple stories) can also affect the timeline.',
  },
  {
    question: 'Can I repair my roof myself?',
    answer:
      'While minor repairs like replacing a few shingles are technically possible for a handy homeowner, DIY roof work is generally not recommended. Working at height carries serious safety risks, and improper repairs often make problems worse by creating new leak paths or voiding your warranty. Professional roofers have the equipment, materials, and expertise to diagnose the actual source of a problem (which is often not where the leak appears inside) and make lasting repairs. For anything beyond the most basic maintenance, hiring a licensed professional is the safer and more cost-effective choice.',
  },
  {
    question: 'What is the most common roof repair?',
    answer:
      'The most common roof repair in Mississippi is fixing leaks caused by damaged or missing shingles. Mississippi\'s hot summers, heavy rains, and occasional severe storms take a toll on asphalt shingles, causing them to crack, curl, lift, or blow off entirely. Other frequent repairs include fixing damaged flashing around chimneys and vents, replacing deteriorated vent boots (a very common leak source), and repairing storm damage from wind and hail. Regular inspections after severe weather help catch these issues before they lead to interior water damage.',
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

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Roof Repair Cost in Mississippi (2026) | Price Guide'
  const description =
    'How much does roof repair cost in Mississippi? See 2026 pricing for leak repairs ($300-$1,000), shingle replacement, flashing, storm damage, and more. Get a free estimate in 60 seconds.'
  const url = `${BASE_URL}/pricing/roof-repair-cost`
  const ogImageUrl = `${BASE_URL}/api/og?type=service&title=${encodeURIComponent('Roof Repair Cost Guide')}&subtitle=${encodeURIComponent('2026 Mississippi Pricing')}`

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
    },
    keywords: [
      'roof repair cost',
      'roof repair cost Mississippi',
      'roof leak repair cost',
      'how much does roof repair cost',
      'roof repair price',
      'shingle repair cost',
      'roof flashing repair cost',
      'storm damage roof repair',
      'emergency roof repair cost',
      'roof repair estimate',
      'roof repair vs replacement',
      'Mississippi roof repair',
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: 'Farrell Roofing',
      locale: 'en_US',
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Roof Repair Cost Guide - Mississippi 2026',
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

const repairTypes = [
  {
    name: 'Leak Repair',
    range: '$300 - $1,000',
    description: 'Locate and seal active roof leaks from any source including worn shingles, failed sealant, or cracked flashing.',
    icon: CloudRain,
  },
  {
    name: 'Shingle Replacement',
    range: '$200 - $500',
    description: 'Replace cracked, curled, or missing shingles in a small, localized area to restore weatherproofing.',
    icon: Wrench,
  },
  {
    name: 'Flashing Repair',
    range: '$300 - $600',
    description: 'Repair or replace metal flashing around roof penetrations, walls, and transitions where leaks commonly develop.',
    icon: Shield,
  },
  {
    name: 'Gutter Repair',
    range: '$150 - $500',
    description: 'Fix sagging, leaking, or damaged gutters and downspouts to restore proper water drainage from your roof.',
    icon: Wrench,
  },
  {
    name: 'Ridge Cap Repair',
    range: '$250 - $750',
    description: 'Replace damaged ridge cap shingles along the peak of your roof, a common failure point in high winds.',
    icon: Wrench,
  },
  {
    name: 'Valley Repair',
    range: '$400 - $1,000',
    description: 'Repair or reline roof valleys where two slopes meet. Valleys handle heavy water flow and are prone to wear.',
    icon: CloudRain,
  },
  {
    name: 'Soffit/Fascia Repair',
    range: '$300 - $2,500',
    description: 'Repair or replace rotted, damaged, or pest-compromised soffit and fascia boards that protect your roof edge.',
    icon: Wrench,
  },
  {
    name: 'Chimney Flashing',
    range: '$300 - $800',
    description: 'Reseal or replace the flashing around your chimney base, one of the most common sources of roof leaks.',
    icon: Shield,
  },
  {
    name: 'Skylight Repair/Reseal',
    range: '$300 - $800',
    description: 'Reseal or repair skylight flashing and weatherstripping to stop leaks around the skylight frame.',
    icon: Shield,
  },
  {
    name: 'Vent Boot Replacement',
    range: '$150 - $400',
    description: 'Replace cracked or deteriorated rubber vent boots around plumbing pipes. A top cause of hidden leaks.',
    icon: Wrench,
  },
  {
    name: 'Storm Damage Repair',
    range: '$500 - $3,000+',
    description: 'Repair wind, hail, or fallen debris damage. Scope varies widely depending on the extent of the storm impact.',
    icon: AlertTriangle,
  },
  {
    name: 'Emergency Tarping',
    range: '$200 - $500',
    description: 'Temporary tarp installation to prevent further water intrusion until a permanent repair can be made.',
    icon: Clock,
  },
]

export default function RoofRepairCostPage() {
  return (
    <div className="min-h-screen bg-[#0c0f14]">
      {/* FAQ JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <SiteHeader />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { name: 'Pricing Guide', href: '/pricing' },
          { name: 'Roof Repair Cost', href: '/pricing/roof-repair-cost' },
        ]}
      />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <p className="text-[#c9a25c] font-semibold text-sm uppercase tracking-wider mb-4">
              2026 Mississippi Pricing Guide
            </p>
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl leading-tight">
              How Much Does Roof Repair Cost in Mississippi?
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed">
              Most roof repairs in Mississippi cost between{' '}
              <span className="text-[#c9a25c] font-semibold">$300 and $3,000</span>{' '}
              depending on the type and extent of damage. Minor repairs like a vent boot
              replacement may cost as little as $150, while extensive storm damage repairs
              can exceed $3,000. This guide breaks down every common repair type with
              current 2026 pricing so you know what to expect before you call a contractor.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-[#c9a25c] hover:bg-[#b5893a] text-[#0c0f14] font-semibold px-8 py-4 rounded-lg transition-all"
              >
                Get Free Repair Estimate
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/services/roof-repair"
                className="inline-flex items-center justify-center bg-transparent border-2 border-[#c9a25c]/50 hover:border-[#c9a25c] text-slate-100 font-semibold px-8 py-4 rounded-lg transition-all"
              >
                Our Repair Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Common Repair Types & Costs */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Common Roof Repair Types &amp; Costs
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Current 2026 pricing for Mississippi homeowners. Actual costs depend on
              your roof&apos;s material, pitch, accessibility, and the extent of damage.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {repairTypes.map((repair) => {
              const Icon = repair.icon
              return (
                <div
                  key={repair.name}
                  className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 hover:border-[#c9a25c]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#c9a25c]/10 rounded-lg">
                        <Icon className="w-5 h-5 text-[#c9a25c]" />
                      </div>
                      <h3 className="font-semibold text-slate-100">{repair.name}</h3>
                    </div>
                  </div>
                  <p className="text-[#c9a25c] font-bold text-lg mb-2">{repair.range}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {repair.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* When to Repair vs. Replace */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              When to Repair vs. Replace Your Roof
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Not every problem calls for a full replacement. Here is how to decide
              whether a targeted repair will solve your issue or if it is time for a
              new roof.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Repair Column */}
            <div className="bg-[#1a1f2e] border border-[#3d7a5a]/30 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#3d7a5a]/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-[#3d7a5a]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-100">Repair Your Roof If</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-100 font-medium">Roof is less than 15 years old</p>
                    <p className="text-slate-400 text-sm mt-1">
                      A roof in the first two-thirds of its lifespan still has plenty of
                      useful life left. Localized repairs are highly cost-effective.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-100 font-medium">Damage is localized to one area</p>
                    <p className="text-slate-400 text-sm mt-1">
                      If the problem is confined to a specific spot such as around a chimney,
                      vent, or a single slope, a targeted repair is the right call.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-100 font-medium">Less than 30% of the roof is affected</p>
                    <p className="text-slate-400 text-sm mt-1">
                      When the majority of your roof is still in good condition, repairing
                      the damaged section saves thousands compared to a full replacement.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-100 font-medium">Roof deck is structurally sound</p>
                    <p className="text-slate-400 text-sm mt-1">
                      If the plywood decking underneath is solid with no rot, sagging, or
                      water damage, the surface-level issue is worth fixing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Replace Column */}
            <div className="bg-[#1a1f2e] border border-red-500/30 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-100">Replace Your Roof If</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-100 font-medium">Roof is over 20 years old</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Standard asphalt shingle roofs are designed to last 20-30 years. Once
                      you are past 20, repairs become a short-term bandage on an aging system.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-100 font-medium">Widespread damage across the roof</p>
                    <p className="text-slate-400 text-sm mt-1">
                      When you see curling, cracking, or granule loss across the entire roof
                      surface, individual repairs will not solve the underlying deterioration.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-100 font-medium">Multiple active leaks</p>
                    <p className="text-slate-400 text-sm mt-1">
                      More than two or three active leak points suggests a systemic problem
                      that patching will not resolve. Each new repair risks creating another failure.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-100 font-medium">Deck failure or structural sagging</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Rotted or sagging decking means the damage has gone beyond the surface.
                      A new roof system including deck repairs is the only safe solution.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-100 font-medium">Repair costs exceed 50% of replacement</p>
                    <p className="text-slate-400 text-sm mt-1">
                      If the total repair bill approaches half the cost of a new roof, a full
                      replacement gives you decades of protection instead of another temporary fix.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-700">
                <Link
                  href="/pricing/roof-replacement-cost"
                  className="inline-flex items-center gap-2 text-[#c9a25c] hover:text-[#b5893a] font-medium transition-colors"
                >
                  See full replacement costs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Repair Pricing */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-100">
                  Emergency Roof Repair Pricing
                </h2>
              </div>
              <p className="text-slate-400 leading-relaxed mb-8">
                Roof emergencies do not wait for business hours. When a storm tears off
                shingles at midnight or a tree branch punches through your roof during a
                thunderstorm, you need immediate help to prevent interior water damage. Here
                is what to expect for emergency repair costs in Mississippi.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#1a1f2e] border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#c9a25c]" />
                    <span className="text-slate-100 font-medium">After-Hours Surcharge</span>
                  </div>
                  <span className="text-[#c9a25c] font-bold">+$100 - $200</span>
                </div>
                <div className="flex items-center justify-between bg-[#1a1f2e] border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#c9a25c]" />
                    <span className="text-slate-100 font-medium">Emergency Tarping</span>
                  </div>
                  <span className="text-[#c9a25c] font-bold">$200 - $500</span>
                </div>
                <div className="flex items-center justify-between bg-[#1a1f2e] border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-[#c9a25c]" />
                    <span className="text-slate-100 font-medium">Temporary Patching</span>
                  </div>
                  <span className="text-[#c9a25c] font-bold">$300 - $800</span>
                </div>
                <div className="flex items-center justify-between bg-[#1a1f2e] border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CloudRain className="w-5 h-5 text-[#c9a25c]" />
                    <span className="text-slate-100 font-medium">Water Damage Mitigation</span>
                  </div>
                  <span className="text-[#c9a25c] font-bold">Varies</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#c9a25c]/20 to-transparent border border-[#c9a25c]/30 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-6 h-6 text-[#c9a25c]" />
                <h3 className="text-xl font-bold text-slate-100">24/7 Emergency Service</h3>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6">
                We offer around-the-clock emergency response for Mississippi homeowners. When
                minutes matter, our team can be on-site quickly to tarp exposed areas, stop
                active leaks, and prevent further damage to your home. Emergency calls are
                prioritized and we carry tarps, sealants, and patching materials on every
                truck.
              </p>
              <p className="text-slate-400 leading-relaxed mb-6">
                After the emergency is stabilized, we will schedule a full inspection to
                assess the total damage and provide a detailed repair or replacement estimate,
                including documentation for your insurance claim if applicable.
              </p>
              <Link
                href="/services/emergency-repair"
                className="inline-flex items-center gap-2 bg-[#c9a25c] hover:bg-[#b5893a] text-[#0c0f14] font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Emergency Repair Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Claim Repairs */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Roof Repair &amp; Insurance Claims
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Understanding what your homeowners insurance covers can save you thousands.
              Here is a breakdown of how insurance typically handles roof repair claims
              in Mississippi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Covered */}
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-[#3d7a5a]" />
                Typically Covered
              </h3>
              <div className="space-y-3">
                {[
                  'Wind damage from storms and severe weather',
                  'Hail damage to shingles and flashing',
                  'Fallen tree or debris impact damage',
                  'Fire and lightning strikes',
                  'Weight of ice, snow, or sleet',
                  'Sudden and accidental water damage',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Not Covered */}
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-400" />
                Typically Not Covered
              </h3>
              <div className="space-y-3">
                {[
                  'Normal wear and tear over time',
                  'Deferred or neglected maintenance',
                  'Gradual deterioration and aging',
                  'Pre-existing damage before the policy',
                  'Improper installation or workmanship',
                  'Cosmetic damage that does not affect function',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deductibles & Tips */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-[#c9a25c]" />
                How Deductibles Work
              </h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Your homeowners insurance deductible is the amount you pay out of pocket
                before your coverage kicks in. In Mississippi, roof-related deductibles
                typically range from $1,000 to $2,500, though some policies in storm-prone
                areas may have percentage-based deductibles (1-5% of your home&apos;s insured
                value).
              </p>
              <p className="text-slate-400 leading-relaxed">
                For example, if your repair costs $2,500 and your deductible is $1,000, your
                insurance would cover $1,500. Keep in mind that filing too many claims in a
                short period can lead to higher premiums or difficulty renewing your policy.
              </p>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-3">
                <Camera className="w-6 h-6 text-[#c9a25c]" />
                Documentation Tips
              </h3>
              <div className="space-y-3">
                {[
                  'Photograph all damage immediately after the event, including wide shots and close-ups',
                  'Document the date and weather conditions that caused the damage',
                  'File your claim within 24-48 hours for the strongest case',
                  'Get a professional inspection report from a licensed roofer',
                  'Keep all receipts for emergency repairs and temporary measures',
                  'Do not sign any contractor agreement before your adjuster inspects',
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-[#c9a25c] mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/blog/roof-insurance-claims"
              className="inline-flex items-center gap-2 text-[#c9a25c] hover:text-[#b5893a] font-medium transition-colors"
            >
              Read our complete guide to roof insurance claims
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Repair Cost Factors */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              What Affects Roof Repair Costs?
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Every roof repair is unique. These are the primary factors that determine
              where your specific project falls within the price ranges listed above.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Type & Extent of Damage',
                description:
                  'A single missing shingle is a quick fix. A 10-foot section of damaged valley with rotted underlayment is a different scope entirely. The type of damage (surface vs. structural) and how much area is affected are the biggest cost drivers.',
              },
              {
                title: 'Roof Accessibility',
                description:
                  'Steep-pitch roofs (8/12 and above), multi-story homes, and roofs with limited access points require additional safety equipment and time. Expect 20-40% higher labor costs for difficult-to-access roofs compared to standard ranch-style homes.',
              },
              {
                title: 'Material Type & Availability',
                description:
                  'Repairing standard 3-tab asphalt shingles is straightforward and affordable. Architectural shingles, tile, slate, or metal roofing require specialized skills and materials that cost more. Matching discontinued materials adds complexity.',
              },
              {
                title: 'Urgency Level',
                description:
                  'Scheduled repairs during normal business hours on a dry day cost less than emergency calls during an active storm. After-hours, weekend, and emergency service typically adds $100-$200 to the base repair cost.',
              },
              {
                title: 'Structural Repairs Needed',
                description:
                  'If damage extends beyond the surface to the roof deck, rafters, or trusses, the repair becomes significantly more involved. Replacing a sheet of rotted decking adds $75-$200 per sheet on top of the surface repair.',
              },
              {
                title: 'Local Labor & Material Costs',
                description:
                  'Pricing varies across Mississippi. Areas with higher demand, a limited contractor supply, or recent storm events may see temporarily elevated pricing. Getting multiple quotes helps ensure you receive fair market rates.',
              },
            ].map((factor) => (
              <div
                key={factor.title}
                className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6"
              >
                <h3 className="font-semibold text-slate-100 mb-3">{factor.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Pricing Guides */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-100 mb-8">
            Related Pricing Guides &amp; Resources
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Roof Replacement Cost',
                description:
                  'Full 2026 pricing guide for complete roof replacement in Mississippi, including materials and labor.',
                href: '/pricing/roof-replacement-cost',
              },
              {
                title: 'Metal Roof Cost',
                description:
                  'Compare standing seam, corrugated, and metal shingle pricing for Mississippi homes.',
                href: '/pricing/metal-roof-cost',
              },
              {
                title: 'Pricing Guide Overview',
                description:
                  'Browse all of our roofing pricing guides and calculators in one place.',
                href: '/pricing',
              },
              {
                title: 'Roof Repair Services',
                description:
                  'Learn about our professional repair process, materials, and warranty coverage.',
                href: '/services/roof-repair',
              },
              {
                title: 'Emergency Repair Services',
                description:
                  '24/7 emergency response for storm damage, leaks, and other urgent roof issues.',
                href: '/services/emergency-repair',
              },
              {
                title: 'Roof Insurance Claims Guide',
                description:
                  'Step-by-step walkthrough for filing and maximizing your roof damage insurance claim.',
                href: '/blog/roof-insurance-claims',
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5 hover:border-[#c9a25c]/50 transition-colors group"
              >
                <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-[#c9a25c] transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-slate-400">{link.description}</p>
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
              Frequently Asked Questions About Roof Repair Costs
            </h2>
            <p className="mt-4 text-slate-400">
              Answers to the most common questions Mississippi homeowners ask about
              roof repairs and pricing.
            </p>
          </div>

          <FAQAccordion items={faqItems} />
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Get Your Repair Estimate in 60 Seconds"
        description="Answer a few quick questions about your roof and receive an instant price range for your repair. No pressure, no contractor calls unless you want them."
        primaryLabel="Get Free Repair Estimate"
        primaryHref="/"
        showPhone
      />

      <SiteFooter />
    </div>
  )
}
