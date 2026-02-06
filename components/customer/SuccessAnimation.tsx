'use client'

import { cn } from '@/lib/utils'

interface SuccessAnimationProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SuccessAnimation({ className, size = 'md' }: SuccessAnimationProps) {
  const sizes = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  }

  const checkSizes = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-9 w-9',
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {/* Gold burst rings */}
      <div className={cn(
        'absolute rounded-full border-2 border-gold-light/40 animate-[ping_1s_ease-out_1]',
        sizes[size]
      )} />
      <div className={cn(
        'absolute rounded-full border border-gold-light/20 animate-[ping_1.2s_ease-out_0.2s_1]',
        size === 'sm' ? 'h-16 w-16' : size === 'md' ? 'h-20 w-20' : 'h-24 w-24'
      )} />

      {/* Check circle */}
      <div className={cn(
        'relative flex items-center justify-center rounded-full bg-success border-2 border-success animate-[scaleIn_0.3s_ease-out]',
        sizes[size]
      )}>
        <svg
          className={cn(checkSizes[size], 'text-white')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
            className="animate-[drawCheck_0.4s_ease-out_0.2s_both]"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: 24,
            }}
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}
