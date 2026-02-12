'use client'

import { createContext, useContext } from 'react'
import { BUSINESS_CONFIG, type BusinessConfig } from './business'

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
