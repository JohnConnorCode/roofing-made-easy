'use client'

import { useRouter, useParams } from 'next/navigation'
import { useFunnelStore } from '@/stores/funnelStore'
import { StepContainer } from '@/components/funnel/step-container'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CollapsibleSection } from '@/components/funnel/collapsible-section'
import { useState, useCallback, useRef } from 'react'
import { Settings } from 'lucide-react'

const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'text', label: 'Text Message' },
]

export default function ContactPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string

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
      newErrors.email = 'Please enter a valid email'
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    if (!consentTerms) {
      newErrors.consentTerms = 'Please agree to continue'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [firstName, lastName, email, phone, consentTerms])

  const handleNext = async () => {
    if (!validateForm()) {
      setTimeout(() => {
        const firstError = formRef.current?.querySelector('[data-error="true"]')
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 0)
      return
    }

    setIsLoading(true)
    try {
      // API save - proceed even if fails, but log errors
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
            current_step: 4,
          }),
        })

        // Generate estimate
        await fetch(`/api/leads/${leadId}/estimate`, {
          method: 'POST',
        })
      } catch (err) {
        console.error('Failed to save contact data:', err)
      }

      setCurrentStep(4)
      router.push(`/${leadId}/estimate`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/${leadId}/details`)
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
      title="Almost there!"
      description="Enter your contact info to get your personalized estimate."
      onNext={handleNext}
      onBack={handleBack}
      isNextDisabled={!isValid}
      isLoading={isLoading}
      nextLabel="Get My Estimate"
    >
      <div className="space-y-6" ref={formRef}>
        {/* Name fields - side by side */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-error={!!errors.firstName}>
            <Input
              label="First Name"
              placeholder="John"
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
              placeholder="Smith"
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

        {/* Email and Phone - side by side on larger screens */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-error={!!errors.email}>
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
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
              label="Phone"
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
        </div>

        {/* Terms consent - required, prominent */}
        <div
          className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
          data-error={!!errors.consentTerms}
        >
          <Checkbox
            label={
              <span className="text-slate-300">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-[#c9a25c] hover:underline">
                  Terms
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" className="text-[#c9a25c] hover:underline">
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
            <p className="mt-2 text-sm text-red-400">{errors.consentTerms}</p>
          )}
        </div>

        {/* Optional preferences - collapsible */}
        <CollapsibleSection
          title="Communication Preferences"
          description="How would you like us to contact you?"
          icon={<Settings className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <Select
              label="Preferred Contact Method"
              options={CONTACT_METHODS}
              value={preferredContactMethod}
              onChange={(value) =>
                setContact({ preferredContactMethod: value as 'phone' | 'email' | 'text' })
              }
            />

            <div className="space-y-3">
              <Checkbox
                label="I agree to receive text messages (SMS)"
                description="Message and data rates may apply. Reply STOP to opt out."
                checked={consentSms}
                onChange={(e) => setContact({ consentSms: e.target.checked })}
              />

              <Checkbox
                label="Send me helpful tips and offers"
                description="Occasional emails about roofing maintenance and special offers"
                checked={consentMarketing}
                onChange={(e) => setContact({ consentMarketing: e.target.checked })}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure & encrypted
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            No spam, ever
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Free estimate
          </span>
        </div>
      </div>
    </StepContainer>
  )
}
