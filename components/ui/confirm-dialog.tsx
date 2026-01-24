'use client'

import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import { Button } from './button'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(null)

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider')
  }
  return context
}

interface ConfirmDialogProviderProps {
  children: ReactNode
}

export function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts)
      setResolvePromise(() => resolve)
      setIsOpen(true)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setIsOpen(false)
    resolvePromise?.(true)
    setResolvePromise(null)
    setOptions(null)
  }, [resolvePromise])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    resolvePromise?.(false)
    setResolvePromise(null)
    setOptions(null)
  }, [resolvePromise])

  const variantStyles = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: 'bg-amber-100 text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700',
    },
    default: {
      icon: 'bg-slate-100 text-slate-600',
      button: 'bg-slate-800 hover:bg-slate-900',
    },
  }

  const styles = variantStyles[options?.variant || 'default']

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      {/* Dialog overlay */}
      {isOpen && options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
          >
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${styles.icon}`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center">
              <h2 id="confirm-dialog-title" className="text-lg font-semibold text-slate-900">
                {options.title}
              </h2>
              <p id="confirm-dialog-description" className="mt-2 text-sm text-slate-600">
                {options.message}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                {options.cancelLabel || 'Cancel'}
              </Button>
              <Button
                variant="primary"
                className={`flex-1 ${styles.button}`}
                onClick={handleConfirm}
              >
                {options.confirmLabel || 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  )
}
