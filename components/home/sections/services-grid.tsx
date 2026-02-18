'use client'

import Link from 'next/link'
import { Home, Wrench, Search, Droplet, Shield, AlertTriangle, ArrowRight } from 'lucide-react'
import { services } from '@/lib/data/services'
import { ScrollAnimate, ScrollStagger } from '@/components/scroll-animate'

const iconMap: Record<string, React.ReactNode> = {
  home: <Home className="h-6 w-6" />,
  wrench: <Wrench className="h-6 w-6" />,
  search: <Search className="h-6 w-6" />,
  droplet: <Droplet className="h-6 w-6" />,
  shield: <Shield className="h-6 w-6" />,
  alert: <AlertTriangle className="h-6 w-6" />,
}

export function ServicesGrid() {
  return (
    <section className="py-16 md:py-24 bg-glow-cool border-t border-slate-800">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
            Our Roofing Services
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            From minor repairs to full replacements, we handle it all with 20+ years of local expertise.
          </p>
        </ScrollAnimate>

        <ScrollStagger simple className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group block bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-4 md:p-6 card-inner-glow card-hover-premium"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] text-[#0c0f14] mb-3">
                {iconMap[service.icon] || <Home className="h-6 w-6" />}
              </div>
              <h3 className="text-base md:text-lg font-bold text-slate-100 mb-1">{service.name}</h3>
              {service.priceRange && (
                <p className="text-sm text-[#c9a25c] mb-2">{service.priceRange}</p>
              )}
              <p className="text-slate-400 text-sm hidden md:block mb-3">{service.shortDescription}</p>
              <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                Learn More <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </ScrollStagger>
      </div>
    </section>
  )
}
