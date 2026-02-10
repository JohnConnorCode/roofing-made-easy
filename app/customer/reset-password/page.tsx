'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { useToast } from '@/components/ui/toast'
import { Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const { showToast } = useToast()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Listen for PASSWORD_RECOVERY event from the auth callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsReady(true)
      }
    })

    // Also check if user already has a session (e.g., page reload after callback)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsReady(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        setIsLoading(false)
        return
      }

      setSuccess(true)
      showToast('Password updated successfully!', 'success')

      setTimeout(() => {
        router.push('/portal')
      }, 2000)
    } catch {
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
              Password Updated
            </h2>
            <p className="text-slate-400 mb-6">
              Your password has been reset. Redirecting you to the portal...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c0f14] via-[#161a23] to-[#0c0f14] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-[#1a1f2e]/80 backdrop-blur">
          <CardContent className="pt-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#c9a25c] mx-auto mb-4" />
            <p className="text-slate-400">Verifying your reset link...</p>
            <p className="text-sm text-slate-500 mt-4">
              If this takes too long, your link may have expired.{' '}
              <Link href="/customer/forgot-password" className="text-[#c9a25c] hover:text-[#d4b06c]">
                Request a new one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0f14] via-[#161a23] to-[#0c0f14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-[#1a1f2e]/80 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl text-slate-100">Set New Password</CardTitle>
            <CardDescription className="text-slate-400">
              Choose a new password for your account
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="New Password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                label="Confirm Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
              >
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ResetPasswordLoading() {
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
