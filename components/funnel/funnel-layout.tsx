'use client'

import { useCurrentStep } from '@/stores/funnelStore'
import { ProgressBar } from './progress-bar'
import { cn } from '@/lib/utils'

interface FunnelLayoutProps {
  children: React.ReactNode
  className?: string
}

export function FunnelLayout({ children, className }: FunnelLayoutProps) {
  const currentStep = useCurrentStep()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="mb-4 flex items-center justify-center">
            <h1 className="text-xl font-bold text-gray-900">
              Your Free Roofing Estimate
            </h1>
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
          <p className="text-center text-sm text-gray-500">
            Your privacy matters. We never sell your information.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <a
              href="/terms"
              className="text-gray-500 hover:text-gray-700 hover:underline"
            >
              Terms of Service
            </a>
            <a
              href="/privacy"
              className="text-gray-500 hover:text-gray-700 hover:underline"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
