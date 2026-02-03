'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// Redirect old /photos route to new /details route
export default function PhotosRedirect() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string

  useEffect(() => {
    router.replace(`/${leadId}/details`)
  }, [router, leadId])

  return null
}
