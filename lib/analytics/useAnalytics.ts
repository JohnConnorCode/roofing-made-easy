'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { tracker } from './tracker'
import { gtagEvent } from './gtag'

export function useAnalytics(leadId?: string) {
  const pathname = usePathname()
  const pageEnteredAt = useRef<number>(Date.now())

  // Initialize tracker and track page views on route change
  useEffect(() => {
    tracker.init()
    pageEnteredAt.current = Date.now()

    tracker.track({
      event_type: 'page_view',
      event_name: 'page_view',
      lead_id: leadId,
    })

    gtagEvent('page_view', { page_path: pathname })

    return () => {
      // Track time on page when navigating away
      const timeOnPage = Date.now() - pageEnteredAt.current
      if (timeOnPage > 1000) {
        tracker.track({
          event_type: 'engagement',
          event_name: 'page_exit',
          lead_id: leadId,
          time_on_page_ms: timeOnPage,
        })
      }
    }
  }, [pathname, leadId])

  const trackFunnelStep = useCallback(
    (step: number, name: string, entrySource?: string) => {
      tracker.track({
        event_type: 'funnel_step',
        event_name: name,
        lead_id: leadId,
        funnel_step: step,
        entry_source: entrySource,
      })
      gtagEvent('funnel_step', {
        step,
        step_name: name,
        lead_id: leadId,
      })
    },
    [leadId]
  )

  const trackConversion = useCallback(
    (name: string, metadata?: Record<string, unknown>) => {
      tracker.track({
        event_type: 'conversion',
        event_name: name,
        lead_id: leadId,
        metadata,
      })
      gtagEvent('conversion', {
        conversion_name: name,
        lead_id: leadId,
      })
    },
    [leadId]
  )

  const trackCTAClick = useCallback(
    (name: string, metadata?: Record<string, unknown>) => {
      tracker.track({
        event_type: 'cta_click',
        event_name: name,
        lead_id: leadId,
        metadata,
      })
      gtagEvent('cta_click', { cta_name: name })
    },
    [leadId]
  )

  const trackEngagement = useCallback(
    (name: string, metadata?: Record<string, unknown>) => {
      tracker.track({
        event_type: 'engagement',
        event_name: name,
        lead_id: leadId,
        metadata,
      })
      gtagEvent(name)
    },
    [leadId]
  )

  return {
    trackFunnelStep,
    trackConversion,
    trackCTAClick,
    trackEngagement,
  }
}
