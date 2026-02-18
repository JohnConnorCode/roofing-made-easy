'use client'

import { ScrollStagger } from '@/components/scroll-animate'
import { CountUp } from '@/components/ui/count-up'

export function TrustBar() {
  return (
    <section className="border-y border-slate-800 bg-ink">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-8">
        <ScrollStagger simple className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
          <div className="flex items-center gap-4 md:first:pl-0 md:pl-8">
            <div className="h-10 w-1 rounded-full bg-gold flex-shrink-0" />
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-100 font-display"><CountUp end={50000} suffix="+" /></div>
              <div className="text-sm text-slate-500 mt-1">Estimates Generated</div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:pl-8 md:border-l md:border-slate-800/50">
            <div className="h-14 w-1 rounded-full bg-gold flex-shrink-0" />
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-100 font-display"><CountUp end={92} suffix="%" /></div>
              <div className="text-sm text-slate-500 mt-1">Within 15% of Final Quote</div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:pl-8 md:border-l md:border-slate-800/50">
            <div className="h-10 w-1 rounded-full bg-gold flex-shrink-0" />
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-100 font-display"><CountUp end={2} suffix=" min" duration={1200} /></div>
              <div className="text-sm text-slate-500 mt-1">Average Time to Estimate</div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:pl-8 md:border-l md:border-slate-800/50">
            <div className="h-14 w-1 rounded-full bg-gold flex-shrink-0" />
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-100 font-display"><CountUp end={20} suffix="+ yrs" duration={1500} /></div>
              <div className="text-sm text-slate-500 mt-1">Roofing Experience</div>
            </div>
          </div>
        </ScrollStagger>
      </div>
    </section>
  )
}
