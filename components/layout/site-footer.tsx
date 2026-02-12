'use client'

// Site Footer Component with Location Links
import { useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram, ChevronDown } from 'lucide-react'
import { getCitiesByPriority, getAllCounties, getAllCities } from '@/lib/data/ms-locations'
import { getPhoneLink, getPhoneDisplay, BUSINESS_CONFIG } from '@/lib/config/business'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

const services = [
  { href: '/services/roof-replacement', label: 'Roof Replacement' },
  { href: '/services/roof-repair', label: 'Roof Repair' },
  { href: '/services/roof-inspection', label: 'Roof Inspection' },
  { href: '/services/emergency-repair', label: 'Storm Damage' },
  { href: '/services/gutters', label: 'Gutters' },
  { href: '/services/roof-maintenance', label: 'Maintenance' },
]

const company = [
  { href: '/about', label: 'About Us' },
  { href: '/portfolio', label: 'Our Work' },
  { href: '/blog', label: 'Blog' },
  { href: '/financing', label: 'Financing' },
  { href: '/insurance-help', label: 'Insurance Help' },
  { href: '/assistance-programs', label: 'Assistance Programs' },
  { href: '/referral', label: 'Referral Program' },
  { href: '/contact', label: 'Contact' },
]

function FooterAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      {/* Mobile: tappable accordion header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between lg:hidden py-2"
        aria-expanded={open}
      >
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
          {title}
        </h3>
        <ChevronDown className={cn('h-4 w-4 text-slate-500 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {/* Desktop: always-visible heading */}
      <h3 className="hidden lg:block text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
        {title}
      </h3>
      {/* Mobile: collapsible content */}
      <div className={cn(
        'overflow-hidden transition-all duration-200 lg:!max-h-none lg:!opacity-100',
        open ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0 lg:mt-0'
      )}>
        {children}
      </div>
    </div>
  )
}

export function SiteFooter() {
  const topCities = getCitiesByPriority('high').slice(0, 8)
  const counties = getAllCounties().slice(0, 5)
  const allCities = getAllCities()

  // Group cities by county for the expanded locations section
  const citiesByCounty = counties.slice(0, 4).map(county => ({
    county,
    cities: allCities.filter(c =>
      c.county.toLowerCase() === county.name.replace(' County', '').toLowerCase()
    ).slice(0, 4)
  }))

  return (
    <footer className="bg-ink border-t border-slate-800">
      {/* Main Footer */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo size="sm" showText={true} />
            </div>
            <p className="text-slate-400 text-sm mb-4 max-w-sm">
              Northeast Mississippi&apos;s trusted roofing contractor. Proudly serving Tupelo and surrounding communities since 2010.
            </p>
            <div className="space-y-2 text-sm">
              <a href={getPhoneLink()} className="flex items-center gap-2 text-slate-400 hover:text-gold transition-colors py-1">
                <Phone className="w-4 h-4" />
                <span>{getPhoneDisplay()}</span>
              </a>
              <a href={`mailto:${BUSINESS_CONFIG.email.primary}`} className="flex items-center gap-2 text-slate-400 hover:text-gold transition-colors py-1">
                <Mail className="w-4 h-4" />
                <span>{BUSINESS_CONFIG.email.primary}</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400 py-1">
                <MapPin className="w-4 h-4" />
                <span>Tupelo, MS 38801</span>
              </div>
            </div>
            {(BUSINESS_CONFIG.social.facebook || BUSINESS_CONFIG.social.instagram) && (
            <div className="flex gap-3 mt-4">
              {BUSINESS_CONFIG.social.facebook && (
              <a href={BUSINESS_CONFIG.social.facebook} className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:text-gold hover:bg-slate-800 transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              )}
              {BUSINESS_CONFIG.social.instagram && (
              <a href={BUSINESS_CONFIG.social.instagram} className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:text-gold hover:bg-slate-800 transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              )}
            </div>
            )}
          </div>

          {/* Services */}
          <FooterAccordion title="Services">
            <ul className="space-y-0 lg:space-y-2">
              {services.map(service => (
                <li key={service.href}>
                  <Link href={service.href} className="block text-sm text-slate-400 hover:text-gold transition-colors py-2">
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterAccordion>

          {/* Company */}
          <FooterAccordion title="Company">
            <ul className="space-y-0 lg:space-y-2">
              {company.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="block text-sm text-slate-400 hover:text-gold transition-colors py-2">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterAccordion>

          {/* Service Areas */}
          <FooterAccordion title="Service Areas">
            <ul className="space-y-0 lg:space-y-2">
              {topCities.slice(0, 6).map(city => (
                <li key={city.slug}>
                  <Link
                    href={`/${city.slug}-roofing`}
                    className="block text-sm text-slate-400 hover:text-gold transition-colors py-2"
                  >
                    {city.name}{city.isHQ ? ' (HQ)' : ''}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/service-areas" className="block text-sm text-gold hover:text-gold-light transition-colors py-2">
                  View All Areas →
                </Link>
              </li>
            </ul>
          </FooterAccordion>
        </div>

        {/* Compare Roofers Section — hidden on mobile */}
        <div className="hidden md:block mt-8 pt-8 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Compare Local Roofers
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {topCities.slice(0, 6).map(city => (
              <Link
                key={`compare-${city.slug}`}
                href={`/best-roofers-in-${city.slug}-ms`}
                className="text-sm text-slate-400 hover:text-gold transition-colors"
              >
                Best Roofers in {city.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Cities by County — hidden on mobile */}
        <div className="hidden md:block mt-6 pt-6 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Service Areas by County
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {citiesByCounty.map(({ county, cities }) => (
              <div key={county.slug}>
                <Link
                  href={`/${county.slug}-roofing`}
                  className="text-sm font-medium text-gold hover:text-gold-light transition-colors"
                >
                  {county.name}
                </Link>
                <ul className="mt-2 space-y-1">
                  {cities.map(city => (
                    <li key={city.slug}>
                      <Link
                        href={`/${city.slug}-roofing`}
                        className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {city.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location Links Bar */}
      <div className="border-t border-slate-800 bg-slate-deep/50">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Counties We Serve
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {counties.map(county => (
              <Link
                key={county.slug}
                href={`/${county.slug}-roofing`}
                className="text-sm text-slate-500 hover:text-gold transition-colors py-1.5"
              >
                {county.name}
              </Link>
            ))}
            <Link href="/service-areas" className="text-sm text-gold hover:text-gold-light transition-colors py-1.5">
              + {getAllCounties().length - counties.length} more
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 safe-bottom">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} {BUSINESS_CONFIG.name}. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-gold transition-colors py-2 min-h-[48px] flex items-center">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-gold transition-colors py-2 min-h-[48px] flex items-center">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
