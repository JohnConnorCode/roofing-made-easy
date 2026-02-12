import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { services } from '@/lib/data/services'
import {
  Home,
  Wrench,
  Search,
  Droplet,
  Shield,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { ServicesListSchema, BreadcrumbSchema } from '@/components/seo/list-schema'
import { BUSINESS_CONFIG } from '@/lib/config/business'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

export const metadata: Metadata = {
  title: `Roofing Services | Roof Repair, Replacement & More | ${BUSINESS_CONFIG.name}`,
  description: `Professional roofing services in ${BUSINESS_CONFIG.address.city}, ${BUSINESS_CONFIG.address.stateCode}. Roof replacement, repair, storm damage restoration, inspections, and gutter services. Free estimates available.`,
  keywords: [
    'roofing services',
    'roof replacement',
    'roof repair',
    'roof inspection',
    'gutter installation',
    `${BUSINESS_CONFIG.address.city} roofing services`,
    BUSINESS_CONFIG.serviceArea.region,
  ],
  openGraph: {
    title: `Roofing Services | ${BUSINESS_CONFIG.name}`,
    description: `Complete roofing services for ${BUSINESS_CONFIG.serviceArea.region} homeowners. From repairs to full replacements.`,
    url: `${BASE_URL}/services`,
    siteName: BUSINESS_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=service&title=Our%20Roofing%20Services&subtitle=Repair%20%E2%80%A2%20Replacement%20%E2%80%A2%20Inspection%20%E2%80%A2%20Gutters`,
        width: 1200,
        height: 630,
        alt: `${BUSINESS_CONFIG.name} Services`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Roofing Services | ${BUSINESS_CONFIG.name}`,
    description: `Professional roofing services in ${BUSINESS_CONFIG.serviceArea.region}. Free estimates available.`,
  },
  alternates: {
    canonical: `${BASE_URL}/services`,
  },
}

const iconMap: Record<string, React.ReactNode> = {
  home: <Home className="h-8 w-8" />,
  wrench: <Wrench className="h-8 w-8" />,
  search: <Search className="h-8 w-8" />,
  droplet: <Droplet className="h-8 w-8" />,
  shield: <Shield className="h-8 w-8" />,
  alert: <AlertTriangle className="h-8 w-8" />,
}

export default function ServicesPage() {
  const breadcrumbs = [
    { name: 'Home', url: BASE_URL },
    { name: 'Services', url: `${BASE_URL}/services` },
  ]

  const serviceItems = services.map(s => ({
    name: s.name,
    slug: s.slug,
    description: s.shortDescription,
    priceRange: s.priceRange,
  }))

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Structured Data */}
      <ServicesListSchema
        services={serviceItems}
        pageTitle="Roofing Services"
        pageDescription={`Professional roofing services offered by ${BUSINESS_CONFIG.name} in ${BUSINESS_CONFIG.serviceArea.region}`}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <SiteHeader />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              Our Roofing Services
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              From minor repairs to complete replacements, we handle every aspect of residential roofing with expertise and care.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 hover:border-[#c9a25c]/50 transition-colors"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] text-[#0c0f14] mb-6">
                  {iconMap[service.icon] || <Home className="h-8 w-8" />}
                </div>

                <h3 className="text-xl font-bold text-slate-100 mb-2">{service.name}</h3>
                <p className="text-slate-400 mb-4">{service.shortDescription}</p>

                <div className="space-y-2 mb-6">
                  {service.priceRange && (
                    <p className="text-sm">
                      <span className="text-slate-500">Typical cost: </span>
                      <span className="text-[#c9a25c]">{service.priceRange}</span>
                    </p>
                  )}
                  {service.timeframe && (
                    <p className="text-sm">
                      <span className="text-slate-500">Timeframe: </span>
                      <span className="text-slate-300">{service.timeframe}</span>
                    </p>
                  )}
                </div>

                <Link href={`/services/${service.slug}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#c9a25c] hover:bg-[#c9a25c]/10 p-0"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100">Why Choose Farrell Roofing?</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 stagger-children">
            {[
              { title: 'Licensed & Insured', desc: 'Full coverage for your protection' },
              { title: 'Free Estimates', desc: 'No obligation, transparent pricing' },
              { title: '20+ Years Experience', desc: 'Trusted by thousands of homeowners' },
              { title: 'Warranty Backed', desc: 'Materials and workmanship guaranteed' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#3d7a5a]/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-[#3d7a5a]" />
                  </div>
                </div>
                <h3 className="font-semibold text-slate-100 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-[#0c0f14] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Get a free estimate in under 2 minutes. No pressure, just honest pricing.
          </p>
          <div className="mt-8">
            <Link href="/">
              <Button
                variant="primary"
                size="xl"
                className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Get Free Estimate
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
