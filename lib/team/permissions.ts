/**
 * Permission checking utilities for role-based access control
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import type { UserRole, Permissions, UserProfile } from './types'

// Default permissions by role (matches database function)
const DEFAULT_PERMISSIONS: Record<UserRole, Permissions> = {
  admin: {
    leads: { view: true, edit: true, delete: true, assign: true },
    estimates: { view: true, edit: true, delete: true, send: true },
    customers: { view: true, edit: true, delete: true },
    tasks: { view: true, edit: true, delete: true, assign: true },
    team: { view: true, edit: true, delete: true, invite: true },
    settings: { view: true, edit: true, delete: true },
    reports: { view: true, export: true },
    jobs: { view: true, edit: true, delete: true, assign: true },
    calendar: { view: true, edit: true, delete: true },
  },
  manager: {
    leads: { view: true, edit: true, delete: false, assign: true },
    estimates: { view: true, edit: true, delete: false, send: true },
    customers: { view: true, edit: true, delete: false },
    tasks: { view: true, edit: true, delete: true, assign: true },
    team: { view: true, edit: false, delete: false, invite: false },
    settings: { view: true, edit: false, delete: false },
    reports: { view: true, export: true },
    jobs: { view: true, edit: true, delete: false, assign: true },
    calendar: { view: true, edit: true, delete: false },
  },
  sales: {
    leads: { view: true, edit: true, delete: false, assign: false },
    estimates: { view: true, edit: true, delete: false, send: true },
    customers: { view: true, edit: true, delete: false },
    tasks: { view: true, edit: true, delete: false, assign: false },
    team: { view: true, edit: false, delete: false, invite: false },
    settings: { view: false, edit: false, delete: false },
    reports: { view: true, export: false },
    jobs: { view: true, edit: false, delete: false, assign: false },
    calendar: { view: true, edit: false, delete: false },
  },
  crew_lead: {
    leads: { view: true, edit: false, delete: false, assign: false },
    estimates: { view: true, edit: false, delete: false, send: false },
    customers: { view: true, edit: false, delete: false },
    tasks: { view: true, edit: true, delete: false, assign: false },
    team: { view: true, edit: false, delete: false, invite: false },
    settings: { view: false, edit: false, delete: false },
    reports: { view: false, export: false },
    jobs: { view: true, edit: true, delete: false, assign: false },
    calendar: { view: true, edit: true, delete: false },
  },
  crew: {
    leads: { view: true, edit: false, delete: false, assign: false },
    estimates: { view: true, edit: false, delete: false, send: false },
    customers: { view: true, edit: false, delete: false },
    tasks: { view: true, edit: true, delete: false, assign: false },
    team: { view: false, edit: false, delete: false, invite: false },
    settings: { view: false, edit: false, delete: false },
    reports: { view: false, export: false },
    jobs: { view: true, edit: false, delete: false, assign: false },
    calendar: { view: true, edit: false, delete: false },
  },
}

export function getDefaultPermissions(role: UserRole): Permissions {
  return DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.crew
}

export interface UserWithProfile {
  user: User
  profile: UserProfile | null
}

export interface PermissionAuthResult {
  user: User | null
  profile: UserProfile | null
  error: NextResponse | null
}

/**
 * Get user's effective permissions (from profile or default by role)
 */
export function getEffectivePermissions(profile: UserProfile | null, user?: User): Permissions {
  if (profile?.permissions) {
    return profile.permissions as Permissions
  }

  // Fall back to role-based defaults
  const role = profile?.role ||
    (user?.user_metadata?.role as UserRole) ||
    (user?.app_metadata?.role as UserRole) ||
    'crew'

  return getDefaultPermissions(role)
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  profile: UserProfile | null,
  resource: keyof Permissions,
  action: string,
  user?: User
): boolean {
  const permissions = getEffectivePermissions(profile, user)
  const resourcePerms = permissions[resource]

  if (!resourcePerms) return false

  return (resourcePerms as Record<string, boolean>)[action] === true
}

/**
 * Get user's role from profile or auth metadata
 */
export function getUserRole(profile: UserProfile | null, user?: User): UserRole {
  if (profile?.role) return profile.role

  const metadataRole =
    (user?.user_metadata?.role as UserRole) ||
    (user?.app_metadata?.role as UserRole)

  if (metadataRole && ['admin', 'manager', 'sales', 'crew_lead', 'crew'].includes(metadataRole)) {
    return metadataRole
  }

  // Check for legacy is_admin flag
  if (user?.user_metadata?.is_admin === true || user?.app_metadata?.is_admin === true) {
    return 'admin'
  }

  return 'crew'
}

/**
 * Check if user is admin (role-based)
 */
export function isUserAdmin(profile: UserProfile | null, user?: User): boolean {
  return getUserRole(profile, user) === 'admin'
}

/**
 * Check if user is manager or above
 */
export function isUserManagerOrAbove(profile: UserProfile | null, user?: User): boolean {
  const role = getUserRole(profile, user)
  return role === 'admin' || role === 'manager'
}

/**
 * Require specific permission for API route
 * Returns user and profile if authorized, error response if not
 */
export async function requirePermission(
  resource: keyof Permissions,
  action: string
): Promise<PermissionAuthResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      user: null,
      profile: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userProfile = profile as UserProfile | null

  // Check permission
  if (!hasPermission(userProfile, resource, action, user)) {
    return {
      user,
      profile: userProfile,
      error: NextResponse.json(
        { error: 'Forbidden', message: `Missing permission: ${resource}.${action}` },
        { status: 403 }
      ),
    }
  }

  return { user, profile: userProfile, error: null }
}

/**
 * Require user to be manager or above
 */
export async function requireManagerOrAbove(): Promise<PermissionAuthResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      user: null,
      profile: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userProfile = profile as UserProfile | null

  if (!isUserManagerOrAbove(userProfile, user)) {
    return {
      user,
      profile: userProfile,
      error: NextResponse.json(
        { error: 'Forbidden', message: 'Manager or admin role required' },
        { status: 403 }
      ),
    }
  }

  return { user, profile: userProfile, error: null }
}

/**
 * Get user with their profile for API routes
 */
export async function getUserWithProfile(): Promise<PermissionAuthResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      user: null,
      profile: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile: profile as UserProfile | null, error: null }
}
