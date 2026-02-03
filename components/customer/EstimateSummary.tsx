'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Info, Calendar, Phone, ExternalLink } from 'lucide-react'
import { getPhoneDisplay, getPhoneLink } from '@/lib/config/business'

interface EstimateSummaryProps {
  estimate: {
    priceLow: number
    priceLikely: number
    priceHigh: number
    explanation?: string
    factors?: Array<{
      name: string
      impact: number
      description: string
    }>
  }
  property?: {
    address?: string
    city?: string
    state?: string
  }
  showActions?: boolean
  compact?: boolean
}

export function EstimateSummary({
  estimate,
  property,
  showActions = true,
  compact = false,
}: EstimateSummaryProps) {
  const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || ''
  const PHONE_NUMBER = getPhoneDisplay()

  const handleScheduleConsultation = () => {
    if (CALENDLY_URL) {
      window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')
    }
  }

  if (compact) {
    return (
      <Card variant="dark" className="border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Your Estimate</p>
              <p className="text-2xl font-bold text-[#c9a25c]">
                {formatCurrency(estimate.priceLikely)}
              </p>
              <p className="text-xs text-slate-500">
                Range: {formatCurrency(estimate.priceLow)} - {formatCurrency(estimate.priceHigh)}
              </p>
            </div>
            {property?.address && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Property</p>
                <p className="text-sm text-slate-300">{property.address}</p>
                {property.city && property.state && (
                  <p className="text-xs text-slate-500">
                    {property.city}, {property.state}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#c9a25c] to-[#9a7432] text-[#0c0f14]">
        <CardTitle className="text-center text-lg text-[#0c0f14]">Your Estimate</CardTitle>
        {property?.address && (
          <p className="text-center text-sm text-[#0c0f14]/70">
            {property.address}
            {property.city && property.state && `, ${property.city}, ${property.state}`}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-6 bg-[#161a23]">
        {/* Price range */}
        <div className="flex items-end justify-center gap-8">
          <div className="text-center">
            <p className="text-sm text-slate-500">Low</p>
            <p className="text-xl font-semibold text-slate-300">
              {formatCurrency(estimate.priceLow)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-[#c9a25c]">Most Likely</p>
            <p className="text-4xl font-bold text-[#c9a25c]">
              {formatCurrency(estimate.priceLikely)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500">High</p>
            <p className="text-xl font-semibold text-slate-300">
              {formatCurrency(estimate.priceHigh)}
            </p>
          </div>
        </div>

        {/* Visual range bar */}
        <div className="mt-6">
          <div className="relative h-3 rounded-full bg-gradient-to-r from-[#3d7a5a] via-[#c9a25c] to-red-700">
            <div
              className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0c0f14] bg-[#c9a25c] shadow-lg"
              style={{
                left: `${((estimate.priceLikely - estimate.priceLow) /
                  (estimate.priceHigh - estimate.priceLow)) *
                  100}%`,
              }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>{formatCurrency(estimate.priceLow)}</span>
            <span>{formatCurrency(estimate.priceHigh)}</span>
          </div>
        </div>

        {/* Factors breakdown */}
        {estimate.factors && estimate.factors.length > 0 && (
          <div className="mt-6 border-t border-slate-700 pt-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Price Factors</h4>
            <div className="space-y-2">
              {estimate.factors.slice(0, 3).map((factor, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{factor.name}</span>
                  <span className={factor.impact > 0 ? 'text-[#c9a25c]' : 'text-[#3d7a5a]'}>
                    {factor.impact > 0 ? '+' : ''}{formatCurrency(factor.impact)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI explanation */}
        {estimate.explanation && (
          <div className="mt-4 rounded-lg bg-[#1a1f2e] border border-slate-700 p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-[#c9a25c] shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed">
                {estimate.explanation.length > 200
                  ? estimate.explanation.substring(0, 200) + '...'
                  : estimate.explanation}
              </p>
            </div>
          </div>
        )}

        {/* CTA buttons */}
        {showActions && (
          <div className="mt-6 space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
              leftIcon={<Calendar className="h-5 w-5" />}
              rightIcon={CALENDLY_URL ? <ExternalLink className="h-4 w-4" /> : undefined}
              onClick={handleScheduleConsultation}
            >
              Schedule Free Consultation
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100"
              leftIcon={<Phone className="h-5 w-5" />}
              onClick={() => {
                window.location.href = getPhoneLink()
              }}
            >
              Call Us: {PHONE_NUMBER}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
