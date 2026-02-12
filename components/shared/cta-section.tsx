// Shared CTA Section Component
// Reusable call-to-action sections used across pages
'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useContact } from '@/lib/hooks/use-contact'

interface CTASectionProps {
  title: string
  description: string
  primaryLabel?: string
  primaryHref?: string
  showPhone?: boolean
  variant?: 'default' | 'gradient' | 'card'
}

export function CTASection({
  title,
  description,
  primaryLabel = 'Get Free Estimate',
  primaryHref = '/',
  showPhone = true,
  variant = 'default'
}: CTASectionProps) {
  const { phoneDisplay, phoneLink } = useContact()

  const bgClass = variant === 'gradient'
    ? 'bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30 rounded-2xl'
    : variant === 'card'
    ? 'bg-slate-deep border border-gold/10 rounded-xl'
    : 'bg-gradient-dark'

  const padding = variant === 'default' ? 'py-16' : 'p-8'

  return (
    <section className={`${bgClass} ${padding}`}>
      <div className={variant === 'default' ? 'container mx-auto px-4' : ''}>
        <div className="text-center">
          <h3 className={`font-bold text-white mb-4 ${variant === 'default' ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
            {title}
          </h3>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-semibold px-8 py-4 rounded-lg transition-all btn-press"
            >
              {primaryLabel}
              <ArrowRight className="w-5 h-5" />
            </Link>
            {showPhone && (
              <a
                href={phoneLink}
                className="inline-flex items-center justify-center bg-transparent border-2 border-gold/50 hover:border-gold text-white font-semibold px-8 py-4 rounded-lg transition-all"
              >
                Call {phoneDisplay}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Inline CTA card variant for use within sections
interface CTACardProps {
  title: string
  description: string
  buttonLabel?: string
  buttonHref?: string
}

export function CTACard({
  title,
  description,
  buttonLabel = 'Get Free Estimate',
  buttonHref = '/'
}: CTACardProps) {
  return (
    <div className="bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30 rounded-2xl p-8 text-center">
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-300 mb-6 max-w-xl mx-auto">{description}</p>
      <Link
        href={buttonHref}
        className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-semibold px-8 py-4 rounded-lg transition-all btn-press"
      >
        {buttonLabel}
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  )
}
