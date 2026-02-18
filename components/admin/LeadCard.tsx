'use client'

import { formatCurrency } from '@/lib/utils'
import { Phone, Mail, MapPin, Calendar, GripVertical, MoveRight, Camera, Shield, Clock } from 'lucide-react'
import { URGENCY_MAP, JOB_TYPE_MAP } from '@/lib/constants/status'

export interface LeadCardData {
  id: string
  status: string
  created_at: string
  updated_at?: string
  current_step: number
  contacts: { first_name: string; last_name: string; email: string; phone: string }[]
  properties: { city: string; state: string; street_address: string }[]
  estimates?: { price_low?: number; price_likely: number; price_high?: number }[]
  intakes?: {
    job_type?: string
    timeline_urgency?: string
    has_insurance_claim?: boolean
  }[]
  uploads?: { id: string }[]
  stage_entered_at?: string
}

export type CardFieldKey =
  | 'name'
  | 'estimate'
  | 'estimate_range'
  | 'location'
  | 'job_type'
  | 'urgency'
  | 'photo_count'
  | 'insurance'
  | 'days_in_stage'
  | 'last_activity'

interface LeadCardProps {
  lead: LeadCardData
  onClick?: () => void
  isDragging?: boolean
  onMoveClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  visibleFields?: CardFieldKey[]
}

const DEFAULT_VISIBLE_FIELDS: CardFieldKey[] = ['name', 'estimate', 'location', 'job_type', 'urgency']

export function LeadCard({ lead, onClick, isDragging, onMoveClick, visibleFields = DEFAULT_VISIBLE_FIELDS }: LeadCardProps) {
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
  const estimateLow = estimate?.price_low || 0
  const estimateHigh = estimate?.price_high || 0
  const urgencyConfig = intake?.timeline_urgency ? URGENCY_MAP[intake.timeline_urgency] : null
  const jobTypeConfig = intake?.job_type ? JOB_TYPE_MAP[intake.job_type] : null
  const photoCount = lead.uploads?.length || 0
  const hasInsurance = intake?.has_insurance_claim || false

  // Calculate days in stage
  const stageEnteredDate = lead.stage_entered_at ? new Date(lead.stage_entered_at) : new Date(lead.updated_at || lead.created_at)
  const daysInStage = Math.floor((Date.now() - stageEnteredDate.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate last activity relative time
  const lastActivityDate = new Date(lead.updated_at || lead.created_at)
  const getRelativeTime = (date: Date) => {
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const showField = (field: CardFieldKey) => visibleFields.includes(field)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() } }}
      className={`
        group relative bg-white rounded-lg border border-slate-200 p-3 shadow-sm cursor-pointer
        hover:border-gold-light hover:shadow-md transition-all
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
          className="absolute right-1 top-1 p-1.5 rounded-md bg-slate-100 hover:bg-gold-light/20 text-slate-500 hover:text-gold-muted opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
          title="Move to..."
          aria-label={`Move ${name} to another stage`}
        >
          <MoveRight className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="pl-4">
        {/* Name and value */}
        <div className="flex items-start justify-between mb-2">
          {showField('name') && (
            <h4 className="font-semibold text-slate-900 truncate text-sm">{name}</h4>
          )}
          {showField('estimate') && estimateValue > 0 && !showField('estimate_range') && (
            <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap ml-2">
              {formatCurrency(estimateValue)}
            </span>
          )}
          {showField('estimate_range') && estimateLow > 0 && estimateHigh > 0 && (
            <span className="text-xs font-semibold text-emerald-600 whitespace-nowrap ml-2">
              {formatCurrency(estimateLow)} - {formatCurrency(estimateHigh)}
            </span>
          )}
        </div>

        {/* Location */}
        {showField('location') && (
          <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
            <MapPin className="h-3 w-3 text-slate-400" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Info badges row */}
        <div className="flex flex-wrap items-center gap-1 mb-2">
          {/* Job type & Urgency badges */}
          {showField('job_type') && jobTypeConfig && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${jobTypeConfig.badge}`}>
              {jobTypeConfig.label}
            </span>
          )}
          {showField('urgency') && urgencyConfig && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${urgencyConfig.badge}`}>
              {urgencyConfig.label}
            </span>
          )}
          {/* Photo count badge */}
          {showField('photo_count') && photoCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600 flex items-center gap-0.5">
              <Camera className="h-3 w-3" />
              {photoCount}
            </span>
          )}
          {/* Insurance badge */}
          {showField('insurance') && hasInsurance && (
            <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-blue-100 text-blue-700 flex items-center gap-0.5">
              <Shield className="h-3 w-3" />
              Ins
            </span>
          )}
          {/* Days in stage badge */}
          {showField('days_in_stage') && daysInStage > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 ${
              daysInStage > 7 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
            }`}>
              <Clock className="h-3 w-3" />
              {daysInStage}d
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          {contact?.phone && (
            <a
              href={`tel:${contact.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-gold transition-colors"
              title="Call"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          )}
          {contact?.email && (
            <a
              href={`mailto:${contact.email}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-gold transition-colors"
              title="Email"
            >
              <Mail className="h-3.5 w-3.5" />
            </a>
          )}
          <span className="ml-auto text-xs text-slate-500 flex items-center gap-1">
            {showField('last_activity') ? (
              <>{getRelativeTime(lastActivityDate)}</>
            ) : (
              <>
                <Calendar className="h-3 w-3" />
                {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
