// Site Header Component
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, MapPin } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/service-areas', label: 'Service Areas' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-slate-800 bg-ink/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-slate-deep border-b border-slate-800 py-2 hidden md:block">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6 text-slate-400">
            <a href="tel:+16620000000" className="flex items-center gap-2 hover:text-gold transition-colors">
              <Phone className="w-4 h-4" />
              <span>(662) 000-0000</span>
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
            {navLinks.map(link => (
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
            <Link
              href="/"
              className="bg-gold hover:bg-gold-light text-ink font-semibold px-5 py-3 rounded-lg transition-all text-center mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Free Estimate
            </Link>
            <a
              href="tel:+16620000000"
              className="flex items-center justify-center gap-2 text-slate-400 py-3 border-t border-slate-800 mt-2"
            >
              <Phone className="w-4 h-4" />
              <span>(662) 000-0000</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
