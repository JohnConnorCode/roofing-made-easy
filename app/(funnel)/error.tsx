'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw, Phone } from 'lucide-react'
import { BUSINESS_CONFIG } from '@/lib/config/business'

export default function FunnelError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Funnel error:', error)
    Sentry.captureException(error)
  }, [error])

  const phoneDisplay = BUSINESS_CONFIG.phone.display
  const phoneHref = `tel:${BUSINESS_CONFIG.phone.raw.replace(/[^+\d]/g, '')}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#c9a25c]/20">
          <AlertTriangle className="h-8 w-8 text-[#c9a25c]" />
        </div>
        <h2 className="mt-6 text-xl font-bold text-slate-100">
          Something went wrong
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          We hit an unexpected issue loading this page. Your information has been saved — please try again, or give us a call for immediate help.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#c9a25c] px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-[#d4af6e]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <a
            href={phoneHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
          >
            <Phone className="h-4 w-4" />
            Call Us: {phoneDisplay}
          </a>
        </div>
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-8 max-w-md rounded-lg bg-slate-800 border border-slate-700 p-3 text-left">
            <pre className="overflow-auto text-xs text-slate-400">{error.message}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
