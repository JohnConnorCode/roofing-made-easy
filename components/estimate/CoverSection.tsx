'use client'

import { COMPANY_INFO } from '@/lib/data/estimate-content'
import { Logo } from '@/components/ui/logo'
import { MapPin, Calendar, Clock } from 'lucide-react'

interface CoverSectionProps {
  customerName?: string
  propertyAddress?: string
  city?: string
  state?: string
  proposalDate?: Date
  validDays?: number
}

export function CoverSection({
  customerName,
  propertyAddress,
  city,
  state,
  proposalDate = new Date(),
  validDays = 30,
}: CoverSectionProps) {
  const validUntil = new Date(proposalDate)
  validUntil.setDate(validUntil.getDate() + validDays)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const fullAddress = propertyAddress
    ? city && state
      ? `${propertyAddress}, ${city}, ${state}`
      : propertyAddress
    : null

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#161a23] via-[#1a1f2e] to-[#161a23] border border-slate-700/50 print:border-slate-300">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a25c] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3d7a5a] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative p-8 md:p-12">
        {/* Header with logo */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
          <div>
            <Logo size="lg" showText={true} linkToHome={false} />
            <p className="text-slate-400 text-sm">{COMPANY_INFO.tagline}</p>
          </div>
          <div className="text-right print:text-left">
            <p className="text-[#c9a25c] text-sm font-medium uppercase tracking-wider mb-1">
              Preliminary Estimate
            </p>
            <p className="text-2xl font-bold text-slate-100">Your Roofing Proposal</p>
          </div>
        </div>

        {/* Customer and property info */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Prepared For */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Prepared For
            </h3>
            {customerName ? (
              <p className="text-2xl font-semibold text-slate-100">{customerName}</p>
            ) : (
              <p className="text-2xl font-semibold text-slate-400">Valued Customer</p>
            )}
            {fullAddress && (
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="h-4 w-4 text-[#c9a25c] mt-0.5 shrink-0" />
                <span>{fullAddress}</span>
              </div>
            )}
          </div>

          {/* Proposal Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Proposal Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="h-4 w-4 text-[#c9a25c] shrink-0" />
                <span>Date: {formatDate(proposalDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="h-4 w-4 text-[#c9a25c] shrink-0" />
                <span>Valid Until: {formatDate(validUntil)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key value propositions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-700/50">
          {COMPANY_INFO.credentials.map((credential, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-slate-300"
            >
              <div className="h-2 w-2 rounded-full bg-[#3d7a5a]" />
              <span>{credential}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="h-2 w-2 rounded-full bg-[#3d7a5a]" />
            <span>Since {COMPANY_INFO.foundedYear}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
