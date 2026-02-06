/**
 * Type definitions for communication automation
 */

// Channel types
export type MessageChannel = 'email' | 'sms'
export type TemplateType = MessageChannel // Alias for backwards compatibility
export type MessageStatus = 'pending' | 'scheduled' | 'sending' | 'sent' | 'delivered' | 'failed' | 'cancelled'
export type MessageDirection = 'outbound' | 'inbound'

// Workflow trigger events
export type WorkflowTrigger =
  | 'lead_created'
  | 'lead_status_changed'
  | 'intake_completed'
  | 'estimate_generated'
  | 'quote_sent'
  | 'quote_viewed'
  | 'appointment_scheduled'
  | 'appointment_reminder'
  | 'payment_received'
  | 'job_completed'
  | 'review_request'
  | 'manual'

// Message template
export interface MessageTemplate {
  id: string
  name: string
  description: string | null
  type: MessageChannel
  subject: string | null
  body: string
  variables: string[] | null
  category: string | null
  tags: string[] | null
  is_system: boolean
  is_active: boolean
  default_body: string | null
  default_subject: string | null
  usage_count: number
  last_used_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// Category options for template forms/filters
export const TEMPLATE_CATEGORY_OPTIONS = [
  { value: 'welcome', label: 'Welcome' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'estimate', label: 'Estimate' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'payment', label: 'Payment' },
  { value: 'review', label: 'Review' },
  { value: 'general', label: 'General' },
]

// Automation workflow
export interface AutomationWorkflow {
  id: string
  name: string
  description: string | null
  trigger_event: WorkflowTrigger
  conditions: Record<string, unknown>
  delay_minutes: number
  template_id: string
  channel: MessageChannel | null
  is_active: boolean
  priority: number
  max_sends_per_lead: number
  cooldown_hours: number
  respect_business_hours: boolean
  business_hours_start: string
  business_hours_end: string
  business_days: number[]
  execution_count: number
  last_executed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined
  template?: MessageTemplate
}

// Scheduled message
export interface ScheduledMessage {
  id: string
  lead_id: string | null
  customer_id: string | null
  recipient_email: string | null
  recipient_phone: string | null
  recipient_name: string | null
  workflow_id: string | null
  template_id: string | null
  channel: MessageChannel
  subject: string | null
  body: string
  scheduled_for: string
  status: MessageStatus
  attempts: number
  max_attempts: number
  sent_at: string | null
  delivered_at: string | null
  external_id: string | null
  error_message: string | null
  error_code: string | null
  metadata: Record<string, unknown>
  created_by: string | null
  cancelled_by: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

// Communication log entry
export interface CommunicationLog {
  id: string
  lead_id: string | null
  customer_id: string | null
  channel: MessageChannel
  direction: MessageDirection
  recipient_email: string | null
  recipient_phone: string | null
  recipient_name: string | null
  sender_email: string | null
  sender_phone: string | null
  subject: string | null
  body: string
  body_html: string | null
  workflow_id: string | null
  template_id: string | null
  scheduled_message_id: string | null
  status: MessageStatus
  external_id: string | null
  external_status: string | null
  opened_at: string | null
  clicked_at: string | null
  bounced_at: string | null
  unsubscribed_at: string | null
  replied_to_id: string | null
  metadata: Record<string, unknown>
  sent_by: string | null
  created_at: string
}

// SMS conversation
export interface SMSConversation {
  id: string
  lead_id: string | null
  customer_id: string | null
  phone_number: string
  status: 'active' | 'closed' | 'spam'
  unread_count: number
  last_message_at: string | null
  last_message_preview: string | null
  last_message_direction: MessageDirection | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

// Workflow execution record
export interface WorkflowExecution {
  id: string
  workflow_id: string
  lead_id: string | null
  customer_id: string | null
  trigger_event: WorkflowTrigger
  trigger_data: Record<string, unknown>
  status: 'pending' | 'success' | 'skipped' | 'failed'
  skip_reason: string | null
  error_message: string | null
  scheduled_message_id: string | null
  communication_log_id: string | null
  executed_at: string
  completed_at: string | null
}

// API request/response types
export interface CreateTemplateRequest {
  name: string
  description?: string
  type: MessageChannel
  subject?: string
  body: string
  variables?: string[]
  category?: string
  tags?: string[]
}

export interface UpdateTemplateRequest {
  name?: string
  description?: string
  subject?: string
  body?: string
  variables?: string[]
  category?: string
  tags?: string[]
  is_active?: boolean
}

export interface CreateWorkflowRequest {
  name: string
  description?: string
  trigger_event: WorkflowTrigger
  conditions?: Record<string, unknown>
  delay_minutes?: number
  template_id: string
  channel?: MessageChannel
  priority?: number
  max_sends_per_lead?: number
  cooldown_hours?: number
  respect_business_hours?: boolean
  business_hours_start?: string
  business_hours_end?: string
  business_days?: number[]
}

export interface UpdateWorkflowRequest {
  name?: string
  description?: string
  trigger_event?: WorkflowTrigger
  conditions?: Record<string, unknown>
  delay_minutes?: number
  template_id?: string
  channel?: MessageChannel
  is_active?: boolean
  priority?: number
  max_sends_per_lead?: number
  cooldown_hours?: number
  respect_business_hours?: boolean
  business_hours_start?: string
  business_hours_end?: string
  business_days?: number[]
}

export interface SendMessageRequest {
  channel: MessageChannel
  to: string // email or phone
  subject?: string
  body: string
  lead_id?: string
  customer_id?: string
  template_id?: string
}

export interface TriggerWorkflowRequest {
  trigger_event: WorkflowTrigger
  lead_id?: string
  customer_id?: string
  data?: Record<string, unknown>
}

// Template variables context
export interface TemplateVariables {
  // Customer info
  customer_name?: string
  customer_first_name?: string
  customer_last_name?: string
  customer_email?: string
  customer_phone?: string

  // Property info
  property_address?: string
  property_city?: string
  property_state?: string
  property_zip?: string

  // Estimate info
  estimate_total?: string
  estimate_low?: string
  estimate_high?: string
  estimate_link?: string

  // Appointment info
  appointment_date?: string
  appointment_time?: string

  // Company info
  company_name?: string
  company_phone?: string
  company_email?: string
  company_address?: string

  // Links
  review_link?: string
  portal_link?: string

  // Custom
  [key: string]: string | undefined
}

// Canonical list of all template variables with metadata
export const TEMPLATE_VARIABLE_DEFINITIONS: {
  variable: string
  description: string
  example: string
  category: string
}[] = [
  // Customer
  { variable: 'customer_name', description: 'Full customer name', example: 'John Smith', category: 'Customer' },
  { variable: 'customer_first_name', description: 'First name only', example: 'John', category: 'Customer' },
  { variable: 'customer_last_name', description: 'Last name only', example: 'Smith', category: 'Customer' },
  { variable: 'customer_email', description: 'Customer email address', example: 'john@example.com', category: 'Customer' },
  { variable: 'customer_phone', description: 'Customer phone number', example: '(555) 123-4567', category: 'Customer' },
  // Property
  { variable: 'property_address', description: 'Property street address', example: '123 Main St', category: 'Property' },
  { variable: 'property_city', description: 'Property city', example: 'Tupelo', category: 'Property' },
  { variable: 'property_state', description: 'Property state', example: 'MS', category: 'Property' },
  { variable: 'property_zip', description: 'Property ZIP code', example: '38801', category: 'Property' },
  // Estimate & Payment
  { variable: 'estimate_total', description: 'Estimate total amount', example: '$12,500.00', category: 'Estimate' },
  { variable: 'estimate_low', description: 'Low estimate range', example: '$10,000.00', category: 'Estimate' },
  { variable: 'estimate_high', description: 'High estimate range', example: '$15,000.00', category: 'Estimate' },
  { variable: 'amount', description: 'Dollar amount', example: '$5,000.00', category: 'Estimate' },
  // Links
  { variable: 'estimate_link', description: 'Link to view estimate', example: 'https://.../estimate/abc123', category: 'Links' },
  { variable: 'quote_url', description: 'Link to view quote', example: 'https://.../quote/abc123', category: 'Links' },
  { variable: 'invoice_url', description: 'Link to pay invoice', example: 'https://.../invoice/xyz789', category: 'Links' },
  { variable: 'review_link', description: 'Link to leave a review', example: 'https://.../review/abc123', category: 'Links' },
  { variable: 'portal_link', description: 'Link to customer portal', example: 'https://.../portal', category: 'Links' },
  // Appointment
  { variable: 'appointment_date', description: 'Appointment date', example: 'February 15, 2026', category: 'Appointment' },
  { variable: 'appointment_time', description: 'Formatted appointment time', example: '10:00 AM', category: 'Appointment' },
  // Company
  { variable: 'company_name', description: 'Business name', example: 'ABC Roofing', category: 'Company' },
  { variable: 'company_phone', description: 'Business phone number', example: '(555) 987-6543', category: 'Company' },
  { variable: 'company_email', description: 'Business email address', example: 'info@abcroofing.com', category: 'Company' },
  { variable: 'company_address', description: 'Business address', example: '456 Commerce Dr', category: 'Company' },
]

// Helper to get available variables by category (derived from canonical list)
export const TEMPLATE_VARIABLES: Record<string, { label: string; variables: string[] }> =
  TEMPLATE_VARIABLE_DEFINITIONS.reduce((acc, v) => {
    const key = v.category.toLowerCase()
    if (!acc[key]) acc[key] = { label: v.category, variables: [] }
    acc[key].variables.push(v.variable)
    return acc
  }, {} as Record<string, { label: string; variables: string[] }>)

// Trigger event labels and descriptions
export const WORKFLOW_TRIGGERS: Record<WorkflowTrigger, { label: string; description: string }> = {
  lead_created: {
    label: 'New Lead',
    description: 'When a new lead is created through the website',
  },
  lead_status_changed: {
    label: 'Status Changed',
    description: 'When a lead status is updated',
  },
  intake_completed: {
    label: 'Intake Complete',
    description: 'When a lead completes the intake form',
  },
  estimate_generated: {
    label: 'Estimate Generated',
    description: 'When an estimate is created for a lead',
  },
  quote_sent: {
    label: 'Quote Sent',
    description: 'When a quote is sent to the customer',
  },
  quote_viewed: {
    label: 'Quote Viewed',
    description: 'When the customer views their quote',
  },
  appointment_scheduled: {
    label: 'Appointment Scheduled',
    description: 'When an appointment is booked',
  },
  appointment_reminder: {
    label: 'Appointment Reminder',
    description: 'Day before scheduled appointment',
  },
  payment_received: {
    label: 'Payment Received',
    description: 'When a payment is processed',
  },
  job_completed: {
    label: 'Job Completed',
    description: 'When a roofing job is marked complete',
  },
  review_request: {
    label: 'Review Request',
    description: 'Request a review after job completion',
  },
  manual: {
    label: 'Manual',
    description: 'Triggered manually by a user',
  },
}
