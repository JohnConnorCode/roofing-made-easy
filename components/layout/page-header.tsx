'use client'

import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

interface NavLink {
  href: string
  label: string
  active?: boolean
}

interface PageHeaderProps {
  activeLink?: string
}

const defaultNavLinks: NavLink[] = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Resources' },
  { href: '/contact', label: 'Contact' },
]

export function PageHeader({ activeLink }: PageHeaderProps = {}) {
  return (
    <header className="border-b border-slate-800 bg-[#0c0f14]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-6">
            {defaultNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  activeLink === link.href
                    ? 'text-[#c9a25c]'
                    : 'text-slate-400 hover:text-[#c9a25c]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
