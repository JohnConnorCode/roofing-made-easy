'use client'

import { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { ToastProvider } from '@/components/ui/toast'
import { ConfirmDialogProvider } from '@/components/ui/confirm-dialog'
import { BusinessConfigProvider, type BusinessConfig } from '@/lib/config/business-provider'

interface ProvidersProps {
  children: ReactNode
  businessConfig: BusinessConfig
}

export function Providers({ children, businessConfig }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <BusinessConfigProvider config={businessConfig}>
        <ToastProvider>
          <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
        </ToastProvider>
      </BusinessConfigProvider>
    </ErrorBoundary>
  )
}
