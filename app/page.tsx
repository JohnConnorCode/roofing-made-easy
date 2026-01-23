'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Home, Shield, Clock, CheckCircle } from 'lucide-react'

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
        console.error('Failed to create lead')
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Error creating lead:', error)
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
          Get Your Free Roofing Estimate
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 md:text-xl">
          Answer a few questions about your roof and get an instant price estimate.
          No phone calls, no pressure, just accurate pricing in minutes.
        </p>

        <div className="mt-10">
          <Button
            variant="primary"
            size="xl"
            onClick={handleGetStarted}
            disabled={isCreating}
            className="text-xl px-12 py-6"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Starting...
              </>
            ) : (
              'Get My Free Estimate'
            )}
          </Button>
          <p className="mt-4 text-sm text-gray-500">
            Takes less than 2 minutes. No credit card required.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Why Homeowners Trust Our Estimates
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Instant Results</h3>
              <p className="mt-2 text-gray-600">
                Get your estimate in under 2 minutes
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Accurate Pricing</h3>
              <p className="mt-2 text-gray-600">
                Based on local market rates and your specific needs
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Home className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">All Roof Types</h3>
              <p className="mt-2 text-gray-600">
                Shingles, metal, tile, flat roofs and more
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <Shield className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No Obligation</h3>
              <p className="mt-2 text-gray-600">
                Free estimate with no pressure to buy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-gray-900 md:text-3xl">
            How It Works
          </h2>

          <div className="mt-12 space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold">Tell us about your property</h3>
                <p className="text-gray-600">
                  Enter your address and basic roof details like material and size
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold">Upload photos (optional)</h3>
                <p className="text-gray-600">
                  Share photos of your roof for a more accurate assessment
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold">Get your instant estimate</h3>
                <p className="text-gray-600">
                  Receive a detailed price range based on your specific project
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              disabled={isCreating}
            >
              {isCreating ? 'Starting...' : 'Start My Free Estimate'}
            </Button>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-lg font-medium text-gray-700">
            Trusted by homeowners across the country
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
            <div>
              <p className="text-3xl font-bold text-blue-600">10,000+</p>
              <p className="text-sm text-gray-500">Estimates Generated</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">4.8/5</p>
              <p className="text-sm text-gray-500">Customer Rating</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">2 min</p>
              <p className="text-sm text-gray-500">Average Completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-gray-500">
          <p>Your privacy matters. We never sell your information.</p>
          <p className="mt-2">
            <a href="/login" className="text-blue-600 hover:underline">
              Admin Login
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
