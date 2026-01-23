'use client'

import { useCurrentStep } from '@/stores/funnelStore'
import { ProgressBar } from './progress-bar'
import { cn } from '@/lib/utils'
import { Hammer, Phone, Shield } from 'lucide-react'

interface FunnelLayoutProps {
  children: React.ReactNode
  className?: string
}

export function FunnelLayout({ children, className }: FunnelLayoutProps) {
  const currentStep = useCurrentStep()
  const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER || '(555) 000-0000'

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800 shadow-lg">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600">
                <Hammer className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  Summit Roofing
                </h1>
                <p className="text-xs text-slate-400">Free Estimate</p>
              </div>
            </div>
            <a
              href={`tel:${PHONE_NUMBER.replace(/\D/g, '')}`}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">{PHONE_NUMBER}</span>
            </a>
          </div>
          <ProgressBar currentStep={currentStep} />
        </div>
      </header>

      {/* Main content */}
      <main className={cn('mx-auto max-w-3xl px-4 py-8', className)}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-4">
            <Shield className="h-4 w-4 text-slate-400" />
            <span>Your information is secure and will never be sold.</span>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <a
              href="/terms"
              className="text-slate-500 hover:text-slate-700 hover:underline"
            >
              Terms of Service
            </a>
            <a
              href="/privacy"
              className="text-slate-500 hover:text-slate-700 hover:underline"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
