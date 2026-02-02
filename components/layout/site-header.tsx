// Site Header Component
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, MapPin, ChevronDown, CreditCard, FileText, HandHeart } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { getPhoneLink, getPhoneDisplay } from '@/lib/config/business'

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

  return (
    <header className="border-b border-slate-800 bg-ink/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-slate-deep border-b border-slate-800 py-2 hidden md:block">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6 text-slate-400">
            <a href={getPhoneLink()} className="flex items-center gap-2 hover:text-gold transition-colors">
              <Phone className="w-4 h-4" />
              <span>{getPhoneDisplay()}</span>
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold" />
              <span>Tupelo, MS & Surrounding Areas</span>
            </span>
          </div>
          <div className="text-slate-500">
            Mon-Fri 7am-6pm | Sat 8am-2pm
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
                className="text-sm text-slate-400 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Resources Dropdown */}
            <div className="relative" ref={resourcesRef}>
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="text-sm text-slate-400 hover:text-gold transition-colors flex items-center gap-1"
              >
                Resources
                <ChevronDown className={`w-4 h-4 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>

              {resourcesOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1f2e] border border-slate-700 rounded-xl shadow-xl py-2 z-50">
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
                className="text-sm text-slate-400 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/"
              className="bg-gold hover:bg-gold-light text-ink font-semibold px-5 py-2.5 rounded-lg transition-all text-sm"
            >
              Free Estimate
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-ink">
          <nav className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-300 hover:text-gold py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Resources Section */}
            <div className="border-t border-slate-800 pt-2 mt-2">
              <div className="text-xs text-slate-500 uppercase tracking-wider py-2">Resources</div>
              {resourceLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 text-slate-300 hover:text-gold py-2 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="w-4 h-4 text-gold" />
                  {link.label}
                </Link>
              ))}
            </div>

            <Link
              href="/"
              className="bg-gold hover:bg-gold-light text-ink font-semibold px-5 py-3 rounded-lg transition-all text-center mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Free Estimate
            </Link>
            <a
              href={getPhoneLink()}
              className="flex items-center justify-center gap-2 text-slate-400 py-3 border-t border-slate-800 mt-2"
            >
              <Phone className="w-4 h-4" />
              <span>{getPhoneDisplay()}</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
