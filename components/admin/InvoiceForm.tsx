'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Plus, Trash2, ArrowLeft, Save, Send } from 'lucide-react'

interface LineItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  isTaxable: boolean
}

interface InvoiceFormProps {
  leadId?: string
  estimateId?: string
  initialData?: {
    id?: string
    leadId: string
    customerId?: string
    paymentType: string
    dueDate: string
    taxRate: number
    discountPercent: number
    notes: string
    terms: string
    lineItems: LineItem[]
  }
}

export function InvoiceForm({ leadId, estimateId, initialData }: InvoiceFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [leadData, setLeadData] = useState<{
    id: string
    contacts: Array<{ first_name?: string; last_name?: string; email?: string; phone?: string }>
    properties: Array<{ street_address?: string; city?: string; state?: string; zip_code?: string }>
    detailed_estimates?: Array<{ id: string; name: string; price_likely: number; adjusted_price_likely?: number }>
  } | null>(null)

  const [formData, setFormData] = useState({
    leadId: initialData?.leadId || leadId || '',
    customerId: initialData?.customerId || '',
    estimateId: estimateId || '',
    paymentType: initialData?.paymentType || 'deposit',
    dueDate: initialData?.dueDate || '',
    taxRate: initialData?.taxRate ?? 0,
    discountPercent: initialData?.discountPercent ?? 0,
    notes: initialData?.notes || '',
    terms: initialData?.terms || 'Payment due within 30 days. Late payments may incur additional fees.',
  })

  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.lineItems || [{ description: '', quantity: 1, unitPrice: 0, isTaxable: true }]
  )

  // Fetch lead data if we have a leadId
  useEffect(() => {
    if (formData.leadId) {
      fetchLeadData(formData.leadId)
    }
  }, [formData.leadId])

  async function fetchLeadData(id: string) {
    try {
      const res = await fetch(`/api/leads/${id}`)
      if (res.ok) {
        const data = await res.json()
        setLeadData(data.lead)
      }
    } catch {
      // Lead data fetch failure is non-critical
    }
  }

  function addLineItem() {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, isTaxable: true }])
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string | number | boolean) {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  function removeLineItem(index: number) {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  function populateFromEstimate(estimateId: string) {
    const estimate = leadData?.detailed_estimates?.find(e => e.id === estimateId)
    if (estimate) {
      const amount = estimate.adjusted_price_likely || estimate.price_likely
      setLineItems([
        {
          description: `${estimate.name} - Roofing Services`,
          quantity: 1,
          unitPrice: amount,
          isTaxable: true,
        },
      ])
      setFormData(prev => ({ ...prev, estimateId }))
    }
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxableAmount = lineItems
    .filter(item => item.isTaxable)
    .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const discountAmount = subtotal * (formData.discountPercent / 100)
  const taxAmount = (taxableAmount - (taxableAmount * formData.discountPercent / 100)) * formData.taxRate
  const total = subtotal - discountAmount + taxAmount

  async function handleSubmit(sendImmediately = false) {
    if (!formData.leadId) {
      showToast('Please select a lead', 'error')
      return
    }

    if (lineItems.some(item => !item.description || item.unitPrice <= 0)) {
      showToast('Please fill in all line items', 'error')
      return
    }

    setLoading(true)
    try {
      const payload = {
        leadId: formData.leadId,
        customerId: formData.customerId || undefined,
        estimateId: formData.estimateId || undefined,
        paymentType: formData.paymentType,
        dueDate: formData.dueDate || undefined,
        taxRate: formData.taxRate,
        discountPercent: formData.discountPercent,
        notes: formData.notes || undefined,
        terms: formData.terms || undefined,
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          isTaxable: item.isTaxable,
        })),
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create invoice')
      }

      const { invoice } = await res.json()

      // Optionally send immediately
      if (sendImmediately) {
        await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' })
      }

      router.push(`/invoices/${invoice.id}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create invoice', 'error')
    } finally {
      setLoading(false)
    }
  }

  const contact = leadData?.contacts?.[0]
  const property = leadData?.properties?.[0]
  const customerName = contact
    ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email
    : 'Unknown Customer'

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Selection (if not pre-selected) */}
          {!leadId && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Lead
              </label>
              <Input
                type="text"
                placeholder="Enter Lead ID"
                value={formData.leadId}
                onChange={e => setFormData(prev => ({ ...prev, leadId: e.target.value }))}
              />
            </div>
          )}

          {/* Customer Info */}
          {leadData && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="font-medium text-slate-900 mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Name:</span>
                  <span className="ml-2 text-slate-900">{customerName}</span>
                </div>
                {contact?.email && (
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <span className="ml-2 text-slate-900">{contact.email}</span>
                  </div>
                )}
                {contact?.phone && (
                  <div>
                    <span className="text-slate-500">Phone:</span>
                    <span className="ml-2 text-slate-900">{contact.phone}</span>
                  </div>
                )}
                {property && (
                  <div className="col-span-2">
                    <span className="text-slate-500">Address:</span>
                    <span className="ml-2 text-slate-900">
                      {property.street_address}, {property.city}, {property.state} {property.zip_code}
                    </span>
                  </div>
                )}
              </div>

              {/* Estimate selection */}
              {leadData.detailed_estimates && leadData.detailed_estimates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Base on Estimate
                  </label>
                  <select
                    value={formData.estimateId}
                    onChange={e => populateFromEstimate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                  >
                    <option value="">Select an estimate...</option>
                    {leadData.detailed_estimates.map(est => (
                      <option key={est.id} value={est.id}>
                        {est.name} - ${(est.adjusted_price_likely || est.price_likely).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Invoice Details */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="font-medium text-slate-900 mb-4">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Type
                </label>
                <select
                  value={formData.paymentType}
                  onChange={e => setFormData(prev => ({ ...prev, paymentType: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                >
                  <option value="deposit">Deposit</option>
                  <option value="progress">Progress Payment</option>
                  <option value="final">Final Payment</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-900">Line Items</h3>
              <Button variant="ghost" size="sm" onClick={addLineItem} leftIcon={<Plus className="h-4 w-4" />}>
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 uppercase">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1" />
              </div>

              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={e => updateLineItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={e => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={e => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 text-right font-medium text-slate-700">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => removeLineItem(index)}
                      className="p-1 text-slate-400 hover:text-red-500"
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="font-medium text-slate-900 mb-4">Notes & Terms</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes (visible to customer)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light resize-none"
                  placeholder="Any additional notes for the customer..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  value={formData.terms}
                  onChange={e => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sticky top-4">
            <h3 className="font-medium text-slate-900 mb-4">Invoice Summary</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-500 whitespace-nowrap">Discount %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.discountPercent}
                  onChange={e => setFormData(prev => ({ ...prev, discountPercent: parseFloat(e.target.value) || 0 }))}
                  className="w-20"
                />
                <span className="text-sm text-slate-500">-${discountAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-500 whitespace-nowrap">Tax Rate</label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.001"
                  value={formData.taxRate}
                  onChange={e => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                  className="w-20"
                />
                <span className="text-sm text-slate-500">${taxAmount.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-gold-dark">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => handleSubmit(false)}
                isLoading={loading}
                className="w-full"
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save as Draft
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                isLoading={loading}
                className="w-full"
                leftIcon={<Send className="h-4 w-4" />}
              >
                Save & Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
