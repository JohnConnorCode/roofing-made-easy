'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Eye, EyeOff, Home } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const sessionExpired = searchParams.get('expired') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before signing in.')
        } else {
          setError(authError.message)
        }
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {sessionExpired && (
        <div role="alert" className="rounded-lg bg-[#c9a25c]/10 border border-[#c9a25c]/30 p-3 text-sm text-[#c9a25c]">
          Your session has expired. Please sign in again.
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
        <input
          type="email"
          placeholder="admin@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-lg border border-slate-700 bg-[#1a1f2e] px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-[#c9a25c] focus:outline-none focus:ring-1 focus:ring-[#c9a25c] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-700 bg-[#1a1f2e] px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-[#c9a25c] focus:outline-none focus:ring-1 focus:ring-[#c9a25c] transition-colors pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0 font-semibold"
        isLoading={isLoading}
      >
        Sign In
      </Button>
    </form>
  )
}

function LoginFormFallback() {
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-[#c9a25c]" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-dark p-4">
      {/* Logo/Branding */}
      <div className="mb-8 flex items-center gap-3 animate-scale-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] shadow-lg glow-gold">
          <Home className="h-7 w-7 text-[#0c0f14]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Farrell Roofing</h1>
          <p className="text-sm text-slate-500">Admin Portal</p>
        </div>
      </div>

      <div className="w-full max-w-md animate-slide-up delay-100">
        <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-slate-100">Sign in to your account</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to access the dashboard</p>
          </div>
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500 animate-slide-up delay-200">
        Having trouble?{' '}
        <a href="mailto:support@farrellroofing.com" className="text-[#c9a25c] hover:text-[#d4b06c] hover:underline transition-colors">
          Contact support
        </a>
      </p>
    </div>
  )
}
