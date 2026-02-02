'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NEXT_STEPS, ESTIMATE_CTA_MESSAGE, COMPANY_INFO, PAYMENT_TERMS, FINANCING_OPTIONS } from '@/lib/data/estimate-content'
import { Calendar, Phone, MessageCircle, ExternalLink, FileText, Calculator, Handshake, DollarSign } from 'lucide-react'

interface NextStepsProps {
  onScheduleConsultation: () => void
  onCallNow: () => void
  onAskQuestion?: () => void
  phoneNumber: string
  calendlyUrl?: string
}

const STEP_ICONS = {
  document: FileText,
  calculator: Calculator,
  calendar: Calendar,
  handshake: Handshake,
}

export function NextSteps({
  onScheduleConsultation,
  onCallNow,
  onAskQuestion,
  phoneNumber,
  calendlyUrl,
}: NextStepsProps) {
  return (
    <Card className="border-[#c9a25c]/30 bg-gradient-to-br from-[#161a23] via-[#1a1f2e] to-[#161a23]">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#c9a25c]/20 text-[#c9a25c] text-sm font-semibold">
            7
          </span>
          Next Steps
        </CardTitle>
        <p className="text-slate-400 text-sm mt-1">
          Ready to move forward? Here&apos;s what happens next.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {/* Steps timeline */}
        <div className="relative mb-8">
          {/* Connection line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#c9a25c] via-[#c9a25c]/50 to-[#3d7a5a] hidden md:block" />

          <div className="space-y-4">
            {NEXT_STEPS.map((step) => {
              const Icon = STEP_ICONS[step.icon]
              return (
                <div key={step.step} className="flex gap-4">
                  <div className="relative shrink-0">
                    <div className="h-12 w-12 rounded-full bg-[#c9a25c]/10 border-2 border-[#c9a25c]/30 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#c9a25c]" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#c9a25c] text-[#0c0f14] text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>
                  <div className="pt-1">
                    <h4 className="font-semibold text-slate-100">{step.title}</h4>
                    <p className="text-sm text-slate-400">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA message */}
        <div className="text-center mb-6 p-4 rounded-lg bg-[#c9a25c]/10 border border-[#c9a25c]/30">
          <p className="text-slate-100 font-medium">{ESTIMATE_CTA_MESSAGE}</p>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="xl"
            className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0 shadow-lg shadow-[#c9a25c]/20"
            leftIcon={<Calendar className="h-5 w-5" />}
            rightIcon={calendlyUrl ? <ExternalLink className="h-4 w-4" /> : undefined}
            onClick={onScheduleConsultation}
          >
            Schedule Free Consultation
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100"
            leftIcon={<Phone className="h-5 w-5" />}
            onClick={onCallNow}
          >
            Call Us Now: {phoneNumber}
          </Button>

          {onAskQuestion && (
            <Button
              variant="outline"
              size="lg"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
              leftIcon={<MessageCircle className="h-5 w-5" />}
              onClick={onAskQuestion}
            >
              Have Questions? Ask Us
            </Button>
          )}
        </div>

        {/* Payment terms summary */}
        <div className="mt-8 pt-6 border-t border-slate-700/30">
          <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            Payment Options
          </h4>

          {/* Payment schedule */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {PAYMENT_TERMS.map((term) => (
              <div
                key={term.name}
                className="text-center p-3 rounded-lg bg-[#1a1f2e] border border-slate-700/30"
              >
                <p className="text-lg font-bold text-[#c9a25c]">{term.percent}%</p>
                <p className="text-xs text-slate-400">{term.name}</p>
              </div>
            ))}
          </div>

          {/* Financing option */}
          {FINANCING_OPTIONS.available && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[#3d7a5a]/10 border border-[#3d7a5a]/30">
              <DollarSign className="h-5 w-5 text-[#3d7a5a] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-100">{FINANCING_OPTIONS.cta}</p>
                <p className="text-sm text-slate-400">{FINANCING_OPTIONS.description}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
