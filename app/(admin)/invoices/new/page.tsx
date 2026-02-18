'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { InvoiceForm } from '@/components/admin/InvoiceForm'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

function NewInvoiceContent() {
  const searchParams = useSearchParams()
  const leadId = searchParams.get('leadId') || undefined
  const estimateId = searchParams.get('estimateId') || undefined

  return (
    <AdminPageTransition className="p-6 space-y-6">
      <FadeInSection delay={0} animation="fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Invoice</h1>
          <p className="text-slate-500 mt-1">Create a new invoice for a customer</p>
        </div>
      </FadeInSection>

      <FadeInSection delay={150} animation="slide-up">
        <InvoiceForm leadId={leadId} estimateId={estimateId} />
      </FadeInSection>
    </AdminPageTransition>
  )
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-6 space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64" /><Skeleton className="h-[400px] w-full rounded-lg" /></div>}>
      <NewInvoiceContent />
    </Suspense>
  )
}
