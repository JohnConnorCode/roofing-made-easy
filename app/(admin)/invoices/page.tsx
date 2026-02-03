'use client'

import { InvoiceList } from '@/components/admin/InvoiceList'

export default function InvoicesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        <p className="text-slate-500 mt-1">Manage customer invoices and payments</p>
      </div>

      <InvoiceList showCreateButton />
    </div>
  )
}
