'use client'

import { useState, useEffect, useRef } from 'react'
import { Phone, ArrowRight } from 'lucide-react'
import { useContact } from '@/lib/hooks/use-contact'
import { StartFunnelButton } from '@/components/funnel/start-funnel-button'

export function MobileCTABar() {
  const { phoneLink, phoneDisplay } = useContact()
  const [visible, setVisible] = useState(false)
  const lastScrollY = useRef(0)
  const scrollingDown = useRef(false)

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return

    let pastHero = false

    // Track when we've scrolled past the hero
    const observer = new IntersectionObserver(
      ([entry]) => {
        pastHero = !entry.isIntersecting
        if (!pastHero) setVisible(false)
      },
      { threshold: 0 }
    )
    observer.observe(hero)

    // Show on scroll up, hide on scroll down (only after passing hero)
    const handleScroll = () => {
      if (!pastHero) return

      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current

      // Require a minimum scroll distance to trigger (prevents jitter)
      if (Math.abs(delta) < 8) return

      scrollingDown.current = delta > 0
      setVisible(!scrollingDown.current)
      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden safe-bottom safe-x transition-transform duration-300 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Subtle top shadow for depth */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a25c]/30 to-transparent" />
      <div className="flex bg-[#0c0f14]/98 backdrop-blur-lg border-t border-slate-800">
        <a
          href={phoneLink}
          className="flex items-center justify-center gap-2 px-4 py-3.5 min-h-[56px] text-sm font-medium text-slate-200 border-r border-slate-800 active:bg-slate-800/80 transition-colors"
          aria-label={`Call ${phoneDisplay}`}
        >
          <Phone className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="whitespace-nowrap">Call Now</span>
        </a>
        <StartFunnelButton
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 min-h-[56px] text-sm font-semibold bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] active:opacity-90 transition-opacity"
        >
          Get Free Estimate
          <ArrowRight className="h-4 w-4" />
        </StartFunnelButton>
      </div>
    </div>
  )
}
