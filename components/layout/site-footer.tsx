// Site Footer Component with Location Links
import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react'
import { getCitiesByPriority, getAllCounties } from '@/lib/data/ms-locations'
import { getPhoneLink, getPhoneDisplay, BUSINESS_CONFIG } from '@/lib/config/business'
import { Logo } from '@/components/ui/logo'

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
  { href: '/referral', label: 'Referral Program' },
  { href: '/contact', label: 'Contact' },
]

export function SiteFooter() {
  const topCities = getCitiesByPriority('high').slice(0, 8)
  const counties = getAllCounties().slice(0, 5)

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
              <a href={getPhoneLink()} className="flex items-center gap-2 text-slate-400 hover:text-gold transition-colors">
                <Phone className="w-4 h-4" />
                <span>{getPhoneDisplay()}</span>
              </a>
              <a href={`mailto:${BUSINESS_CONFIG.email.primary}`} className="flex items-center gap-2 text-slate-400 hover:text-gold transition-colors">
                <Mail className="w-4 h-4" />
                <span>{BUSINESS_CONFIG.email.primary}</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>Tupelo, MS 38801</span>
              </div>
            </div>
            {(BUSINESS_CONFIG.social.facebook || BUSINESS_CONFIG.social.instagram) && (
            <div className="flex gap-4 mt-4">
              {BUSINESS_CONFIG.social.facebook && (
              <a href={BUSINESS_CONFIG.social.facebook} className="text-slate-500 hover:text-gold transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              )}
              {BUSINESS_CONFIG.social.instagram && (
              <a href={BUSINESS_CONFIG.social.instagram} className="text-slate-500 hover:text-gold transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              )}
            </div>
            )}
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {services.map(service => (
                <li key={service.href}>
                  <Link href={service.href} className="text-sm text-slate-400 hover:text-gold transition-colors">
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {company.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-slate-400 hover:text-gold transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Service Areas
            </h3>
            <ul className="space-y-2">
              {topCities.slice(0, 6).map(city => (
                <li key={city.slug}>
                  <Link
                    href={`/${city.slug}-roofing`}
                    className="text-sm text-slate-400 hover:text-gold transition-colors"
                  >
                    {city.name}{city.isHQ ? ' (HQ)' : ''}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/service-areas" className="text-sm text-gold hover:text-gold-light transition-colors">
                  View All Areas →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Compare Roofers Section */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Compare Local Roofers
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {topCities.slice(0, 6).map(city => (
              <Link
                key={`compare-${city.slug}`}
                href={`/best-roofers-in-${city.slug}-ms`}
                className="text-xs text-slate-400 hover:text-gold transition-colors"
              >
                Best Roofers in {city.name}
              </Link>
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
                className="text-xs text-slate-500 hover:text-gold transition-colors"
              >
                {county.name}
              </Link>
            ))}
            <Link href="/service-areas" className="text-xs text-gold hover:text-gold-light transition-colors">
              + {getAllCounties().length - counties.length} more
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} {BUSINESS_CONFIG.name}. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-gold transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
