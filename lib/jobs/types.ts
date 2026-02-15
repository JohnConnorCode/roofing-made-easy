/**
 * Type definitions for job/project management
 */

export type JobStatus =
  | 'pending_start'
  | 'materials_ordered'
  | 'scheduled'
  | 'in_progress'
  | 'inspection_pending'
  | 'punch_list'
  | 'completed'
  | 'warranty_active'
  | 'closed'

export type JobDocumentType =
  | 'contract'
  | 'permit'
  | 'insurance_cert'
  | 'inspection_report'
  | 'photo'
  | 'warranty_cert'
  | 'other'

export type JobExpenseCategory =
  | 'materials'
  | 'labor'
  | 'subcontractor'
  | 'permit'
  | 'equipment'
  | 'disposal'
  | 'other'

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending_start: 'Pending Start',
  materials_ordered: 'Materials Ordered',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  inspection_pending: 'Inspection Pending',
  punch_list: 'Punch List',
  completed: 'Completed',
  warranty_active: 'Warranty Active',
  closed: 'Closed',
}

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  pending_start: 'bg-slate-100 text-slate-700',
  materials_ordered: 'bg-amber-100 text-amber-700',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  inspection_pending: 'bg-purple-100 text-purple-700',
  punch_list: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  warranty_active: 'bg-teal-100 text-teal-700',
  closed: 'bg-slate-100 text-slate-500',
}

// Valid status transitions
export const JOB_STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  pending_start: ['materials_ordered', 'scheduled', 'closed'],
  materials_ordered: ['scheduled', 'pending_start', 'closed'],
  scheduled: ['in_progress', 'pending_start', 'closed'],
  in_progress: ['inspection_pending', 'punch_list', 'completed', 'closed'],
  inspection_pending: ['in_progress', 'punch_list', 'completed', 'closed'],
  punch_list: ['in_progress', 'completed', 'closed'],
  completed: ['warranty_active', 'punch_list', 'closed'],
  warranty_active: ['closed'],
  closed: [],
}

export interface Job {
  id: string
  job_number: string
  lead_id: string | null
  customer_id: string | null
  estimate_id: string | null
  status: JobStatus
  scheduled_start: string | null
  scheduled_end: string | null
  actual_start: string | null
  actual_end: string | null
  assigned_team_id: string | null
  project_manager_id: string | null
  contract_amount: number
  total_invoiced: number
  total_paid: number
  material_cost: number
  labor_cost: number
  property_address: string | null
  property_city: string | null
  property_state: string | null
  property_zip: string | null
  warranty_start_date: string | null
  warranty_end_date: string | null
  warranty_type: string | null
  notes: string | null
  internal_notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined
  team?: { id: string; name: string; color: string }
  project_manager?: { id: string; first_name: string | null; last_name: string | null }
  lead?: { id: string; contacts: Array<{ first_name: string | null; last_name: string | null }> }
  customer?: { id: string; first_name: string | null; last_name: string | null; email: string }
}

export interface JobStatusHistory {
  id: string
  job_id: string
  old_status: JobStatus | null
  new_status: JobStatus
  changed_by: string | null
  notes: string | null
  created_at: string
  // Joined
  changed_by_user?: { first_name: string | null; last_name: string | null }
}

export interface JobDocument {
  id: string
  job_id: string
  document_type: JobDocumentType
  title: string
  description: string | null
  storage_path: string
  file_size: number | null
  mime_type: string | null
  permit_number: string | null
  expiration_date: string | null
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export interface JobDailyLog {
  id: string
  job_id: string
  log_date: string
  crew_members: string[]
  work_performed: string | null
  hours_worked: number | null
  weather_conditions: string | null
  work_delayed: boolean
  delay_reason: string | null
  materials_used: string | null
  safety_incidents: string | null
  notes: string | null
  logged_by: string | null
  created_at: string
  updated_at: string
  // Joined
  logged_by_user?: { first_name: string | null; last_name: string | null }
}

export interface JobExpense {
  id: string
  job_id: string
  category: JobExpenseCategory
  description: string
  vendor: string | null
  amount: number
  receipt_path: string | null
  expense_date: string
  approved_by: string | null
  approved_at: string | null
  submitted_by: string | null
  created_at: string
  updated_at: string
  // Joined
  approved_by_user?: { first_name: string | null; last_name: string | null }
}

export interface CreateJobRequest {
  lead_id?: string
  customer_id?: string
  estimate_id?: string
  scheduled_start?: string
  scheduled_end?: string
  assigned_team_id?: string
  project_manager_id?: string
  contract_amount?: number
  property_address?: string
  property_city?: string
  property_state?: string
  property_zip?: string
  warranty_type?: string
  notes?: string
}

export interface UpdateJobRequest {
  status?: JobStatus
  scheduled_start?: string
  scheduled_end?: string
  actual_start?: string
  actual_end?: string
  assigned_team_id?: string
  project_manager_id?: string
  contract_amount?: number
  warranty_start_date?: string
  warranty_end_date?: string
  warranty_type?: string
  notes?: string
  internal_notes?: string
}

// ============================================
// Time Tracking
// ============================================

export interface TimeEntry {
  id: string
  job_id: string
  user_id: string
  clock_in: string
  clock_out: string | null
  break_minutes: number
  total_hours: number | null
  notes: string | null
  status: 'active' | 'completed' | 'voided'
  created_at: string
  updated_at: string
  user?: {
    first_name: string
    last_name: string
  }
}
