'use client'

import { useCurrentStep } from '@/stores/funnelStore'
import { ProgressBar } from './progress-bar'
import { cn } from '@/lib/utils'
import { Home, Shield } from 'lucide-react'

interface FunnelLayoutProps {
  children: React.ReactNode
  className?: string
}

export function FunnelLayout({ children, className }: FunnelLayoutProps) {
  const currentStep = useCurrentStep()

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 animate-slide-up">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 shadow-md shadow-amber-500/20">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">
                  RoofEstimate
                </h1>
                <p className="text-xs text-slate-500">by Farrell Roofing</p>
              </div>
            </a>
            <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              Free • No account needed
            </div>
          </div>
          <ProgressBar currentStep={currentStep} />
        </div>
      </header>

      {/* Main content */}
      <main className={cn('mx-auto max-w-3xl px-4 py-8 page-transition', className)}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-4">
            <Shield className="h-4 w-4 text-slate-400" />
            <span>Your data stays private. We never sell your information.</span>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <a
              href="/terms"
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/privacy"
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
