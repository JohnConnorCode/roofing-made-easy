import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'
import { isMockMode } from '@/lib/mocks/config'
import { createMockClient } from '@/lib/mocks/supabase'

// Check if Supabase is properly configured
function hasValidSupabaseConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return false
  if (url.includes('placeholder') || key.includes('placeholder')) return false
  if (url === 'https://placeholder.supabase.co') return false

  return true
}

export async function createClient() {
  // SECURITY: In production, NEVER fall back to mock
  if (process.env.NODE_ENV === 'production') {
    if (!hasValidSupabaseConfig()) {
      throw new Error(
        'FATAL: Supabase is not configured in production. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
      )
    }
    // Never check mock mode in production - always use real Supabase
    const cookieStore = await cookies()

    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing sessions.
            }
          },
        },
      }
    )
  }

  // Development: Allow mock mode for local development without Supabase
  if (isMockMode() || !hasValidSupabaseConfig()) {
    console.warn('⚠️ Using mock Supabase client (server) - NOT FOR PRODUCTION USE')
    return createMockClient() as unknown as ReturnType<typeof createServerClient<Database>>
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}

export async function createAdminClient() {
  // SECURITY: In production, NEVER fall back to mock
  if (process.env.NODE_ENV === 'production') {
    if (!hasValidSupabaseConfig()) {
      throw new Error(
        'FATAL: Supabase is not configured in production. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
      )
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        'FATAL: SUPABASE_SERVICE_ROLE_KEY is not set in production.'
      )
    }

    const cookieStore = await cookies()

    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignored in Server Components
            }
          },
        },
      }
    )
  }

  // Development: Allow mock mode
  if (isMockMode() || !hasValidSupabaseConfig()) {
    console.warn('⚠️ Using mock admin Supabase client - NOT FOR PRODUCTION USE')
    return createMockClient() as unknown as ReturnType<typeof createServerClient<Database>>
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored in Server Components
          }
        },
      },
    }
  )
}
