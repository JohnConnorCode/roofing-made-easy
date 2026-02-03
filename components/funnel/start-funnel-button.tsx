'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StartFunnelButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  onError?: (error: string) => void
}

export function StartFunnelButton({ children, className, onClick, onError }: StartFunnelButtonProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    if (isCreating) return

    onClick?.()
    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'web_funnel',
          referrerUrl: typeof window !== 'undefined' ? document.referrer : undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/${data.lead.id}/property`)
      } else {
        const errorMsg = 'Unable to start your estimate. Please try again.'
        setError(errorMsg)
        onError?.(errorMsg)
        setIsCreating(false)
      }
    } catch {
      const errorMsg = 'Connection error. Please check your internet and try again.'
      setError(errorMsg)
      onError?.(errorMsg)
      setIsCreating(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-center">
      <button
        onClick={handleClick}
        disabled={isCreating}
        className={cn(
          'inline-flex items-center justify-center transition-all',
          isCreating && 'opacity-80 cursor-wait',
          className
        )}
      >
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Starting...
          </>
        ) : (
          children
        )}
      </button>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
