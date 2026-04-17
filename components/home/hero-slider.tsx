'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const SLIDES = [
  { src: '/images/work/replacement-after.webp', alt: 'Aerial view of a completed residential shingle roof replacement' },
  { src: '/images/work/estate-roof.webp', alt: 'Estate-sized home with architectural shingle roof' },
  { src: '/images/work/metal-conversion.webp', alt: 'Residential metal roof installation, shingle to standing seam conversion' },
  { src: '/images/work/large-residential.webp', alt: 'Large home with newly installed architectural shingle roof' },
  { src: '/images/work/aerial-wide.webp', alt: 'Aerial drone photo of a completed roof in rural Mississippi' },
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
