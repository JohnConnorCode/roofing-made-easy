'use client'

import { MapPin, PhoneOff, ShieldCheck, Clock } from 'lucide-react'
import { ScrollAnimate } from '@/components/scroll-animate'
import { useBusinessConfig } from '@/lib/config/business-provider'

/**
 * Honest trust strip — only shows claims we can actually back.
 * No fabricated counts, percentages, or dollar amounts.
 */
export function TrustBar() {
  const config = useBusinessConfig()
  const years = config.foundedYear
    ? new Date().getFullYear() - parseInt(config.foundedYear)
    : null

  const signals: { icon: typeof MapPin; label: string; sub: string }[] = []

  if (years) {
    signals.push({
      icon: MapPin,
      label: `${years} years`,
      sub: `roofing in ${config.serviceArea.region}`,
    })
  }

  if (config.credentials.stateLicensed && config.credentials.stateContractorLicense) {
    signals.push({
      icon: ShieldCheck,
      label: 'Licensed & insured',
      sub: `MS contractor #${config.credentials.stateContractorLicense}`,
    })
  } else if (config.credentials.stateLicensed) {
    signals.push({
      icon: ShieldCheck,
      label: 'Licensed & insured',
      sub: `${config.address.stateCode} roofing contractor`,
    })
  }

  signals.push({
    icon: PhoneOff,
    label: 'No sales calls',
    sub: 'You email us first. Always.',
  })

  signals.push({
    icon: Clock,
    label: 'Free estimate',
    sub: 'Two minutes, no account',
  })

  // Trim to 4 signals — avoid stuffing
  const display = signals.slice(0, 4)

  return (
    <section aria-label="Trust signals" className="border-y border-slate-900 bg-[#0a0d12]">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <ScrollAnimate>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
            {display.map(({ icon: Icon, label, sub }) => (
              <li key={label} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-[#c9a25c]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-100 leading-tight">
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 leading-snug">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </ScrollAnimate>
      </div>
    </section>
  )
}
