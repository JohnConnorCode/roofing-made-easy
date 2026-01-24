'use client'

import { useRouter, useParams } from 'next/navigation'
import { useFunnelStore } from '@/stores/funnelStore'
import { StepContainer } from '@/components/funnel/step-container'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useCallback, useRef } from 'react'

const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'text', label: 'Text Message' },
]

export default function ContactPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string
  const isDemoMode = leadId.startsWith('demo-')

  const {
    firstName,
    lastName,
    email,
    phone,
    preferredContactMethod,
    consentMarketing,
    consentSms,
    consentTerms,
    setContact,
    setCurrentStep,
  } = useFunnelStore()

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLDivElement>(null)

  // Clear field error as user types
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits'
    }
    if (!consentTerms) {
      newErrors.consentTerms = 'You must agree to the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [firstName, lastName, email, phone, consentTerms])

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
      // Try API save (non-blocking)
      if (!isDemoMode) {
        try {
          await fetch(`/api/leads/${leadId}/intake`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contact: {
                first_name: firstName,
                last_name: lastName,
                email,
                phone,
                preferred_contact_method: preferredContactMethod,
                consent_marketing: consentMarketing,
                consent_sms: consentSms,
                consent_terms: consentTerms,
              },
              current_step: 8,
            }),
          })

          // Generate estimate via API
          await fetch(`/api/leads/${leadId}/estimate`, {
            method: 'POST',
          })
        } catch (apiError) {
          // API save failed, continue with local data
        }
      }

      setCurrentStep(8)
      router.push(`/${leadId}/estimate`)
    } catch (error) {
      // Error handling - continue with navigation
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/${leadId}/timeline`)
  }

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    phone.replace(/\D/g, '').length >= 10 &&
    consentTerms

  return (
    <StepContainer
      title="How can we reach you?"
      description="We'll use this to send your estimate and schedule a consultation."
      onNext={handleNext}
      onBack={handleBack}
      isNextDisabled={!isValid}
      isLoading={isLoading}
      nextLabel="Get My Estimate"
    >
      <div className="space-y-6" ref={formRef}>
        {/* Name fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div data-error={!!errors.firstName}>
            <Input
              label="First Name"
              placeholder="First name"
              value={firstName}
              onChange={(e) => {
                setContact({ firstName: e.target.value })
                clearError('firstName')
              }}
              error={errors.firstName}
              autoComplete="given-name"
            />
          </div>
          <div data-error={!!errors.lastName}>
            <Input
              label="Last Name"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => {
                setContact({ lastName: e.target.value })
                clearError('lastName')
              }}
              error={errors.lastName}
              autoComplete="family-name"
            />
          </div>
        </div>

        {/* Contact fields */}
        <div data-error={!!errors.email}>
          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setContact({ email: e.target.value })
              clearError('email')
            }}
            error={errors.email}
            autoComplete="email"
          />
        </div>

        <div data-error={!!errors.phone}>
          <Input
            label="Phone Number"
            type="tel"
            placeholder="(555) 000-0000"
            value={phone}
            onChange={(e) => {
              setContact({ phone: formatPhoneNumber(e.target.value) })
              clearError('phone')
            }}
            error={errors.phone}
            autoComplete="tel"
          />
        </div>

        <Select
          label="Preferred Contact Method"
          options={CONTACT_METHODS}
          value={preferredContactMethod}
          onChange={(value) =>
            setContact({ preferredContactMethod: value as 'phone' | 'email' | 'text' })
          }
        />

        {/* Consent checkboxes */}
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4" data-error={!!errors.consentTerms}>
          <Checkbox
            label={
              <span>
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-amber-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" className="text-amber-600 hover:underline">
                  Privacy Policy
                </a>
              </span>
            }
            checked={consentTerms}
            onChange={(e) => {
              setContact({ consentTerms: e.target.checked })
              clearError('consentTerms')
            }}
          />
          {errors.consentTerms && (
            <p className="text-sm text-red-600">{errors.consentTerms}</p>
          )}

          <Checkbox
            label="I agree to receive text messages (SMS)"
            description="Message and data rates may apply. Reply STOP to opt out."
            checked={consentSms}
            onChange={(e) => setContact({ consentSms: e.target.checked })}
          />

          <Checkbox
            label="Send me helpful tips and promotional offers"
            description="Occasional emails about roofing maintenance and special offers"
            checked={consentMarketing}
            onChange={(e) => setContact({ consentMarketing: e.target.checked })}
          />
        </div>
      </div>
    </StepContainer>
  )
}
