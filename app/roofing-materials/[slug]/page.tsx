import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, XCircle, Clock, DollarSign, Shield, Wind, Flame, ArrowRight, ArrowLeft } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { FAQAccordion } from '@/components/faq/faq-accordion'
import { StartFunnelButton } from '@/components/funnel/start-funnel-button'
import { ScrollAnimate } from '@/components/scroll-animate'
import { getMaterialBySlug, getAllMaterials } from '@/lib/data/roofing-materials'
import { MarkdownContent } from '@/components/shared/markdown-content'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllMaterials().map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const material = getMaterialBySlug(slug)

  if (!material) return { title: 'Not Found' }

  const description = `${material.summary.slice(0, 155).trimEnd()}…`
  const url = `${BASE_URL}/roofing-materials/${slug}`

  return {
    title: `${material.name} for Mississippi Homes — Cost, Lifespan & Guide | Smart Roof Pricing`,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: url },
    keywords: [
      material.name.toLowerCase(),
      `${material.name.toLowerCase()} Mississippi`,
      `${material.name.toLowerCase()} cost`,
      `${material.name.toLowerCase()} lifespan`,
      'roofing materials Northeast Mississippi',
    ],
    openGraph: {
      title: `${material.name} Guide | Smart Roof Pricing`,
      description,
      url,
      siteName: 'Smart Roof Pricing',
      type: 'article',
    },
  }
}

const STAT_ICONS = {
  lifespan: Clock,
  cost: DollarSign,
  warranty: Shield,
  wind: Wind,
  fire: Flame,
}

const STAT_LABELS: Record<string, string> = {
  lifespan: 'Lifespan',
  cost: 'Installed Cost',
  warranty: 'Warranty',
  wind: 'Wind Rating',
  fire: 'Fire Rating',
}

export default async function MaterialGuidePage({ params }: Props) {
  const { slug } = await params
  const material = getMaterialBySlug(slug)

  if (!material) notFound()

  const otherMaterials = getAllMaterials().filter((m) => m.slug !== slug)

  const faqItems = material.faqs.map((f) => ({ question: f.q, answer: f.a }))

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${material.name} for Mississippi Homes`,
    description: material.summary,
    image: `${BASE_URL}${material.image}`,
    url: `${BASE_URL}/roofing-materials/${slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'Smart Roof Pricing',
      url: BASE_URL,
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Roofing Materials', item: `${BASE_URL}/roofing-materials` },
      { '@type': 'ListItem', position: 3, name: material.name, item: `${BASE_URL}/roofing-materials/${slug}` },
    ],
  }

  return (
    <div className="min-h-screen bg-[#0c0f14]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <SiteHeader />
      <Breadcrumbs items={[
        { name: 'Roofing Materials', href: '/roofing-materials' },
        { name: material.name, href: `/roofing-materials/${slug}` },
      ]} />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[460px] md:min-h-[520px] flex items-end">
        <Image
          src={material.image}
          alt={material.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f14] via-[#0c0f14]/60 to-[#0c0f14]/15" />
        <div className="relative z-10 w-full mx-auto max-w-6xl px-4 pb-14 pt-28">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-4">
            {material.eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50 font-display leading-[1.0] tracking-tight max-w-3xl mb-5">
            {material.name}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
            {material.summary.split('.')[0]}.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-slate-800/60 bg-[#0e1118]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap">
            {Object.entries(material.stats).map(([key, value]) => {
              const Icon = STAT_ICONS[key as keyof typeof STAT_ICONS] ?? Shield
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 py-4 px-5 border-r border-slate-800/40 last:border-r-0 min-w-[160px] flex-1"
                >
                  <Icon className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">{STAT_LABELS[key]}</p>
                    <p className="text-sm font-medium text-slate-100 tabular-nums">{value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Summary + Pros/Cons */}
      <section className="py-16 md:py-20 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Summary */}
            <div className="lg:col-span-7">
              <ScrollAnimate>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-3">Overview</p>
                {material.summary.split('. ').reduce<string[][]>((acc, sentence, i) => {
                  // Group into pseudo-paragraphs every 2-3 sentences
                  const groupIdx = Math.floor(i / 3)
                  if (!acc[groupIdx]) acc[groupIdx] = []
                  acc[groupIdx].push(sentence)
                  return acc
                }, []).map((group, i) => (
                  <p key={i} className="text-lg text-slate-300 leading-relaxed mb-4">
                    {group.join('. ')}{group[group.length - 1].endsWith('.') ? '' : '.'}
                  </p>
                ))}
              </ScrollAnimate>
            </div>

            {/* Pros / Cons */}
            <div className="lg:col-span-5 space-y-5">
              <ScrollAnimate delay={80}>
                <div className="rounded-2xl border border-slate-800/80 bg-[#141925] p-6">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#c9a25c] mb-4">Advantages</p>
                  <ul className="space-y-2.5">
                    {material.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <CheckCircle className="h-4 w-4 text-emerald-500/80 flex-shrink-0 mt-0.5" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollAnimate>
              <ScrollAnimate delay={120}>
                <div className="rounded-2xl border border-slate-800/80 bg-[#141925] p-6">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 mb-4">Limitations</p>
                  <ul className="space-y-2.5">
                    {material.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                        <XCircle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollAnimate>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial sections */}
      <section className="py-8 bg-[#0a0d12] border-t border-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-12 gap-8 md:gap-12">
            {/* Sticky TOC on desktop */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 rounded-xl border border-slate-800/60 bg-[#141925] p-5">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500 mb-4">In this guide</p>
                <nav className="space-y-2">
                  {material.sections.map((s, i) => (
                    <a
                      key={i}
                      href={`#section-${i}`}
                      className="block text-sm text-slate-400 hover:text-[#e6c588] transition-colors py-1 leading-snug"
                    >
                      {s.heading}
                    </a>
                  ))}
                  <a
                    href="#ms-context"
                    className="block text-sm text-slate-400 hover:text-[#e6c588] transition-colors py-1 leading-snug"
                  >
                    Mississippi considerations
                  </a>
                  <a
                    href="#faq"
                    className="block text-sm text-slate-400 hover:text-[#e6c588] transition-colors py-1 leading-snug"
                  >
                    Common questions
                  </a>
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-9 py-8">
              {material.sections.map((section, i) => (
                <ScrollAnimate key={i} delay={0}>
                  <article id={`section-${i}`} className="mb-14 scroll-mt-24">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-50 font-display tracking-tight mb-5">
                      {section.heading}
                    </h2>
                    <MarkdownContent content={section.body} />
                  </article>
                </ScrollAnimate>
              ))}

              {/* Mississippi context */}
              <ScrollAnimate>
                <article id="ms-context" className="mb-14 scroll-mt-24">
                  <div className="rounded-2xl border border-[#c9a25c]/20 bg-gradient-to-br from-[#c9a25c]/8 to-transparent p-7 md:p-8">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-3">
                      Northeast Mississippi context
                    </p>
                    <h2 className="text-2xl font-bold text-slate-50 font-display tracking-tight mb-4">
                      How {material.name.toLowerCase()} performs here
                    </h2>
                    <MarkdownContent content={material.msContext} />
                  </div>
                </article>
              </ScrollAnimate>

              {/* Best for / Not ideal for */}
              <ScrollAnimate>
                <div className="grid sm:grid-cols-2 gap-5 mb-14">
                  <div className="rounded-xl border border-slate-800/80 bg-[#141925] p-6">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#c9a25c] mb-3">Best for</p>
                    <ul className="space-y-2">
                      {material.bestFor.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle className="h-4 w-4 text-[#c9a25c] flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-800/80 bg-[#141925] p-6">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500 mb-3">Not ideal for</p>
                    <ul className="space-y-2">
                      {material.notIdealFor.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                          <XCircle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollAnimate>

              {/* FAQ */}
              <ScrollAnimate>
                <div id="faq" className="scroll-mt-24">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-2">FAQ</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-50 font-display tracking-tight mb-8">
                    Common questions about {material.name.toLowerCase()}
                  </h2>
                  <FAQAccordion items={faqItems} />
                </div>
              </ScrollAnimate>
            </div>
          </div>
        </div>
      </section>

      {/* Other materials */}
      {otherMaterials.length > 0 && (
        <section className="py-14 bg-[#0c0f14] border-t border-slate-900">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-6">
              Other materials
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {otherMaterials.map((m) => (
                <Link
                  key={m.slug}
                  href={`/roofing-materials/${m.slug}`}
                  className="group flex items-start gap-4 rounded-xl border border-slate-800/80 bg-[#141925] p-5 hover:border-[#c9a25c]/30 transition-colors"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={m.image} alt={m.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#c9a25c] mb-1">{m.eyebrow}</p>
                    <p className="font-medium text-slate-100 group-hover:text-[#e6c588] transition-colors mb-1">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.stats.lifespan} · {m.stats.cost}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-[#c9a25c] flex-shrink-0 mt-1 transition-colors" />
                </Link>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <Link href="/roofing-materials" className="hover:text-[#c9a25c] transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> All materials
              </Link>
              <span>·</span>
              <Link href="/services/roof-replacement" className="hover:text-[#c9a25c] transition-colors flex items-center gap-1">
                Roof replacement <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <span>·</span>
              <Link href="/services/roof-repair" className="hover:text-[#c9a25c] transition-colors flex items-center gap-1">
                Roof repair <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-14 bg-[#0a0d12] border-t border-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate>
            <div className="rounded-2xl border border-[#c9a25c]/20 bg-gradient-to-br from-[#c9a25c]/10 to-transparent p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#c9a25c] mb-2">Pricing tool</p>
                <h2 className="text-2xl font-bold text-slate-50 font-display mb-1">
                  See what {material.name.toLowerCase()} costs for your home.
                </h2>
                <p className="text-slate-400 text-sm">
                  2 minutes. Northeast Mississippi pricing. Free PDF estimate.
                </p>
              </div>
              <StartFunnelButton className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] font-semibold px-6 py-3.5 rounded-lg transition-all text-sm">
                Get my free estimate
                <ArrowRight className="h-4 w-4" />
              </StartFunnelButton>
            </div>
          </ScrollAnimate>
        </div>
      </section>

      <SiteFooter />
      <div className="h-[60px] lg:hidden" aria-hidden="true" />
    </div>
  )
}
