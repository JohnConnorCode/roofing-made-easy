'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { ArrowLeft, Mail, Loader2 } from 'lucide-react'

function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/customer/reset-password`,
      })
    } catch {
      // Silently handle - don't reveal whether email exists
    } finally {
      setIsLoading(false)
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c0f14] via-[#161a23] to-[#0c0f14] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-slate-700 bg-[#1a1f2e]/80 backdrop-blur">
            <CardContent className="pt-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/20">
                <Mail className="h-8 w-8 text-[#c9a25c]" />
              </div>
              <h2 className="text-xl font-semibold text-slate-100 mb-2">
                Check Your Email
              </h2>
              <p className="text-slate-400 mb-6">
                If an account exists for <strong className="text-slate-200">{email}</strong>,
                we&apos;ve sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link href="/customer/login">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
                >
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0f14] via-[#161a23] to-[#0c0f14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/customer/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <Card className="border-slate-700 bg-[#1a1f2e]/80 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl text-slate-100">Reset Password</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your email and we&apos;ll send you a link to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
              >
                Send Reset Link
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ForgotPasswordLoading() {
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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordForm />
    </Suspense>
  )
}
