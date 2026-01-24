'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { serviceRegions, getAllServiceAreas } from '@/lib/data/service-areas'
import {
  Home,
  MapPin,
  ArrowRight,
  Phone,
  CheckCircle,
} from 'lucide-react'

export default function ServiceAreasPage() {
  const allAreas = getAllServiceAreas()

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0c0f14]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] shadow-lg">
                <Home className="h-6 w-6 text-[#0c0f14]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100">RoofEstimate</h1>
                <p className="text-xs text-slate-500">by Farrell Roofing</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/about" className="text-sm text-slate-400 hover:text-[#c9a25c]">About</Link>
              <Link href="/services" className="text-sm text-slate-400 hover:text-[#c9a25c]">Services</Link>
              <Link href="/portfolio" className="text-sm text-slate-400 hover:text-[#c9a25c]">Portfolio</Link>
              <Link href="/contact" className="text-sm text-slate-400 hover:text-[#c9a25c]">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c9a25c]/20 mb-6">
              <MapPin className="h-8 w-8 text-[#c9a25c]" />
            </div>
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              Areas We Serve
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              Proudly serving the Greater Austin area and surrounding communities with quality roofing services.
            </p>
          </div>
        </div>
      </section>

      {/* Service Areas Map Placeholder */}
      <section className="py-12 bg-[#0c0f14] border-y border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <MapPin className="h-12 w-12 text-[#c9a25c] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-100 mb-2">Central Texas Coverage</h3>
              <p className="text-slate-400">
                We serve a 50-mile radius around Austin, covering {allAreas.length}+ cities and communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Regions */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="space-y-12">
            {serviceRegions.map((region, regionIndex) => (
              <div key={region.name}>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">{region.name}</h2>
                <p className="text-slate-400 mb-6">{region.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {region.areas.map((area) => (
                    <div
                      key={area.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border ${
                        area.isMainArea
                          ? 'bg-[#c9a25c]/10 border-[#c9a25c]/30'
                          : 'bg-[#1a1f2e] border-slate-700'
                      }`}
                    >
                      <CheckCircle className={`h-4 w-4 ${area.isMainArea ? 'text-[#c9a25c]' : 'text-[#3d7a5a]'}`} />
                      <span className="text-slate-200">{area.name}</span>
                      {area.isMainArea && (
                        <span className="text-xs bg-[#c9a25c] text-[#0c0f14] px-2 py-0.5 rounded-full ml-auto">
                          HQ
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Not in area? */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">
            Don't See Your City?
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

      {/* Footer */}
      <footer className="bg-[#0c0f14] py-8 border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Farrell Roofing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
