'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { COMPANY_INFO, getEstimateTestimonials } from '@/lib/data/estimate-content'
import { Star, Quote, CheckCircle, MapPin } from 'lucide-react'

export function TrustSignals() {
  const testimonials = getEstimateTestimonials()

  return (
    <Card className="border-slate-700/50 bg-[#161a23]">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#c9a25c]/20 text-[#c9a25c] text-sm font-semibold">
            6
          </span>
          Why Choose {COMPANY_INFO.name}
        </CardTitle>
        <p className="text-slate-400 text-sm mt-1">
          {COMPANY_INFO.serviceArea}&apos;s trusted roofing experts
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {/* Credentials */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {COMPANY_INFO.credentials.map((credential, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 rounded-lg bg-[#1a1f2e] border border-slate-700/30"
            >
              <CheckCircle className="h-5 w-5 text-[#3d7a5a] shrink-0" />
              <span className="text-sm text-slate-300">{credential}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1a1f2e] border border-slate-700/30">
            <CheckCircle className="h-5 w-5 text-[#3d7a5a] shrink-0" />
            <span className="text-sm text-slate-300">Est. {COMPANY_INFO.foundedYear}</span>
          </div>
        </div>

        {/* Testimonials */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            What Our Customers Say
          </h4>

          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="p-4 rounded-xl bg-gradient-to-b from-[#1a1f2e] to-[#161a23] border border-slate-700/30"
              >
                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-[#c9a25c] text-[#c9a25c]"
                    />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative mb-4">
                  <Quote className="absolute -top-1 -left-1 h-6 w-6 text-[#c9a25c]/20" />
                  <p className="text-sm text-slate-300 leading-relaxed pl-4">
                    {testimonial.text.length > 150
                      ? testimonial.text.substring(0, 150) + '...'
                      : testimonial.text}
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-700/30">
                  <div className="h-8 w-8 rounded-full bg-[#c9a25c]/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-[#c9a25c]">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{testimonial.name}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      <span>{testimonial.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-8 pt-6 border-t border-slate-700/30">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-[#3d7a5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Fully Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-[#3d7a5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Background Checked Crews</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-[#3d7a5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Local to {COMPANY_INFO.serviceArea}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
