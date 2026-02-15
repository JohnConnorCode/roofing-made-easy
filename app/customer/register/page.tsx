'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { useToast } from '@/components/ui/toast'
import { Eye, EyeOff, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'

function CustomerRegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    consentTerms: false,
    consentMarketing: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [leadData, setLeadData] = useState<{
    address?: string
    estimate?: number
  } | null>(null)

  const leadId = searchParams.get('leadId')
  const source = searchParams.get('source')

  // Fetch lead data if leadId is provided (public endpoint, no auth required)
  useEffect(() => {
    async function fetchLeadData() {
      if (!leadId || leadId.startsWith('demo-')) return

      try {
        const response = await fetch(`/api/public/lead-summary/${leadId}`)
        if (response.ok) {
          const data = await response.json()
          setLeadData({
            address: data.address,
            estimate: data.estimate,
          })
          // Pre-fill name if available (email/phone not returned for privacy)
          if (data.firstName || data.lastName) {
            setFormData((prev) => ({
              ...prev,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
            }))
          }
        }
      } catch {
        // Silently fail - user can still register
      }
    }

    fetchLeadData()
  }, [leadId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password) {
      return 'Email and password are required'
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }
    if (!formData.consentTerms) {
      return 'You must accept the terms of service'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        setError('Failed to create account')
        setIsLoading(false)
        return
      }

      // Create customer record via API
      const customerResponse = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authUserId: authData.user.id,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          consentMarketing: formData.consentMarketing,
          leadId: leadId || undefined,
          source: source || undefined,
        }),
      })

      if (!customerResponse.ok) {
        const errorData = await customerResponse.json()
        setError(errorData.error || 'Failed to complete registration')
        setIsLoading(false)
        return
      }

      setSuccess(true)
      showToast('Account created successfully!', 'success')

      // If email confirmation is required, show success message
      // Otherwise, redirect to portal
      if (authData.session) {
        router.push('/portal')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c0f14] via-[#161a23] to-[#0c0f14] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-[#1a1f2e]/80 backdrop-blur">
          <CardContent className="pt-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#3d7a5a]/20 border border-[#3d7a5a]">
              <CheckCircle className="h-8 w-8 text-[#3d7a5a]" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100 mb-2">
              Check Your Email
            </h2>
            <p className="text-slate-400 mb-6">
              We&apos;ve sent a confirmation link to <strong className="text-slate-200">{formData.email}</strong>.
              Click the link to activate your account.
            </p>
            <Link href="/customer/login">
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
              >
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0f14] via-[#161a23] to-[#0c0f14] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href={leadId ? `/${leadId}/estimate` : '/'}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {leadId ? 'Back to estimate' : 'Back to home'}
        </Link>

        <Card className="border-slate-700 bg-[#1a1f2e]/80 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl text-slate-100">Create Account</CardTitle>
            <CardDescription className="text-slate-400">
              {leadId
                ? 'Create an account to explore financing and track your project'
                : 'Join to access estimates, financing, and more'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Show lead info if available */}
            {leadData && (
              <div className="mb-6 rounded-lg bg-[#c9a25c]/10 border border-[#c9a25c]/20 p-4">
                <p className="text-sm text-slate-400 mb-1">Linking to estimate for:</p>
                <p className="text-slate-100 font-medium">{leadData.address}</p>
                {leadData.estimate && (
                  <p className="text-[#c9a25c] text-lg font-semibold mt-1">
                    ${leadData.estimate.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="firstName"
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                />
                <Input
                  name="lastName"
                  label="Last Name"
                  placeholder="Smith"
                  value={formData.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                />
              </div>

              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />

              <Input
                type="tel"
                name="phone"
                label="Phone (optional)"
                placeholder="(555) 555-5555"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  label="Password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <Input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />

              <div className="space-y-3 pt-2">
                <Checkbox
                  name="consentTerms"
                  label={
                    <span>
                      I agree to the{' '}
                      <Link href="/terms" className="text-[#c9a25c] hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-[#c9a25c] hover:underline">
                        Privacy Policy
                      </Link>
                    </span>
                  }
                  checked={formData.consentTerms}
                  onChange={handleChange}
                  required
                />

                <Checkbox
                  name="consentMarketing"
                  label="Send me updates about my project and special offers"
                  checked={formData.consentMarketing}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link
                  href={leadId ? `/customer/login?leadId=${leadId}` : '/customer/login'}
                  className="text-[#c9a25c] hover:text-[#d4b06c] font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RegisterLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0f14] via-[#161a23] to-[#0c0f14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-[#1a1f2e]/80 backdrop-blur">
          <CardContent className="pt-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#c9a25c]" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CustomerRegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <CustomerRegisterForm />
    </Suspense>
  )
}
