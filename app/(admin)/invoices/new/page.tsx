'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { InvoiceForm } from '@/components/admin/InvoiceForm'

function NewInvoiceContent() {
  const searchParams = useSearchParams()
  const leadId = searchParams.get('leadId') || undefined
  const estimateId = searchParams.get('estimateId') || undefined

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Create Invoice</h1>
        <p className="text-slate-500 mt-1">Create a new invoice for a customer</p>
      </div>

      <InvoiceForm leadId={leadId} estimateId={estimateId} />
    </div>
  )
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <NewInvoiceContent />
    </Suspense>
  )
}
