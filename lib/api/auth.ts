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

/**
 * Check if user owns a specific lead (for customer access)
 * Verifies the lead belongs to the authenticated user via customer_leads table
 */
export async function requireLeadOwnership(leadId: string): Promise<AuthResult> {
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

  // Check if admin (admins have access to all leads)
  const isAdmin =
    user.user_metadata?.role === 'admin' ||
    user.app_metadata?.role === 'admin'

  if (isAdmin) {
    return { user, error: null }
  }

  // Check if user owns this lead via customer_leads
  const { data: customerLead } = await supabase
    .from('customer_leads' as never)
    .select('id')
    .eq('customer_id', user.id)
    .eq('lead_id', leadId)
    .single()

  if (!customerLead) {
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
