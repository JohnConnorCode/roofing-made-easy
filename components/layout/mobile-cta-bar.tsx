'use client'

import { useState, useEffect } from 'react'
import { Phone } from 'lucide-react'
import { getPhoneLink, getPhoneDisplay } from '@/lib/config/business'
import { StartFunnelButton } from '@/components/funnel/start-funnel-button'

export function MobileCTABar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.querySelector('section')
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden safe-bottom safe-x transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex border-t border-slate-700 bg-ink/95 backdrop-blur-md">
        <a
          href={getPhoneLink()}
          className="flex-1 flex items-center justify-center gap-2 min-h-[48px] py-3 text-sm font-semibold text-slate-100 border-r border-slate-700 active:bg-slate-800"
        >
          <Phone className="h-4 w-4" />
          Call {getPhoneDisplay()}
        </a>
        <StartFunnelButton className="flex-1 flex items-center justify-center min-h-[48px] py-3 text-sm font-semibold bg-gold text-ink active:bg-gold-light">
          Free Estimate
        </StartFunnelButton>
      </div>
    </div>
  )
}
