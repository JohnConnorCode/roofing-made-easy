'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { X, Percent, DollarSign, Tag } from 'lucide-react'

interface PriceAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  estimateId: string
  estimateType: 'basic' | 'detailed'
  currentPrice: number
  adjustedPrice?: number | null
  onAdjustmentApplied: () => void
}

type AdjustmentType = 'discount_percent' | 'discount_fixed' | 'price_override'

export function PriceAdjustmentModal({
  isOpen,
  onClose,
  estimateId,
  estimateType,
  currentPrice,
  adjustedPrice,
  onAdjustmentApplied,
}: PriceAdjustmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('discount_percent')
  const [value, setValue] = useState('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  const basePrice = adjustedPrice || currentPrice

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Focus trap and initial focus
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

  // Calculate preview
  const getPreviewPrice = (): number => {
    const numValue = parseFloat(value) || 0
    switch (adjustmentType) {
      case 'discount_percent':
        return basePrice * (1 - numValue / 100)
      case 'discount_fixed':
        return basePrice - numValue
      case 'price_override':
        return numValue
      default:
        return basePrice
    }
  }

  const previewPrice = getPreviewPrice()
  const savings = basePrice - previewPrice

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const numValue = parseFloat(value)
    if (!numValue || numValue <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (adjustmentType === 'discount_percent' && numValue > 50) {
      setError('Discount cannot exceed 50%')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const endpoint = estimateType === 'detailed'
        ? `/api/leads/${estimateId}/detailed-estimate/adjust`
        : `/api/estimates/${estimateId}/adjust`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustmentType,
          value: numValue,
          reason,
          description,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to apply adjustment')
      }

      onAdjustmentApplied()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply adjustment')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="price-adjustment-title"
        className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 id="price-adjustment-title" className="text-xl font-semibold text-slate-900">Adjust Price</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Price Display */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Current Price</span>
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(basePrice)}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('discount_percent')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  adjustmentType === 'discount_percent'
                    ? 'border-gold bg-gold-light/10 text-gold-dark'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Percent className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs font-medium">% Off</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('discount_fixed')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  adjustmentType === 'discount_fixed'
                    ? 'border-gold bg-gold-light/10 text-gold-dark'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <DollarSign className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs font-medium">$ Off</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('price_override')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  adjustmentType === 'price_override'
                    ? 'border-gold bg-gold-light/10 text-gold-dark'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Tag className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs font-medium">Override</span>
              </button>
            </div>
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {adjustmentType === 'discount_percent'
                ? 'Discount Percentage'
                : adjustmentType === 'discount_fixed'
                ? 'Discount Amount'
                : 'New Price'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {adjustmentType === 'discount_percent' ? '%' : '$'}
              </span>
              <Input
                type="number"
                step={adjustmentType === 'discount_percent' ? '1' : '0.01'}
                min="0"
                max={adjustmentType === 'discount_percent' ? '50' : undefined}
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={adjustmentType === 'discount_percent' ? '10' : '500'}
                className="pl-8"
                required
              />
            </div>
          </div>

          {/* Description (customer visible) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description (shown on quote)
            </label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., Senior discount, Referral bonus"
            />
          </div>

          {/* Reason (internal) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Internal Reason
            </label>
            <Input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g., Price match competitor"
            />
          </div>

          {/* Preview */}
          {value && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-green-700">New Price</span>
                <span className="text-xl font-bold text-green-700">
                  {formatCurrency(previewPrice)}
                </span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-600">Customer Savings</span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(savings)} ({((savings / basePrice) * 100).toFixed(1)}% off)
                  </span>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            Apply Adjustment
          </Button>
        </div>
      </div>
    </div>
  )
}
