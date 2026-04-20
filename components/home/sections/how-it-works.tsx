'use client'

import Image from 'next/image'
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Steps column */}
          <div className="lg:col-span-7">
            <ScrollAnimate>
              <div className="mb-14">
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

            <ol className="space-y-10 mb-14">
              {STEPS.map((step, idx) => (
                <ScrollAnimate key={step.label} delay={idx * 80}>
                  <li className="flex gap-6">
                    <div className="flex-shrink-0 w-16">
                      <span className="text-5xl md:text-6xl font-bold text-[#c9a25c]/80 font-display tabular-nums leading-none">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-500 mt-1">
                        {step.meta}
                      </span>
                    </div>
                    <div className="pt-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-semibold text-slate-50 font-display leading-snug">
                        {step.label}
                      </h3>
                      <p className="mt-3 text-base text-slate-300 leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </li>
                </ScrollAnimate>
              ))}
            </ol>

            <ScrollAnimate delay={300}>
              <Button
                variant="primary"
                size="lg"
                onClick={onGetStarted}
                disabled={isCreating}
                className="btn-press"
              >
                {isCreating ? 'Starting\u2026' : 'Start my estimate'}
              </Button>
            </ScrollAnimate>
          </div>

          {/* Photo column — hidden on mobile */}
          <ScrollAnimate className="hidden lg:block lg:col-span-5" delay={150}>
            <div className="relative rounded-3xl overflow-hidden aspect-[3/4]">
              <Image
                src="/images/work/team-work.jpg"
                alt="Homeowner reviewing roofing estimate with contractor"
                fill
                sizes="(min-width: 1024px) 38vw, 0px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f14]/85 via-[#0c0f14]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <blockquote className="text-slate-100 text-base font-medium leading-snug">
                  &ldquo;Knew exactly what we were getting into before anyone touched the roof.&rdquo;
                </blockquote>
                <cite className="mt-3 flex items-center gap-3 not-italic">
                  <div className="h-px flex-1 bg-[#c9a25c]/30" />
                  <span className="text-xs text-[#c9a25c] flex-shrink-0">Sarah M., Tupelo MS</span>
                </cite>
              </div>
            </div>
          </ScrollAnimate>

        </div>
      </div>
    </section>
  )
}
