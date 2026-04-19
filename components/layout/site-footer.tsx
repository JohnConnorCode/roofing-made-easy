'use client'

// Site Footer Component with Location Links
import { useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram, ChevronDown, ArrowRight } from 'lucide-react'
import { getCitiesByPriority } from '@/lib/data/ms-locations'
import { useContact } from '@/lib/hooks/use-contact'
import { useBusinessConfig } from '@/lib/config/business-provider'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'
import { StartFunnelButton } from '@/components/funnel/start-funnel-button'

const services = [
  { href: '/services/roof-replacement', label: 'Roof Replacement' },
  { href: '/services/roof-repair', label: 'Roof Repair' },
  { href: '/services/roof-inspection', label: 'Roof Inspection' },
  { href: '/services/emergency-repair', label: 'Storm Damage' },
  { href: '/services/gutters', label: 'Gutters' },
  { href: '/services/roof-maintenance', label: 'Maintenance' },
  { href: '/roofing-materials', label: 'Materials Guide' },
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
        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform duration-200', open && 'rotate-180')} />
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
  const topCities = getCitiesByPriority('high').slice(0, 6)

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
                {config.serviceArea.region}&rsquo;s trusted roofing contractor. Proudly serving {config.address.city} and surrounding communities{config.foundedYear ? ` since ${config.foundedYear}` : ''}.
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
                <a href={config.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:border-gold/50 hover:text-gold hover:-translate-y-0.5 transition-all" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                )}
                {config.social.instagram && (
                <a href={config.social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:border-gold/50 hover:text-gold hover:-translate-y-0.5 transition-all" aria-label="Instagram">
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

            {/* Service Areas — 6 clean city links */}
            <div className="lg:col-span-4">
              <FooterAccordion title="Service Areas">
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-0 lg:gap-y-1">
                  {topCities.map(city => (
                    <li key={city.slug}>
                      <Link
                        href={`/${city.slug}-roofing`}
                        className="block text-sm text-slate-300 hover:text-slate-100 hover:translate-x-1 transition-all duration-200 py-2 lg:py-1.5"
                      >
                        {city.name}{city.isHQ ? ' — HQ' : ''}
                      </Link>
                    </li>
                  ))}
                  <li className="lg:col-span-2">
                    <Link href="/service-areas" className="block text-sm text-[#c9a25c] hover:text-[#e6c588] transition-colors py-2">
                      View all areas →
                    </Link>
                  </li>
                </ul>
              </FooterAccordion>
            </div>
          </div>

        </div>

        {/* Final CTA strip */}
        <div className="border-t border-slate-800/70">
          <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c]">
                Ready to price your roof?
              </p>
              <p className="mt-1.5 text-base md:text-lg text-slate-200 font-medium">
                Two minutes, built from real {config.serviceArea.region} pricing.
              </p>
            </div>
            <StartFunnelButton className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-ink font-semibold px-5 py-3 rounded-lg transition-all text-sm">
              <span className="inline-flex items-center gap-2">
                Get my free estimate
                <ArrowRight className="w-4 h-4" />
              </span>
            </StartFunnelButton>
          </div>
        </div>

        {/* Divider above bottom bar */}
        <div className="border-t border-slate-800" />

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 safe-bottom">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
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
