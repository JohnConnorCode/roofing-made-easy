'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface ScrollAnimateProps {
  children: ReactNode
  className?: string
  animation?: 'slide-up' | 'slide-in-right' | 'slide-in-left' | 'scale-in' | 'fade-in'
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
      { threshold, rootMargin: '0px 0px -50px 0px' }
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
  }[animation]

  const delayStyle = delay > 0 ? { animationDelay: `${delay}ms` } : undefined

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? animationClass : 'opacity-0'}`}
      style={delayStyle}
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
      { threshold, rootMargin: '0px 0px -50px 0px' }
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
