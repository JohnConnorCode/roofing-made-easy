'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Loader2,
  Eye,
  AlertTriangle,
  RefreshCw,
  X,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface QuoteViewerProps {
  leadId: string
  estimate: {
    id?: string
    price_low: number
    price_likely: number
    price_high: number
    adjusted_price_likely?: number | null
    created_at: string
    valid_until?: string
    estimate_status?: string
    accepted_at?: string | null
    rejected_at?: string | null
  }
  customerName?: string
  customerEmail?: string
  jobType?: string
  className?: string
  onQuoteAccepted?: () => void
  onQuoteRejected?: () => void
}

export function QuoteViewer({
  leadId,
  estimate,
  customerName,
  customerEmail,
  jobType,
  className,
  onQuoteAccepted,
  onQuoteRejected,
}: QuoteViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signature, setSignature] = useState('')
  const [acceptName, setAcceptName] = useState(customerName || '')
  const [acceptEmail, setAcceptEmail] = useState(customerEmail || '')
  const [rejectReason, setRejectReason] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [quoteIncludes, setQuoteIncludes] = useState<string[]>([
    'Materials & labor',
    'Workmanship warranty',
    'Cleanup & disposal',
    'Permit assistance',
  ])

  // Fetch dynamic estimate content for "What's Included"
  useEffect(() => {
    const controller = new AbortController()
    async function fetchEstimateContent() {
      try {
        const res = await fetch('/api/customer/estimate-content', { signal: controller.signal })
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.items) && data.items.length > 0) {
          setQuoteIncludes(data.items.map((item: { title: string }) => item.title))
        }
      } catch {
        // Keep fallback defaults on error or abort
      }
    }
    fetchEstimateContent()
    return () => controller.abort()
  }, [])

  const quoteStatus = estimate.estimate_status || 'draft'
  const isAccepted = quoteStatus === 'accepted' || !!estimate.accepted_at
  const isRejected = quoteStatus === 'rejected' || !!estimate.rejected_at
  const canRespond = !isAccepted && !isRejected
  const displayPrice = estimate.adjusted_price_likely || estimate.price_likely

  async function handleAcceptQuote(e: React.FormEvent) {
    e.preventDefault()
    if (!signature || !acceptName || !acceptEmail) {
      setSubmitError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch(`/api/leads/${leadId}/estimate/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimateId: estimate.id,
          signature,
          acceptedByName: acceptName,
          acceptedByEmail: acceptEmail,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to accept quote')
      }

      setShowAcceptModal(false)
      onQuoteAccepted?.()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to accept quote')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRejectQuote(e: React.FormEvent) {
    e.preventDefault()
    if (!rejectReason) {
      setSubmitError('Please provide a reason for declining')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch(`/api/leads/${leadId}/estimate/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimateId: estimate.id,
          reason: rejectReason,
          rejectedByName: customerName,
          rejectedByEmail: customerEmail,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to decline quote')
      }

      setShowRejectModal(false)
      onQuoteRejected?.()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to decline quote')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadError(null)
    setDownloadSuccess(false)

    try {
      // Use customer endpoint for PDF download
      const response = await fetch(`/api/customer/leads/${leadId}/quote-pdf`)

      if (!response.ok) {
        if (response.status === 401) {
          setDownloadError('Please log in to download your quote.')
        } else if (response.status === 403) {
          setDownloadError('You do not have access to this quote.')
        } else if (response.status === 404) {
          setDownloadError('Quote not found. Please contact us for assistance.')
        } else {
          setDownloadError('Unable to generate PDF. Please try again or contact us.')
        }
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Quote_${customerName?.replace(/\s+/g, '_') || 'Customer'}_${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setDownloadSuccess(true)
      // Clear success after 5 seconds
      setTimeout(() => setDownloadSuccess(false), 5000)
    } catch {
      setDownloadError('Network error. Please check your connection and try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const validUntilDate = estimate.valid_until
    ? new Date(estimate.valid_until)
    : new Date(new Date(estimate.created_at).getTime() + 30 * 24 * 60 * 60 * 1000)

  const isExpired = validUntilDate < new Date()
  const daysUntilExpiry = Math.ceil((validUntilDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card variant="dark" className={cn('border-slate-700', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <FileText className="h-5 w-5 text-gold-light" />
          Your Quote
        </CardTitle>
        <CardDescription>
          Review your personalized roofing estimate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quote Summary */}
        <div className="rounded-lg bg-gradient-to-r from-gold-light/10 to-transparent border border-gold-light/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Project Type</p>
              <p className="text-slate-200 font-medium capitalize">
                {jobType?.replace(/_/g, ' ') || 'Roofing Service'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Estimated Cost</p>
              <p className="text-2xl font-bold text-gold-light">
                {formatCurrency(displayPrice)}
              </p>
              {estimate.adjusted_price_likely && estimate.adjusted_price_likely !== estimate.price_likely && (
                <p className="text-xs text-slate-400 line-through">
                  was {formatCurrency(estimate.price_likely)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-slate-500">Low Estimate</p>
                <p className="text-sm text-slate-300">{formatCurrency(estimate.price_low)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">High Estimate</p>
                <p className="text-sm text-slate-300">{formatCurrency(estimate.price_high)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Status */}
        <div className={cn(
          'flex items-center gap-3 rounded-lg p-3',
          isAccepted ? 'bg-green-500/10 border border-green-500/30' :
          isRejected ? 'bg-slate-700' :
          isExpired ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-800'
        )}>
          {isAccepted ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-400">Quote Accepted</p>
                <p className="text-xs text-slate-400">
                  You accepted this quote{estimate.accepted_at && ` on ${new Date(estimate.accepted_at).toLocaleDateString()}`}
                </p>
              </div>
            </>
          ) : isRejected ? (
            <>
              <X className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-400">Quote Declined</p>
                <p className="text-xs text-slate-500">
                  Contact us if you change your mind or would like a revised quote
                </p>
              </div>
            </>
          ) : isExpired ? (
            <>
              <Clock className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-400">Quote Expired</p>
                <p className="text-xs text-slate-400">
                  Expired on {validUntilDate.toLocaleDateString()}. Contact us for an updated quote.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-400">Quote Valid</p>
                <p className="text-xs text-slate-400">
                  Valid until {validUntilDate.toLocaleDateString()} ({daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} remaining)
                </p>
              </div>
            </>
          )}
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="h-4 w-4" />
          Quote generated on {new Date(estimate.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>

        {/* Error Message */}
        {downloadError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p>{downloadError}</p>
              <button
                onClick={() => setDownloadError(null)}
                className="mt-2 text-xs underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {downloadSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>Quote downloaded successfully!</span>
          </div>
        )}

        {/* Accept/Reject Buttons */}
        {canRespond && !isExpired && (
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1 bg-gradient-to-r from-[#3d7a5a] to-[#2d5a42] hover:from-[#4d8a6a] hover:to-[#3d7a5a] text-white border-0"
              onClick={() => setShowAcceptModal(true)}
              leftIcon={<CheckCircle className="h-5 w-5" />}
            >
              Accept Quote
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={() => setShowRejectModal(true)}
              leftIcon={<X className="h-5 w-5" />}
            >
              Decline
            </Button>
          </div>
        )}

        {/* Download Button */}
        <Button
          variant={canRespond ? 'ghost' : 'primary'}
          className={canRespond
            ? 'w-full text-slate-400 hover:text-slate-300'
            : 'w-full bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0'
          }
          onClick={handleDownload}
          disabled={isDownloading}
          leftIcon={isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
        >
          {isDownloading ? 'Generating PDF...' : 'Download Full Quote'}
        </Button>

        {/* Retry hint */}
        {downloadError && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-slate-400 hover:text-slate-300"
            onClick={handleDownload}
            disabled={isDownloading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Try Again
          </Button>
        )}

        {/* What's Included */}
        <div className="pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Quote Includes</p>
          <div className="grid grid-cols-2 gap-2">
            {quoteIncludes.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle className="h-3.5 w-3.5 text-success" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Accept Quote Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowAcceptModal(false)} />
          <div className="relative bg-slate-deep rounded-xl shadow-xl max-w-md w-full border border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-100 mb-2">Accept Quote</h3>
              <p className="text-sm text-slate-400 mb-6">
                By accepting, you agree to proceed with this roofing project at the quoted price of{' '}
                <span className="text-gold-light font-medium">{formatCurrency(displayPrice)}</span>.
              </p>

              <form onSubmit={handleAcceptQuote} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {submitError}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={acceptName}
                    onChange={e => setAcceptName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-light"
                    placeholder="John Smith"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email *</label>
                  <input
                    type="email"
                    value={acceptEmail}
                    onChange={e => setAcceptEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-light"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Type your name to sign *</label>
                  <input
                    type="text"
                    value={signature}
                    onChange={e => setSignature(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 italic font-serif text-lg focus:outline-none focus:ring-2 focus:ring-gold-light"
                    placeholder="John Smith"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This serves as your electronic signature
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 text-slate-400"
                    onClick={() => setShowAcceptModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#3d7a5a] hover:bg-[#4d8a6a] text-white"
                    disabled={isSubmitting}
                    leftIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  >
                    {isSubmitting ? 'Accepting...' : 'Accept Quote'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reject Quote Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-slate-deep rounded-xl shadow-xl max-w-md w-full border border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-100 mb-2">Decline Quote</h3>
              <p className="text-sm text-slate-400 mb-6">
                We&apos;re sorry to hear that. Please let us know why so we can improve.
              </p>

              <form onSubmit={handleRejectQuote} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {submitError}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Reason for declining *</label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-light resize-none"
                    rows={3}
                    placeholder="Price too high, timing not right, went with another company, etc."
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 text-slate-400"
                    onClick={() => setShowRejectModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300"
                    disabled={isSubmitting}
                    leftIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  >
                    {isSubmitting ? 'Submitting...' : 'Decline Quote'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
