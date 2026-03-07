'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Star, Quote } from 'lucide-react'
import { ScrollAnimate } from '@/components/scroll-animate'
import { getAllTestimonials } from '@/lib/data/testimonials'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'

const AVATAR_COLORS = [
  'bg-[#c9a25c]',
  'bg-[#5b7fa4]',
  'bg-[#3d7a5a]',
  'bg-[#8b6cc1]',
  'bg-[#c97a5c]',
  'bg-[#4a8f8f]',
  'bg-[#a65c7a]',
  'bg-[#6b8a3d]',
] as const

export function SocialProof() {
  const testimonials = getAllTestimonials()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [activeCard, setActiveCard] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const scrollNext = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    const cardWidth = container.firstElementChild?.clientWidth ?? 0
    const gap = 16
    const maxScroll = container.scrollWidth - container.clientWidth
    if (container.scrollLeft >= maxScroll - 10) {
      container.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: cardWidth + gap, behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return
    intervalRef.current = setInterval(scrollNext, 6000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, prefersReducedMotion, scrollNext])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const cardWidth = container.firstElementChild?.clientWidth ?? 0
      const gap = 16
      if (cardWidth === 0) return
      const index = Math.round(container.scrollLeft / (cardWidth + gap))
      setActiveCard(Math.min(index, testimonials.length - 1))
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [testimonials.length])

  const scrollToCard = (index: number) => {
    const container = scrollRef.current
    if (!container) return
    const cardWidth = container.firstElementChild?.clientWidth ?? 0
    const gap = 16
    container.scrollTo({ left: index * (cardWidth + gap), behavior: 'smooth' })
  }

  return (
    <section aria-label="Customer testimonials" className="py-20 md:py-28 bg-diagonal-dark">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
            What Homeowners Say
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Real stories from homeowners who got their answers fast.
          </p>
        </ScrollAnimate>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 scrollbar-hide"
          aria-roledescription="carousel"
          aria-label="Customer testimonials"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="w-[85vw] sm:w-[340px] md:w-[380px] snap-center bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-6 card-inner-glow card-hover-premium flex-shrink-0"
            >
              <Quote className="h-8 w-8 text-[#c9a25c]/30 mb-4" />
              <p className="text-slate-300 mb-4 leading-relaxed line-clamp-4">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#c9a25c] text-[#c9a25c] star-glow" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center text-sm font-bold text-[#0c0f14]`}>
                  {testimonial.name.split(' ').filter((_, i, arr) => i === 0 || i === arr.length - 1).map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-slate-100">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.location} &bull; {testimonial.projectType}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              className="p-2"
              aria-label={`View testimonial ${i + 1}`}
            >
              <span className={`block h-2 rounded-full transition-all ${i === activeCard ? 'bg-[#c9a25c] w-6' : 'bg-slate-600 hover:bg-slate-500 w-2'}`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
