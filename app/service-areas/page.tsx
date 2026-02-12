import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAllCities, getAllCounties } from '@/lib/data/ms-locations'
import {
  MapPin,
  ArrowRight,
  Phone,
  CheckCircle,
  Star,
  Shield,
} from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { BUSINESS_CONFIG } from '@/lib/config/business'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://smartroofpricing.com'

export const metadata: Metadata = {
  title: 'Service Areas | Farrell Roofing | Northeast Mississippi',
  description: 'Farrell Roofing serves Tupelo, Oxford, Starkville, Columbus, and 20+ cities across Northeast Mississippi. View our complete service area coverage.',
  keywords: [
    'Mississippi roofing',
    'Tupelo roofer',
    'Northeast Mississippi roofing',
    'Lee County roofing',
    'Oxford roofing',
    'Starkville roofing',
  ],
  openGraph: {
    title: 'Service Areas | Farrell Roofing',
    description: 'Serving 20+ cities across Northeast Mississippi with quality roofing services.',
    url: `${BASE_URL}/service-areas`,
    siteName: 'Farrell Roofing',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/api/og?type=service&title=Service%20Areas&subtitle=20%2B%20Cities%20Across%20Northeast%20Mississippi`,
        width: 1200,
        height: 630,
        alt: 'Farrell Roofing Service Areas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Service Areas | Farrell Roofing',
    description: 'Serving 20+ cities across Northeast Mississippi with quality roofing services.',
  },
  alternates: {
    canonical: `${BASE_URL}/service-areas`,
  },
}

export default function ServiceAreasPage() {
  const allCities = getAllCities()
  const allCounties = getAllCounties()

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SiteHeader />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c9a25c]/20 mb-6">
              <MapPin className="h-8 w-8 text-[#c9a25c]" />
            </div>
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              Northeast Mississippi Service Areas
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              Proudly serving Tupelo and {allCities.length - 1}+ communities across Northeast Mississippi with quality roofing services.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {BUSINESS_CONFIG.reviews.googleRating && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Star className="w-5 h-5 text-[#c9a25c] fill-[#c9a25c]" />
                  <span>{BUSINESS_CONFIG.reviews.googleRating} Rating</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-300">
                <Shield className="w-5 h-5 text-[#c9a25c]" />
                <span>Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-5 h-5 text-[#c9a25c]" />
                <span>{allCounties.length} Counties</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas Map Placeholder */}
      <section className="py-12 bg-[#0c0f14] border-y border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <MapPin className="h-12 w-12 text-[#c9a25c] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-100 mb-2">Northeast Mississippi Coverage</h3>
              <p className="text-slate-400">
                Based in Tupelo, we serve a wide radius across {allCounties.length} counties and {allCities.length}+ cities throughout Northeast Mississippi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Market - Tupelo Metro */}
      <section className="py-16 md:py-20 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Primary Service Area - Tupelo Metro</h2>
            <p className="text-slate-400">Our home base and surrounding Lee County communities.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allCities
              .filter(city => city.county === 'Lee')
              .map((city) => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}-roofing`}
                  className={`group flex items-center justify-between p-4 rounded-lg border transition-all ${
                    city.isHQ
                      ? 'bg-[#c9a25c]/10 border-[#c9a25c]/30 hover:border-[#c9a25c]'
                      : 'bg-[#1a1f2e] border-slate-700 hover:border-[#c9a25c]/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${city.isHQ ? 'text-[#c9a25c]' : 'text-[#3d7a5a]'}`} />
                    <span className="text-slate-200 group-hover:text-white">{city.name}</span>
                  </div>
                  {city.isHQ && (
                    <span className="text-xs bg-[#c9a25c] text-[#0c0f14] px-2 py-0.5 rounded-full font-semibold">
                      HQ
                    </span>
                  )}
                </Link>
              ))}
          </div>

          {/* Lee County Link */}
          <div className="mt-6 text-center">
            <Link
              href="/lee-county-roofing"
              className="inline-flex items-center gap-2 text-[#c9a25c] hover:text-[#c9a25c]/80 transition-colors"
            >
              View all Lee County services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Secondary Markets */}
      <section className="py-16 md:py-20 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Extended Service Area</h2>
            <p className="text-slate-400">Cities within 30-45 minutes of Tupelo.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allCities
              .filter(city => city.county !== 'Lee' && ['high', 'medium'].includes(city.priority))
              .sort((a, b) => (a.priority === 'high' ? -1 : 1) - (b.priority === 'high' ? -1 : 1))
              .map((city) => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}-roofing`}
                  className="group flex items-center justify-between p-4 rounded-lg border bg-[#1a1f2e] border-slate-700 hover:border-[#c9a25c]/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${city.priority === 'high' ? 'text-[#c9a25c]' : 'text-[#3d7a5a]'}`} />
                    <span className="text-slate-200 group-hover:text-white">{city.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">{city.county}</span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Counties */}
      <section className="py-16 md:py-20 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Counties We Serve</h2>
            <p className="text-slate-400">Full coverage across {allCounties.length} Mississippi counties.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {allCounties.map((county) => (
              <Link
                key={county.slug}
                href={`/${county.slug}-roofing`}
                className="group flex flex-col p-4 rounded-lg border bg-[#1a1f2e] border-slate-700 hover:border-[#c9a25c]/50 transition-all"
              >
                <span className="text-slate-200 group-hover:text-white font-medium">{county.name}</span>
                <span className="text-xs text-slate-500 mt-1">{county.cities.length} cities</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* College Towns Highlight */}
      <section className="py-16 md:py-20 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="bg-gradient-to-r from-[#c9a25c]/10 to-transparent border border-[#c9a25c]/20 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-slate-100 mb-4">
                Serving Mississippi&apos;s College Towns
              </h2>
              <p className="text-slate-400 mb-8">
                We proudly extend our service area to Oxford (Ole Miss) and Starkville (Mississippi State), providing premium roofing services to homeowners and investors in these vibrant university communities.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/oxford-roofing"
                  className="inline-flex items-center gap-2 bg-[#1a1f2e] border border-slate-700 hover:border-[#c9a25c] px-6 py-3 rounded-lg text-slate-200 hover:text-white transition-all"
                >
                  <MapPin className="w-4 h-4 text-[#c9a25c]" />
                  Oxford (Ole Miss)
                </Link>
                <Link
                  href="/starkville-roofing"
                  className="inline-flex items-center gap-2 bg-[#1a1f2e] border border-slate-700 hover:border-[#c9a25c] px-6 py-3 rounded-lg text-slate-200 hover:text-white transition-all"
                >
                  <MapPin className="w-4 h-4 text-[#c9a25c]" />
                  Starkville (MS State)
                </Link>
                <Link
                  href="/columbus-roofing"
                  className="inline-flex items-center gap-2 bg-[#1a1f2e] border border-slate-700 hover:border-[#c9a25c] px-6 py-3 rounded-lg text-slate-200 hover:text-white transition-all"
                >
                  <MapPin className="w-4 h-4 text-[#c9a25c]" />
                  Columbus
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compare Local Roofers */}
      <section className="py-16 md:py-20 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Compare Local Roofers</h2>
            <p className="text-slate-400">Find the best roofing companies in your city with our comparison guides.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allCities
              .filter(city => city.priority === 'high' || city.isHQ)
              .slice(0, 8)
              .map((city) => (
                <Link
                  key={`compare-${city.slug}`}
                  href={`/best-roofers-in-${city.slug}-ms`}
                  className="group flex items-center gap-2 p-4 rounded-lg border bg-[#1a1f2e] border-slate-700 hover:border-[#c9a25c]/50 transition-all"
                >
                  <Star className="h-4 w-4 text-[#c9a25c]" />
                  <span className="text-slate-200 group-hover:text-white text-sm">
                    Best Roofers in {city.name}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Not in area? */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">
            Don&apos;t See Your City?
          </h2>
          <p className="text-slate-400 mb-8">
            We may still be able to help. Contact us to see if we can service your area, or if we can recommend a trusted contractor near you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300"
                leftIcon={<Phone className="h-5 w-5" />}
              >
                Contact Us
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="primary"
                size="lg"
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
