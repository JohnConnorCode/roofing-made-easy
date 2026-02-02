'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/estimation/detailed-engine'
import { cn } from '@/lib/utils'

interface EstimateSummaryCardProps {
  totalMaterial: number
  totalLabor: number
  totalEquipment: number
  subtotal: number
  overheadPercent: number
  overheadAmount: number
  profitPercent: number
  profitAmount: number
  taxPercent: number
  taxAmount: number
  priceLow: number
  priceLikely: number
  priceHigh: number
  className?: string
  variant?: 'full' | 'compact' | 'minimal'
}

export function EstimateSummaryCard({
  totalMaterial,
  totalLabor,
  totalEquipment,
  subtotal,
  overheadPercent,
  overheadAmount,
  profitPercent,
  profitAmount,
  taxPercent,
  taxAmount,
  priceLow,
  priceLikely,
  priceHigh,
  className,
  variant = 'full',
}: EstimateSummaryCardProps) {
  if (variant === 'minimal') {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-slate-400">Estimated Price</p>
            <p className="text-3xl font-bold text-[#c9a25c] mt-1">
              {formatCurrency(priceLikely)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Range: {formatCurrency(priceLow)} - {formatCurrency(priceHigh)}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Estimate Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500">Material</p>
              <p className="font-semibold text-slate-200">
                {formatCurrency(totalMaterial)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Labor</p>
              <p className="font-semibold text-slate-200">
                {formatCurrency(totalLabor)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Equipment</p>
              <p className="font-semibold text-slate-200">
                {formatCurrency(totalEquipment)}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Subtotal</span>
              <span className="font-medium text-slate-200">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-500">
              <span>Overhead ({overheadPercent}%)</span>
              <span>{formatCurrency(overheadAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-500">
              <span>Profit ({profitPercent}%)</span>
              <span>{formatCurrency(profitAmount)}</span>
            </div>
            {taxPercent > 0 && (
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Tax ({taxPercent}%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-700 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-200">Total</span>
              <span className="text-2xl font-bold text-[#c9a25c]">
                {formatCurrency(priceLikely)}
              </span>
            </div>
            <p className="text-xs text-slate-500 text-right mt-1">
              {formatCurrency(priceLow)} - {formatCurrency(priceHigh)}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Full variant
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Estimate Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cost breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">
            Cost Breakdown
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Materials</span>
              <span className="font-medium text-slate-200">
                {formatCurrency(totalMaterial)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Labor</span>
              <span className="font-medium text-slate-200">
                {formatCurrency(totalLabor)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Equipment</span>
              <span className="font-medium text-slate-200">
                {formatCurrency(totalEquipment)}
              </span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex justify-between items-center">
              <span className="font-medium text-slate-300">Subtotal</span>
              <span className="font-semibold text-slate-100">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>

          {/* Visual breakdown bar */}
          {subtotal > 0 && (
            <div className="mt-3 h-3 rounded-full overflow-hidden flex bg-slate-700">
              <div
                className="bg-blue-500"
                style={{ width: `${(totalMaterial / subtotal) * 100}%` }}
                title={`Materials: ${formatCurrency(totalMaterial)}`}
              />
              <div
                className="bg-green-500"
                style={{ width: `${(totalLabor / subtotal) * 100}%` }}
                title={`Labor: ${formatCurrency(totalLabor)}`}
              />
              <div
                className="bg-orange-500"
                style={{ width: `${(totalEquipment / subtotal) * 100}%` }}
                title={`Equipment: ${formatCurrency(totalEquipment)}`}
              />
            </div>
          )}
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Materials
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Labor
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> Equipment
            </span>
          </div>
        </div>

        {/* Markup */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">
            Markup & Tax
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">
                Overhead ({overheadPercent}%)
              </span>
              <span className="text-slate-200">
                {formatCurrency(overheadAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">
                Profit ({profitPercent}%)
              </span>
              <span className="text-slate-200">
                {formatCurrency(profitAmount)}
              </span>
            </div>
            {taxPercent > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">
                  Tax ({taxPercent}%)
                </span>
                <span className="text-slate-200">
                  {formatCurrency(taxAmount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-slate-700 pt-4">
          <div className="bg-gradient-to-r from-[#1a1f2e] to-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-slate-200">
                Estimated Total
              </span>
              <span className="text-3xl font-bold text-[#c9a25c]">
                {formatCurrency(priceLikely)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Price Range</span>
              <span className="text-slate-300">
                {formatCurrency(priceLow)} - {formatCurrency(priceHigh)}
              </span>
            </div>
          </div>
        </div>

        {/* Per-square cost */}
        {subtotal > 0 && (
          <div className="text-center pt-2">
            <p className="text-sm text-slate-400">
              Note: Actual costs may vary based on final measurements and
              conditions found during installation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
