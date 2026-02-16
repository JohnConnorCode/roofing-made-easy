'use client'

// Thin wrapper around Google Analytics gtag
// Fires events to GA4 when the measurement ID is configured

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function gtagEvent(
  action: string,
  params?: Record<string, string | number | undefined>
) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', action, params)
}
