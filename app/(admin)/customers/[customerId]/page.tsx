'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils'
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  FileText,
  DollarSign,
  Shield,
  Calendar,
  Save,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { SkeletonPageContent } from '@/components/ui/skeleton'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

interface CustomerLead {
  id: string
  status: string
  source: string
  created_at: string
  is_primary: boolean
  nickname?: string
  linked_at: string
  contacts?: { first_name: string; last_name: string; email: string; phone: string }[]
  properties?: { street_address: string; city: string; state: string; zip_code: string }[]
  intakes?: { job_type: string; timeline_urgency: string; roof_size_sqft: number }[]
  estimates?: { price_likely: number; price_low: number; price_high: number }[]
}

interface FinancingApplication {
  id: string
  amount_requested: number
  credit_range: string
  status: string
  created_at: string
}

interface InsuranceClaim {
  id: string
  insurance_company: string
  claim_number: string
  status: string
  claim_amount_approved?: number
  created_at: string
}

interface CustomerDetail {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  role: string
  email_verified: boolean
  created_at: string
  updated_at: string
  leads: CustomerLead[]
  financing_applications: FinancingApplication[]
  insurance_claims: InsuranceClaim[]
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-amber-100 text-amber-800',
  intake_started: 'bg-slate-100 text-slate-800',
  intake_complete: 'bg-slate-200 text-slate-800',
  estimate_generated: 'bg-green-100 text-green-800',
  consultation_scheduled: 'bg-blue-100 text-blue-800',
  quote_sent: 'bg-purple-100 text-purple-800',
  won: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-red-100 text-red-800',
  archived: 'bg-slate-100 text-slate-500',
}

const FINANCING_STATUS_STYLES: Record<string, string> = {
  interested: 'bg-slate-100 text-slate-700',
  contacted: 'bg-blue-100 text-blue-700',
  pre_qualified: 'bg-amber-100 text-amber-700',
  applied: 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  denied: 'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-500',
}

const INSURANCE_STATUS_STYLES: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-700',
  filed: 'bg-blue-100 text-blue-700',
  adjuster_scheduled: 'bg-amber-100 text-amber-700',
  adjuster_visited: 'bg-purple-100 text-purple-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  denied: 'bg-red-100 text-red-700',
  appealing: 'bg-orange-100 text-orange-700',
  settled: 'bg-emerald-100 text-emerald-700',
}

export default function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = use(params)
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  })

  const fetchCustomer = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Customer not found')
          return
        }
        throw new Error('Failed to fetch customer')
      }
      const data = await response.json()
      setCustomer(data.customer)
      setEditForm({
        first_name: data.customer.first_name || '',
        last_name: data.customer.last_name || '',
        email: data.customer.email || '',
        phone: data.customer.phone || ''
      })
    } catch (err) {
      setError('Unable to load customer. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) throw new Error('Failed to save')

      const data = await response.json()
      setCustomer(prev => prev ? { ...prev, ...data.customer } : null)
      setIsEditing(false)
    } catch {
      setError('Failed to save customer. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonPageContent />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="mt-4 text-slate-600">{error || 'Customer not found'}</p>
        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            onClick={fetchCustomer}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Try Again
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push('/customers')}
          >
            Back to Customers
          </Button>
        </div>
      </div>
    )
  }

  const name = customer.first_name && customer.last_name
    ? `${customer.first_name} ${customer.last_name}`
    : customer.email

  const totalValue = customer.leads.reduce((sum, lead) => {
    const estimate = lead.estimates?.[0]?.price_likely || 0
    return sum + estimate
  }, 0)

  return (
    <AdminPageTransition className="space-y-6">
      <FadeInSection delay={0} animation="fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/customers')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
          <p className="text-slate-500">Customer since {formatDate(customer.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Contact Info
            </Button>
          )}
        </div>
      </div>
      </FadeInSection>

      <FadeInSection delay={150} animation="slide-up">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                      <Input
                        value={editForm.first_name}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                      <Input
                        value={editForm.last_name}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSave} isLoading={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <dl className="grid gap-4 md:grid-cols-2">
                  <div>
                    <dt className="text-sm text-slate-500">Name</dt>
                    <dd className="text-slate-900">{name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Email</dt>
                    <dd className="text-slate-900 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {customer.email}
                      {customer.email_verified && (
                        <span title="Verified">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Phone</dt>
                    <dd className="text-slate-900 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {customer.phone ? formatPhone(customer.phone) : 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Role</dt>
                    <dd className="text-slate-900 capitalize">{customer.role}</dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>

          {/* Linked Leads */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Linked Leads ({customer.leads.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.leads.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No leads linked to this customer</p>
              ) : (
                <div className="space-y-3">
                  {customer.leads.map((lead) => {
                    const property = lead.properties?.[0]
                    const estimate = lead.estimates?.[0]

                    return (
                      <Link
                        key={lead.id}
                        href={`/leads/${lead.id}`}
                        className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-slate-900">
                                {property?.street_address || 'No address'}
                              </h4>
                              {lead.is_primary && (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">
                              {property?.city}, {property?.state}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[lead.status] || 'bg-slate-100'}`}>
                              {lead.status.replace(/_/g, ' ')}
                            </span>
                            {estimate?.price_likely && (
                              <p className="text-sm font-semibold text-green-600 mt-1">
                                {formatCurrency(estimate.price_likely)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(lead.created_at)}
                          </span>
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Summary Stats */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Leads</span>
                <span className="font-semibold text-slate-900">{customer.leads.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Value</span>
                <span className="font-semibold text-green-600">{formatCurrency(totalValue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Won Deals</span>
                <span className="font-semibold text-slate-900">
                  {customer.leads.filter(l => l.status === 'won').length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Financing Applications */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900 text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financing ({customer.financing_applications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.financing_applications.length === 0 ? (
                <p className="text-sm text-slate-500">No financing applications</p>
              ) : (
                <div className="space-y-2">
                  {customer.financing_applications.map((app) => (
                    <div key={app.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">
                          {formatCurrency(app.amount_requested)}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${FINANCING_STATUS_STYLES[app.status] || 'bg-slate-100'}`}>
                          {app.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(app.created_at)} · {app.credit_range} credit
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insurance Claims */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900 text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Insurance ({customer.insurance_claims.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.insurance_claims.length === 0 ? (
                <p className="text-sm text-slate-500">No insurance claims</p>
              ) : (
                <div className="space-y-2">
                  {customer.insurance_claims.map((claim) => (
                    <div key={claim.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 text-sm">
                          {claim.insurance_company}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${INSURANCE_STATUS_STYLES[claim.status] || 'bg-slate-100'}`}>
                          {claim.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Claim #{claim.claim_number}
                      </p>
                      {claim.claim_amount_approved && (
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          {formatCurrency(claim.claim_amount_approved)} approved
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </FadeInSection>
    </AdminPageTransition>
  )
}
