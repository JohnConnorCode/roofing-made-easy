'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Home, Shield, Clock, PhoneOff, CreditCard, HandHeart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollAnimate } from '@/components/scroll-animate'

interface FinalCTAProps {
  onGetStarted: () => void
  isCreating: boolean
}

export function FinalCTA({ onGetStarted, isCreating }: FinalCTAProps) {
  return (
    <section className="py-20 md:py-28 bg-glow-warm border-t border-slate-800 relative overflow-hidden">
      <Image
        src="/images/services/roof-replacement.jpg"
        alt=""
        fill
        className="object-cover opacity-[0.06] pointer-events-none"
      />
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <ScrollAnimate>
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] shadow-lg glow-gold animate-float icon-pulse-ring">
              <Home className="h-8 w-8 text-[#0c0f14]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
            Your Roof, Made Affordable
          </h2>
          <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto">
            Insurance, assistance programs, and financing stack together so you never pay full price out of pocket.
          </p>

          {/* Funding recap pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-6 mb-6">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5">
              <Shield className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">Insurance saves ~$15K</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
              <HandHeart className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">Programs save ~$5K</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-[#c9a25c]/10 border border-[#c9a25c]/20 rounded-full px-3 py-1.5">
              <CreditCard className="h-3.5 w-3.5 text-[#c9a25c]" />
              <span className="text-sm text-[#c9a25c] font-medium">Finance from $89/mo</span>
            </div>
          </div>

          {/* Value recap */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="xl"
              onClick={onGetStarted}
              disabled={isCreating}
              className="text-lg btn-press shadow-lg"
            >
              {isCreating ? 'Starting...' : 'Get My Free Estimate Now'}
            </Button>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Or explore our{' '}
            <Link href="/services" className="text-[#c9a25c] hover:underline">services</Link>,{' '}
            <Link href="/financing" className="text-[#c9a25c] hover:underline">financing</Link>,{' '}
            <Link href="/insurance-help" className="text-[#c9a25c] hover:underline">insurance help</Link>,{' '}
            <Link href="/assistance-programs" className="text-[#c9a25c] hover:underline">assistance programs</Link>, or{' '}
            <Link href="/service-areas" className="text-[#c9a25c] hover:underline">local pricing</Link>
          </p>
        </ScrollAnimate>
      </div>
    </section>
  )
}
