'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAnalytics } from '@/lib/analytics'
import { useToast } from '@/components/ui/toast'

export function useStartFunnel() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { trackCTAClick, trackConversion } = useAnalytics()
  const { showToast } = useToast()

  const handleGetStarted = useCallback(async () => {
    trackCTAClick('get_estimate_clicked')
    setIsCreating(true)
    setError(null)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'web_funnel',
          referrerUrl: typeof window !== 'undefined' && document.referrer ? document.referrer : undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        trackConversion('lead_created', { lead_id: data.lead.id })
        router.push(`/${data.lead.id}/property`)
      } else {
        const msg = 'Unable to start your estimate. Please try again.'
        setError(msg)
        showToast(msg, 'error')
        setIsCreating(false)
      }
    } catch {
      const msg = 'Connection error. Please check your internet and try again.'
      setError(msg)
      showToast(msg, 'error')
      setIsCreating(false)
    }
  }, [router, trackCTAClick, trackConversion, showToast])

  return { handleGetStarted, isCreating, error }
}
