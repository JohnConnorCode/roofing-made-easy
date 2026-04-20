'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, MapPin, ChevronDown, CreditCard, FileText, HandHeart, User, Gift, HardHat, Star, CloudLightning, Wrench } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { useContact } from '@/lib/hooks/use-contact'
import { StartFunnelButton } from '@/components/funnel/start-funnel-button'

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

const resourceLinks = [
  { href: '/roofing-materials', label: 'Roofing Materials', icon: HardHat, description: 'Compare materials & costs' },
  { href: '/storm-damage', label: 'Storm Damage', icon: CloudLightning, description: 'After hail, wind, or tornado' },
  { href: '/roof-maintenance', label: 'Roof Maintenance', icon: Wrench, description: 'Seasonal care & inspections' },
  { href: '/insurance-help', label: 'Insurance Help', icon: FileText, description: 'Claim filing guidance' },
  { href: '/financing', label: 'Financing Options', icon: CreditCard, description: 'Affordable payment plans' },
  { href: '/assistance-programs', label: 'Assistance Programs', icon: HandHeart, description: 'Grants & financial aid' },
  { href: '/service-areas', label: 'Service Areas', icon: MapPin, description: 'Where we work' },
]

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const resourcesRef = useRef<HTMLDivElement>(null)
  const { phoneDisplay, phoneLink } = useContact()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

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
    <header
      className={`bg-ink/95 backdrop-blur-xl sticky top-0 z-50 safe-top transition-all duration-300 ${
        scrolled
          ? 'shadow-[0_4px_30px_-4px_rgba(0,0,0,0.6)] border-b border-slate-800/80'
          : 'border-b border-slate-800/40'
      }`}
    >
      {/* Gold accent top line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a25c]/50 to-transparent" />

      {/* Main Nav */}
      <div className={`mx-auto max-w-6xl px-4 transition-all duration-300 ${scrolled ? 'py-3' : 'py-4'}`}>
        <div className="flex items-center gap-4">
          <Logo size={scrolled ? 'sm' : 'md'} />

          {/* Desktop Nav — centered */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-7">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm text-slate-300 hover:text-slate-50 transition-colors after:absolute after:inset-x-0 after:-bottom-1.5 after:h-[1px] after:bg-[#c9a25c] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-200"
              >
                {link.label}
              </Link>
            ))}

            {/* Resources Dropdown */}
            <div className="relative" ref={resourcesRef}>
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="text-sm text-slate-300 hover:text-slate-50 transition-colors flex items-center gap-1"
                aria-expanded={resourcesOpen}
                aria-haspopup="true"
              >
                Resources
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${resourcesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Animated dropdown */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 glass-card-elevated rounded-2xl shadow-2xl shadow-black/40 py-2 z-50 transition-all duration-200 origin-top ${
                  resourcesOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="px-4 py-2 mb-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
                    Resources & Tools
                  </p>
                </div>
                {resourceLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2 mx-1 rounded-xl hover:bg-slate-800/60 transition-colors"
                    onClick={() => setResourcesOpen(false)}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a25c]/10 border border-[#c9a25c]/20 flex-shrink-0">
                      <link.icon className="w-3.5 h-3.5 text-[#c9a25c]" />
                    </span>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{link.label}</div>
                      <div className="text-xs text-slate-500">{link.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Right: Phone + Account + CTA */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <a
              href={phoneLink}
              className="hidden xl:flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#e6c588] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{phoneDisplay}</span>
            </a>
            <span className="hidden xl:block h-4 w-px bg-slate-700/60" />
            <Link
              href="/portal"
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#e6c588] transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">My Account</span>
            </Link>
            <StartFunnelButton className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-ink font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-[0_4px_12px_rgba(201,162,92,0.2)] hover:shadow-[0_4px_20px_rgba(201,162,92,0.35)]">
              Free Estimate
            </StartFunnelButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-h-[48px] min-w-[48px] flex items-center justify-center text-slate-400 hover:text-white transition-colors ml-auto"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className="relative w-6 h-6">
              <Menu
                className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                }`}
              />
              <X
                className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'max-h-[calc(100dvh-80px)] opacity-100' : 'max-h-0 opacity-0'
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
            <div className="text-xs text-slate-400 uppercase tracking-wider py-2">Resources</div>
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
              className="bg-gold hover:bg-gold-light text-ink font-semibold px-5 py-3.5 rounded-xl transition-all text-center w-full"
              onClick={closeMobileMenu}
            >
              Free Estimate
            </StartFunnelButton>
            <a
              href={phoneLink}
              className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 py-3 border border-slate-800 rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{phoneDisplay}</span>
            </a>
            <Link
              href="/portal"
              className="flex items-center justify-center gap-2 text-slate-400 hover:text-gold py-3 border border-slate-800 rounded-xl transition-colors"
              onClick={closeMobileMenu}
            >
              <User className="w-4 h-4" />
              <span>My Account</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
