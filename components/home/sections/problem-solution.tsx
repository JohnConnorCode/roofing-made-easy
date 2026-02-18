'use client'

import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'
import { ScrollAnimate } from '@/components/scroll-animate'

export function ProblemSolution() {
  return (
    <section className="py-20 md:py-28 bg-mesh-dark">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
            Sound Familiar?
          </h2>
          <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto">
            The traditional way of getting a roofing estimate is broken.
          </p>
        </ScrollAnimate>

        <div className="grid md:grid-cols-2 gap-12 items-center relative">
          <ScrollAnimate animation="slide-in-left">
            <div className="bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-5 md:p-8 card-inner-glow">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-900/20 border border-red-900/30">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">The Old Way</h3>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Schedule 3+ appointments', desc: 'Take time off work, wait around for contractors who may or may not show up' },
                  { title: 'Get wildly different quotes', desc: 'One says $12,000, another says $24,000\u2014who\u2019s right?' },
                  { title: 'Deal with pressure tactics', desc: '\u201CThis price is only good today\u201D or \u201CSign now before prices go up\u201D' },
                  { title: 'Wonder if you\u2019re getting ripped off', desc: 'No way to know the fair market price without industry knowledge' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-900/20 flex items-center justify-center mt-0.5">
                      <span className="text-red-400 text-sm">&#x2715;</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">{item.title}</p>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollAnimate>

          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-ink border-2 border-gold/30 items-center justify-center shadow-card-md icon-pulse-ring">
            <ArrowRight className="w-6 h-6 text-gold" />
          </div>

          <ScrollAnimate animation="slide-in-right" delay={100}>
            <div className="bg-[#1a1f2e] border border-[#c9a25c]/20 rounded-2xl p-5 md:p-8 card-inner-glow">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c9a25c]/15 border border-[#c9a25c]/30">
                  <CheckCircle className="h-6 w-6 text-[#c9a25c]" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">Our Way</h3>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Get your estimate in 2 minutes', desc: 'Answer a few questions, get an instant price range' },
                  { title: 'Know the fair market price', desc: 'AI analyzes 50,000+ projects to show you what jobs like yours actually cost' },
                  { title: 'Zero pressure, zero spam', desc: 'We don\u2019t sell your info to contractors. Period.' },
                  { title: 'Negotiate from a position of knowledge', desc: 'Walk into any contractor meeting knowing what\u2019s fair' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#c9a25c]/15 flex items-center justify-center mt-0.5">
                      <span className="text-[#c9a25c] text-sm">&#x2713;</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">{item.title}</p>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollAnimate>
        </div>
      </div>
    </section>
  )
}
