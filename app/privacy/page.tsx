import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Roofing Estimate Calculator',
  description: 'Privacy Policy for the Roofing Estimate Calculator',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Privacy Policy
        </h1>

        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-lg text-gray-600">
            Effective Date: January 1, 2025
          </p>

          <p className="text-gray-700">
            This Privacy Policy describes how we collect, use, and share information when you use
            our roofing estimate calculator service. We are committed to protecting your privacy
            and handling your data responsibly.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">
            1. Information We Collect
          </h2>
          <p className="text-gray-700">
            We collect the following types of information:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li><strong>Contact Information:</strong> Name, email address, phone number, and preferred contact method.</li>
            <li><strong>Property Information:</strong> Street address, city, state, ZIP code of the property requiring roofing services.</li>
            <li><strong>Project Details:</strong> Type of roofing work needed, roof material, size, pitch, number of stories, and any reported issues.</li>
            <li><strong>Photos:</strong> Images of your roof that you voluntarily upload to help us provide more accurate estimates.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our service, including pages visited and time spent.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">
            2. How We Use Your Information
          </h2>
          <p className="text-gray-700">
            We use the information we collect to:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>Generate accurate roofing estimates based on your property and project details.</li>
            <li>Contact you regarding your estimate and potential roofing services.</li>
            <li>Connect you with qualified roofing contractors in your area (with your consent).</li>
            <li>Improve our estimation algorithms and service quality.</li>
            <li>Send promotional communications if you have opted in to receive them.</li>
            <li>Comply with legal obligations and protect our rights.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">
            3. Information Sharing
          </h2>
          <p className="text-gray-700">
            We do not sell your personal information. We may share your information in the following circumstances:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our service (hosting, analytics).</li>
            <li><strong>Roofing Contractors:</strong> With licensed contractors who may provide quotes for your project (only with your consent).</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">
            4. Data Security
          </h2>
          <p className="text-gray-700">
            We implement appropriate technical and organizational measures to protect your personal
            information against unauthorized access, alteration, disclosure, or destruction. These
            measures include encryption, secure servers, and access controls. However, no method of
            transmission over the internet is 100% secure.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">
            5. Data Retention
          </h2>
          <p className="text-gray-700">
            We retain your personal information for as long as necessary to fulfill the purposes
            outlined in this policy, unless a longer retention period is required by law. Estimate
            data is typically retained for 2 years to allow for follow-up services and historical reference.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">
            6. Your Rights
          </h2>
          <p className="text-gray-700">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information.</li>
            <li><strong>Opt-out:</strong> Opt out of marketing communications at any time.</li>
          </ul>
          <p className="text-gray-700">
            To exercise these rights, please contact us using the information provided below.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">
            7. Cookies and Tracking
          </h2>
          <p className="text-gray-700">
            We use cookies and similar technologies to improve your experience, analyze usage patterns,
            and remember your preferences. You can control cookie settings through your browser preferences.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">
            8. Children&apos;s Privacy
          </h2>
          <p className="text-gray-700">
            Our service is not intended for children under 18 years of age. We do not knowingly
            collect personal information from children.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">
            9. Changes to This Policy
          </h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes by posting the new policy on this page and updating the effective date.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">
            10. Contact Us
          </h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy or wish to exercise your rights,
            please contact us:
          </p>
          <ul className="list-none space-y-1 pl-0 text-gray-700">
            <li>By phone: Contact us using the number provided on our website</li>
            <li>By using the contact form on our website</li>
          </ul>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
