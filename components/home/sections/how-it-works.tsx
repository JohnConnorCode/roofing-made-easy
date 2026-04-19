'use client'

import { Button } from '@/components/ui/button'
import { ScrollAnimate } from '@/components/scroll-animate'

const STEPS = [
  {
    label: 'Tell us about the roof',
    body: 'A few questions about size, age, material, and what\u2019s going on. No account needed.',
    meta: '~2 minutes',
  },
  {
    label: 'Get a grounded price range',
    body: 'We run your specifics through real material costs and regional labor rates, then show the low, likely, and high end.',
    meta: 'Instant',
  },
  {
    label: 'Take it from here',
    body: 'Share the PDF with family, hand it to an adjuster, or keep going with us \u2014 insurance claim help, financing options, and getting on the schedule.',
    meta: 'On your terms',
  },
]

interface HowItWorksProps {
  onGetStarted: () => void
  isCreating: boolean
}

export function HowItWorks({ onGetStarted, isCreating }: HowItWorksProps) {
  return (
    <section
      aria-label="How it works"
      className="py-24 md:py-32 bg-[#0c0f14] border-t border-slate-900"
    >
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate>
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c]">
              How it works
            </p>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-slate-50 font-display leading-[1.05]">
              Three steps.
              <br />
              No phone tag.
            </h2>
          </div>
        </ScrollAnimate>

        <ol className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-12 mb-14">
          {STEPS.map((step, idx) => (
            <ScrollAnimate key={step.label} delay={idx * 80}>
              <li className="relative">
                <div className="flex items-baseline gap-4 mb-5">
                  <span className="text-5xl md:text-6xl font-bold text-[#c9a25c]/80 font-display tabular-nums leading-none">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
                    {step.meta}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-slate-50 font-display leading-snug">
                  {step.label}
                </h3>
                <p className="mt-3 text-base text-slate-300 leading-relaxed">
                  {step.body}
                </p>
              </li>
            </ScrollAnimate>
          ))}
        </ol>

        <ScrollAnimate delay={300}>
          <div className="pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={onGetStarted}
              disabled={isCreating}
              className="btn-press"
            >
              {isCreating ? 'Starting\u2026' : 'Start my estimate'}
            </Button>
          </div>
        </ScrollAnimate>
      </div>
    </section>
  )
}
