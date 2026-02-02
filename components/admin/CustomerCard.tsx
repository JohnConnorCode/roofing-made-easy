'use client'

import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { User, Mail, Phone, FileText, TrendingUp } from 'lucide-react'

export interface CustomerData {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  created_at: string
  leads_count: number
  active_leads: number
  won_leads: number
  total_value: number
}

interface CustomerCardProps {
  customer: CustomerData
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const name = customer.first_name && customer.last_name
    ? `${customer.first_name} ${customer.last_name}`
    : customer.email

  return (
    <Link
      href={`/customers/${customer.id}`}
      className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-amber-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-slate-400" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 truncate">{name}</h3>

          <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
            {customer.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{customer.email}</span>
              </span>
            )}
            {customer.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {customer.phone}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-slate-400" />
              <span className="text-sm">
                <span className="font-medium text-slate-900">{customer.leads_count}</span>
                <span className="text-slate-500"> lead{customer.leads_count !== 1 ? 's' : ''}</span>
              </span>
            </div>

            {customer.won_leads > 0 && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  <span className="font-medium text-green-600">{customer.won_leads}</span>
                  <span className="text-slate-500"> won</span>
                </span>
              </div>
            )}

            {customer.total_value > 0 && (
              <span className="ml-auto text-sm font-semibold text-green-600">
                {formatCurrency(customer.total_value)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
