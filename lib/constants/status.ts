/**
 * Centralized status configurations for leads
 * Used across admin dashboard, leads table, pipeline, and cards
 */

export type LeadStatus =
  | 'new'
  | 'intake_started'
  | 'intake_complete'
  | 'estimate_generated'
  | 'consultation_scheduled'
  | 'quote_sent'
  | 'won'
  | 'lost'
  | 'archived'

export interface StatusConfig {
  value: LeadStatus
  label: string
  /** Badge style for light backgrounds */
  badge: string
  /** Dot/indicator color */
  dot: string
  /** Pipeline column border color */
  border: string
  /** Pipeline column background */
  bg: string
}

export const LEAD_STATUSES: StatusConfig[] = [
  {
    value: 'new',
    label: 'New',
    badge: 'bg-gold-light/20 text-gold-muted border-gold-light/30',
    dot: 'bg-gold',
    border: 'border-gold',
    bg: 'bg-gold-light/10',
  },
  {
    value: 'intake_started',
    label: 'Intake Started',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    border: 'border-slate-400',
    bg: 'bg-slate-50',
  },
  {
    value: 'intake_complete',
    label: 'Intake Complete',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    border: 'border-slate-500',
    bg: 'bg-slate-50',
  },
  {
    value: 'estimate_generated',
    label: 'Estimate Generated',
    badge: 'bg-green-100 text-green-800 border-green-200',
    dot: 'bg-green-500',
    border: 'border-green-500',
    bg: 'bg-green-50',
  },
  {
    value: 'consultation_scheduled',
    label: 'Consultation',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    border: 'border-blue-500',
    bg: 'bg-blue-50',
  },
  {
    value: 'quote_sent',
    label: 'Quote Sent',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
    border: 'border-purple-500',
    bg: 'bg-purple-50',
  },
  {
    value: 'won',
    label: 'Won',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    border: 'border-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    value: 'lost',
    label: 'Lost',
    badge: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-400',
    border: 'border-red-400',
    bg: 'bg-red-50',
  },
  {
    value: 'archived',
    label: 'Archived',
    badge: 'bg-slate-100 text-slate-500 border-slate-200',
    dot: 'bg-slate-300',
    border: 'border-slate-300',
    bg: 'bg-slate-50',
  },
]

export const STATUS_MAP = Object.fromEntries(
  LEAD_STATUSES.map((s) => [s.value, s])
) as Record<LeadStatus, StatusConfig>

export function getStatusConfig(status: string): StatusConfig {
  return STATUS_MAP[status as LeadStatus] ?? STATUS_MAP.new
}

/**
 * Timeline urgency configurations
 */
export interface UrgencyConfig {
  value: string
  label: string
  badge: string
}

export const URGENCY_OPTIONS: UrgencyConfig[] = [
  { value: 'emergency', label: 'Emergency', badge: 'bg-red-100 text-red-700' },
  { value: 'asap', label: 'ASAP', badge: 'bg-amber-100 text-amber-700' },
  { value: 'within_month', label: 'This Month', badge: 'bg-blue-100 text-blue-700' },
  { value: 'within_3_months', label: 'Within 3 Mo', badge: 'bg-slate-100 text-slate-600' },
  { value: 'flexible', label: 'Flexible', badge: 'bg-slate-100 text-slate-600' },
  { value: 'just_exploring', label: 'Exploring', badge: 'bg-slate-100 text-slate-500' },
]

export const URGENCY_MAP = Object.fromEntries(
  URGENCY_OPTIONS.map((u) => [u.value, u])
) as Record<string, UrgencyConfig>

/**
 * Job type configurations
 */
export interface JobTypeConfig {
  value: string
  label: string
  badge: string
}

export const JOB_TYPE_OPTIONS: JobTypeConfig[] = [
  { value: 'full_replacement', label: 'Full Replace', badge: 'bg-green-100 text-green-700' },
  { value: 'repair', label: 'Repair', badge: 'bg-amber-100 text-amber-700' },
  { value: 'inspection', label: 'Inspection', badge: 'bg-slate-100 text-slate-600' },
  { value: 'maintenance', label: 'Maintenance', badge: 'bg-slate-100 text-slate-600' },
  { value: 'gutter', label: 'Gutter', badge: 'bg-blue-100 text-blue-700' },
  { value: 'other', label: 'Other', badge: 'bg-slate-100 text-slate-500' },
]

export const JOB_TYPE_MAP = Object.fromEntries(
  JOB_TYPE_OPTIONS.map((j) => [j.value, j])
) as Record<string, JobTypeConfig>
