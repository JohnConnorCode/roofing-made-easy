'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getServiceBySlug, services } from '@/lib/data/services'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react'
import { SiteFooter } from '@/components/layout/site-footer'
import { PageHeader } from '@/components/layout/page-header'

export default function ServiceDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const service = getServiceBySlug(slug)

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">Service Not Found</h1>
          <Link href="/services">
            <Button variant="outline" className="border-slate-600 text-slate-300">
              View All Services
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <PageHeader activeLink="/services" />

      {/* Breadcrumb */}
      <div className="bg-[#161a23] border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#c9a25c]"
          >
            <ArrowLeft className="h-4 w-4" />
            All Services
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              {service.name}
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              {service.fullDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-6 animate-slide-up delay-200">
              {service.priceRange && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#c9a25c]" />
                  <span className="text-slate-300">{service.priceRange}</span>
                </div>
              )}
              {service.timeframe && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#c9a25c]" />
                  <span className="text-slate-300">{service.timeframe}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 mb-6">What's Included</h2>
              <div className="space-y-3">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#3d7a5a] mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-100 mb-6">Materials We Use</h2>
              <div className="space-y-3">
                {service.materials.map((material, index) => (
                  <div
                    key={index}
                    className="bg-[#1a1f2e] border border-slate-700 rounded-lg p-4"
                  >
                    <span className="text-slate-300">{material}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-[#c9a25c]/20 to-transparent border border-[#c9a25c]/30 rounded-xl">
                <h3 className="font-semibold text-slate-100 mb-2">Get a Personalized Estimate</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Every roof is different. Get an accurate price range for your specific situation.
                </p>
                <Link href="/">
                  <Button
                    variant="primary"
                    className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Get Free Estimate
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-100 mb-8">Other Services</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {services
              .filter((s) => s.id !== service.id)
              .slice(0, 3)
              .map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-4 hover:border-[#c9a25c]/50 transition-colors"
                >
                  <h3 className="font-semibold text-slate-100 mb-1">{s.name}</h3>
                  <p className="text-sm text-slate-400">{s.shortDescription}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
