import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'
import { isMockMode } from '@/lib/mocks/config'
import { createMockClient } from '@/lib/mocks/supabase'

export function createClient() {
  // Use mock client in mock mode
  if (isMockMode()) {
    return createMockClient() as unknown as ReturnType<typeof createBrowserClient<Database>>
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
