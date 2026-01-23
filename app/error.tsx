'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-slate-600">
          We're sorry, but something unexpected happened. Please try again.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-700"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Home className="h-5 w-5" />
            Go to Homepage
          </a>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-8 max-w-lg rounded-lg bg-slate-100 p-4 text-left">
            <p className="text-sm font-medium text-slate-700">Error details:</p>
            <pre className="mt-2 overflow-auto text-xs text-slate-600">{error.message}</pre>
            {error.digest && (
              <p className="mt-2 text-xs text-slate-500">Error ID: {error.digest}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
