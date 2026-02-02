'use client'

import { formatCurrency } from '@/lib/utils'
import { Phone, Mail, MapPin, Calendar, GripVertical, MoveRight } from 'lucide-react'
import { URGENCY_MAP, JOB_TYPE_MAP } from '@/lib/constants/status'

export interface LeadCardData {
  id: string
  status: string
  created_at: string
  current_step: number
  contacts: { first_name: string; last_name: string; email: string; phone: string }[]
  properties: { city: string; state: string; street_address: string }[]
  estimates?: { price_likely: number }[]
  intakes?: {
    job_type?: string
    timeline_urgency?: string
  }[]
}

interface LeadCardProps {
  lead: LeadCardData
  onClick?: () => void
  isDragging?: boolean
  onMoveClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function LeadCard({ lead, onClick, isDragging, onMoveClick }: LeadCardProps) {
  const contact = lead.contacts?.[0]
  const property = lead.properties?.[0]
  const estimate = lead.estimates?.[0]
  const intake = lead.intakes?.[0]

  const name = contact?.first_name && contact?.last_name
    ? `${contact.first_name} ${contact.last_name}`
    : contact?.email || 'Unknown'

  const location = property?.city && property?.state
    ? `${property.city}, ${property.state}`
    : 'No address'

  const estimateValue = estimate?.price_likely || 0
  const urgencyConfig = intake?.timeline_urgency ? URGENCY_MAP[intake.timeline_urgency] : null
  const jobTypeConfig = intake?.job_type ? JOB_TYPE_MAP[intake.job_type] : null

  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-white rounded-lg border border-slate-200 p-3 shadow-sm cursor-pointer
        hover:border-amber-300 hover:shadow-md transition-all
        ${isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''}
      `}
    >
      {/* Drag handle (desktop) */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hidden md:block">
        <GripVertical className="h-4 w-4 text-slate-400" />
      </div>

      {/* Move button (touch devices) */}
      {onMoveClick && (
        <button
          onClick={onMoveClick}
          className="absolute right-1 top-1 p-1.5 rounded-md bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-700 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
          title="Move to..."
        >
          <MoveRight className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="pl-4">
        {/* Name and value */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-slate-900 truncate text-sm">{name}</h4>
          {estimateValue > 0 && (
            <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap ml-2">
              {formatCurrency(estimateValue)}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
          <MapPin className="h-3 w-3 text-slate-400" />
          <span className="truncate">{location}</span>
        </div>

        {/* Badges */}
        {(jobTypeConfig || urgencyConfig) && (
          <div className="flex flex-wrap gap-1 mb-2">
            {jobTypeConfig && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${jobTypeConfig.badge}`}>
                {jobTypeConfig.label}
              </span>
            )}
            {urgencyConfig && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${urgencyConfig.badge}`}>
                {urgencyConfig.label}
              </span>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          {contact?.phone && (
            <a
              href={`tel:${contact.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors"
              title="Call"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          )}
          {contact?.email && (
            <a
              href={`mailto:${contact.email}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors"
              title="Email"
            >
              <Mail className="h-3.5 w-3.5" />
            </a>
          )}
          <span className="ml-auto text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  )
}
