'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface ScrollAnimateProps {
  children: ReactNode
  className?: string
  animation?: 'slide-up' | 'slide-in-right' | 'slide-in-left' | 'scale-in' | 'fade-in' | 'rise-up' | 'reveal-rotate'
  delay?: number
  threshold?: number
  once?: boolean
}

export function ScrollAnimate({
  children,
  className = '',
  animation = 'slide-up',
  delay = 0,
  threshold = 0.1,
  once = true,
}: ScrollAnimateProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

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
    return () => observer.disconnect()
  }, [threshold, once])

  const animationClass = {
    'slide-up': 'animate-slide-up',
    'slide-in-right': 'animate-slide-in-right',
    'slide-in-left': 'animate-slide-in-left',
    'scale-in': 'animate-scale-in',
    'fade-in': 'animate-fade-in',
    'rise-up': 'animate-rise-up',
    'reveal-rotate': 'animate-reveal-rotate',
  }[animation]

  const hiddenStyle: React.CSSProperties = {
    willChange: 'transform, opacity, filter',
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
}

export function ScrollStagger({
  children,
  className = '',
  staggerDelay = 50,
  threshold = 0.1,
  once = true,
}: ScrollStaggerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

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
    return () => observer.disconnect()
  }, [threshold, once])

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? 'stagger-children' : 'stagger-children-hidden'}`}
      style={{ '--stagger-delay': `${staggerDelay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
