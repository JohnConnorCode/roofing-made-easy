'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCurrentStep, useFunnelStore } from '@/stores/funnelStore'
import { ProgressBar } from './progress-bar'
import { cn } from '@/lib/utils'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'

interface FunnelLayoutProps {
  children: React.ReactNode
  className?: string
}

export function FunnelLayout({ children, className }: FunnelLayoutProps) {
  const currentStep = useCurrentStep()
  const pathname = usePathname()
  const { address, firstName, email } = useFunnelStore()

  // Scroll to top on every page/step change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Warn users before leaving if they have unsaved progress
  useEffect(() => {
    const hasProgress = address || firstName || email

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if user has entered data and hasn't completed the funnel
      if (hasProgress && currentStep < 4) {
        e.preventDefault()
        // Modern browsers ignore custom messages, but this triggers the default warning
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [address, firstName, email, currentStep])

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:bg-[#c9a25c] focus:text-[#0c0f14] focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Site Header */}
      <SiteHeader />

      {/* Progress Bar */}
      <div className="bg-[#0c0f14] border-b border-slate-800">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <ProgressBar currentStep={currentStep} />
        </div>
      </div>

      {/* Main content */}
      <main
        id="main-content"
        className={cn('flex-1 mx-auto max-w-3xl px-4 py-8 page-transition', className)}
        role="main"
      >
        {children}
      </main>

      {/* Site Footer */}
      <SiteFooter />
    </div>
  )
}
