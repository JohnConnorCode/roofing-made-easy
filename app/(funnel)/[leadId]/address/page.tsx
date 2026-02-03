'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// Redirect old /address route to new /property route
export default function AddressRedirect() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string

  useEffect(() => {
    router.replace(`/${leadId}/property`)
  }, [router, leadId])

  return null
}
