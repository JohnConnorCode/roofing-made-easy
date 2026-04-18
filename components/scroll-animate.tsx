'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface ScrollAnimateProps {
  children: ReactNode
  className?: string
  animation?: 'slide-up' | 'slide-in-right' | 'slide-in-left' | 'scale-in' | 'fade-in' | 'rise-up' | 'reveal-rotate' | 'fade-up'
  delay?: number
  threshold?: number
  once?: boolean
}

export function ScrollAnimate({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1,
  once = true,
}: ScrollAnimateProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // If the element is already in view at mount, show immediately.
    const rect = element.getBoundingClientRect()
    const inView = rect.top < window.innerHeight && rect.bottom > 0
    if (inView) {
      setIsVisible(true)
      if (once) return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) {
            observer.unobserve(element)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    )

    observer.observe(element)

    // Safety net: if the observer hasn't fired within 2s (user is in an
    // automation tool, prefers-reduced-motion edge case, or a weird browser
    // quirk), reveal anyway so content is never permanently hidden.
    const safetyTimer = setTimeout(() => setIsVisible(true), 2000)

    return () => {
      observer.disconnect()
      clearTimeout(safetyTimer)
    }
  }, [threshold, once])

  const animationClass = {
    'slide-up': 'animate-slide-up',
    'slide-in-right': 'animate-slide-in-right',
    'slide-in-left': 'animate-slide-in-left',
    'scale-in': 'animate-scale-in',
    'fade-in': 'animate-fade-in',
    'rise-up': 'animate-rise-up',
    'reveal-rotate': 'animate-reveal-rotate',
    'fade-up': 'animate-fade-up',
  }[animation]

  const hiddenStyle: React.CSSProperties = {
    willChange: 'transform, opacity',
    ...(delay > 0 ? { animationDelay: `${delay}ms` } : {}),
  }
  const visibleStyle: React.CSSProperties = delay > 0 ? { animationDelay: `${delay}ms` } : {}

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? animationClass : 'opacity-0'}`}
      style={isVisible ? visibleStyle : hiddenStyle}
    >
      {children}
    </div>
  )
}

interface ScrollStaggerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  threshold?: number
  once?: boolean
  simple?: boolean
}

export function ScrollStagger({
  children,
  className = '',
  staggerDelay = 50,
  threshold = 0.1,
  once = true,
  simple = false,
}: ScrollStaggerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // If the element is already in view at mount, show immediately.
    const rect = element.getBoundingClientRect()
    const inView = rect.top < window.innerHeight && rect.bottom > 0
    if (inView) {
      setIsVisible(true)
      if (once) return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) {
            observer.unobserve(element)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    )

    observer.observe(element)

    // Safety net: if the observer hasn't fired within 2s (user is in an
    // automation tool, prefers-reduced-motion edge case, or a weird browser
    // quirk), reveal anyway so content is never permanently hidden.
    const safetyTimer = setTimeout(() => setIsVisible(true), 2000)

    return () => {
      observer.disconnect()
      clearTimeout(safetyTimer)
    }
  }, [threshold, once])

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? (simple ? 'stagger-children-simple' : 'stagger-children') : (simple ? 'stagger-children-simple-hidden' : 'stagger-children-hidden')}`}
      style={{ '--stagger-delay': `${staggerDelay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
