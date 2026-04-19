'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const SLIDES = [
  { src: '/images/work/replacement-after.webp', alt: 'Aerial view of a completed residential shingle roof replacement' },
  { src: '/images/work/estate-roof.webp', alt: 'Estate-sized home with architectural shingle roof' },
  { src: '/images/work/metal-conversion.webp', alt: 'Residential metal roof installation, shingle to standing seam conversion' },
  { src: '/images/work/large-residential.webp', alt: 'Large home with newly installed architectural shingle roof' },
  { src: '/images/work/aerial-wide.webp', alt: 'Aerial drone photo of a completed roof in rural Mississippi' },
]

const INTERVAL_MS = 7000
const PARALLAX_FACTOR = 0.35

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0)
  const layerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let rafId = 0
    const update = () => {
      const el = layerRef.current
      if (el) {
        const y = window.scrollY * PARALLAX_FACTOR
        el.style.transform = `translate3d(0, ${y}px, 0)`
      }
      rafId = 0
    }
    const onScroll = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={layerRef}
      className="absolute inset-0 will-change-transform"
      style={{ transform: 'translate3d(0, 0, 0)' }}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            i === activeIndex ? 'opacity-100 hero-slide-active' : 'opacity-0'
          }`}
          aria-hidden={i !== activeIndex}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover scale-110"
            priority={i === 0}
            loading={i === 0 ? undefined : 'lazy'}
            fetchPriority={i === 0 ? 'high' : 'auto'}
            sizes="100vw"
          />
        </div>
      ))}
    </div>
  )
}
