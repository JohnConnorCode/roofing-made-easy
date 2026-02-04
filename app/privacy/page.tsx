import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://farrellroofing.com'

export const metadata: Metadata = {
  title: 'Privacy Policy | Farrell Roofing',
  description: 'Privacy Policy for Farrell Roofing. Learn how we collect, use, and protect your information when using our roofing estimate services.',
  alternates: {
    canonical: `${BASE_URL}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | Farrell Roofing',
    description: 'How Farrell Roofing collects, uses, and protects your personal information.',
    url: `${BASE_URL}/privacy`,
    siteName: 'Farrell Roofing',
    locale: 'en_US',
    type: 'website',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-[#161a23] border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#c9a25c]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-8 text-3xl font-bold text-slate-100">
            Privacy Policy
          </h1>

          <div className="space-y-6 text-slate-300">
            <p className="text-lg text-[#c9a25c]">
              Effective Date: January 1, 2026
            </p>

            <p>
              This Privacy Policy describes how we collect, use, and share information when you use
              our roofing estimate calculator service. We are committed to protecting your privacy
              and handling your data responsibly.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              1. Information We Collect
            </h2>
            <p>
              We collect the following types of information:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li><strong className="text-slate-100">Contact Information:</strong> Name, email address, phone number, and preferred contact method.</li>
              <li><strong className="text-slate-100">Property Information:</strong> Street address, city, state, ZIP code of the property requiring roofing services.</li>
              <li><strong className="text-slate-100">Project Details:</strong> Type of roofing work needed, roof material, size, pitch, number of stories, and any reported issues.</li>
              <li><strong className="text-slate-100">Photos:</strong> Images of your roof that you voluntarily upload to help us provide more accurate estimates.</li>
              <li><strong className="text-slate-100">Usage Data:</strong> Information about how you interact with our service, including pages visited and time spent.</li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Generate accurate roofing estimates based on your property and project details.</li>
              <li>Contact you regarding your estimate and potential roofing services.</li>
              <li>Connect you with qualified roofing contractors in your area (with your consent).</li>
              <li>Improve our estimation algorithms and service quality.</li>
              <li>Send promotional communications if you have opted in to receive them.</li>
              <li>Comply with legal obligations and protect our rights.</li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              3. Information Sharing
            </h2>
            <p>
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li><strong className="text-slate-100">Service Providers:</strong> With trusted third parties who assist in operating our service (hosting, analytics).</li>
              <li><strong className="text-slate-100">Roofing Contractors:</strong> With licensed contractors who may provide quotes for your project (only with your consent).</li>
              <li><strong className="text-slate-100">Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
              <li><strong className="text-slate-100">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              4. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal
              information against unauthorized access, alteration, disclosure, or destruction. These
              measures include encryption, secure servers, and access controls. However, no method of
              transmission over the internet is 100% secure.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              5. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes
              outlined in this policy, unless a longer retention period is required by law. Estimate
              data is typically retained for 2 years to allow for follow-up services and historical reference.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              6. Your Rights
            </h2>
            <p>
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li><strong className="text-slate-100">Access:</strong> Request a copy of the personal information we hold about you.</li>
              <li><strong className="text-slate-100">Correction:</strong> Request correction of inaccurate or incomplete information.</li>
              <li><strong className="text-slate-100">Deletion:</strong> Request deletion of your personal information.</li>
              <li><strong className="text-slate-100">Opt-out:</strong> Opt out of marketing communications at any time.</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided below.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              7. Cookies and Tracking
            </h2>
            <p>
              We use cookies and similar technologies to improve your experience, analyze usage patterns,
              and remember your preferences. You can control cookie settings through your browser preferences.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              8. Children&apos;s Privacy
            </h2>
            <p>
              Our service is not intended for children under 18 years of age. We do not knowingly
              collect personal information from children.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material
              changes by posting the new policy on this page and updating the effective date.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              10. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or wish to exercise your rights,
              please contact us:
            </p>
            <ul className="list-none space-y-1 pl-0">
              <li>By phone: Contact us using the number provided on our website</li>
              <li>By using the contact form on our website</li>
            </ul>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
