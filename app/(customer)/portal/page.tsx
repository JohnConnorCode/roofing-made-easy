'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCustomerStore } from '@/stores/customerStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  StatusCard,
  EstimateSummary,
  ProgressTimeline,
  type TimelineStep,
} from '@/components/customer'
import {
  DollarSign,
  Shield,
  HandHeart,
  Calendar,
  Phone,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import { getPhoneDisplay, getPhoneLink } from '@/lib/config/business'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || ''

export default function CustomerPortalPage() {
  const router = useRouter()
  const {
    customer,
    linkedLeads,
    selectedLeadId,
    financingApplications,
    insuranceClaims,
    programApplications,
    setCustomer,
    setLinkedLeads,
    setSelectedLeadId,
    setFinancingApplications,
    setInsuranceClaims,
    setProgramApplications,
    setLoading,
    isLoading,
  } = useCustomerStore()

  const [isInitializing, setIsInitializing] = useState(true)

  // Fetch customer data on mount
  useEffect(() => {
    async function fetchCustomerData() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/customer/login')
          return
        }

        // Fetch customer profile and linked data
        const response = await fetch('/api/customer/profile')
        if (!response.ok) {
          // If no customer record exists, redirect to complete registration
          if (response.status === 404) {
            router.push('/customer/register')
            return
          }
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        setCustomer(data.customer)
        setLinkedLeads(data.linkedLeads || [])
        setFinancingApplications(data.financingApplications || [])
        setInsuranceClaims(data.insuranceClaims || [])
        setProgramApplications(data.programApplications || [])

        // Set selected lead to primary or first lead
        if (data.linkedLeads?.length > 0 && !selectedLeadId) {
          const primaryLead = data.linkedLeads.find((l: { is_primary: boolean }) => l.is_primary)
          setSelectedLeadId(primaryLead?.lead_id || data.linkedLeads[0].lead_id)
        }
      } catch (error) {
        console.error('Error fetching customer data:', error)
      } finally {
        setLoading(false)
        setIsInitializing(false)
      }
    }

    fetchCustomerData()
  }, [router, setCustomer, setLinkedLeads, setSelectedLeadId, setFinancingApplications, setInsuranceClaims, setProgramApplications, setLoading, selectedLeadId])

  // Get current lead data
  const currentLead = linkedLeads.find((l) => l.lead_id === selectedLeadId)
  const estimate = currentLead?.lead?.estimate
  const property = currentLead?.lead?.property

  // Get financing status for current lead
  const currentFinancing = financingApplications.find((f) => f.lead_id === selectedLeadId)
  const financingStatus = currentFinancing
    ? { label: currentFinancing.status.replace('_', ' ').charAt(0).toUpperCase() + currentFinancing.status.replace('_', ' ').slice(1), color: 'text-blue-400' }
    : undefined

  // Get insurance claim for current lead
  const currentClaim = insuranceClaims.find((c) => c.lead_id === selectedLeadId)
  const claimStatus = currentClaim
    ? { label: currentClaim.status.replace('_', ' ').charAt(0).toUpperCase() + currentClaim.status.replace('_', ' ').slice(1), color: 'text-yellow-400' }
    : undefined

  // Get program applications for current lead
  const currentPrograms = programApplications.filter((p) => p.lead_id === selectedLeadId)

  // Build progress timeline
  const progressSteps: TimelineStep[] = [
    {
      id: 'estimate',
      label: 'Estimate Received',
      description: estimate ? `$${estimate.price_likely?.toLocaleString()}` : 'Get your estimate',
      status: estimate ? 'completed' : 'current',
    },
    {
      id: 'financing',
      label: 'Explore Financing',
      description: currentFinancing ? financingStatus?.label : 'Pre-qualify for financing',
      status: currentFinancing ? (currentFinancing.status === 'approved' ? 'completed' : 'current') : 'upcoming',
    },
    {
      id: 'consultation',
      label: 'Schedule Consultation',
      description: 'Meet with our team',
      status: 'upcoming',
    },
    {
      id: 'project',
      label: 'Start Project',
      description: 'Begin your roofing project',
      status: 'upcoming',
    },
  ]

  if (isInitializing) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Welcome{customer?.first_name ? `, ${customer.first_name}` : ''}!
        </h1>
        <p className="text-slate-400">
          Track your roofing project progress and explore your options.
        </p>
      </div>

      {/* No leads message */}
      {linkedLeads.length === 0 && (
        <Card className="border-[#c9a25c]/30 bg-[#c9a25c]/5">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-[#c9a25c] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">No Estimate Found</h3>
            <p className="text-slate-400 mb-4">
              Get started by completing our quick assessment to receive your personalized estimate.
            </p>
            <Button
              variant="primary"
              className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
              onClick={() => router.push('/')}
            >
              Get Your Estimate
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main content - show when leads exist */}
      {linkedLeads.length > 0 && (
        <>
          {/* Progress tracker */}
          <Card className="border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressTimeline steps={progressSteps} orientation="horizontal" />
            </CardContent>
          </Card>

          {/* Estimate summary */}
          {estimate && (
            <EstimateSummary
              estimate={{
                priceLow: estimate.price_low,
                priceLikely: estimate.price_likely,
                priceHigh: estimate.price_high,
                explanation: estimate.ai_explanation || undefined,
                factors: estimate.adjustments as Array<{ name: string; impact: number; description: string }> || [],
              }}
              property={{
                address: property?.street_address || undefined,
                city: property?.city || undefined,
                state: property?.state || undefined,
              }}
            />
          )}

          {/* Qualification cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatusCard
              title="Financing"
              description={currentFinancing
                ? 'View your pre-qualification status'
                : 'Explore financing options for your project'}
              icon={DollarSign}
              status={financingStatus}
              href="/portal/financing"
              variant={currentFinancing ? 'default' : 'highlight'}
            />

            <StatusCard
              title="Insurance Claim"
              description={currentClaim
                ? 'Track your insurance claim progress'
                : 'Get help with your insurance claim'}
              icon={Shield}
              status={claimStatus}
              href="/portal/insurance"
              variant={currentClaim ? 'default' : 'default'}
            />

            <StatusCard
              title="Assistance Programs"
              description={currentPrograms.length > 0
                ? `Tracking ${currentPrograms.length} program${currentPrograms.length > 1 ? 's' : ''}`
                : 'Find programs you may qualify for'}
              icon={HandHeart}
              href="/portal/assistance"
            />
          </div>

          {/* Next steps CTA */}
          <Card className="border-[#c9a25c]/30 bg-gradient-to-r from-[#c9a25c]/10 to-transparent">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">Ready to Get Started?</h3>
                  <p className="text-slate-400">
                    Schedule a free consultation with our roofing experts.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
                    leftIcon={<Calendar className="h-5 w-5" />}
                    rightIcon={CALENDLY_URL ? <ExternalLink className="h-4 w-4" /> : undefined}
                    onClick={() => {
                      if (CALENDLY_URL) {
                        window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')
                      }
                    }}
                  >
                    Schedule Consultation
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    leftIcon={<Phone className="h-5 w-5" />}
                    onClick={() => {
                      window.location.href = getPhoneLink()
                    }}
                  >
                    Call {getPhoneDisplay()}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
