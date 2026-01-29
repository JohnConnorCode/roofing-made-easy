import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'

export const metadata: Metadata = {
  title: 'Terms of Service | Roofing Estimate Calculator',
  description: 'Terms of Service for the Roofing Estimate Calculator',
}

export default function TermsPage() {
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
            Terms of Service
          </h1>

          <div className="space-y-6 text-slate-300">
            <p className="text-lg text-[#c9a25c]">
              Effective Date: January 1, 2026
            </p>

            <p>
              Please read these Terms of Service carefully before using our roofing estimate
              calculator service. By accessing or using our service, you agree to be bound by
              these terms.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using this website and our roofing estimate calculator service,
              you accept and agree to be bound by these Terms of Service and our Privacy Policy.
              If you do not agree to these terms, please do not use our service.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              2. Description of Service
            </h2>
            <p>
              Our service provides automated roofing cost estimates based on information you provide
              about your property and project requirements. The service is designed to give you a
              general idea of potential costs before engaging with roofing contractors.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              3. Estimate Disclaimer
            </h2>
            <p>
              <strong className="text-slate-100">Important:</strong> All estimates provided through this service are for
              informational purposes only and do not constitute a binding quote, bid, or contract.
              You acknowledge and agree that:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Estimates are based solely on the information you provide and may not reflect actual costs.</li>
              <li>Final pricing will be determined only after an on-site inspection by a licensed roofing contractor.</li>
              <li>Actual costs may vary significantly based on factors not visible in photos or disclosed during the estimate process.</li>
              <li>Material prices, labor costs, and other factors may change between the time of estimate and actual work.</li>
              <li>We make no guarantees regarding the accuracy of any estimate provided.</li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              4. User Responsibilities
            </h2>
            <p>
              When using our service, you agree to:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Provide accurate and truthful information about your property and roofing needs.</li>
              <li>Only submit information and photos for properties you own or have authorization to request estimates for.</li>
              <li>Not use the service for any unlawful purpose or in violation of any applicable laws.</li>
              <li>Not attempt to interfere with the proper functioning of the service.</li>
            </ul>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              5. Intellectual Property
            </h2>
            <p>
              All content, features, and functionality of this service, including but not limited to
              text, graphics, logos, and software, are owned by us or our licensors and are protected
              by intellectual property laws. You may not reproduce, distribute, or create derivative
              works without our express written permission.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              6. Photos and Content You Submit
            </h2>
            <p>
              By uploading photos or other content to our service, you grant us a non-exclusive,
              royalty-free license to use, store, and process that content for the purpose of
              providing our services. You represent that you have the right to submit any content
              you upload and that it does not infringe on any third-party rights.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              7. Third-Party Contractors
            </h2>
            <p>
              We may connect you with third-party roofing contractors. We do not employ, endorse,
              or guarantee the work of any contractor. Any agreement you enter into with a contractor
              is solely between you and that contractor. We are not responsible for the quality,
              safety, or legality of any work performed by third-party contractors.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, we shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising out of or related
              to your use of our service. Our total liability shall not exceed the amount you
              paid to use our service (if any) in the 12 months preceding the claim.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              9. Disclaimer of Warranties
            </h2>
            <p>
              Our service is provided &quot;as is&quot; and &quot;as available&quot; without any
              warranties of any kind, either express or implied, including but not limited to
              warranties of merchantability, fitness for a particular purpose, or non-infringement.
              We do not warrant that the service will be uninterrupted, error-free, or secure.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              10. Indemnification
            </h2>
            <p>
              You agree to indemnify and hold us harmless from any claims, damages, losses, or
              expenses (including reasonable attorney&apos;s fees) arising from your use of the
              service, your violation of these terms, or your violation of any rights of a third party.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              11. Modifications to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. We will notify
              users of material changes by posting the updated terms on this page with a new
              effective date. Your continued use of the service after changes are posted
              constitutes acceptance of the modified terms.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              12. Termination
            </h2>
            <p>
              We may terminate or suspend your access to our service at any time, without prior
              notice or liability, for any reason, including if you breach these Terms of Service.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              13. Governing Law
            </h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the
              laws of the state in which our company is registered, without regard to its conflict
              of law provisions.
            </p>

            <h2 className="mt-8 text-xl font-semibold text-slate-100">
              14. Contact Information
            </h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
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
