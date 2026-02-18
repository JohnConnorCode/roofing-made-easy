'use client'

import { ClipboardList, Zap, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollAnimate, ScrollStagger } from '@/components/scroll-animate'

const STEPS = [
  {
    number: 1,
    icon: ClipboardList,
    title: 'Tell us about your roof',
    time: '2 min',
    description: 'Answer a few quick questions about your property, roof type, and timeline. Upload photos for extra accuracy.',
  },
  {
    number: 2,
    icon: Zap,
    title: 'Get your instant estimate',
    time: 'Instant',
    description: 'Our AI analyzes your roof against 50,000+ local projects and gives you a detailed price range with full breakdown.',
  },
  {
    number: 3,
    icon: Compass,
    title: 'Explore your options',
    time: 'Your pace',
    description: 'Finance it, file an insurance claim, check assistance programs, or share with your family\u2014all from your personal dashboard.',
  },
]

interface HowItWorksProps {
  onGetStarted: () => void
  isCreating: boolean
}

export function HowItWorks({ onGetStarted, isCreating }: HowItWorksProps) {
  return (
    <section className="py-16 md:py-24 bg-glow-cool border-t border-slate-800">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            From question to quote in three simple steps.
          </p>
        </ScrollAnimate>

        {/* Desktop: horizontal timeline */}
        <ScrollStagger simple className="hidden md:grid md:grid-cols-3 gap-0 relative mb-12">
          {/* Connecting line */}
          <div className="absolute top-[2.25rem] left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-[#c9a25c]/50 via-[#c9a25c]/30 to-[#c9a25c]/50 z-0" />

          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative text-center px-6">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-ink border-2 border-[#c9a25c]/40 flex items-center justify-center mb-4 shadow-lg">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a25c] to-[#9a7432] flex items-center justify-center">
                      <Icon className="h-6 w-6 text-[#0c0f14]" />
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-full bg-gold text-ink text-xs font-bold flex items-center justify-center">
                      {step.number}
                    </span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">{step.time}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </ScrollStagger>

        {/* Mobile: vertical stack */}
        <ScrollStagger simple className="md:hidden space-y-6 mb-12">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative flex gap-4">
                {/* Vertical line */}
                {index < STEPS.length - 1 && (
                  <div className="absolute left-[1.6rem] top-[4.5rem] bottom-0 w-0.5 bg-[#c9a25c]/20" />
                )}
                <div className="flex-shrink-0">
                  <div className="w-[3.25rem] h-[3.25rem] rounded-full bg-gradient-to-br from-[#c9a25c] to-[#9a7432] flex items-center justify-center shadow-lg">
                    <Icon className="h-5 w-5 text-[#0c0f14]" />
                  </div>
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-gold text-ink text-xs font-bold flex items-center justify-center">
                      {step.number}
                    </span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">{step.time}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-1">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </ScrollStagger>

        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onGetStarted}
            disabled={isCreating}
            className="btn-press"
          >
            {isCreating ? 'Starting...' : 'Calculate My Estimate'}
          </Button>
        </div>
      </div>
    </section>
  )
}
