'use client'

// Site Footer Component with Location Links
import { useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram, ChevronDown } from 'lucide-react'
import { getCitiesByPriority, getAllCounties, getAllCities } from '@/lib/data/ms-locations'
import { useContact } from '@/lib/hooks/use-contact'
import { useBusinessConfig } from '@/lib/config/business-provider'
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
  { href: '/portal', label: 'My Account' },
]

function FooterColumnHeading({ title }: { title: string }) {
  return (
    <h3 className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-widest mb-5">
      <span className="w-4 h-0.5 rounded-full bg-gradient-to-r from-gold to-transparent" />
      {title}
    </h3>
  )
}

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
      {/* Desktop: accented heading */}
      <FooterColumnHeading title={title} />
      {/* Mobile: collapsible content */}
      <div className={cn(
        'overflow-hidden transition-all duration-200 lg:max-h-none lg:opacity-100 lg:mt-0',
        open ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
      )}>
        {children}
      </div>
    </div>
  )
}

export function SiteFooter() {
  const { phoneDisplay, phoneLink } = useContact()
  const config = useBusinessConfig()
  const topCities = getCitiesByPriority('high').slice(0, 8)
  const counties = getAllCounties().slice(0, 5)
  const allCities = getAllCities()
  const [areasExpanded, setAreasExpanded] = useState(false)

  // Group cities by county for the expanded locations section
  const citiesByCounty = counties.slice(0, 4).map(county => ({
    county,
    cities: allCities.filter(c =>
      c.county.toLowerCase() === county.name.replace(' County', '').toLowerCase()
    ).slice(0, 4)
  }))

  return (
    <footer className="bg-ink border-glow-top relative overflow-hidden">
      {/* Subtle roof pattern background */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: "url('/images/roof-pattern.svg')", backgroundSize: '80px 40px' }}
      />

      <div className="relative">
        {/* Main Footer */}
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-4">
              <div className="mb-3">
                <Logo size="sm" showText={true} />
              </div>
              <div className="h-px w-16 bg-gold/30 mt-3 mb-4" />
              <p className="text-slate-300 text-sm leading-relaxed mb-4 max-w-sm">
                Northeast Mississippi&apos;s trusted roofing contractor. Proudly serving Tupelo and surrounding communities since 2010.
              </p>
              {/* Contact info with separator */}
              <div className="mt-5 pt-5 border-t border-slate-800/50">
                <div className="space-y-2 text-sm">
                  <a href={phoneLink} className="flex items-center gap-2 text-slate-400 hover:text-gold transition-colors py-1">
                    <Phone className="w-4 h-4" />
                    <span>{phoneDisplay}</span>
                  </a>
                  <a href={`mailto:${config.email.primary}`} className="flex items-center gap-2 text-slate-400 hover:text-gold transition-colors py-1">
                    <Mail className="w-4 h-4" />
                    <span>{config.email.primary}</span>
                  </a>
                  <div className="flex items-center gap-2 text-slate-400 py-1">
                    <MapPin className="w-4 h-4" />
                    <span>{config.address.city}, {config.address.stateCode} {config.address.zip}</span>
                  </div>
                </div>
              </div>
              {(config.social.facebook || config.social.instagram) && (
              <div className="flex gap-3 mt-4">
                {config.social.facebook && (
                <a href={config.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-700 text-slate-500 hover:border-gold/50 hover:text-gold hover:-translate-y-0.5 transition-all" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                )}
                {config.social.instagram && (
                <a href={config.social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-700 text-slate-500 hover:border-gold/50 hover:text-gold hover:-translate-y-0.5 transition-all" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                )}
              </div>
              )}
            </div>

            {/* Services */}
            <div className="lg:col-span-2">
              <FooterAccordion title="Services">
                <ul className="space-y-0 lg:space-y-2">
                  {services.map(service => (
                    <li key={service.href}>
                      <Link href={service.href} className="block text-sm text-slate-400 hover:text-slate-200 hover:translate-x-1 transition-all duration-200 py-2">
                        {service.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </FooterAccordion>
            </div>

            {/* Company */}
            <div className="lg:col-span-2">
              <FooterAccordion title="Company">
                <ul className="space-y-0 lg:space-y-2">
                  {company.map(item => (
                    <li key={item.href}>
                      <Link href={item.href} className="block text-sm text-slate-400 hover:text-slate-200 hover:translate-x-1 transition-all duration-200 py-2">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </FooterAccordion>
            </div>

            {/* Service Areas — wider column with 2-col city grid */}
            <div className="lg:col-span-4">
              <FooterAccordion title="Service Areas">
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-0 lg:gap-y-1">
                  {topCities.slice(0, 8).map(city => (
                    <li key={city.slug}>
                      <Link
                        href={`/${city.slug}-roofing`}
                        className="block text-sm text-slate-400 hover:text-slate-200 hover:translate-x-1 transition-all duration-200 py-2 lg:py-1.5"
                      >
                        {city.name}{city.isHQ ? ' (HQ)' : ''}
                      </Link>
                    </li>
                  ))}
                  <li className="lg:col-span-2">
                    <Link href="/service-areas" className="block text-sm text-gold hover:text-gold-light transition-colors py-2">
                      View All Areas →
                    </Link>
                  </li>
                </ul>
              </FooterAccordion>
            </div>
          </div>

          {/* Consolidated "All Service Areas" collapsible section */}
          <div className="hidden md:block mt-8 pt-8 border-t border-slate-800">
            <button
              onClick={() => setAreasExpanded(!areasExpanded)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-300 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              All Service Areas
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', areasExpanded && 'rotate-180')} />
            </button>

            <div className={cn(
              'overflow-hidden transition-all duration-300',
              areasExpanded ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'
            )}>
              {/* Compare Roofers pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {topCities.slice(0, 6).map(city => (
                  <Link
                    key={`compare-${city.slug}`}
                    href={`/best-roofers-in-${city.slug}-ms`}
                    className="text-xs text-slate-400 hover:text-gold bg-slate-800/50 hover:bg-slate-800 rounded-full px-3 py-1.5 transition-colors"
                  >
                    Best Roofers in {city.name}
                  </Link>
                ))}
              </div>

              {/* Counties with city sub-lists */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
                {/* Counties list */}
                <div>
                  <span className="text-sm font-medium text-slate-400">More Counties</span>
                  <ul className="mt-2 space-y-1">
                    {counties.map(county => (
                      <li key={county.slug}>
                        <Link
                          href={`/${county.slug}-roofing`}
                          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {county.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link href="/service-areas" className="text-sm text-gold hover:text-gold-light transition-colors">
                        + {getAllCounties().length - counties.length} more
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider above bottom bar */}
        <div className="border-t border-slate-800" />

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 safe-bottom">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
              <p>&copy; {new Date().getFullYear()} {config.name}. All rights reserved.</p>
              <div className="flex gap-4">
                <Link href="/terms" className="hover:text-gold transition-colors py-2 min-h-[48px] flex items-center">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-gold transition-colors py-2 min-h-[48px] flex items-center">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
