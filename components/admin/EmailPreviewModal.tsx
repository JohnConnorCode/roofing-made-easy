'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  X,
  Monitor,
  Smartphone,
  RefreshCw,
  Send,
  Code,
  Eye,
  Check,
  AlertTriangle,
} from 'lucide-react'

interface EmailPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  templateId?: string
  templateSlug?: string
  subject?: string
  htmlBody?: string
  customData?: Record<string, string>
  onSendTest?: () => Promise<void>
}

type ViewMode = 'desktop' | 'mobile'
type ContentMode = 'rendered' | 'source'

export function EmailPreviewModal({
  isOpen,
  onClose,
  templateId,
  templateSlug,
  subject,
  htmlBody,
  customData,
  onSendTest,
}: EmailPreviewModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [contentMode, setContentMode] = useState<ContentMode>('rendered')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [testSent, setTestSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{
    subject?: string
    html: string
    plainText: string
    sampleData: Record<string, string>
  } | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return
    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    firstElement?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  const loadPreview = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/email-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          templateSlug,
          subject,
          htmlBody,
          customData,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to load preview')
      }

      const data = await response.json()
      setPreview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview')
    } finally {
      setIsLoading(false)
    }
  }, [templateId, templateSlug, subject, htmlBody, customData])

  useEffect(() => {
    if (isOpen) {
      loadPreview()
      setTestSent(false)
    }
  }, [isOpen, loadPreview])

  const handleSendTest = async () => {
    if (!onSendTest) return
    setIsSending(true)
    try {
      await onSendTest()
      setTestSent(true)
      setTimeout(() => setTestSent(false), 3000)
    } catch {
      setError('Failed to send test email')
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-preview-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <h2 id="email-preview-title" className="text-lg font-semibold text-slate-900">Email Preview</h2>
            {preview?.subject && (
              <span className="text-sm text-slate-500 truncate max-w-md">
                Subject: {preview.subject}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'desktop'
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Desktop view"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'mobile'
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Mobile view"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            {/* Content mode toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setContentMode('rendered')}
                className={`p-2 rounded-md transition-colors ${
                  contentMode === 'rendered'
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Rendered view"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => setContentMode('source')}
                className={`p-2 rounded-md transition-colors ${
                  contentMode === 'source'
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="HTML source"
              >
                <Code className="h-4 w-4" />
              </button>
            </div>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={loadPreview}
              disabled={isLoading}
              title="Refresh preview"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Send test */}
            {onSendTest && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendTest}
                disabled={isSending || !preview}
                leftIcon={
                  testSent ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : isSending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )
                }
              >
                {testSent ? 'Sent!' : 'Send Test'}
              </Button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-100 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={loadPreview}
              >
                Try Again
              </Button>
            </div>
          ) : preview ? (
            <div
              className={`mx-auto transition-all ${
                viewMode === 'desktop' ? 'max-w-[600px]' : 'max-w-[375px]'
              }`}
            >
              {contentMode === 'rendered' ? (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <iframe
                    srcDoc={preview.html}
                    title="Email Preview"
                    className="w-full border-0"
                    style={{
                      height: viewMode === 'desktop' ? '800px' : '667px',
                    }}
                    sandbox="allow-same-origin"
                  />
                </div>
              ) : (
                <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-[800px]">
                  <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                    {preview.html}
                  </pre>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer with sample data reference */}
        {preview?.sampleData && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <details className="text-sm">
              <summary className="cursor-pointer text-slate-600 hover:text-slate-800 font-medium">
                View sample data used in preview
              </summary>
              <div className="mt-2 p-3 bg-white rounded border border-slate-200 max-h-48 overflow-auto">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(preview.sampleData)
                    .filter(([, value]) => value && !value.includes('<'))
                    .slice(0, 20)
                    .map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="font-mono text-gold-dark">{`{{${key}}}`}</span>
                        <span className="text-slate-600 truncate">{value}</span>
                      </div>
                    ))}
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
