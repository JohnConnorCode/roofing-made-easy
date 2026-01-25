// Services CTA Section for Location Pages
import { MSCity } from '@/lib/data/ms-locations'
import { Hammer, Wrench, CloudLightning, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ServicesCTAProps {
  city: MSCity
}

const services = [
  {
    icon: Hammer,
    name: 'Roof Replacement',
    slug: 'roof-replacement',
    description: 'Complete tear-off and installation of new roofing systems'
  },
  {
    icon: Wrench,
    name: 'Roof Repair',
    slug: 'roof-repair',
    description: 'Fix leaks, damaged shingles, and other roofing issues'
  },
  {
    icon: CloudLightning,
    name: 'Storm Damage',
    slug: 'emergency-repair',
    description: 'Emergency repairs and insurance claim assistance'
  },
  {
    icon: Shield,
    name: 'Roof Inspection',
    slug: 'roof-inspection',
    description: 'Comprehensive assessments and maintenance planning'
  }
]

export function ServicesCTA({ city }: ServicesCTAProps) {
  return (
    <section className="py-12 bg-ink">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            Roofing Services in {city.name}
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            From routine maintenance to complete replacements, we offer comprehensive roofing solutions for {city.name} homeowners.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group bg-slate-deep/50 border border-gold/10 hover:border-gold/30 rounded-xl p-6 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <service.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{service.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                <span className="inline-flex items-center gap-1 text-gold text-sm group-hover:gap-2 transition-all">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>

          {/* Main CTA */}
          <div className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-8 text-center">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
              Ready for Your Free Roofing Estimate?
            </h3>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              Get a detailed, no-obligation quote for your {city.name} home. Our estimates include material options, timelines, and transparent pricing.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-semibold px-8 py-4 rounded-lg transition-all btn-press"
            >
              Get Your Free Estimate
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
