'use client'

import { useState } from 'react'
import { ChevronDown, Loader2, Check } from 'lucide-react'
import { LEAD_STATUSES, getStatusConfig } from '@/lib/constants/status'

interface QuickStatusSelectProps {
  leadId: string
  currentStatus: string
  onStatusChange: (leadId: string, newStatus: string) => Promise<void>
  compact?: boolean
}

export function QuickStatusSelect({ leadId, currentStatus, onStatusChange, compact }: QuickStatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const currentOption = getStatusConfig(currentStatus)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      setIsOpen(false)
      return
    }

    setIsUpdating(true)
    setIsOpen(false)
    try {
      await onStatusChange(leadId, newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`
          inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium
          ${currentOption.badge}
          ${isUpdating ? 'opacity-50' : 'hover:ring-2 hover:ring-slate-200'}
          transition-all
        `}
      >
        {isUpdating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : null}
        {compact ? currentOption.label.split(' ')[0] : currentOption.label}
        {!isUpdating && <ChevronDown className="h-3 w-3" />}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 z-20 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[180px]">
            {LEAD_STATUSES.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`
                  w-full px-3 py-2 text-left text-sm flex items-center gap-2
                  ${option.value === currentStatus ? 'bg-slate-50' : 'hover:bg-slate-50'}
                `}
              >
                <span className={`w-2 h-2 rounded-full ${option.dot}`} />
                <span className="flex-1 text-slate-700">{option.label}</span>
                {option.value === currentStatus && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
