'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAnalytics } from '@/lib/analytics'
import { useFunnelStore } from '@/stores/funnelStore'
import { StepContainer } from '@/components/funnel/step-container'
import { useToast } from '@/components/ui/toast'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { OptionCard } from '@/components/funnel/option-card'
import { Textarea } from '@/components/ui/textarea'
import type { JobType } from '@/lib/supabase/types'
import {
  Home,
  Wrench,
  Search,
  Settings,
  Droplets,
  Building2,
  Sun,
  HelpCircle,
} from 'lucide-react'

const US_STATES = [
  { value: '', label: 'Select state' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

const JOB_TYPES: { value: JobType; title: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'full_replacement',
    title: 'Full Replacement',
    description: 'Replace entire roof',
    icon: <Home className="h-5 w-5" />,
  },
  {
    value: 'repair',
    title: 'Repair',
    description: 'Fix specific issues',
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    value: 'inspection',
    title: 'Inspection',
    description: 'Assess condition',
    icon: <Search className="h-5 w-5" />,
  },
  {
    value: 'maintenance',
    title: 'Maintenance',
    description: 'Preventive care',
    icon: <Settings className="h-5 w-5" />,
  },
  {
    value: 'commercial',
    title: 'Commercial',
    description: 'Business property',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    value: 'solar_installation',
    title: 'Solar Install',
    description: 'Add solar panels',
    icon: <Sun className="h-5 w-5" />,
  },
  {
    value: 'gutter',
    title: 'Gutters',
    description: 'Gutter work',
    icon: <Droplets className="h-5 w-5" />,
  },
  {
    value: 'other',
    title: 'Other',
    description: 'Something else',
    icon: <HelpCircle className="h-5 w-5" />,
  },
]

export default function PropertyPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string

  const { showToast } = useToast()
  const { trackFunnelStep } = useAnalytics(leadId)

  useEffect(() => {
    trackFunnelStep(1, 'property_entered')
  }, [trackFunnelStep])

  const {
    address,
    setAddress,
    jobType,
    jobDescription,
    setJobType,
    setJobDescription,
    setCurrentStep,
    setLeadId,
  } = useFunnelStore()

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    streetAddress: address?.streetAddress || '',
    city: address?.city || '',
    state: address?.state || '',
    zipCode: address?.zipCode || '',
  })

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const handleJobSelect = (type: JobType) => {
    setJobType(type)
    if (type !== 'other') {
      setJobDescription('')
    }
    if (errors.jobType) {
      setErrors({ ...errors, jobType: '' })
    }
  }

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!formData.state) {
      newErrors.state = 'State is required'
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code'
    }
    if (!jobType) {
      newErrors.jobType = 'Please select a job type'
    }
    if (jobType === 'other' && !jobDescription?.trim()) {
      newErrors.jobDescription = 'Please describe what you need'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, jobType, jobDescription])

  const handleNext = async () => {
    if (!validateForm()) {
      setTimeout(() => {
        const firstError = formRef.current?.querySelector('[data-error="true"]')
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
          const input = firstError.querySelector('input, select, textarea') as HTMLElement | null
          input?.focus()
        }
      }, 0)
      return
    }

    setIsLoading(true)
    try {
      // Save to store
      setAddress({
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        formattedAddress: `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
      })
      setLeadId(leadId)

      // API save - proceed even if fails, but warn user
      try {
        const response = await fetch(`/api/leads/${leadId}/intake`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property: {
              street_address: formData.streetAddress,
              city: formData.city,
              state: formData.state,
              zip_code: formData.zipCode,
            },
            intake: {
              job_type: jobType,
              job_description: jobDescription || null,
            },
            current_step: 2,
          }),
        })
        if (!response.ok) {
          showToast('Your data may not have saved. You can continue, but please double-check your info later.', 'info')
        }
      } catch (err) {
        console.error('Failed to save property data:', err)
        showToast('Your data may not have saved. You can continue, but please double-check your info later.', 'info')
      }

      trackFunnelStep(1, 'property_completed')
      setCurrentStep(2)
      router.push(`/${leadId}/details`)
    } finally {
      setIsLoading(false)
    }
  }

  const isValid =
    formData.streetAddress.trim() &&
    formData.city.trim() &&
    formData.state &&
    /^\d{5}(-\d{4})?$/.test(formData.zipCode) &&
    jobType &&
    (jobType !== 'other' || jobDescription?.trim())

  return (
    <StepContainer
      title="Let's get started"
      description="Tell us where the property is and what you need done."
      onNext={handleNext}
      isNextDisabled={!isValid}
      isLoading={isLoading}
      showBack={false}
    >
      <div className="space-y-8" ref={formRef}>
        {/* Address Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-200">Property Address</h3>

          <div data-error={!!errors.streetAddress}>
            <Input
              label="Street Address"
              placeholder="123 Main St"
              value={formData.streetAddress}
              onChange={(e) => updateField('streetAddress', e.target.value)}
              error={errors.streetAddress}
              autoComplete="street-address"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div data-error={!!errors.city}>
              <Input
                label="City"
                placeholder="City"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                error={errors.city}
                autoComplete="address-level2"
              />
            </div>

            <div data-error={!!errors.state}>
              <Select
                label="State"
                options={US_STATES}
                value={formData.state}
                onChange={(value) => updateField('state', value)}
                error={errors.state}
              />
            </div>

            <div data-error={!!errors.zipCode}>
              <Input
                label="ZIP Code"
                placeholder="12345"
                value={formData.zipCode}
                onChange={(e) => updateField('zipCode', e.target.value)}
                error={errors.zipCode}
                maxLength={10}
                autoComplete="postal-code"
              />
            </div>
          </div>
        </div>

        {/* Job Type Section */}
        <div className="space-y-4" data-error={!!errors.jobType}>
          <h3 className="text-lg font-medium text-slate-200">What do you need?</h3>
          {errors.jobType && (
            <p className="text-sm text-red-400">{errors.jobType}</p>
          )}

          <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
            {JOB_TYPES.map((type) => (
              <OptionCard
                key={type.value}
                icon={type.icon}
                title={type.title}
                description={type.description}
                selected={jobType === type.value}
                onClick={() => handleJobSelect(type.value)}
                compact
              />
            ))}
          </div>

          {jobType === 'other' && (
            <div data-error={!!errors.jobDescription} className="animate-slide-up">
              <Textarea
                label="Please describe what you need"
                placeholder="e.g., Roof leaking in master bedroom, need estimate for insurance claim"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                error={errors.jobDescription}
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    </StepContainer>
  )
}
