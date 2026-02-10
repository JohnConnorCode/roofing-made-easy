'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Portal error:', error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-900/50">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-100">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-400">
          An error occurred while loading this page. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#c9a25c] px-5 py-2.5 text-sm font-semibold text-[#0c0f14] transition-colors hover:bg-[#d4b06c]"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-6 max-w-md rounded-lg bg-slate-800 p-3 text-left">
            <pre className="overflow-auto text-xs text-slate-400">{error.message}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
