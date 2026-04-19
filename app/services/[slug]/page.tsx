import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  ArrowRight,
  Check,
} from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { ServiceSchemaBundle } from '@/components/seo/service-schema'
import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { FAQAccordion } from '@/components/faq/faq-accordion'
import { StartFunnelButton } from '@/components/funnel/start-funnel-button'
import { ScrollAnimate } from '@/components/scroll-animate'
import { getServiceBySlug, services } from '@/lib/data/services'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const service = getServiceBySlug(resolvedParams.slug)

  if (!service) return { title: 'Service Not Found' }

  const firstPara = service.fullDescription.split('\n\n')[0]
  const description = `${firstPara.slice(0, 155).trimEnd()}… Get a free estimate in 2 minutes.`
  const url = `${BASE_URL}/services/${service.slug}`
  const ogImageUrl = `${BASE_URL}/api/og?type=service&title=${encodeURIComponent(service.name)}&subtitle=${encodeURIComponent(service.shortDescription)}`

  return {
    title: `${service.name} in Northeast Mississippi | Smart Roof Pricing`,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: url },
    keywords: [
      service.name.toLowerCase(),
      `${service.name.toLowerCase()} Mississippi`,
      `${service.name.toLowerCase()} Tupelo`,
      'roofing contractor Northeast Mississippi',
    ],
    openGraph: {
      title: `${service.name} | Smart Roof Pricing`,
      description,
      url,
      siteName: 'Smart Roof Pricing',
      locale: 'en_US',
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: service.name, type: 'image/png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${service.name} | Smart Roof Pricing`,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const resolvedParams = await params
  const service = getServiceBySlug(resolvedParams.slug)

  if (!service) notFound()

  const paragraphs = service.fullDescription.split('\n\n').filter(Boolean)
  const otherServices = services.filter((s) => s.id !== service.id).slice(0, 3)

  return (
    <div className="min-h-screen bg-[#0c0f14]">
      <ServiceSchemaBundle service={service} />
      <SiteHeader />

      <Breadcrumbs items={[
        { name: 'Services', href: '/services' },
        { name: service.name, href: `/services/${service.slug}` },
      ]} />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[480px] md:min-h-[560px] flex items-end">
        {service.image ? (
          <>
            <Image
              src={service.image}
              alt={service.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f14] via-[#0c0f14]/65 to-[#0c0f14]/20" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#161a23]" />
        )}

        <div className="relative z-10 w-full mx-auto max-w-6xl px-4 pb-14 pt-28">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-4">
            {service.id === 'replacement' ? 'Full replacement' :
             service.id === 'repair' ? 'Targeted repair' :
             service.id === 'inspection' ? 'Inspection & assessment' :
             service.id === 'gutters' ? 'Gutters & drainage' :
             service.id === 'maintenance' ? 'Preventive maintenance' :
             '24/7 emergency response'}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50 font-display leading-[1.0] tracking-tight max-w-3xl">
            {service.name}
          </h1>
          <p className="mt-5 text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
            {service.shortDescription}
          </p>

          {/* At a glance strip */}
          <div className="mt-8 flex flex-wrap gap-3">
            {service.priceRange && (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a25c]/30 bg-[#c9a25c]/10 px-4 py-2 text-sm text-[#e6c588]">
                <DollarSign className="h-4 w-4 flex-shrink-0" />
                {service.priceRange}
              </div>
            )}
            {service.timeframe && (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/40 px-4 py-2 text-sm text-slate-300">
                <Clock className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
                {service.timeframe}
              </div>
            )}
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/40 px-4 py-2 text-sm text-slate-300">
              <Shield className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
              {service.warranty.workmanship.split('.')[0]}
            </div>
          </div>
        </div>
      </section>

      {/* Full description */}
      <section className="py-16 md:py-20 bg-[#0c0f14] border-t border-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7">
              <ScrollAnimate>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-4">Overview</p>
                <div className="space-y-5">
                  {paragraphs.map((para, i) => (
                    <p key={i} className="text-lg text-slate-300 leading-relaxed">{para}</p>
                  ))}
                </div>
              </ScrollAnimate>
            </div>

            <div className="lg:col-span-5">
              <ScrollAnimate delay={100}>
                <div className="rounded-2xl border border-slate-800/80 bg-[#141925] p-7 space-y-6">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#c9a25c] mb-3">
                      When to choose this
                    </p>
                    <ul className="space-y-2.5">
                      {service.whenToChoose.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <Check className="h-4 w-4 text-[#c9a25c] flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-slate-800 pt-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#c9a25c] mb-3">
                      Warranty
                    </p>
                    <div className="space-y-2 text-sm text-slate-400">
                      <p><span className="text-slate-300 font-medium">Manufacturer:</span> {service.warranty.manufacturer.split('.')[0]}.</p>
                      <p><span className="text-slate-300 font-medium">Workmanship:</span> {service.warranty.workmanship}</p>
                    </div>
                  </div>
                  <StartFunnelButton className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] font-semibold px-5 py-3 rounded-lg transition-all text-sm w-full text-center">
                    Get my free estimate
                  </StartFunnelButton>
                </div>
              </ScrollAnimate>
            </div>
          </div>
        </div>
      </section>

      {/* How the work goes */}
      <section className="py-16 md:py-20 bg-[#0a0d12] border-t border-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-2">Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 font-display tracking-tight mb-12">
              How the work goes
            </h2>
          </ScrollAnimate>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {service.includedSteps.map((step, i) => (
              <ScrollAnimate key={i} delay={i * 60}>
                <div className="relative rounded-xl border border-slate-800/80 bg-[#141925] p-6">
                  <span className="block text-[42px] font-bold text-slate-800/60 font-display leading-none mb-4 select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-base font-semibold text-slate-100 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      {/* Materials & options — only shown when data exists */}
      {service.materialOptions && service.materialOptions.length > 0 && (
        <section className="py-16 md:py-20 bg-[#0c0f14] border-t border-slate-900">
          <div className="mx-auto max-w-6xl px-4">
            <ScrollAnimate>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-2">
                Options
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-50 font-display tracking-tight mb-4">
                Materials &amp; options
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mb-12">
                Every option below comes with our same transparent pricing model. The right choice depends on your budget, your timeline, and how long you plan to own the home.
              </p>
            </ScrollAnimate>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Option</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Lifespan</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Installed Cost</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-[0.15em] text-slate-500 hidden lg:table-cell">Best For</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {service.materialOptions.map((opt, i) => (
                    <ScrollAnimate key={i} delay={i * 50}>
                      <tr className="border-b border-slate-800/50 hover:bg-[#141925] transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-medium text-slate-100">{opt.name}</p>
                          <p className="text-xs text-[#c9a25c] mt-0.5">{opt.pros.split(',')[0]}</p>
                        </td>
                        <td className="py-4 px-4 text-slate-300">{opt.lifespan}</td>
                        <td className="py-4 px-4 text-[#e6c588] font-medium tabular-nums">{opt.priceRange}</td>
                        <td className="py-4 px-4 text-slate-400 hidden lg:table-cell text-xs max-w-[200px]">{opt.bestFor}</td>
                        <td className="py-4 px-4">
                          {opt.guideSlug && (
                            <Link href={`/roofing-materials/${opt.guideSlug}`} className="text-xs text-[#c9a25c] hover:text-[#e6c588] transition-colors whitespace-nowrap flex items-center gap-1">
                              Guide <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    </ScrollAnimate>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {service.materialOptions.map((opt, i) => (
                <ScrollAnimate key={i} delay={i * 50}>
                  <div className="rounded-xl border border-slate-800/80 bg-[#141925] p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-slate-100">{opt.name}</h3>
                      <span className="text-[#e6c588] font-medium text-sm tabular-nums flex-shrink-0">{opt.priceRange}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-slate-500">Lifespan</span>
                        <p className="text-slate-300 mt-0.5">{opt.lifespan}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Best for</span>
                        <p className="text-slate-300 mt-0.5 line-clamp-2">{opt.bestFor}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#c9a25c]">{opt.pros.split(',')[0]}</p>
                      {opt.guideSlug && (
                        <Link href={`/roofing-materials/${opt.guideSlug}`} className="text-xs text-[#c9a25c] hover:text-[#e6c588] transition-colors flex items-center gap-1">
                          Guide <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </ScrollAnimate>
              ))}
            </div>

            <div className="mt-5 text-sm">
              <Link href="/roofing-materials" className="text-slate-500 hover:text-[#c9a25c] transition-colors flex items-center gap-1 w-fit">
                Compare all roofing materials in depth <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* What's included */}
      <section className="py-16 md:py-20 bg-[#0a0d12] border-t border-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <ScrollAnimate>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-2">
                Scope
              </p>
              <h2 className="text-3xl font-bold text-slate-50 font-display tracking-tight mb-8">
                What&apos;s included
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {service.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </ScrollAnimate>

            <ScrollAnimate delay={100}>
              <div className="rounded-2xl border border-[#c9a25c]/20 bg-gradient-to-br from-[#c9a25c]/10 to-transparent p-7 h-fit">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#c9a25c] mb-3">
                  Get a number for your roof
                </p>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">
                  Every roof is different. Get a real price range based on your home&apos;s size, pitch, and material — in about 2 minutes.
                </p>
                <StartFunnelButton className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] font-semibold px-5 py-3 rounded-lg transition-all text-sm w-full text-center inline-flex items-center justify-center gap-2">
                  Get my free estimate
                  <ArrowRight className="h-4 w-4" />
                </StartFunnelButton>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>2 minutes</span>
                  <span>·</span>
                  <span>No account required</span>
                  <span>·</span>
                  <span>Free PDF estimate</span>
                </div>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-[#0c0f14] border-t border-slate-900">
        <div className="mx-auto max-w-4xl px-4">
          <ScrollAnimate>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] mb-2 text-center">
              Common questions
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 font-display tracking-tight mb-10 text-center">
              Everything you&apos;re wondering about
            </h2>
          </ScrollAnimate>
          <FAQAccordion items={service.commonFaqs} />
        </div>
      </section>

      {/* Related services */}
      <section className="py-14 md:py-16 bg-[#0a0d12] border-t border-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-6">
            Other services
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {otherServices.map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                className="group flex items-start justify-between gap-3 rounded-xl border border-slate-800/80 bg-[#141925] p-5 hover:border-[#c9a25c]/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-100 group-hover:text-[#e6c588] transition-colors mb-1">
                    {s.name}
                  </p>
                  <p className="text-xs text-slate-500">{s.shortDescription}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-[#c9a25c] flex-shrink-0 mt-1 transition-colors" />
              </Link>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
            <Link href="/services" className="hover:text-[#c9a25c] transition-colors flex items-center gap-1">
              All services <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <span>·</span>
            <Link href="/roofing-materials" className="hover:text-[#c9a25c] transition-colors flex items-center gap-1">
              Roofing materials guide <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
      <div className="h-[60px] lg:hidden" aria-hidden="true" />
    </div>
  )
}
