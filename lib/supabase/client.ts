import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'
import { isMockMode } from '@/lib/mocks/config'
import { createMockClient } from '@/lib/mocks/supabase'

// Check if Supabase is properly configured
function hasValidSupabaseConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check for missing or placeholder values
  if (!url || !key) return false
  if (url.includes('placeholder') || key.includes('placeholder')) return false
  if (url === 'https://placeholder.supabase.co') return false

  return true
}

export function createClient() {
  // SECURITY: In production, NEVER fall back to mock
  if (process.env.NODE_ENV === 'production') {
    if (!hasValidSupabaseConfig()) {
      throw new Error(
        'FATAL: Supabase is not configured in production. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
      )
    }
    // Never check mock mode in production - always use real Supabase
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Development: Allow mock mode for local development without Supabase
  if (isMockMode() || !hasValidSupabaseConfig()) {
    return createMockClient() as unknown as ReturnType<typeof createBrowserClient<Database>>
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
