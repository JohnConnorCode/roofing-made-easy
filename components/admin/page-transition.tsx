'use client'

import { ReactNode } from 'react'

interface AdminPageTransitionProps {
  children: ReactNode
  className?: string
}

/**
 * Wrapper for admin pages that provides smooth fade-in animation
 * Use this at the top level of admin page content
 */
export function AdminPageTransition({ children, className = '' }: AdminPageTransitionProps) {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  /** Delay between each child animation in ms */
  staggerDelay?: number
}

/**
 * Container that staggers the fade-in of its children
 * Each direct child will animate in sequence
 */
export function StaggerContainer({ children, className = '', staggerDelay = 75 }: StaggerContainerProps) {
  return (
    <div
      className={`stagger-children ${className}`}
      style={{ '--stagger-delay': `${staggerDelay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

interface FadeInSectionProps {
  children: ReactNode
  className?: string
  /** Delay in ms before animation starts */
  delay?: number
  /** Animation type */
  animation?: 'fade-in' | 'slide-up' | 'scale-in'
}

/**
 * Individual section that fades in with optional delay
 * Use for larger page sections that should animate independently
 */
export function FadeInSection({
  children,
  className = '',
  delay = 0,
  animation = 'slide-up'
}: FadeInSectionProps) {
  const animationClass = {
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'scale-in': 'animate-scale-in',
  }[animation]

  return (
    <div
      className={`${animationClass} ${className}`}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
