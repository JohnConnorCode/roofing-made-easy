'use client'

import { useEffect, useRef } from 'react'
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Estimate {
  id: string
  lead_id: string
  price_low: number
  price_likely: number
  price_high: number
  status: string
  created_at: string
  valid_until: string | null
  base_cost?: number
  material_cost?: number
  labor_cost?: number
  lead: {
    id: string
    status: string
    contact: { first_name: string; last_name: string }[] | null
    property: { street_address: string; city: string; state: string }[] | null
    intake: { job_type: string }[] | null
  }
}

interface EstimateComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  estimates: Estimate[]
}

export function EstimateComparisonModal({
  isOpen,
  onClose,
  estimates,
}: EstimateComparisonModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || estimates.length < 2) return null

  // Calculate price differences
  const minPrice = Math.min(...estimates.map((e) => e.price_likely))
  const maxPrice = Math.max(...estimates.map((e) => e.price_likely))
  const priceDiff = maxPrice - minPrice

  const getPriceTrend = (price: number) => {
    if (price === minPrice && priceDiff > 0) {
      return {
        icon: TrendingDown,
        label: 'Lowest',
        className: 'text-green-600 bg-green-50',
      }
    }
    if (price === maxPrice && priceDiff > 0) {
      return {
        icon: TrendingUp,
        label: 'Highest',
        className: 'text-red-600 bg-red-50',
      }
    }
    return { icon: Minus, label: 'Same', className: 'text-slate-600 bg-slate-50' }
  }

  const formatJobType = (type: string | undefined) => {
    if (!type) return 'N/A'
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const ComparisonRow = ({
    label,
    values,
    formatter = (v: string | number) => v,
    highlightDiff = false,
  }: {
    label: string
    values: (string | number | null)[]
    formatter?: (value: string | number) => string | number
    highlightDiff?: boolean
  }) => {
    const formattedValues = values.map((v) => (v != null ? formatter(v) : '-'))
    const allSame =
      highlightDiff &&
      new Set(values.filter((v) => v != null)).size === 1

    return (
      <tr className="border-b border-slate-100 last:border-0">
        <td className="py-3 pr-4 font-medium text-slate-700 whitespace-nowrap">
          {label}
        </td>
        {formattedValues.map((value, i) => (
          <td
            key={i}
            className={cn(
              'py-3 px-4 text-center',
              highlightDiff && !allSame && value !== '-'
                ? 'font-semibold'
                : 'text-slate-600'
            )}
          >
            {value}
          </td>
        ))}
      </tr>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative z-10 mx-4 max-h-[90vh] w-full max-w-5xl overflow-auto rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comparison-title"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
          <h2 id="comparison-title" className="text-xl font-semibold text-slate-900">
            Estimate Comparison
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Price Summary Cards */}
          <div className="mb-6 grid gap-4" style={{ gridTemplateColumns: `repeat(${estimates.length}, 1fr)` }}>
            {estimates.map((estimate) => {
              const contact = estimate.lead?.contact?.[0]
              const trend = getPriceTrend(estimate.price_likely)
              const TrendIcon = trend.icon

              return (
                <div
                  key={estimate.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="mb-2 text-sm text-slate-500">
                    {contact?.first_name} {contact?.last_name}
                  </div>
                  <div className="mb-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(estimate.price_likely)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                        trend.className
                      )}
                    >
                      <TrendIcon className="h-3 w-3" />
                      {trend.label}
                    </span>
                    {priceDiff > 0 && estimate.price_likely === minPrice && (
                      <span className="text-xs text-green-600">
                        -{formatCurrency(priceDiff)} lower
                      </span>
                    )}
                    {priceDiff > 0 && estimate.price_likely === maxPrice && (
                      <span className="text-xs text-red-600">
                        +{formatCurrency(priceDiff)} higher
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Difference Banner */}
          {priceDiff > 0 && (
            <div className="mb-6 rounded-lg bg-gold-light/20 p-4 text-center">
              <span className="text-sm text-slate-600">
                Price difference:{' '}
                <span className="font-semibold text-slate-900">
                  {formatCurrency(priceDiff)}
                </span>{' '}
                ({Math.round((priceDiff / minPrice) * 100)}% variance)
              </span>
            </div>
          )}

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 pr-4 text-left text-sm font-semibold text-slate-700">
                    Detail
                  </th>
                  {estimates.map((estimate) => {
                    const contact = estimate.lead?.contact?.[0]
                    return (
                      <th
                        key={estimate.id}
                        className="py-3 px-4 text-center text-sm font-semibold text-slate-700"
                      >
                        {contact?.first_name} {contact?.last_name}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  label="Price (Low)"
                  values={estimates.map((e) => e.price_low)}
                  formatter={(v) => formatCurrency(Number(v))}
                  highlightDiff
                />
                <ComparisonRow
                  label="Price (Likely)"
                  values={estimates.map((e) => e.price_likely)}
                  formatter={(v) => formatCurrency(Number(v))}
                  highlightDiff
                />
                <ComparisonRow
                  label="Price (High)"
                  values={estimates.map((e) => e.price_high)}
                  formatter={(v) => formatCurrency(Number(v))}
                  highlightDiff
                />
                <ComparisonRow
                  label="Base Cost"
                  values={estimates.map((e) => e.base_cost || null)}
                  formatter={(v) => formatCurrency(Number(v))}
                  highlightDiff
                />
                <ComparisonRow
                  label="Material Cost"
                  values={estimates.map((e) => e.material_cost || null)}
                  formatter={(v) => formatCurrency(Number(v))}
                  highlightDiff
                />
                <ComparisonRow
                  label="Labor Cost"
                  values={estimates.map((e) => e.labor_cost || null)}
                  formatter={(v) => formatCurrency(Number(v))}
                  highlightDiff
                />
                <ComparisonRow
                  label="Status"
                  values={estimates.map((e) =>
                    e.status.charAt(0).toUpperCase() + e.status.slice(1)
                  )}
                />
                <ComparisonRow
                  label="Job Type"
                  values={estimates.map((e) =>
                    formatJobType(e.lead?.intake?.[0]?.job_type)
                  )}
                />
                <ComparisonRow
                  label="Created"
                  values={estimates.map((e) => e.created_at)}
                  formatter={(v) => formatDate(String(v))}
                />
                <ComparisonRow
                  label="Valid Until"
                  values={estimates.map((e) => e.valid_until)}
                  formatter={(v) => formatDate(String(v))}
                />
                <ComparisonRow
                  label="Property"
                  values={estimates.map((e) => {
                    const property = e.lead?.property?.[0]
                    return property
                      ? `${property.city}, ${property.state}`
                      : null
                  })}
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white p-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
