'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import {
  Home,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
} from 'lucide-react'
import { SiteFooter } from '@/components/layout/site-footer'
import { BUSINESS_CONFIG, getFullAddress, getPhoneDisplay } from '@/lib/config/business'

const PHONE_NUMBER = getPhoneDisplay()
const EMAIL = BUSINESS_CONFIG.email.primary
const ADDRESS = getFullAddress()

export default function ContactPage() {
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)
    showToast('Message sent successfully! We\'ll be in touch soon.', 'success')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0c0f14]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] shadow-lg">
                <Home className="h-6 w-6 text-[#0c0f14]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100">Farrell Roofing</h1>
                <p className="text-xs text-slate-500">Tupelo, Mississippi</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/about" className="text-sm text-slate-400 hover:text-[#c9a25c]">About</Link>
              <Link href="/services" className="text-sm text-slate-400 hover:text-[#c9a25c]">Services</Link>
              <Link href="/service-areas" className="text-sm text-slate-400 hover:text-[#c9a25c]">Areas</Link>
              <Link href="/blog" className="text-sm text-slate-400 hover:text-[#c9a25c]">Resources</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              Get In Touch
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              Have questions? Need a quote? We're here to help. Reach out and we'll respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-slate-100 mb-8">Contact Information</h2>

              <div className="space-y-6">
                <a
                  href={`tel:${PHONE_NUMBER.replace(/\D/g, '')}`}
                  className="flex items-start gap-4 p-4 bg-[#1a1f2e] border border-slate-700 rounded-xl hover:border-[#c9a25c] transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#c9a25c]/20">
                    <Phone className="h-6 w-6 text-[#c9a25c]" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">Phone</p>
                    <p className="text-slate-400">{PHONE_NUMBER}</p>
                    <p className="text-xs text-slate-500 mt-1">Mon-Fri 8am-6pm, Sat 9am-2pm</p>
                  </div>
                </a>

                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-start gap-4 p-4 bg-[#1a1f2e] border border-slate-700 rounded-xl hover:border-[#c9a25c] transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#c9a25c]/20">
                    <Mail className="h-6 w-6 text-[#c9a25c]" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">Email</p>
                    <p className="text-slate-400">{EMAIL}</p>
                    <p className="text-xs text-slate-500 mt-1">We respond within 24 hours</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 bg-[#1a1f2e] border border-slate-700 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#c9a25c]/20">
                    <MapPin className="h-6 w-6 text-[#c9a25c]" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">Office</p>
                    <p className="text-slate-400">{ADDRESS}</p>
                    <p className="text-xs text-slate-500 mt-1">By appointment only</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-[#1a1f2e] border border-slate-700 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#c9a25c]/20">
                    <Clock className="h-6 w-6 text-[#c9a25c]" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">Emergency Service</p>
                    <p className="text-slate-400">24/7 for existing customers</p>
                    <p className="text-xs text-slate-500 mt-1">Storm damage? Call anytime.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-[#c9a25c]/20 to-transparent border border-[#c9a25c]/30 rounded-xl">
                <h3 className="font-semibold text-slate-100 mb-2">Prefer a quick estimate?</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Get an instant price range for your roofing project in under 2 minutes.
                </p>
                <Link href="/">
                  <Button
                    variant="primary"
                    className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  >
                    Get Free Estimate
                  </Button>
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-slate-100 mb-8">Send Us a Message</h2>

              {isSubmitted ? (
                <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-[#3d7a5a]/20 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-[#3d7a5a]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">Message Sent!</h3>
                  <p className="text-slate-400 mb-6">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                    onClick={() => {
                      setIsSubmitted(false)
                      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Phone"
                      name="phone"
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Subject"
                    name="subject"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />

                  <Textarea
                    label="Message"
                    name="message"
                    placeholder="Tell us about your project or question..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                    isLoading={isSubmitting}
                    leftIcon={!isSubmitting ? <Send className="h-5 w-5" /> : undefined}
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
