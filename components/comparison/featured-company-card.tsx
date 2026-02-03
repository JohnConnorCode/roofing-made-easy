// Featured Company Card - "Our Top Pick" for Farrell Roofing
// Full company profile with credentials and primary CTA

import { MSCity } from '@/lib/data/ms-locations'
import { BUSINESS_CONFIG, getPhoneDisplay, getFullAddress } from '@/lib/config/business'
import {
  Shield,
  Award,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface FeaturedCompanyCardProps {
  city: MSCity
}

export function FeaturedCompanyCard({ city }: FeaturedCompanyCardProps) {
  const services = [
    'Roof Replacement',
    'Roof Repair',
    'Storm Damage Restoration',
    'Roof Inspections',
    'Metal Roofing',
    'Emergency Services'
  ]

  const highlights = [
    'Locally Owned & Operated',
    'Licensed & Fully Insured',
    'Free No-Obligation Estimates',
    'Insurance Claim Assistance',
    'Workmanship Warranty',
    'Same-Day Response Available'
  ]

  return (
    <div className="bg-gradient-to-br from-gold/10 to-gold/5 border-2 border-gold rounded-2xl overflow-hidden">
      {/* Top Pick Badge */}
      <div className="bg-gold text-ink py-3 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="font-bold">Our Top Pick</span>
          </div>
          <span className="text-sm font-medium">#1 Recommended</span>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Company Header */}
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
          {/* Logo Placeholder */}
          <div className="w-24 h-24 bg-ink/50 border border-gold/20 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-gold">FR</span>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {BUSINESS_CONFIG.name}
            </h2>
            <p className="text-gold font-medium mb-3">
              {BUSINESS_CONFIG.tagline}
            </p>

            {/* Credentials */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="w-4 h-4 text-gold" />
                <span className="text-sm">Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-gold" />
                <span className="text-sm">Since {BUSINESS_CONFIG.foundedYear}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Description */}
        <div className="mb-8">
          <p className="text-gray-300 leading-relaxed">
            Farrell Roofing has proudly served {city.name} and the greater {city.county} County
            area since {BUSINESS_CONFIG.foundedYear}. As a locally owned and operated roofing
            contractor headquartered in Tupelo, we understand the unique roofing challenges that
            Northeast Mississippi homeowners face. From severe spring storms and high humidity to
            intense summer heat, your roof needs to withstand it all. Our experienced team
            delivers quality craftsmanship, honest pricing, and responsive service that has made
            us the trusted choice for thousands of families across the region.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Services Offered</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {services.map((service) => (
              <div
                key={service}
                className="flex items-center gap-2 bg-ink/30 border border-gold/10 rounded-lg px-3 py-2"
              >
                <CheckCircle className="w-4 h-4 text-gold shrink-0" />
                <span className="text-sm text-gray-300">{service}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Why Choose Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gold shrink-0" />
                <span className="text-gray-300">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-ink/30 rounded-xl">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gold" />
            <div>
              <p className="text-xs text-slate-400">Phone</p>
              <p className="text-white font-medium">{getPhoneDisplay()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gold" />
            <div>
              <p className="text-xs text-slate-400">Location</p>
              <p className="text-white font-medium">Tupelo, MS (HQ)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gold" />
            <div>
              <p className="text-xs text-slate-400">Hours</p>
              <p className="text-white font-medium">Mon-Fri 7am-6pm</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-semibold px-6 py-4 rounded-lg transition-all btn-press"
          >
            Get Your Free Estimate
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href={`/${city.slug}-roofing`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent border-2 border-gold/50 hover:border-gold text-white font-semibold px-6 py-4 rounded-lg transition-all"
          >
            View {city.name} Services
          </Link>
        </div>
      </div>
    </div>
  )
}
