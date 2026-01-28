'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Gift,
  Users,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Copy,
  Share2,
  Mail,
  MessageSquare,
} from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { useToast } from '@/components/ui/toast'

const REFERRAL_REWARDS = [
  {
    tier: 1,
    referrals: '1',
    reward: '$50',
    description: 'Amazon Gift Card',
  },
  {
    tier: 2,
    referrals: '3',
    reward: '$200',
    description: 'Cash or Visa Gift Card',
  },
  {
    tier: 3,
    referrals: '5+',
    reward: '$100 each',
    description: 'Per completed project',
  },
]

const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Share Your Link',
    description: 'Send your unique referral link to friends, family, or neighbors who need roofing work.',
  },
  {
    step: 2,
    title: 'They Get an Estimate',
    description: 'Your referral uses the link to get their free estimate through our easy process.',
  },
  {
    step: 3,
    title: 'Project Completes',
    description: "When they choose Farrell Roofing and their project is done, you get rewarded!",
  },
]

export default function ReferralPage() {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [referralCode, setReferralCode] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    // Simulate registration - in production this would call an API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate a simple referral code
    const code = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    setReferralCode(code)
    setIsRegistered(true)
    setIsSubmitting(false)
    showToast('Welcome to the referral program!', 'success')
  }

  const referralLink = referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${referralCode}`
    : ''

  const copyToClipboard = async () => {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      showToast('Link copied to clipboard!', 'success')
    } catch {
      showToast('Failed to copy link', 'error')
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Get a free roofing estimate')
    const body = encodeURIComponent(
      `Hey!\n\nI used Farrell Roofing for my roof and had a great experience. They have this cool tool that gives you a free estimate in under 2 minutes.\n\nCheck it out: ${referralLink}\n\nNo pressure, just honest pricing.`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareViaSMS = () => {
    const text = encodeURIComponent(
      `Hey! Need a roofing estimate? I used Farrell Roofing - they're great. Get a free estimate here: ${referralLink}`
    )
    window.open(`sms:?body=${text}`)
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SiteHeader />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c9a25c]/20 mb-6">
              <Gift className="h-8 w-8 text-[#c9a25c]" />
            </div>
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              Earn Rewards for Referrals
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              Know someone who needs a new roof? Share Farrell Roofing and earn cash rewards when they complete their project.
            </p>
          </div>
        </div>
      </section>

      {/* Rewards Tiers */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-12">
            Reward Tiers
          </h2>

          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            {REFERRAL_REWARDS.map((tier) => (
              <div
                key={tier.tier}
                className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-8 text-center hover:border-[#c9a25c]/50 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#c9a25c]/20 mb-4">
                  <DollarSign className="h-7 w-7 text-[#c9a25c]" />
                </div>
                <p className="text-4xl font-bold text-[#c9a25c] mb-2">{tier.reward}</p>
                <p className="text-slate-100 font-semibold mb-1">
                  {tier.referrals} Referral{tier.referrals !== '1' ? 's' : ''}
                </p>
                <p className="text-sm text-slate-400">{tier.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#c9a25c] text-[#0c0f14] font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Register / Get Link */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-xl px-4">
          <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-8">
            {!isRegistered ? (
              <>
                <h2 className="text-xl font-bold text-slate-100 text-center mb-6">
                  Join the Referral Program
                </h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Your Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full h-12 px-4 rounded-lg border border-slate-600 bg-[#0c0f14] text-slate-100 placeholder:text-slate-500 focus:border-[#c9a25c] focus:outline-none focus:ring-2 focus:ring-[#c9a25c]/20"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating your link...' : 'Get My Referral Link'}
                  </Button>
                </form>
                <p className="text-xs text-slate-500 text-center mt-4">
                  By joining, you agree to our referral program terms.
                </p>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#3d7a5a]/20 mb-4">
                    <CheckCircle className="h-7 w-7 text-[#3d7a5a]" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">You're In!</h2>
                  <p className="text-slate-400 mt-2">Share your link to start earning rewards</p>
                </div>

                <div className="bg-[#0c0f14] border border-slate-600 rounded-lg p-4 mb-6">
                  <p className="text-xs text-slate-500 mb-2">Your Referral Link</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-1 bg-transparent text-slate-100 text-sm focus:outline-none"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      aria-label="Copy link"
                    >
                      <Copy className="h-4 w-4 text-[#c9a25c]" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-slate-400 text-center mb-4">Share via:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={shareViaEmail}
                      className="flex items-center justify-center gap-2 h-12 rounded-lg border border-slate-600 text-slate-300 hover:border-[#c9a25c] hover:text-[#c9a25c] transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </button>
                    <button
                      onClick={shareViaSMS}
                      className="flex items-center justify-center gap-2 h-12 rounded-lg border border-slate-600 text-slate-300 hover:border-[#c9a25c] hover:text-[#c9a25c] transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Text
                    </button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-[#c9a25c]/10 border border-[#c9a25c]/30 rounded-lg">
                  <p className="text-sm text-[#c9a25c] text-center">
                    Your referral code: <span className="font-mono font-bold">{referralCode}</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="py-8 bg-[#0c0f14] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Program Terms</h3>
          <ul className="text-xs text-slate-500 space-y-2">
            <li>• Rewards are paid after the referred project is completed and paid in full.</li>
            <li>• Referrals must be new customers who have not previously received a quote from Farrell Roofing.</li>
            <li>• There is no limit to the number of referrals you can make.</li>
            <li>• Farrell Roofing reserves the right to modify or end this program at any time.</li>
            <li>• Rewards are typically processed within 30 days of project completion.</li>
          </ul>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
