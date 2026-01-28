'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Printer, Download, Home } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { BUSINESS_CONFIG, getPhoneDisplay } from '@/lib/config/business'

interface QuoteLineItem {
  description: string
  quantity?: number
  unit?: string
  unitPrice?: number
  total: number
}

interface QuoteData {
  quoteNumber: string
  date: string
  validUntil: string
  customerName: string
  customerAddress: string
  customerCity: string
  customerState: string
  customerZip: string
  customerPhone?: string
  customerEmail?: string
  projectDescription: string
  lineItems: QuoteLineItem[]
  subtotal: number
  tax?: number
  total: number
  notes?: string
  terms?: string
}

interface QuoteGeneratorProps {
  leadData: {
    id: string
    contact?: {
      first_name?: string
      last_name?: string
      email?: string
      phone?: string
    }
    property?: {
      street_address?: string
      city?: string
      state?: string
      zip_code?: string
    }
    intake?: {
      job_type?: string
      roof_material?: string
      roof_size_sqft?: number
    }
    estimate?: {
      price_low?: number
      price_likely?: number
      price_high?: number
    }
  }
}

export function QuoteGenerator({ leadData }: QuoteGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Generate default quote data from lead
  const defaultLineItems: QuoteLineItem[] = []

  if (leadData.intake?.job_type === 'full_replacement') {
    defaultLineItems.push({
      description: `Complete roof replacement - ${leadData.intake.roof_material?.replace('_', ' ') || 'Architectural shingles'}`,
      quantity: leadData.intake.roof_size_sqft || 2000,
      unit: 'sq ft',
      unitPrice: (leadData.estimate?.price_likely || 15000) / (leadData.intake.roof_size_sqft || 2000),
      total: leadData.estimate?.price_likely || 15000,
    })
  } else {
    defaultLineItems.push({
      description: `${leadData.intake?.job_type?.replace('_', ' ') || 'Roofing'} service`,
      total: leadData.estimate?.price_likely || 5000,
    })
  }

  defaultLineItems.push(
    { description: 'Tear-off and disposal of existing roofing', total: 0 },
    { description: 'New underlayment installation', total: 0 },
    { description: 'Flashing and ventilation', total: 0 },
    { description: 'Cleanup and final inspection', total: 0 }
  )

  const [quote, setQuote] = useState<QuoteData>({
    quoteNumber: `Q-${Date.now().toString().slice(-8)}`,
    date: new Date().toLocaleDateString('en-US'),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US'),
    customerName: `${leadData.contact?.first_name || ''} ${leadData.contact?.last_name || ''}`.trim() || 'Customer',
    customerAddress: leadData.property?.street_address || '',
    customerCity: leadData.property?.city || '',
    customerState: leadData.property?.state || '',
    customerZip: leadData.property?.zip_code || '',
    customerPhone: leadData.contact?.phone,
    customerEmail: leadData.contact?.email,
    projectDescription: `${leadData.intake?.job_type?.replace('_', ' ') || 'Roofing'} project`,
    lineItems: defaultLineItems,
    subtotal: leadData.estimate?.price_likely || 15000,
    tax: 0,
    total: leadData.estimate?.price_likely || 15000,
    notes: 'Price includes all materials and labor. Permit fees may be additional if required by your municipality.',
    terms: 'Payment: 50% deposit to schedule, 50% upon completion. Quote valid for 30 days.',
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Quote / Proposal
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Print Quote
          </Button>
        </div>
      </div>

      {/* Printable Quote */}
      <div
        ref={printRef}
        className="bg-white border border-slate-200 rounded-lg p-8 print:border-0 print:shadow-none"
        id="printable-quote"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 print:bg-amber-500">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Farrell Roofing</h1>
              <p className="text-sm text-slate-500">Licensed & Insured Contractor</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-slate-900">QUOTE</h2>
            <p className="text-sm text-slate-500">#{quote.quoteNumber}</p>
          </div>
        </div>

        {/* Quote Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quote For
            </h3>
            <p className="font-semibold text-slate-900">{quote.customerName}</p>
            <p className="text-slate-600">{quote.customerAddress}</p>
            <p className="text-slate-600">
              {quote.customerCity}, {quote.customerState} {quote.customerZip}
            </p>
            {quote.customerPhone && (
              <p className="text-slate-600 mt-2">{quote.customerPhone}</p>
            )}
            {quote.customerEmail && (
              <p className="text-slate-600">{quote.customerEmail}</p>
            )}
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Date:{' '}
              </span>
              <span className="text-slate-900">{quote.date}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Valid Until:{' '}
              </span>
              <span className="text-slate-900">{quote.validUntil}</span>
            </div>
          </div>
        </div>

        {/* Project Description */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Project Description
          </h3>
          <p className="text-slate-700 capitalize">{quote.projectDescription}</p>
        </div>

        {/* Line Items */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Description
              </th>
              <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {quote.lineItems.map((item, index) => (
              <tr key={index} className="border-b border-slate-100">
                <td className="py-3 text-slate-700">
                  {item.description}
                  {item.quantity && item.unit && (
                    <span className="text-slate-400 text-sm ml-2">
                      ({item.quantity.toLocaleString()} {item.unit})
                    </span>
                  )}
                </td>
                <td className="py-3 text-right text-slate-900">
                  {item.total > 0 ? formatCurrency(item.total) : 'Included'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.tax && quote.tax > 0 && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Tax</span>
                <span className="font-medium">{formatCurrency(quote.tax)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 text-lg font-bold">
              <span className="text-slate-900">Total</span>
              <span className="text-amber-600">{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Notes
            </h3>
            <p className="text-sm text-slate-600">{quote.notes}</p>
          </div>
        )}

        {/* Terms */}
        {quote.terms && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Terms & Conditions
            </h3>
            <p className="text-sm text-slate-600">{quote.terms}</p>
          </div>
        )}

        {/* Signature Area */}
        <div className="grid md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-slate-200">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Customer Acceptance
            </p>
            <div className="border-b border-slate-300 mb-2 h-8" />
            <p className="text-sm text-slate-500">Signature & Date</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Farrell Roofing
            </p>
            <div className="border-b border-slate-300 mb-2 h-8" />
            <p className="text-sm text-slate-500">Authorized Representative</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Farrell Roofing | {BUSINESS_CONFIG.address.city}, {BUSINESS_CONFIG.address.stateCode} | {BUSINESS_CONFIG.email.support} | {getPhoneDisplay()}
          </p>
        </div>
      </div>
    </div>
  )
}
