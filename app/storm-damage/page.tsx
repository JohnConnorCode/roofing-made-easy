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
  AlertTriangle,
  Camera,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  CloudLightning,
  Wind,
  Droplets,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export const metadata: Metadata = {
  title: `Storm Damage Roof Repair in ${BUSINESS_CONFIG.serviceArea.region} | ${BUSINESS_CONFIG.name}`,
  description: `Mississippi storm damage resources: what to do after hail, wind, tornado, or fallen tree roof damage. Documentation guides, insurance claim help, and emergency repair for Northeast Mississippi homeowners.`,
  keywords: [
    'storm damage roof repair Mississippi',
    'hail damage roof Mississippi',
    'tornado roof damage Mississippi',
    'wind damage roof repair',
    'roof damage insurance claim',
    'emergency roof repair Mississippi',
    'Dixie Alley roofing',
    'Mississippi severe weather roof',
  ],
  openGraph: {
    title: `Storm Damage Roof Help | ${BUSINESS_CONFIG.serviceArea.region} | ${BUSINESS_CONFIG.name}`,
    description: `After a Mississippi storm: document damage, file the right claim, get repaired. Step-by-step guides from Farrell Roofing.`,
    url: `${BASE_URL}/storm-damage`,
    siteName: BUSINESS_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=service&title=Storm%20Damage%20Roof%20Help&subtitle=Mississippi%20Storm%20%E2%80%A2%20Hail%20%E2%80%A2%20Tornado%20Resources`,
        width: 1200,
        height: 630,
        alt: 'Storm Damage Roof Help — Northeast Mississippi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Storm Damage Roof Help | ${BUSINESS_CONFIG.name}`,
    description: `After a Mississippi storm: what to do, how to document it, how to file a roof insurance claim.`,
  },
  alternates: {
    canonical: `${BASE_URL}/storm-damage`,
  },
}

export const revalidate = 3600

const FAQ_ITEMS = [
  {
    question: 'How long do I have to file a roof insurance claim after a storm in Mississippi?',
    answer: 'Most Mississippi homeowner policies require you to report storm damage within 1 year of the event, but many insurers prefer notice within 30–60 days. File as soon as damage is confirmed — delays give adjusters reason to question the claim. Even if you\'re unsure whether damage meets your deductible, filing a claim opens the inspection process.',
  },
  {
    question: 'Does my homeowner\'s insurance cover roof damage from a tornado in Mississippi?',
    answer: 'Standard homeowner\'s insurance (HO-3) in Mississippi covers wind and tornado damage to your roof. However, flood damage from accompanying rain is typically excluded unless you have separate NFIP flood coverage. Document everything separately: wind damage vs. water intrusion. If your insurer tries to reclassify wind damage as flood damage, that\'s when you need documentation photos with timestamps.',
  },
  {
    question: 'What is the Mississippi Wind Pool, and do I need it?',
    answer: 'The Mississippi Windstorm Underwriting Association (Wind Pool) provides wind and hail coverage for properties in 6 coastal counties (Harrison, Hancock, Jackson, Stone, George, Pearl River) that private insurers won\'t cover. If you\'re in those counties, you likely need Wind Pool coverage separate from your standard homeowner\'s policy. Inland Northeast Mississippi homeowners are not in the Wind Pool zone.',
  },
  {
    question: 'Can I tarp my own roof after storm damage?',
    answer: 'Yes — and you should if rain is coming and a contractor can\'t get there same-day. Tarping prevents secondary water damage, which insurers may not cover if you did nothing to mitigate it. Use 6-mil polyethylene tarps secured with 1x3 boards screwed into the deck, not the shingles. Keep your receipts — emergency tarping materials are typically reimbursable under your policy.',
  },
  {
    question: 'What should I photograph after storm damage to my roof?',
    answer: 'Photograph everything before any cleanup: hail impacts on metal surfaces (gutters, AC units, flashings) as independent damage validators, missing or lifted shingles from multiple angles, interior water stains with the date visible, any fallen debris. Take GPS-tagged photos from your phone with timestamps. These become your evidence if the adjuster\'s estimate is lower than actual damage.',
  },
]

const RESPONSE_STEPS = [
  {
    step: '01',
    icon: AlertTriangle,
    title: 'Stay safe first',
    body: 'Wait for severe weather to pass before going outside. Check for downed power lines, structural damage, or standing water before inspecting your roof from the ground.',
  },
  {
    step: '02',
    icon: Camera,
    title: 'Document from the ground',
    body: 'Photograph your roof from every angle while damage is fresh. Capture hail impacts on gutters and AC units (independent damage validators). Timestamp everything — do not clean up before photos.',
  },
  {
    step: '03',
    icon: Shield,
    title: 'Stop secondary damage',
    body: 'If rain is coming and you have visible holes or missing shingles, tarp the affected area. Keep receipts — emergency mitigation costs are typically covered. Don\'t wait for a contractor.',
  },
  {
    step: '04',
    icon: Phone,
    title: 'Get a professional inspection',
    body: 'Call a local contractor (not a storm chaser) for a damage assessment before contacting your insurer. A documented inspection report is worth more than the adjuster\'s solo walkthrough.',
  },
  {
    step: '05',
    icon: FileText,
    title: 'File your claim',
    body: 'Contact your insurer with the inspection report and your photos. Request a written Scope of Loss from the adjuster. If the estimate is low, you can request a re-inspection or hire a public adjuster.',
  },
  {
    step: '06',
    icon: CheckCircle,
    title: 'Repair with a local contractor',
    body: 'Use a licensed Mississippi contractor, not a traveling storm chaser. Get your repairs scheduled before your claim\'s Replacement Cost Value (RCV) deadline — typically 180 days post-settlement.',
  },
]

const STORM_TYPES = [
  {
    icon: Wind,
    label: 'Tornado & High Wind',
    href: '/blog/mississippi-tornado-roof-damage-recovery',
    desc: 'Step-by-step roof recovery after tornado or straight-line wind damage.',
  },
  {
    icon: CloudLightning,
    label: 'Hail Damage',
    href: '/blog/hail-damage-roof-mississippi-guide',
    desc: 'How to identify hail impact, what adjusters look for, when to claim.',
  },
  {
    icon: Droplets,
    label: 'Fallen Trees',
    href: '/blog/fallen-tree-roof-damage-mississippi',
    desc: 'Liability, emergency tarping, and insurance when a tree hits your roof.',
  },
  {
    icon: AlertTriangle,
    label: 'Wind Damage Signs',
    href: '/blog/wind-damage-signs-roof-mississippi',
    desc: '10 signs your roof has hidden wind damage most homeowners miss.',
  },
]

export default async function StormDamagePage() {
  const stormPosts = await getPostsByCategory('Storm & Weather').catch(() => [])

  const breadcrumbs = [
    { name: 'Home', url: BASE_URL },
    { name: 'Storm Damage', url: `${BASE_URL}/storm-damage` },
  ]

  return (
    <div className="min-h-screen bg-gradient-dark">
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema items={FAQ_ITEMS} />

      <SiteHeader />
      <Breadcrumbs items={[{ name: 'Storm Damage', href: '/storm-damage' }]} />

      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-[#0c0f14]">
        <div className="absolute inset-0">
          <Image
            src="/images/services/storm-damage-repair.jpg"
            alt="Storm-damaged roof in Northeast Mississippi showing missing shingles and hail damage"
            fill
            className="object-cover object-center opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f14] via-[#0c0f14]/80 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c] mb-4">
              Storm Damage Resources · {BUSINESS_CONFIG.serviceArea.region}
            </p>
            <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.05] font-bold tracking-tight text-slate-50 font-display mb-6">
              After the storm.<br />
              Know exactly what to do.
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
              Mississippi is in the heart of Dixie Alley — more tornadoes per square mile than almost anywhere in the US. Hail, high winds, and fallen trees are part of life here. This is everything you need to document damage, file a legitimate claim, and get your roof back right.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href={getPhoneLink()}>
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  leftIcon={<Phone className="h-4 w-4" />}
                >
                  Emergency: {getPhoneDisplay()}
                </Button>
              </a>
              <Link href="/insurance-help">
                <Button variant="outline" size="lg" className="border-slate-600 text-slate-300">
                  Insurance claim help
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mississippi Storm Context */}
      <section className="py-14 bg-[#161a23] border-y border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { stat: '148', label: 'Average tornadoes in Mississippi per year', sub: 'Most in the Deep South' },
              { stat: '1–2"', label: 'Hailstones large enough to damage shingles', sub: 'Standard threshold for claims' },
              { stat: '180 days', label: 'Typical RCV deadline after claim settlement', sub: 'Miss it, lose the recoverable depreciation' },
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

      {/* Response Steps */}
      <section className="py-20 md:py-28 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-4">After a storm hits</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 font-display mb-12">
            Six steps. In this order.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RESPONSE_STEPS.map((s) => (
              <div key={s.step} className="rounded-2xl border border-slate-800/80 bg-[#141925] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 flex items-center justify-center flex-shrink-0">
                    <s.icon className="h-4 w-4 text-[#c9a25c]" />
                  </div>
                  <span className="text-xs font-mono text-slate-500">{s.step}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Storm Type Quick Links */}
      <section className="py-14 bg-[#161a23] border-y border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-6 text-center">By storm type</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STORM_TYPES.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-xl border border-slate-800 bg-[#141925] p-5 hover:border-[#c9a25c]/40 transition-colors group"
              >
                <t.icon className="h-5 w-5 text-[#c9a25c] mb-3" />
                <h3 className="text-sm font-semibold text-slate-200 mb-1 group-hover:text-[#c9a25c] transition-colors">{t.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      {stormPosts.length > 0 && (
        <section className="py-20 md:py-28 bg-[#0c0f14]">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-3">All storm guides</p>
                <h2 className="text-3xl font-bold text-slate-50">Every storm scenario, covered.</h2>
              </div>
              <Link href="/blog" className="text-sm text-[#c9a25c] hover:text-[#e6c588] transition-colors hidden sm:flex items-center gap-1">
                All articles <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stormPosts.map((post) => (
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
      <section className="py-20 md:py-28 bg-[#161a23] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-4">Common questions</p>
          <h2 className="text-3xl font-bold text-slate-50 mb-10">Storm damage FAQ</h2>
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
      <section className="py-12 bg-[#0c0f14] border-t border-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { href: '/insurance-help', label: 'Insurance claim help', desc: 'File your claim correctly, track every step' },
              { href: '/services/roof-repair', label: 'Roof repair service', desc: 'Emergency and storm damage repairs' },
              { href: '/services/roof-inspection', label: 'Storm inspection', desc: 'Professional damage assessment report' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-slate-800 bg-[#141925] p-5 hover:border-[#c9a25c]/40 transition-colors group"
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
          <Clock className="h-8 w-8 text-[#c9a25c] mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
            Storm damage doesn&apos;t wait.
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            The longer exposed wood sits wet, the more expensive the repair. Call now or get a damage-based estimate in two minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={getPhoneLink()}>
              <Button
                variant="primary"
                size="xl"
                className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                leftIcon={<Phone className="h-5 w-5" />}
              >
                Call {getPhoneDisplay()}
              </Button>
            </a>
            <Link href="/">
              <Button variant="outline" size="xl" className="border-slate-600 text-slate-300" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Get free estimate
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
