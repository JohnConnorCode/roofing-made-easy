import { Metadata } from 'next'
import Link from 'next/link'
import { Home, Hammer } from 'lucide-react'
import NotFoundBackButton from '@/components/not-found-back-button'

export const metadata: Metadata = {
  title: 'Page Not Found | Smart Roof Pricing',
  description: 'The page you are looking for does not exist. Visit our homepage for roofing estimates, services, and resources.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-800">
            <Hammer className="h-8 w-8 text-amber-500" />
          </div>
        </div>
        <h1 className="text-9xl font-bold text-slate-200">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Page Not Found</h2>
        <p className="mt-2 text-slate-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-700"
          >
            <Home className="h-5 w-5" />
            Go to Homepage
          </Link>
          <NotFoundBackButton />
        </div>

        <div className="mt-12">
          <p className="text-sm text-slate-500">
            Looking for a roofing estimate?{' '}
            <Link href="/" className="text-amber-600 hover:underline">
              Start your free estimate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
