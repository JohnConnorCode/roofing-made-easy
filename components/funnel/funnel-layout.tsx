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
    <div className="min-h-screen bg-gradient-dark">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:bg-[#c9a25c] focus:text-[#0c0f14] focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0c0f14]/95 backdrop-blur-md border-b border-slate-800">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] shadow-md glow-gold">
                <Home className="h-5 w-5 text-[#0c0f14]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100">
                  Farrell Roofing
                </h1>
                <p className="text-xs text-slate-500">Tupelo, Mississippi</p>
              </div>
            </a>
            <div className="text-xs text-slate-500 bg-[#1a1f2e] border border-slate-700 px-3 py-1.5 rounded-full">
              Free • No account needed
            </div>
          </div>
          <ProgressBar currentStep={currentStep} />
        </div>
      </header>

      {/* Main content */}
      <main
        id="main-content"
        className={cn('mx-auto max-w-3xl px-4 py-8 page-transition', className)}
        role="main"
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0c0f14] py-6">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-4">
            <Shield className="h-4 w-4 text-slate-600" />
            <span>Your data stays private. We never sell your information.</span>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <a
              href="/terms"
              className="text-slate-500 hover:text-[#c9a25c] transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/privacy"
              className="text-slate-500 hover:text-[#c9a25c] transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
