'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, ArrowRight, Zap } from 'lucide-react'

interface IntegrationStatus {
  id: string
  name: string
  configured: boolean
}

interface ApiResponse {
  integrations: IntegrationStatus[]
}

interface Gap {
  id: string
  label: string
  impact: string
  action: string
  href: string
  severity: 'critical' | 'warning'
}

/**
 * Surfaces the configuration gaps that silently kill deals.
 *
 * Without email, customers never receive their estimate PDF and
 * admin never gets notified of new leads. Without SMS / Calendly,
 * fast-follow-up and consultation booking both break.
 *
 * This component is purposely in the admin's face — if a real bug
 * is here, it matters more than anything else on the page.
 */
export function DealFlowHealth() {
  const [status, setStatus] = useState<IntegrationStatus[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/admin/integrations')
        if (!res.ok) return
        const data: ApiResponse = await res.json()
        if (!cancelled) setStatus(data.integrations)
      } catch {
        // silent — header will stay hidden
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading || dismissed || !status) return null

  const byId = Object.fromEntries(status.map(i => [i.id, i]))

  const gaps: Gap[] = []

  if (!byId.resend?.configured) {
    gaps.push({
      id: 'resend',
      label: 'Email (Resend) not configured',
      impact: 'Customers who get an estimate aren\u2019t receiving the email. Admin isn\u2019t notified of new leads. This is the biggest deal-killer on the list.',
      action: 'Configure Resend',
      href: '/settings?section=integrations',
      severity: 'critical',
    })
  }
  if (!byId.twilio?.configured) {
    gaps.push({
      id: 'twilio',
      label: 'SMS (Twilio) not configured',
      impact: 'Customers don\u2019t get text confirmations. Admin doesn\u2019t get instant lead alerts to phone.',
      action: 'Configure Twilio',
      href: '/settings?section=integrations',
      severity: 'warning',
    })
  }

  if (gaps.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm">
        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        <span className="text-slate-700">
          <span className="font-medium text-slate-900">All deal-flow integrations are live.</span>{' '}
          Email, SMS, and lead notifications are all firing.
        </span>
      </div>
    )
  }

  const hasCritical = gaps.some(g => g.severity === 'critical')

  return (
    <div
      className={`rounded-xl border ${
        hasCritical
          ? 'border-red-500/40 bg-red-50'
          : 'border-amber-500/40 bg-amber-50'
      } p-5`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 rounded-lg p-2 ${
            hasCritical ? 'bg-red-500/10' : 'bg-amber-500/10'
          }`}
        >
          {hasCritical ? (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          ) : (
            <Zap className="h-5 w-5 text-amber-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900">
            {hasCritical ? 'Your deal pipeline has a leak' : 'Heads up on your pipeline'}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {hasCritical
              ? 'Fix these before new leads come in — every hour without this costs closes.'
              : 'These aren\u2019t blockers, but they\u2019d sharpen your follow-up.'}
          </p>

          <ul className="mt-4 space-y-3">
            {gaps.map(gap => (
              <li
                key={gap.id}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 rounded-lg bg-white border border-slate-200 p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{gap.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{gap.impact}</p>
                </div>
                <Link
                  href={gap.href}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                    gap.severity === 'critical'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {gap.action}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setDismissed(true)}
            className="mt-4 text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2"
          >
            Dismiss for this session
          </button>
        </div>
      </div>
    </div>
  )
}
