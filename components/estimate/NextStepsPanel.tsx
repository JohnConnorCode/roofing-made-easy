'use client'

import { useState, useCallback } from 'react'
import {
  Calendar,
  Phone,
  Share2,
  Download,
  UserPlus,
  CheckCircle,
  ArrowRight,
  Copy,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NextStepsPanelProps {
  phoneDisplay: string
  phoneLink: string
  calendlyUrl?: string
  shareUrl?: string
  onScheduleConsultation: () => void
  onShare: () => void
  onDownload: () => void
  onCreateAccount?: () => void
  accountStatus?: 'created' | 'existed' | 'failed' | null
  isDownloading?: boolean
}

type Path = 'talk' | 'share' | 'save' | 'account'

/**
 * The decision moment.
 *
 * Customers coming off the estimate page split into four intents:
 *   1. Talk it through (book a call / call now)
 *   2. Send it to spouse (copy link / share)
 *   3. Keep the PDF (download)
 *   4. Come back later (account)
 *
 * Surfacing all four with equal weight, each labeled by intent,
 * reduces abandonment vs. one giant "Schedule" button that
 * presumes every visitor is ready to commit.
 */
export function NextStepsPanel({
  phoneDisplay,
  phoneLink,
  calendlyUrl,
  shareUrl,
  onScheduleConsultation,
  onShare,
  onDownload,
  onCreateAccount,
  accountStatus,
  isDownloading,
}: NextStepsPanelProps) {
  const [activePath, setActivePath] = useState<Path | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) {
      onShare()
      return
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2500)
    } catch {
      // Clipboard blocked — fall through to share handler
      onShare()
    }
  }, [shareUrl, onShare])

  return (
    <div className="rounded-2xl border border-[#c9a25c]/25 bg-gradient-to-br from-[#161a23] via-[#13171f] to-[#0c0f14] p-6 md:p-8 shadow-xl shadow-black/30 print:hidden">
      <div className="text-center mb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c] mb-2">
          Your next step
        </p>
        <h3 className="text-2xl md:text-3xl font-bold text-slate-50 font-display leading-tight">
          What feels right from here?
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Pick whichever matches where you are. No wrong answer.
        </p>
      </div>

      {/* Primary CTA — big, full-width, easy to thumb */}
      <button
        type="button"
        onClick={() => {
          setActivePath('talk')
          onScheduleConsultation()
        }}
        className={cn(
          'group w-full flex items-center justify-between gap-4 rounded-xl p-5 transition-all',
          'bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c]',
          'text-[#0c0f14] shadow-lg shadow-[#c9a25c]/20',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a25c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0f14]'
        )}
      >
        <div className="flex items-center gap-4 text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0c0f14]/10 flex-shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base md:text-lg font-semibold">
              {calendlyUrl ? 'Book a free 10-min consultation' : 'Call us — we\u2019ll walk you through it'}
            </p>
            <p className="text-xs md:text-sm font-medium opacity-80">
              {calendlyUrl
                ? 'We\u2019ll confirm exact pricing and answer questions.'
                : `Direct line: ${phoneDisplay}`}
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
      </button>

      {/* Three secondary paths — equal weight grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Call */}
        <a
          href={phoneLink}
          onClick={() => setActivePath('talk')}
          className={cn(
            'group flex items-center gap-3 rounded-xl p-4 transition-colors',
            'bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900',
            'text-slate-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0f14]'
          )}
        >
          <Phone className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold truncate">Call now</p>
            <p className="text-xs text-slate-400 truncate">{phoneDisplay}</p>
          </div>
        </a>

        {/* Share with spouse */}
        <button
          type="button"
          onClick={() => {
            setActivePath('share')
            handleCopyLink()
          }}
          className={cn(
            'group flex items-center gap-3 rounded-xl p-4 transition-colors text-left',
            'bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900',
            'text-slate-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0f14]'
          )}
        >
          {linkCopied ? (
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <Share2 className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {linkCopied ? 'Link copied' : 'Share with spouse'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {linkCopied ? 'Paste it wherever you need' : 'Copy a private view link'}
            </p>
          </div>
        </button>

        {/* Download PDF */}
        <button
          type="button"
          onClick={() => {
            setActivePath('save')
            onDownload()
          }}
          disabled={isDownloading}
          className={cn(
            'group flex items-center gap-3 rounded-xl p-4 transition-colors text-left',
            'bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900',
            'text-slate-200 disabled:opacity-60',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0f14]'
          )}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 text-[#c9a25c] flex-shrink-0 animate-spin" />
          ) : (
            <Download className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {isDownloading ? 'Preparing\u2026' : 'Download PDF'}
            </p>
            <p className="text-xs text-slate-400 truncate">Keep a printable copy</p>
          </div>
        </button>
      </div>

      {/* Optional: account creation — only if available and not already done */}
      {onCreateAccount && accountStatus !== 'created' && accountStatus !== 'existed' && (
        <button
          type="button"
          onClick={() => {
            setActivePath('account')
            onCreateAccount()
          }}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl p-3 text-sm text-slate-400 hover:text-[#e6c588] hover:bg-slate-900/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0f14]"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Save to a free account so you can come back any time
        </button>
      )}

      {accountStatus === 'created' && (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5" />
          Saved to your account. We emailed you a magic-link sign-in.
        </p>
      )}
      {accountStatus === 'existed' && (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          Saved to the account you already had with this email.
        </p>
      )}

      {/* Trust footer — very subtle */}
      <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <Copy className="h-3 w-3" />
        <span>Your estimate link is private. Only people you share it with can see it.</span>
      </div>

      {/* Hidden but functional: analytics anchor */}
      <span className="sr-only" data-next-path={activePath ?? 'none'} />
    </div>
  )
}
