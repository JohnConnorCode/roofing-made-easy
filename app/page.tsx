'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Shield,
  Clock,
  CheckCircle,
  Phone,
  Star,
  Award,
  BadgeCheck,
  Hammer,
  FileText,
  Users
} from 'lucide-react'

// Generate a demo lead ID for when the API isn't available
function generateDemoLeadId(): string {
  return 'demo-' + Math.random().toString(36).substring(2, 15)
}

export default function HomePage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleGetStarted = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'web_funnel',
          referrerUrl: typeof window !== 'undefined' ? document.referrer : undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/${data.lead.id}/address`)
      } else {
        // Fallback to demo mode if API fails
        const demoId = generateDemoLeadId()
        router.push(`/${demoId}/address`)
      }
    } catch (error) {
      // Fallback to demo mode on any error
      console.log('Using demo mode')
      const demoId = generateDemoLeadId()
      router.push(`/${demoId}/address`)
    }
  }

  const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER || '(555) 000-0000'

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-amber-500" />
              Licensed & Insured
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" />
              A+ BBB Rating
            </span>
          </div>
          <a href={`tel:${PHONE_NUMBER.replace(/\D/g, '')}`} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
            <Phone className="h-4 w-4" />
            <span className="font-medium">{PHONE_NUMBER}</span>
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="bg-slate-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-600">
                <Hammer className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Summit Roofing</h1>
                <p className="text-sm text-slate-400">Professional Roofing Services</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm">
              <span className="text-slate-300">Serving homeowners since 2008</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-600/20 border border-amber-600/30 px-4 py-1.5 text-sm text-amber-400 mb-6">
                <Clock className="h-4 w-4" />
                Free estimates in under 2 minutes
              </div>
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Get Your Roofing Estimate
                <span className="text-amber-500"> Today</span>
              </h2>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                No salespeople. No pressure. Just honest pricing from a local roofing company
                you can trust. Tell us about your roof and get an instant estimate.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="xl"
                  onClick={handleGetStarted}
                  disabled={isCreating}
                  className="text-lg"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Get My Free Estimate
                    </>
                  )}
                </Button>
                <a
                  href={`tel:${PHONE_NUMBER.replace(/\D/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 h-16 px-6 text-lg font-medium text-white border-2 border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  Call Now
                </a>
              </div>

              <p className="mt-4 text-sm text-slate-400">
                No credit card required. Takes less than 2 minutes.
              </p>
            </div>

            {/* Stats/Trust Box */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/10">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4">
                  <div className="text-4xl font-bold text-amber-500">500+</div>
                  <div className="text-sm text-slate-300 mt-1">Roofs Completed</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl font-bold text-amber-500">15+</div>
                  <div className="text-sm text-slate-300 mt-1">Years Experience</div>
                </div>
                <div className="text-center p-4">
                  <div className="flex justify-center gap-0.5 text-amber-500">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                  <div className="text-sm text-slate-300 mt-1">4.9 Star Rating</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl font-bold text-amber-500">100%</div>
                  <div className="text-sm text-slate-300 mt-1">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-slate-700">
              <Shield className="h-10 w-10 text-slate-400" />
              <div>
                <div className="font-semibold">Fully Insured</div>
                <div className="text-sm text-slate-500">$2M Liability Coverage</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <BadgeCheck className="h-10 w-10 text-slate-400" />
              <div>
                <div className="font-semibold">Licensed Contractor</div>
                <div className="text-sm text-slate-500">State License #RC-123456</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Award className="h-10 w-10 text-slate-400" />
              <div>
                <div className="font-semibold">BBB Accredited</div>
                <div className="text-sm text-slate-500">A+ Rating Since 2010</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-16 md:py-24 bg-stone-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Get your estimate in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-2xl font-bold text-white mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Tell Us About Your Roof
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Answer a few quick questions about your property, roof type, and what work you need done.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-2xl font-bold text-white mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Upload Photos (Optional)
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Share photos of your roof for a more accurate assessment. We'll review them carefully.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-2xl font-bold text-white mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Get Your Estimate
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Receive a detailed price range instantly. No waiting, no pushy sales calls.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              disabled={isCreating}
            >
              {isCreating ? 'Loading...' : 'Start My Free Estimate'}
            </Button>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Our Roofing Services
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Quality workmanship for every type of roofing project
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Complete Replacement', desc: 'Full tear-off and new roof installation' },
              { title: 'Roof Repairs', desc: 'Fix leaks, damage, and wear' },
              { title: 'Storm Damage', desc: 'Insurance claim assistance included' },
              { title: 'Inspections', desc: 'Comprehensive roof assessments' },
            ].map((service) => (
              <div key={service.title} className="bg-stone-50 rounded-lg p-6 border border-slate-100">
                <CheckCircle className="h-8 w-8 text-amber-600 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-sm text-slate-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 md:py-24 bg-slate-800 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "They replaced our entire roof in two days. Professional crew, fair price, and the new roof looks amazing. Highly recommend.",
                name: "Michael R.",
                location: "Denver, CO"
              },
              {
                quote: "After the hail storm, they handled everything with our insurance company. Made a stressful situation easy. Great communication throughout.",
                name: "Sarah T.",
                location: "Austin, TX"
              },
              {
                quote: "Got quotes from 5 different companies. These guys were honest about what I actually needed and saved me thousands. Truly trustworthy.",
                name: "James P.",
                location: "Phoenix, AZ"
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-6 backdrop-blur border border-white/10">
                <div className="flex gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-slate-200 leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-slate-400">{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 md:py-24 bg-amber-600">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-amber-100">
            Get your free estimate in under 2 minutes. No obligation, no pressure.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="xl"
              onClick={handleGetStarted}
              disabled={isCreating}
              className="text-lg"
            >
              {isCreating ? 'Loading...' : 'Get My Free Estimate'}
            </Button>
            <a
              href={`tel:${PHONE_NUMBER.replace(/\D/g, '')}`}
              className="inline-flex items-center justify-center gap-2 h-16 px-8 text-lg font-semibold text-amber-600 bg-white rounded-lg hover:bg-amber-50 transition-colors"
            >
              <Phone className="h-5 w-5" />
              {PHONE_NUMBER}
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600">
                  <Hammer className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg font-bold">Summit Roofing</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Professional roofing services for residential and commercial properties.
                Licensed, insured, and committed to quality workmanship since 2008.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="/terms" className="block hover:text-white transition-colors">Terms of Service</a>
                <a href="/privacy" className="block hover:text-white transition-colors">Privacy Policy</a>
                <a href="/login" className="block hover:text-white transition-colors">Contractor Login</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href={`tel:${PHONE_NUMBER.replace(/\D/g, '')}`} className="block hover:text-white transition-colors">
                  {PHONE_NUMBER}
                </a>
                <p>Mon-Fri: 7am - 6pm</p>
                <p>Sat: 8am - 2pm</p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Summit Roofing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
