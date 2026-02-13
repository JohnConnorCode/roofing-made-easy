'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const SLIDES = [
  { src: '/images/services/roof-replacement.jpg', alt: 'Professional shingle installation on residential roof' },
  { src: '/images/hero-roof.jpg', alt: 'Completed residential roofing project' },
  { src: '/images/services/process-install.jpg', alt: 'Aerial view of residential neighborhood rooftops' },
  { src: '/images/about/team-work.jpg', alt: 'Roofing team at work on a project' },
  { src: '/images/blog/roof-maintenance.jpg', alt: 'Roof maintenance and care' },
]

const INTERVAL_MS = 7000

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0">
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
            className="object-cover"
            priority={i === 0}
            loading={i === 0 ? undefined : 'eager'}
            sizes="100vw"
          />
        </div>
      ))}
    </div>
  )
}
