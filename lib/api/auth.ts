/**
 * Authentication helpers for API routes
 * Provides consistent auth checking across all admin API endpoints
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

export interface AuthResult {
  user: User | null
  error: NextResponse | null
}

/**
 * Require authenticated user for API route
 * Returns 401 Unauthorized if no valid session
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  return { user, error: null }
}

/**
 * Require admin role for API route
 * Returns 401 if not authenticated, 403 if not admin
 */
export async function requireAdmin(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  // Check admin role in user metadata or app_metadata
  const isAdmin =
    user.user_metadata?.role === 'admin' ||
    user.app_metadata?.role === 'admin' ||
    user.user_metadata?.is_admin === true ||
    user.app_metadata?.is_admin === true

  if (!isAdmin) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
  }

  return { user, error: null }
}

export interface CustomerAuthResult {
  user: User | null
  customerId: string | null
  error: NextResponse | null
}

/**
 * Require authenticated customer
 * Returns the customer ID for use in subsequent queries
 */
export async function requireCustomer(): Promise<CustomerAuthResult> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      customerId: null,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  // Get customer record by auth_user_id
  const { data: customer } = await supabase
    .from('customers' as never)
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!customer) {
    return {
      user,
      customerId: null,
      error: NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
  }

  return { user, customerId: (customer as { id: string }).id, error: null }
}

/**
 * Check if user owns a specific lead (for customer access)
 * Verifies the lead belongs to the authenticated user via customer_leads table
 */
export async function requireLeadOwnership(leadId: string): Promise<CustomerAuthResult> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      customerId: null,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  // Check if admin (admins have access to all leads)
  const isAdmin =
    user.user_metadata?.role === 'admin' ||
    user.app_metadata?.role === 'admin'

  if (isAdmin) {
    return { user, customerId: null, error: null }
  }

  // Get customer record by auth_user_id
  const { data: customer } = await supabase
    .from('customers' as never)
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!customer) {
    return {
      user,
      customerId: null,
      error: NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
  }

  const customerId = (customer as { id: string }).id

  // Check if customer owns this lead via customer_leads
  const { data: customerLead } = await supabase
    .from('customer_leads' as never)
    .select('id')
    .eq('customer_id', customerId)
    .eq('lead_id', leadId)
    .single()

  if (!customerLead) {
    return {
      user,
      customerId,
      error: NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
  }

  return { user, customerId, error: null }
}

/**
 * Pagination validation utilities
 * Prevents DoS attacks via unbounded pagination
 */
export interface PaginationParams {
  limit: number
  offset: number
}

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100

/**
 * Parse and validate pagination parameters from URL search params
 * Returns safe, bounded values
 */
export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const rawLimit = searchParams.get('limit')
  const rawOffset = searchParams.get('offset')

  // Parse limit with bounds checking
  let limit = DEFAULT_LIMIT
  if (rawLimit) {
    const parsed = parseInt(rawLimit, 10)
    if (!isNaN(parsed) && parsed > 0) {
      limit = Math.min(parsed, MAX_LIMIT)
    }
  }

  // Parse offset with bounds checking
  let offset = 0
  if (rawOffset) {
    const parsed = parseInt(rawOffset, 10)
    if (!isNaN(parsed) && parsed >= 0) {
      offset = parsed
    }
  }

  return { limit, offset }
}
