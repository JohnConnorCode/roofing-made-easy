'use client'

import { createContext, useContext, useMemo } from 'react'
import { BUSINESS_CONFIG, type BusinessConfig } from './business'

export type { BusinessConfig }

export interface ContactInfo {
  phoneDisplay: string
  phoneRaw: string
  phoneLink: string
}

const BusinessConfigContext = createContext<BusinessConfig>(BUSINESS_CONFIG)

export function BusinessConfigProvider({
  config,
  children,
}: {
  config: BusinessConfig
  children: React.ReactNode
}) {
  return (
    <BusinessConfigContext.Provider value={config}>
      {children}
    </BusinessConfigContext.Provider>
  )
}

export function useBusinessConfig(): BusinessConfig {
  return useContext(BusinessConfigContext)
}

export function usePhoneDisplay(): string {
  return useBusinessConfig().phone.display
}

export function usePhoneLink(): string {
  const config = useBusinessConfig()
  return `tel:${config.phone.raw.replace(/[^+\d]/g, '')}`
}

export function useContact(): ContactInfo {
  const config = useBusinessConfig()
  return useMemo(() => ({
    phoneDisplay: config.phone.display,
    phoneRaw: config.phone.raw,
    phoneLink: `tel:${config.phone.raw.replace(/[^+\d]/g, '')}`,
  }), [config.phone.display, config.phone.raw])
}

/** Formatted hours string, e.g. "Mon-Fri 7am-6pm | Sat 8am-2pm" */
export function useHoursText(): string {
  const { hours } = useBusinessConfig()
  return useMemo(() => {
    const fmt = (t: string) => {
      const [h, m] = t.split(':').map(Number)
      const suffix = h >= 12 ? 'pm' : 'am'
      const h12 = h % 12 || 12
      return m ? `${h12}:${String(m).padStart(2, '0')}${suffix}` : `${h12}${suffix}`
    }
    const fmtRange = (day: { open: string; close: string } | null, label: string) =>
      day ? `${label} ${fmt(day.open)}-${fmt(day.close)}` : null
    return [
      fmtRange(hours.weekdays, 'Mon-Fri'),
      fmtRange(hours.saturday, 'Sat'),
      fmtRange(hours.sunday as { open: string; close: string } | null, 'Sun'),
    ].filter(Boolean).join(' | ')
  }, [hours])
}
