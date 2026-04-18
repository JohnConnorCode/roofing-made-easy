'use client'

/**
 * Subscribe to live updates on the customer's jobs. When the payments webhook
 * flips a pending_deposit job to pending_start (or any other server-side
 * status change), this hook pushes the update into the customer store so the
 * UI re-renders without a refresh.
 *
 * RLS on the `jobs` table already restricts customer visibility to their own
 * rows, and Supabase realtime inherits those policies — so subscribing to the
 * full table is safe. Consumer only receives events for rows they could read.
 *
 * The hook is defensive: if realtime is misconfigured (publication not added,
 * browser offline), it silently no-ops. The portal still has the initial
 * `fetch()` — realtime is an enhancement, not a dependency.
 */

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCustomerStore, type CustomerJob } from '@/stores/customerStore'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export function useCustomerJobRealtime(customerId: string | null) {
  const updateJob = useCustomerStore((s) => s.updateJob)

  useEffect(() => {
    if (!customerId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`customer-jobs-${customerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const next = payload.new as Partial<CustomerJob> & { id?: string }
          if (!next.id) return
          updateJob(next.id, next)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [customerId, updateJob])
}
