'use client'

import { AlertTriangle, RefreshCw, Home, Phone } from 'lucide-react'
import { getPhoneDisplay, getPhoneLink } from '@/lib/config/business'

export default function EstimateError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0f14] px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="mx-auto h-12 w-12 text-[#c9a25c]" />
        <h1 className="mt-6 text-2xl font-bold text-slate-100">
          Unable to Load Estimate
        </h1>
        <p className="mt-3 text-slate-400">
          We&apos;re having trouble loading this estimate right now. Your information has been saved &mdash; please try refreshing, or call us for immediate help.
        </p>

        <div className="mt-8 flex flex-col gap-3 w-full">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#c9a25c] px-6 py-3 font-semibold text-[#0c0f14] transition-colors hover:bg-[#b8913f]"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>
          <a
            href={getPhoneLink()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-transparent px-6 py-3 font-semibold text-slate-300 transition-colors hover:bg-slate-800"
          >
            <Phone className="h-5 w-5" />
            Call Us: {getPhoneDisplay()}
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-transparent px-6 py-3 font-semibold text-slate-400 transition-colors hover:bg-slate-800"
          >
            <Home className="h-5 w-5" />
            Back to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}
