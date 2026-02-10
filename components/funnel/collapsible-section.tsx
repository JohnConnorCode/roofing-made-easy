'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
  icon?: React.ReactNode
  className?: string
}

export function CollapsibleSection({
  title,
  description,
  children,
  defaultOpen = false,
  badge,
  icon,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    defaultOpen ? undefined : 0
  )

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0)
    }
  }, [isOpen])

  // Update height when children change (e.g., conditional fields appear)
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current) {
          setContentHeight(contentRef.current.scrollHeight)
        }
      })
      resizeObserver.observe(contentRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [isOpen])

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden transition-all duration-300',
        isOpen && 'border-[#c9a25c]/30 bg-slate-800/80',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-700/30"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/50 text-slate-400">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-200">{title}</span>
              {badge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#c9a25c]/20 px-2 py-0.5 text-xs font-medium text-[#c9a25c]">
                  <Sparkles className="h-3 w-3" />
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-0.5 text-sm text-slate-400">{description}</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-slate-400 transition-transform duration-300',
            isOpen && 'rotate-180 text-[#c9a25c]'
          )}
        />
      </button>
      <div
        id={panelId}
        role="region"
        style={{ height: contentHeight }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div ref={contentRef} className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  )
}
