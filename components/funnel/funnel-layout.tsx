'use client'

import { useCurrentStep } from '@/stores/funnelStore'
import { ProgressBar } from './progress-bar'
import { cn } from '@/lib/utils'
import { Brain, Shield } from 'lucide-react'

interface FunnelLayoutProps {
  children: React.ReactNode
  className?: string
}

export function FunnelLayout({ children, className }: FunnelLayoutProps) {
  const currentStep = useCurrentStep()

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  RoofEstimate AI
                </h1>
                <p className="text-xs text-slate-500">by Farrell Roofing</p>
              </div>
            </a>
            <div className="text-xs text-slate-500">
              Free • No account needed
            </div>
          </div>
          <ProgressBar currentStep={currentStep} />
        </div>
      </header>

      {/* Main content */}
      <main className={cn('mx-auto max-w-3xl px-4 py-8', className)}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-6">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-4">
            <Shield className="h-4 w-4 text-slate-500" />
            <span>Your data stays private. We never sell your information.</span>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <a
              href="/terms"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/privacy"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
