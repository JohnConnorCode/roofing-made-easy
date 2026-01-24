'use client'

import { Star, Quote } from 'lucide-react'
import type { Testimonial } from '@/lib/data/testimonials'

interface TestimonialCardProps {
  testimonial: Testimonial
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 flex flex-col h-full">
      {/* Quote icon */}
      <div className="mb-4">
        <Quote className="h-8 w-8 text-[#c9a25c] opacity-50" />
      </div>

      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < testimonial.rating
                ? 'text-[#c9a25c] fill-current'
                : 'text-slate-600'
            }`}
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-slate-300 leading-relaxed flex-1 mb-6">
        "{testimonial.text}"
      </p>

      {/* Author */}
      <div className="border-t border-slate-700 pt-4">
        <p className="font-semibold text-slate-100">{testimonial.name}</p>
        <p className="text-sm text-slate-500">{testimonial.location}</p>
        <p className="text-xs text-[#c9a25c] mt-1">{testimonial.projectType}</p>
      </div>
    </div>
  )
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
  title?: string
  subtitle?: string
}

export function TestimonialsSection({
  testimonials,
  title = "What Homeowners Say",
  subtitle = "Real reviews from real customers"
}: TestimonialsSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-[#0c0f14]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}
