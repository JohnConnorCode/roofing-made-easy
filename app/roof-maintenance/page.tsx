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
  CheckCircle,
  AlertTriangle,
  Calendar,
  Eye,
  Wrench,
  Leaf,
  Sun,
  Snowflake,
  Droplets,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export const metadata: Metadata = {
  title: `Roof Maintenance Guide for Mississippi Homeowners | ${BUSINESS_CONFIG.name}`,
  description: `Roof maintenance in Mississippi: humidity, pine needles, moss, ice storms, and 100°F summers all demand a different approach. Month-by-month maintenance schedules, DIY checks, and professional service guides for Northeast Mississippi homeowners.`,
  keywords: [
    'roof maintenance Mississippi',
    'roof maintenance schedule Mississippi',
    'Mississippi roof care guide',
    'when to inspect roof Mississippi',
    'roof upkeep tips Mississippi',
    'annual roof inspection Mississippi',
    'gutter maintenance Mississippi',
    'moss algae roof Mississippi',
  ],
  openGraph: {
    title: `Roof Maintenance Guide | ${BUSINESS_CONFIG.serviceArea.region} | ${BUSINESS_CONFIG.name}`,
    description: `Keep your Mississippi roof for 30+ years. Month-by-month maintenance, humidity and moss control, and seasonal guides for Northeast Mississippi homeowners.`,
    url: `${BASE_URL}/roof-maintenance`,
    siteName: BUSINESS_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=service&title=Roof%20Maintenance%20Guide&subtitle=Mississippi%20Seasonal%20Care%20%E2%80%A2%20Inspection%20%E2%80%A2%20Prevention`,
        width: 1200,
        height: 630,
        alt: 'Roof Maintenance Guide — Northeast Mississippi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Roof Maintenance Guide | ${BUSINESS_CONFIG.name}`,
    description: `Month-by-month roof maintenance for Mississippi homeowners. Humidity, pine needles, moss, and storm prep.`,
  },
  alternates: {
    canonical: `${BASE_URL}/roof-maintenance`,
  },
}

export const revalidate = 3600

const FAQ_ITEMS = [
  {
    question: 'How often should you inspect your roof in Mississippi?',
    answer: 'Twice a year: once in spring (after storm season) and once in fall (before winter). Mississippi\'s combination of hot humid summers, storm season, and occasional ice events means more wear than drier climates. Also inspect after any significant storm — hail and high winds can cause damage that\'s invisible from the ground but allows water intrusion for months before it shows inside.',
  },
  {
    question: 'How do I get rid of moss and algae on my Mississippi roof?',
    answer: 'For light algae (the black streaking), zinc or copper strips near the ridge slow regrowth — rainwater carries metal ions down the roof. For established moss, a diluted bleach solution (1:1 with water) applied with a low-pressure sprayer kills the root structure. Never pressure wash — it strips granules and voids most warranties. The dark staining you see is typically Gloeocapsa magma algae, not damage, but it does accelerate shingle degradation over time.',
  },
  {
    question: 'Why do Mississippi roofs grow moss faster than in other states?',
    answer: 'Mississippi\'s humidity (averaging 70–85%) combined with tree canopy shade creates ideal conditions for algae and moss. Pine trees are a compounding problem — pine needles hold moisture against shingles and create the damp habitat moss needs. Regular gutter clearing and trimming branches back 6–10 feet from the roofline reduces moss dramatically. Impact-resistant or algae-resistant shingles (with copper-infused granules) can cut regrowth by 80%.',
  },
  {
    question: 'Do gutters really matter for roof longevity?',
    answer: 'More than most homeowners realize. Clogged gutters allow water to back up under shingles at the eave — the #1 source of residential water intrusion in Mississippi. They also cause fascia rot and foundation erosion. Mississippi\'s pine tree density means gutters need clearing 2–3 times per year (spring, fall, and often mid-summer after cone drop). Gutter guards help but aren\'t maintenance-free.',
  },
  {
    question: 'What\'s the biggest roof maintenance mistake Mississippi homeowners make?',
    answer: 'Not inspecting after storms. A small hail event that doesn\'t obviously damage shingles can still crack the asphalt mat beneath, creating invisible points of failure. When you\'re due a full replacement in 3 years and an adjuster looks at the roof, undocumented hail events may be attributed to "wear and tear" rather than storm damage — meaning your insurer covers less. Annual inspections with documented reports protect you at claim time.',
  },
]

const SEASONAL_TASKS = [
  {
    season: 'Spring (Mar–May)',
    icon: Leaf,
    color: 'text-green-400',
    tasks: [
      'Full visual inspection after storm season',
      'Clear debris and pine needles from valleys',
      'Inspect and clean gutters post-winter',
      'Check flashings around chimneys and vents',
      'Look for any missing or lifted shingles from winter ice',
    ],
  },
  {
    season: 'Summer (Jun–Aug)',
    icon: Sun,
    color: 'text-yellow-400',
    tasks: [
      'Check attic ventilation for heat buildup',
      'Inspect for algae and moss starting on north-facing slopes',
      'Mid-summer gutter clear (pine cone season)',
      'Check pipe boots and penetration seals',
      'Trim overhanging branches before storm season',
    ],
  },
  {
    season: 'Fall (Sep–Nov)',
    icon: Calendar,
    color: 'text-orange-400',
    tasks: [
      'Full pre-winter inspection',
      'Clear all gutters after leaf drop',
      'Apply zinc/copper treatment for moss prevention',
      'Check attic insulation before heating season',
      'Inspect ridge cap shingles for cracking',
    ],
  },
  {
    season: 'Winter (Dec–Feb)',
    icon: Snowflake,
    color: 'text-blue-400',
    tasks: [
      'Monitor attic for condensation after temperature swings',
      'Check for ice dam formation at eaves (rare but happens)',
      'Inspect soffit vents for blockage',
      'Document any storm events with photos',
      'Schedule spring inspection appointment now',
    ],
  },
]

const COMMON_ISSUES = [
  {
    issue: 'Moss & algae',
    href: '/blog/moss-algae-prevention-mississippi-roof',
    severity: 'medium' as const,
    desc: 'Grows in shade and humidity. Degrades asphalt over time.',
  },
  {
    issue: 'Gutter backup',
    href: '/blog/gutter-maintenance-mississippi-guide',
    severity: 'high' as const,
    desc: 'Leads to eave rot and water intrusion under shingles.',
  },
  {
    issue: 'Attic ventilation failure',
    href: '/blog/attic-ventilation-mississippi-guide',
    severity: 'high' as const,
    desc: 'Shortens shingle life by 30–40% in Mississippi heat.',
  },
  {
    issue: 'Attic mold',
    href: '/blog/attic-mold-mississippi-roof-connection',
    severity: 'high' as const,
    desc: 'Usually a ventilation or leak problem — fix the source.',
  },
  {
    issue: 'Roof leaks',
    href: '/blog/roof-leak-detection-mississippi-homeowner',
    severity: 'high' as const,
    desc: 'Locate the source before water migrates to ceiling staining.',
  },
  {
    issue: 'Annual inspection gaps',
    href: '/blog/annual-roof-inspection-checklist-mississippi',
    severity: 'medium' as const,
    desc: 'Document damage yearly to protect future insurance claims.',
  },
]

const SEVERITY_COLORS = {
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  low: 'text-green-400 bg-green-500/10 border-green-500/20',
}

export default async function RoofMaintenancePage() {
  const maintenancePosts = await getPostsByCategory('Maintenance & Care').catch(() => [])

  const breadcrumbs = [
    { name: 'Home', url: BASE_URL },
    { name: 'Roof Maintenance', url: `${BASE_URL}/roof-maintenance` },
  ]

  return (
    <div className="min-h-screen bg-gradient-dark">
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema items={FAQ_ITEMS} />

      <SiteHeader />
      <Breadcrumbs items={[{ name: 'Roof Maintenance', href: '/roof-maintenance' }]} />

      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-[#0c0f14]">
        <div className="absolute inset-0">
          <Image
            src="/images/services/roof-inspection.jpg"
            alt="Professional roof inspection in Northeast Mississippi — checking shingles and flashings"
            fill
            className="object-cover object-top opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f14] via-[#0c0f14]/80 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c] mb-4">
              Roof Maintenance · Northeast Mississippi
            </p>
            <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.05] font-bold tracking-tight text-slate-50 font-display mb-6">
              A well-maintained roof<br />
              lasts 30 years in Mississippi.
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
              Mississippi humidity, pine trees, UV exposure, and storm seasons are harder on roofs than most climates. But with a simple seasonal routine, the same 30-year architectural shingles that fail in 18 years on a neglected house go the full distance on a maintained one.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/services/roof-inspection">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Schedule inspection
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

      {/* Mississippi-specific context */}
      <section className="py-14 bg-[#161a23] border-y border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { stat: '70–85%', label: 'Average humidity in Mississippi', sub: 'Accelerates moss, algae, and wood rot' },
              { stat: '2–3×', label: 'Gutter clears needed per year', sub: 'Pine needles and leaves clog fast' },
              { stat: '+12 yrs', label: 'Extra roof life from annual maintenance', sub: 'vs. zero-maintenance neglect' },
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

      {/* Seasonal Maintenance */}
      <section className="py-20 md:py-28 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-4">Season by season</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 font-display mb-12">
            Mississippi maintenance calendar.
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {SEASONAL_TASKS.map((s) => (
              <div key={s.season} className="rounded-2xl border border-slate-800/80 bg-[#141925] p-7">
                <div className="flex items-center gap-3 mb-5">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <h3 className="text-lg font-semibold text-slate-100">{s.season}</h3>
                </div>
                <ul className="space-y-2.5">
                  {s.tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 text-[#c9a25c] flex-shrink-0 mt-0.5" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Issues */}
      <section className="py-16 bg-[#161a23] border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-4">Most common problems</p>
          <h2 className="text-3xl font-bold text-slate-50 mb-10">What catches Mississippi homeowners off guard.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMMON_ISSUES.map((issue) => (
              <Link
                key={issue.href}
                href={issue.href}
                className="group rounded-xl border border-slate-800 bg-[#141925] p-5 hover:border-[#c9a25c]/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-200 group-hover:text-[#c9a25c] transition-colors">{issue.issue}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[issue.severity]}`}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{issue.desc}</p>
                <span className="text-xs text-[#c9a25c]">Full guide →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      {maintenancePosts.length > 0 && (
        <section className="py-20 md:py-28 bg-[#0c0f14]">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-3">Maintenance guides</p>
                <h2 className="text-3xl font-bold text-slate-50">Everything about roof upkeep.</h2>
              </div>
              <Link href="/blog" className="text-sm text-[#c9a25c] hover:text-[#e6c588] transition-colors hidden sm:flex items-center gap-1">
                All articles <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {maintenancePosts.map((post) => (
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
          <h2 className="text-3xl font-bold text-slate-50 mb-10">Roof maintenance FAQ</h2>
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
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { href: '/services/roof-inspection', label: 'Roof inspection', desc: 'Professional annual inspection service' },
              { href: '/services/roof-repair', label: 'Roof repair', desc: 'Fix problems before they get expensive' },
              { href: '/storm-damage', label: 'Storm damage', desc: 'After a storm: document and claim correctly' },
              { href: '/roofing-materials', label: 'Material guides', desc: 'Which materials need the least maintenance' },
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
          <Eye className="h-8 w-8 text-[#c9a25c] mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
            When was your last inspection?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Most Mississippi homeowners don&apos;t find out about roof damage until it shows up as a ceiling stain. An annual inspection catches problems when they&apos;re still cheap.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                variant="primary"
                size="xl"
                className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Get inspection estimate
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
