'use client'

import { useCallback, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useFunnelStore } from '@/stores/funnelStore'
import { StepContainer } from '@/components/funnel/step-container'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

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

export default function AddressPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string

  const { address, setAddress, setCurrentStep } = useFunnelStore()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    streetAddress: address?.streetAddress || '',
    city: address?.city || '',
    state: address?.state || '',
    zipCode: address?.zipCode || '',
  })

  // Clear individual field errors as user types
  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
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
      newErrors.zipCode = 'Invalid ZIP code format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleNext = async () => {
    if (!validateForm()) {
      // Scroll to first error
      setTimeout(() => {
        const firstError = formRef.current?.querySelector('[data-error="true"]')
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 0)
      return
    }

    setIsLoading(true)
    try {
      // Save address to store
      setAddress({
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        formattedAddress: `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
      })

      // Save to API
      await fetch(`/api/leads/${leadId}/intake`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property: {
            street_address: formData.streetAddress,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
          },
          current_step: 2,
        }),
      })

      setCurrentStep(2)
      router.push(`/${leadId}/job-type`)
    } catch (error) {
      console.error('Error saving address:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isValid =
    formData.streetAddress.trim() &&
    formData.city.trim() &&
    formData.state &&
    /^\d{5}(-\d{4})?$/.test(formData.zipCode)

  return (
    <StepContainer
      title="Where is the property located?"
      description="We'll use this to check if we service your area and provide accurate pricing."
      onNext={handleNext}
      isNextDisabled={!isValid}
      isLoading={isLoading}
      showBack={false}
    >
      <div className="space-y-4" ref={formRef}>
        <div data-error={!!errors.streetAddress}>
          <Input
            label="Street Address"
            placeholder="123 Main St"
            value={formData.streetAddress}
            onChange={(e) => updateField('streetAddress', e.target.value)}
            error={errors.streetAddress}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div data-error={!!errors.city}>
            <Input
              label="City"
              placeholder="City"
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              error={errors.city}
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
        </div>

        <div data-error={!!errors.zipCode}>
          <Input
            label="ZIP Code"
            placeholder="12345"
            value={formData.zipCode}
            onChange={(e) => updateField('zipCode', e.target.value)}
            error={errors.zipCode}
            maxLength={10}
          />
        </div>
      </div>
    </StepContainer>
  )
}
