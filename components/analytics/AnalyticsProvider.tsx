'use client'

import { ReactNode, useEffect } from 'react'
import { tracker } from '@/lib/analytics/tracker'

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    tracker.init()
    return () => tracker.destroy()
  }, [])

  return <>{children}</>
}
