'use client'

import { Shield, Clock, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollAnimate } from '@/components/scroll-animate'

interface FinalCTAProps {
  onGetStarted: () => void
  isCreating: boolean
}

export function FinalCTA({ onGetStarted, isCreating }: FinalCTAProps) {
  return (
    <section aria-label="Get your free estimate" className="py-20 md:py-28 bg-glow-warm border-t border-slate-800 relative overflow-hidden">
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <ScrollAnimate>
          <h2 className="text-3xl font-bold text-slate-100 md:text-5xl font-display">
            Ready to Stop Worrying
            <br className="hidden sm:block" />
            {' '}About Your Roof?
          </h2>
          <p className="mt-5 text-xl text-slate-400 max-w-2xl mx-auto">
            Your estimate is 2 minutes away. Your support options are already waiting.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-8 mb-10">
            <div className="flex items-center gap-2 text-slate-300">
              <Shield className="h-5 w-5 text-[#c9a25c]" />
              <span className="text-sm font-medium">Free Forever</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="h-5 w-5 text-[#c9a25c]" />
              <span className="text-sm font-medium">2 Minutes</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <PhoneOff className="h-5 w-5 text-[#c9a25c]" />
              <span className="text-sm font-medium">No Spam Calls</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="xl"
            onClick={onGetStarted}
            disabled={isCreating}
            className="text-lg btn-press shadow-lg glow-gold hero-cta-pulse"
          >
            {isCreating ? 'Starting...' : 'Get My Free Estimate'}
          </Button>
        </ScrollAnimate>
      </div>
    </section>
  )
}
