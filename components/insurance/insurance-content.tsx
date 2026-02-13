'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader, SiteFooter } from '@/components/layout'
import {
  FileText,
  ArrowRight,
  CheckCircle,
  Camera,
  Phone,
  ClipboardList,
  Shield,
  UserPlus,
  AlertTriangle,
  FileCheck,
  Clock,
  Building2,
  ExternalLink,
} from 'lucide-react'
import { INSURANCE_COMPANIES, INSURANCE_RESOURCES } from '@/lib/data/insurance-resources'
import { ScrollAnimate, ScrollStagger } from '@/components/scroll-animate'

export default function InsuranceContent() {
  const filingGuide = INSURANCE_RESOURCES.find(r => r.id === 'filing-guide')
  const documentationChecklist = INSURANCE_RESOURCES.find(r => r.id === 'documentation-checklist')
  const adjusterPrep = INSURANCE_RESOURCES.find(r => r.id === 'adjuster-prep')
  const appealGuide = INSURANCE_RESOURCES.find(r => r.id === 'appeal-guide')

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SiteHeader />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c9a25c]/20 mb-6">
              <FileText className="h-8 w-8 text-[#c9a25c]" />
            </div>
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              Navigate Your Insurance Claim with Confidence
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              Filing a roof damage claim can be overwhelming. Here you'll find free resources, step-by-step guides, and tracking tools to document damage, file your claim correctly, and get what you're entitled to.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
              <Link href="/customer/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Track Your Claim
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => document.getElementById('how-we-help')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How We Help */}
      <section id="how-we-help" className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              The Claims Process, Simplified
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Three steps to navigate your insurance claim successfully
            </p>
          </ScrollAnimate>

          <ScrollStagger className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-6 shadow-lg">
                <Camera className="h-8 w-8 text-[#0c0f14]" />
              </div>
              <div className="text-sm text-[#c9a25c] font-medium mb-2">Step 1</div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                Document the Damage
              </h3>
              <p className="text-slate-400">
                Use the checklists and guides below to thoroughly document roof damage with photos, videos, and detailed notes.
              </p>
            </div>

            <div className="text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-6 shadow-lg">
                <ClipboardList className="h-8 w-8 text-[#0c0f14]" />
              </div>
              <div className="text-sm text-[#c9a25c] font-medium mb-2">Step 2</div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                File Your Claim
              </h3>
              <p className="text-slate-400">
                Follow the step-by-step filing guide to submit your claim correctly the first time. Download letter templates for professional communication.
              </p>
            </div>

            <div className="text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-6 shadow-lg">
                <Clock className="h-8 w-8 text-[#0c0f14]" />
              </div>
              <div className="text-sm text-[#c9a25c] font-medium mb-2">Step 3</div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                Track Progress
              </h3>
              <p className="text-slate-400">
                Monitor your claim status, manage documents, and get reminders for important deadlines all in one place.
              </p>
            </div>
          </ScrollStagger>
        </div>
      </section>

      {/* Resource Preview */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Essential Resources
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Guides and checklists to help you through every step
            </p>
          </ScrollAnimate>

          <ScrollStagger className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 mb-2">{filingGuide?.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{filingGuide?.description}</p>
                  <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                    Guide • 6 Steps
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 mb-2">{documentationChecklist?.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{documentationChecklist?.description}</p>
                  <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                    Checklist • {Array.isArray(documentationChecklist?.content) ? documentationChecklist.content.length : 0} Items
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 mb-2">{adjusterPrep?.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{adjusterPrep?.description}</p>
                  <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                    Guide • Before, During & After
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 mb-2">{appealGuide?.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{appealGuide?.description}</p>
                  <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                    Guide • Appeal Process
                  </span>
                </div>
              </div>
            </div>
          </ScrollStagger>

          {/* AI Letter Teaser */}
          <div className="mt-8 bg-gradient-to-r from-[#c9a25c]/10 to-transparent border border-[#c9a25c]/20 rounded-xl p-6 text-center">
            <FileText className="h-8 w-8 text-[#c9a25c] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-100 mb-2">AI-Powered Claim Letters</h3>
            <p className="text-sm text-slate-400 mb-4 max-w-xl mx-auto">
              Generate professional claim and appeal letters pre-filled with your information. Our AI crafts personalized letters based on your specific situation.
            </p>
            <Link href="/customer/register">
              <Button
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
              >
                Create Account for Full Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Insurance Company Directory */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1f2e] border border-slate-700 mb-6">
              <Building2 className="h-7 w-7 text-[#c9a25c]" />
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Insurance Company Directory
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Quick access to claims hotlines for major insurance providers
            </p>
          </ScrollAnimate>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INSURANCE_COMPANIES.map((company) => (
              <div
                key={company.name}
                className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-slate-100">{company.name}</h3>
                  <a
                    href={`tel:${company.claimsPhone.replace(/-/g, '')}`}
                    className="text-[#c9a25c] text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {company.claimsPhone}
                  </a>
                </div>
                {company.claimsUrl && (
                  <a
                    href={company.claimsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={`Visit ${company.name} claims website`}
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claim Status Tracking */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <Clock className="h-4 w-4" />
                Free Tracking Tools
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-6">
                Stay on Top of Your Claim
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                Insurance claims can drag on for weeks. Keep everything organized in one place - track status, store documents securely, and never miss a deadline.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Real-time status updates as your claim progresses',
                  'Secure document storage for photos, estimates, and correspondence',
                  'Deadline reminders so you never miss important dates',
                  'Communication log to track all conversations',
                  'Appeal tracking if your claim is denied',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/customer/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Free Account
                </Button>
              </Link>
            </ScrollAnimate>

            <ScrollAnimate delay={100}>
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="text-sm text-slate-500 mb-4">Claim Status Preview</div>
                <div className="space-y-4">
                  {[
                    { status: 'Claim Filed', date: 'Jan 15', color: 'bg-blue-400', completed: true },
                    { status: 'Adjuster Scheduled', date: 'Jan 18', color: 'bg-yellow-400', completed: true },
                    { status: 'Inspection Complete', date: 'Jan 20', color: 'bg-purple-400', completed: true },
                    { status: 'Under Review', date: 'In Progress', color: 'bg-orange-400', completed: false, current: true },
                    { status: 'Decision', date: 'Pending', color: 'bg-slate-600', completed: false },
                    { status: 'Settlement', date: 'Pending', color: 'bg-slate-600', completed: false },
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${step.color} ${step.current ? 'animate-pulse' : ''}`} />
                      <div className="flex-1">
                        <span className={step.completed ? 'text-slate-100' : step.current ? 'text-slate-200' : 'text-slate-500'}>
                          {step.status}
                        </span>
                      </div>
                      <span className="text-sm text-slate-500">{step.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#0c0f14] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <ScrollAnimate>
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] shadow-lg">
                <FileText className="h-8 w-8 text-[#0c0f14]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Create a free account to access all resources, track your claim progress, and keep everything organized in one place.
            </p>
            <div className="mt-8">
              <Link href="/customer/register">
                <Button
                  variant="primary"
                  size="xl"
                  className="text-lg shadow-lg bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Account to Track Your Claim
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Free forever • No credit card required
            </p>
          </ScrollAnimate>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
