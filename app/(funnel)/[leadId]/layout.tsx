'use client'

import { FunnelLayout } from '@/components/funnel/funnel-layout'
import { useEffect } from 'react'
import { useFunnelStore } from '@/stores/funnelStore'
import { useParams } from 'next/navigation'

export default function FunnelRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const leadId = params.leadId as string
  const setLeadId = useFunnelStore((state) => state.setLeadId)
  const storedLeadId = useFunnelStore((state) => state.leadId)

  useEffect(() => {
    if (leadId && leadId !== storedLeadId) {
      setLeadId(leadId)
    }
  }, [leadId, storedLeadId, setLeadId])

  return <FunnelLayout>{children}</FunnelLayout>
}
