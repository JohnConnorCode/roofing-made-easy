'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react'

interface LeadCreateModalProps {
  isOpen: boolean
  onClose: () => void
}

const JOB_TYPES = [
  { value: 'full_replacement', label: 'Full Replacement' },
  { value: 'repair', label: 'Repair' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'gutter', label: 'Gutter' },
  { value: 'other', label: 'Other' },
]

const SOURCES = [
  { value: 'phone', label: 'Phone Call' },
  { value: 'walk_in', label: 'Walk-In' },
  { value: 'referral', label: 'Referral' },
  { value: 'email', label: 'Email' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'repeat_customer', label: 'Repeat Customer' },
  { value: 'web_funnel', label: 'Website' },
  { value: 'other', label: 'Other' },
]

const URGENCIES = [
  { value: 'emergency', label: 'Emergency' },
  { value: 'asap', label: 'ASAP' },
  { value: 'within_month', label: 'Within a Month' },
  { value: 'within_3_months', label: 'Within 3 Months' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'just_exploring', label: 'Just Exploring' },
]

export function LeadCreateModal({ isOpen, onClose }: LeadCreateModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Focus trap and initial focus
  useEffect(() => {
    if (!isOpen || !modalRef.current) return
    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    firstElement?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  const [formData, setFormData] = useState({
    // Contact
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Property
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    // Lead details
    source: 'phone',
    jobType: '',
    urgency: '',
    notes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate required fields
    if (!formData.firstName || !formData.phone) {
      setError('Name and phone are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Step 1: Create the lead
      const leadRes = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: formData.source,
        }),
      })

      if (!leadRes.ok) throw new Error('Failed to create lead')
      const { lead } = await leadRes.json()
      const leadId = lead.id

      // Step 2: Update contact info
      await fetch(`/api/leads/${leadId}/intake`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email || undefined,
            phone: formData.phone,
          },
          property: formData.streetAddress ? {
            streetAddress: formData.streetAddress,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          } : undefined,
          intake: {
            jobType: formData.jobType || undefined,
            timelineUrgency: formData.urgency || undefined,
            additionalNotes: formData.notes || undefined,
          },
        }),
      })

      // Navigate to the new lead
      router.push(`/admin/leads/${leadId}`)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-create-title"
        className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 id="lead-create-title" className="text-xl font-semibold text-slate-900">Create New Lead</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          <div className="space-y-6">
            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Contact Section */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <User className="h-4 w-4 text-slate-400" />
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">First Name *</label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Last Name</label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Smith"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Section */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <MapPin className="h-4 w-4 text-slate-400" />
                Property Address (Optional)
              </h3>
              <div className="space-y-3">
                <Input
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="123 Main St"
                />
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-3">
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      maxLength={2}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="ZIP"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Details Section */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Briefcase className="h-4 w-4 text-slate-400" />
                Lead Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                  >
                    {SOURCES.map(src => (
                      <option key={src.value} value={src.value}>{src.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Job Type</label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                  >
                    <option value="">Select...</option>
                    {JOB_TYPES.map(jt => (
                      <option key={jt.value} value={jt.value}>{jt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-slate-500 mb-1">Urgency</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
                >
                  <option value="">Select...</option>
                  {URGENCIES.map(urg => (
                    <option key={urg.value} value={urg.value}>{urg.label}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-slate-500 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any additional notes about this lead..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light resize-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            Create Lead
          </Button>
        </div>
      </div>
    </div>
  )
}
