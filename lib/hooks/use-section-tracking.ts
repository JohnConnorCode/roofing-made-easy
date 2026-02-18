'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useAnalytics } from '@/lib/analytics'

export function useSectionTracking() {
  const { trackEngagement, trackCTAClick } = useAnalytics()
  const observedSections = useRef(new Set<string>())
  const firedDepths = useRef(new Set<number>())
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Create a persistent IntersectionObserver
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.getAttribute('data-track-section')
            if (section && !observedSections.current.has(section)) {
              observedSections.current.add(section)
              trackEngagement('section_impression', { section })
            }
          }
        })
      },
      { threshold: 0.3 }
    )

    return () => observerRef.current?.disconnect()
  }, [trackEngagement])

  // Scroll depth tracking
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        if (docHeight <= 0) { ticking = false; return }
        const percent = Math.round((scrollTop / docHeight) * 100)

        const milestones = [25, 50, 75, 100]
        for (const milestone of milestones) {
          if (percent >= milestone && !firedDepths.current.has(milestone)) {
            firedDepths.current.add(milestone)
            trackEngagement('scroll_depth', { depth: milestone })
          }
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [trackEngagement])

  // Ref callback that registers elements with the observer immediately
  const trackSectionRef = useCallback((sectionName: string) => {
    return (el: HTMLElement | null) => {
      if (el && observerRef.current) {
        el.setAttribute('data-track-section', sectionName)
        observerRef.current.observe(el)
      }
    }
  }, [])

  // CTA attribution: fires a tracking event before the actual CTA handler
  const trackCTAWithAttribution = useCallback(
    (ctaId: string, handler: () => void) => {
      return () => {
        trackCTAClick('cta_click_attributed', { cta_id: ctaId })
        handler()
      }
    },
    [trackCTAClick]
  )

  return { trackSectionRef, trackCTAWithAttribution }
}
