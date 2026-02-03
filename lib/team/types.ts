/**
 * Type definitions for team and user management
 */

// Role types matching database enum
export type UserRole = 'admin' | 'manager' | 'sales' | 'crew_lead' | 'crew'

// Task types matching database enum
export type TaskType = 'call' | 'email' | 'site_visit' | 'follow_up' | 'internal' | 'meeting' | 'inspection'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

// Activity log categories
export type ActivityCategory =
  | 'auth'
  | 'lead'
  | 'estimate'
  | 'task'
  | 'team'
  | 'settings'
  | 'customer'
  | 'communication'

// Permission structure
export interface Permissions {
  leads: {
    view: boolean
    edit: boolean
    delete: boolean
    assign?: boolean
  }
  estimates: {
    view: boolean
    edit: boolean
    delete: boolean
    send?: boolean
  }
  customers: {
    view: boolean
    edit: boolean
    delete: boolean
  }
  tasks: {
    view: boolean
    edit: boolean
    delete: boolean
    assign?: boolean
  }
  team: {
    view: boolean
    edit: boolean
    delete: boolean
    invite?: boolean
  }
  settings: {
    view: boolean
    edit: boolean
    delete: boolean
  }
  reports: {
    view: boolean
    export?: boolean
  }
}

// User profile
export interface UserProfile {
  id: string
  role: UserRole
  permissions: Permissions
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  job_title: string | null
  hired_at: string | null
  terminated_at: string | null
  is_active: boolean
  notification_preferences: {
    email: { tasks: boolean; leads: boolean; system: boolean }
    sms: { tasks: boolean; leads: boolean; system: boolean }
    push: { tasks: boolean; leads: boolean; system: boolean }
  }
  created_at: string
  updated_at: string
  // Joined from auth.users
  email?: string
}

// Team
export interface Team {
  id: string
  name: string
  description: string | null
  manager_id: string | null
  color: string
  icon: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Computed
  member_count?: number
  manager?: UserProfile
  members?: UserProfile[]
}

// Team member junction
export interface TeamMember {
  team_id: string
  user_id: string
  is_team_lead: boolean
  joined_at: string
}

// Task
export interface Task {
  id: string
  title: string
  description: string | null
  type: TaskType
  assigned_to: string | null
  assigned_by: string | null
  lead_id: string | null
  customer_id: string | null
  due_at: string | null
  reminder_at: string | null
  priority: TaskPriority
  status: TaskStatus
  completed_at: string | null
  completed_by: string | null
  completion_notes: string | null
  created_at: string
  updated_at: string
  // Joined
  assignee?: UserProfile
  assigner?: UserProfile
  lead?: { id: string; contacts: Array<{ first_name: string | null; last_name: string | null }> }
}

// User activity log entry
export interface UserActivityLog {
  id: string
  user_id: string | null
  user_email: string | null
  user_role: UserRole | null
  action: string
  category: ActivityCategory
  entity_type: string | null
  entity_id: string | null
  entity_name: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  session_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// User invitation
export interface UserInvitation {
  id: string
  email: string
  role: UserRole
  team_id: string | null
  invited_by: string | null
  token: string
  message: string | null
  expires_at: string
  accepted_at: string | null
  accepted_user_id: string | null
  created_at: string
}

// API request/response types
export interface CreateUserRequest {
  email: string
  password?: string
  role: UserRole
  first_name?: string
  last_name?: string
  phone?: string
  job_title?: string
  team_id?: string
}

export interface UpdateUserRequest {
  role?: UserRole
  permissions?: Partial<Permissions>
  first_name?: string
  last_name?: string
  phone?: string
  job_title?: string
  avatar_url?: string
  is_active?: boolean
  notification_preferences?: UserProfile['notification_preferences']
}

export interface InviteUserRequest {
  email: string
  role: UserRole
  team_id?: string
  message?: string
}

export interface CreateTeamRequest {
  name: string
  description?: string
  manager_id?: string
  color?: string
  icon?: string
}

export interface UpdateTeamRequest {
  name?: string
  description?: string
  manager_id?: string
  color?: string
  icon?: string
  is_active?: boolean
}

export interface CreateTaskRequest {
  title: string
  description?: string
  type: TaskType
  assigned_to?: string
  lead_id?: string
  customer_id?: string
  due_at?: string
  reminder_at?: string
  priority?: TaskPriority
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  type?: TaskType
  assigned_to?: string
  lead_id?: string
  customer_id?: string
  due_at?: string
  reminder_at?: string
  priority?: TaskPriority
  status?: TaskStatus
  completion_notes?: string
}
