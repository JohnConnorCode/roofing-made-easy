'use client'

import { useState, useRef, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children?: React.ReactNode
  className?: string
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('top')
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (visible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      if (rect.top < 80) {
        setPosition('bottom')
      } else {
        setPosition('top')
      }
    }
  }, [visible])

  return (
    <span className={cn('relative inline-flex', className)}>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center text-slate-500 hover:text-slate-300 focus:outline-none focus:text-slate-300 transition-colors"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-describedby={visible ? 'tooltip' : undefined}
      >
        {children || <HelpCircle className="h-3.5 w-3.5" />}
      </button>
      {visible && (
        <div
          id="tooltip"
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-2 text-xs text-slate-200 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-w-[200px] whitespace-normal',
            position === 'top'
              ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
              : 'top-full left-1/2 -translate-x-1/2 mt-2'
          )}
        >
          {content}
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-slate-800 border-slate-700',
              position === 'top'
                ? 'top-full -mt-1 border-r border-b'
                : 'bottom-full -mb-1 border-l border-t'
            )}
          />
        </div>
      )}
    </span>
  )
}
