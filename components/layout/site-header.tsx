// Site Header Component
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, MapPin, ChevronDown, CreditCard, FileText, HandHeart } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { useContact } from '@/lib/hooks/use-contact'
import { useBusinessConfig, useHoursText } from '@/lib/config/business-provider'
import { StartFunnelButton } from '@/components/funnel/start-funnel-button'

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/service-areas', label: 'Service Areas' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

const resourceLinks = [
  { href: '/financing', label: 'Financing Options', icon: CreditCard, description: 'Affordable payment plans' },
  { href: '/insurance-help', label: 'Insurance Help', icon: FileText, description: 'Claim filing guidance' },
  { href: '/assistance-programs', label: 'Assistance Programs', icon: HandHeart, description: 'Grants & financial aid' },
]

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const resourcesRef = useRef<HTMLDivElement>(null)
  const { phoneDisplay, phoneLink } = useContact()
  const config = useBusinessConfig()
  const hoursText = useHoursText()

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setResourcesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])

  return (
    <header className="border-b border-slate-800 bg-ink/95 sticky top-0 z-50 safe-top">
      {/* Top Bar */}
      <div className="bg-slate-deep border-b border-slate-800/50 py-2 hidden md:block">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6 text-slate-400">
            <a href={phoneLink} className="flex items-center gap-2 hover:text-gold transition-colors">
              <Phone className="w-4 h-4" />
              <span>{phoneDisplay}</span>
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold" />
              <span>{config.address.city}, {config.address.stateCode} &amp; Surrounding Areas</span>
            </span>
          </div>
          <div className="text-slate-500">
            {hoursText}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo size="md" />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.slice(0, 3).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-gold transition-colors nav-link"
              >
                {link.label}
              </Link>
            ))}

            {/* Resources Dropdown */}
            <div className="relative" ref={resourcesRef}>
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="text-sm text-slate-400 hover:text-gold transition-colors flex items-center gap-1"
                aria-expanded={resourcesOpen}
                aria-haspopup="true"
              >
                Resources
                <ChevronDown className={`w-4 h-4 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>

              {resourcesOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1f2e] border border-slate-700/50 rounded-xl shadow-xl py-2 z-50">
                  {resourceLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors"
                      onClick={() => setResourcesOpen(false)}
                    >
                      <link.icon className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-slate-200">{link.label}</div>
                        <div className="text-xs text-slate-500">{link.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.slice(3).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-gold transition-colors nav-link"
              >
                {link.label}
              </Link>
            ))}
            <StartFunnelButton className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-ink font-semibold px-5 py-2.5 rounded-lg transition-all text-sm">
              Free Estimate
            </StartFunnelButton>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-h-[48px] min-w-[48px] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className="relative w-6 h-6">
              <Menu className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
              <X className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu - always in DOM, animated with CSS */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen
            ? 'max-h-[calc(100dvh-80px)] opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="mx-auto max-w-6xl px-4 pt-2 pb-6 flex flex-col gap-1 border-t border-slate-800">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-300 hover:text-gold py-3.5 transition-all"
              style={{
                transitionDelay: mobileMenuOpen ? `${50 + i * 30}ms` : '0ms',
                opacity: mobileMenuOpen ? 1 : 0,
                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-12px)',
                transitionProperty: 'opacity, transform, color',
                transitionDuration: '250ms',
              }}
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}

          {/* Resources Section */}
          <div
            className="border-t border-slate-800 pt-2 mt-2"
            style={{
              transitionDelay: mobileMenuOpen ? `${50 + navLinks.length * 30}ms` : '0ms',
              opacity: mobileMenuOpen ? 1 : 0,
              transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-12px)',
              transitionProperty: 'opacity, transform',
              transitionDuration: '250ms',
            }}
          >
            <div className="text-xs text-slate-500 uppercase tracking-wider py-2">Resources</div>
            {resourceLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 text-slate-300 hover:text-gold py-3.5 transition-colors"
                onClick={closeMobileMenu}
              >
                <link.icon className="w-4 h-4 text-gold" />
                {link.label}
              </Link>
            ))}
          </div>

          <div
            className="mt-3 space-y-3"
            style={{
              transitionDelay: mobileMenuOpen ? `${50 + (navLinks.length + 1) * 30}ms` : '0ms',
              opacity: mobileMenuOpen ? 1 : 0,
              transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(8px)',
              transitionProperty: 'opacity, transform',
              transitionDuration: '300ms',
            }}
          >
            <StartFunnelButton
              className="bg-gold hover:bg-gold-light text-ink font-semibold px-5 py-3.5 rounded-lg transition-all text-center w-full"
              onClick={closeMobileMenu}
            >
              Get Free Estimate
            </StartFunnelButton>
            <a
              href={phoneLink}
              className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 py-3 border border-slate-800 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{phoneDisplay}</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
