'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { X } from 'lucide-react'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const confirmButtonVariant = variant === 'danger' ? 'destructive' : 'primary'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? 'confirm-dialog-description' : undefined}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
          'rounded-xl bg-white p-6 shadow-xl mx-4',
          'animate-in fade-in-0 zoom-in-95',
          'dark:bg-slate-900 dark:border dark:border-slate-700'
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="pr-8">
          <h2
            id="confirm-dialog-title"
            className={cn(
              'text-lg font-semibold',
              variant === 'danger' && 'text-red-600',
              variant === 'warning' && 'text-amber-600',
              variant === 'default' && 'text-slate-900 dark:text-slate-100'
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              id="confirm-dialog-description"
              className="mt-2 text-sm text-slate-600 dark:text-slate-400"
            >
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </>
  )
}

// Type for confirm function options
export type ConfirmOptions = Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>

// Hook return type
export interface UseConfirmDialogReturn {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  showConfirm: (options: ConfirmOptions) => Promise<boolean>
  ConfirmDialog: React.FC
}

// Hook for easier usage
export function useConfirmDialog(): UseConfirmDialogReturn {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<ConfirmOptions>({
    title: '',
  })
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null)

  const confirmFn = React.useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      setConfig(options)
      setIsOpen(true)
      return new Promise((resolve) => {
        resolverRef.current = resolve
      })
    },
    []
  )

  const handleClose = React.useCallback(() => {
    setIsOpen(false)
    resolverRef.current?.(false)
  }, [])

  const handleConfirm = React.useCallback(() => {
    setIsOpen(false)
    resolverRef.current?.(true)
  }, [])

  const ConfirmDialogComponent = React.useCallback(
    () => (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        {...config}
      />
    ),
    [isOpen, handleClose, handleConfirm, config]
  )

  return { confirm: confirmFn, showConfirm: confirmFn, ConfirmDialog: ConfirmDialogComponent }
}

// Context for global confirm dialog access
interface ConfirmDialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmDialogContext = React.createContext<ConfirmDialogContextValue | null>(null)

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const { confirm, ConfirmDialog } = useConfirmDialog()

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog />
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirm() {
  const context = React.useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider')
  }
  return context.confirm
}
