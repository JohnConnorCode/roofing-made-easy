'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  BarChart3,
  Settings,
  CheckCircle,
  Shield,
  Kanban,
  Calculator,
  Mail,
  MessageSquare,
  Target,
  HelpCircle,
  FolderOpen,
  ClipboardList,
  Workflow,
  Home,
  Award,
  BookOpen,
  Layers,
  Bell,
  CreditCard,
  FileCheck,
  Map,
  Eye,
  ChevronRight,
  Receipt,
  FileSignature,
  Send,
  UserPlus,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'

const NAV_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'estimates', label: 'Estimates & Quotes', icon: Calculator },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'portal', label: 'Customer Portal', icon: Home },
  { id: 'team', label: 'Team', icon: UserPlus },
  { id: 'automations', label: 'Automations', icon: Workflow },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
]

export default function AdminFeaturesPage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)

      // Update active section based on scroll position
      const sections = NAV_SECTIONS.map(s => document.getElementById(s.id))
      const scrollPos = window.scrollY + 150

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(NAV_SECTIONS[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="-m-4 md:-m-8 min-h-screen bg-[#0c0f14]">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-40 bg-[#161a23]/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {NAV_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-[#c9a25c] text-[#0c0f14] font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <section.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-gradient-to-b from-[#1a1f2e] to-[#0c0f14] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0c0f14] border border-[#c9a25c]/40 px-4 py-2 text-sm text-[#c9a25c] mb-6">
            <BookOpen className="h-4 w-4" />
            Platform Guide
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            How to Use Your<br />
            <span className="text-[#c9a25c]">Roofing Business Platform</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Everything you need to know about managing leads, creating quotes,
            processing payments, and growing your business.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* DASHBOARD */}
        <section id="dashboard" className="mb-16 scroll-mt-20">
          <SectionHeader
            icon={BarChart3}
            title="Dashboard"
            subtitle="Your daily command center"
            link="/dashboard"
          />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">What You'll See</h3>
              <ul className="space-y-3">
                <FeatureItem>New leads this month with trend indicator</FeatureItem>
                <FeatureItem>Total pipeline value (active quotes)</FeatureItem>
                <FeatureItem>Win rate percentage</FeatureItem>
                <FeatureItem>Recent activity feed</FeatureItem>
                <FeatureItem>Lead sources breakdown</FeatureItem>
              </ul>
            </div>
            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">Three Views</h3>
              <div className="space-y-4">
                <ViewItem number="1" title="Overview" desc="Key metrics at a glance - check this daily" />
                <ViewItem number="2" title="Analytics" desc="Deeper charts, trends, and conversion funnels" />
                <ViewItem number="3" title="Velocity" desc="How fast deals move through your pipeline" />
              </div>
            </div>
          </div>
        </section>

        {/* LEADS */}
        <section id="leads" className="mb-16 scroll-mt-20">
          <SectionHeader
            icon={Users}
            title="Leads & Pipeline"
            subtitle="Track every opportunity"
            link="/leads"
          />

          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800 mb-6">
            <h3 className="text-white font-semibold mb-4">Lead Journey</h3>
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {[
                { label: 'New', color: 'bg-yellow-500', icon: Bell },
                { label: 'Intake', color: 'bg-blue-500', icon: ClipboardList },
                { label: 'Estimate Ready', color: 'bg-cyan-500', icon: Calculator },
                { label: 'Estimate Sent', color: 'bg-teal-500', icon: Send },
                { label: 'Quote Created', color: 'bg-green-500', icon: FileSignature },
                { label: 'Quote Sent', color: 'bg-purple-500', icon: Mail },
                { label: 'Won/Lost', color: 'bg-emerald-500', icon: Award },
              ].map((stage, i) => (
                <div key={stage.label} className="flex items-center">
                  <div className={`${stage.color} rounded-lg px-3 py-2 flex items-center gap-2`}>
                    <stage.icon className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-medium">{stage.label}</span>
                  </div>
                  {i < 6 && <ChevronRight className="h-4 w-4 text-slate-600 mx-1" />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <InfoCard title="List View" link="/leads">
              <p className="text-slate-400 text-sm mb-3">
                Sortable table with all your leads. Search, filter by status, and bulk export to CSV.
              </p>
              <FeatureItem>Search by name, email, city</FeatureItem>
              <FeatureItem>Filter by status or score</FeatureItem>
              <FeatureItem>Bulk select and update</FeatureItem>
            </InfoCard>
            <InfoCard title="Pipeline View" link="/leads/pipeline">
              <p className="text-slate-400 text-sm mb-3">
                Visual kanban board. Drag leads between stages and see value per column.
              </p>
              <FeatureItem>Drag-and-drop to change status</FeatureItem>
              <FeatureItem>See pipeline value per stage</FeatureItem>
              <FeatureItem>Click any card for details</FeatureItem>
            </InfoCard>
          </div>
        </section>

        {/* ESTIMATES & QUOTES */}
        <section id="estimates" className="mb-16 scroll-mt-20">
          <SectionHeader
            icon={Calculator}
            title="Estimates & Quotes"
            subtitle="From AI approximation to final pricing"
            link="/estimates"
          />

          {/* Key Difference Callout */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-green-500/10 border border-cyan-500/30 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#c9a25c]" />
              Estimate vs Quote - What's the Difference?
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#0c0f14]/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-cyan-400" />
                  <span className="text-cyan-400 font-semibold">Estimate</span>
                </div>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• AI-generated from intake data</li>
                  <li>• Price <strong>range</strong> (e.g., $10k - $15k)</li>
                  <li>• Sent automatically to give ballpark</li>
                  <li>• Customer can't sign this</li>
                </ul>
              </div>
              <div className="bg-[#0c0f14]/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileSignature className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Quote</span>
                </div>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• You create after reviewing lead</li>
                  <li>• <strong>Fixed price</strong> with line items</li>
                  <li>• Includes terms & payment schedule</li>
                  <li>• Customer signs to start work</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <InfoCard title="Line Items" link="/line-items" small>
              <p className="text-slate-400 text-sm">
                18 categories of materials, labor, and equipment. Set your costs here.
              </p>
            </InfoCard>
            <InfoCard title="Quote Templates" link="/macros" small>
              <p className="text-slate-400 text-sm">
                Pre-built bundles for common jobs. Apply with one click.
              </p>
            </InfoCard>
            <InfoCard title="Geographic Pricing" link="/pricing/geographic" small>
              <p className="text-slate-400 text-sm">
                Auto-adjust prices by region with multipliers.
              </p>
            </InfoCard>
          </div>
        </section>

        {/* INVOICES */}
        <section id="invoices" className="mb-16 scroll-mt-20">
          <SectionHeader
            icon={Receipt}
            title="Invoices"
            subtitle="Bill customers and track payments"
            link="/invoices"
          />
          <div className="grid md:grid-cols-2 gap-6">
            <InfoCard title="Creating Invoices">
              <ul className="space-y-2">
                <FeatureItem>Create from accepted quote (auto-fills)</FeatureItem>
                <FeatureItem>Deposit, progress, or final payment</FeatureItem>
                <FeatureItem>Online payment via Stripe</FeatureItem>
                <FeatureItem>Track paid/unpaid/overdue</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="Payment Flow">
              <div className="space-y-3">
                <FlowStep n="1">Customer accepts quote</FlowStep>
                <FlowStep n="2">You create deposit invoice (30-50%)</FlowStep>
                <FlowStep n="3">Customer pays online via portal</FlowStep>
                <FlowStep n="4">Work completes → final invoice</FlowStep>
                <FlowStep n="5">Fully paid → marked as Won</FlowStep>
              </div>
            </InfoCard>
          </div>
        </section>

        {/* MESSAGES */}
        <section id="messages" className="mb-16 scroll-mt-20">
          <SectionHeader
            icon={MessageSquare}
            title="Messages"
            subtitle="Scheduled & automated communications"
            link="/messages"
          />
          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
            <p className="text-slate-400 mb-4">
              View all scheduled emails and SMS. Messages are triggered by workflows or scheduled manually.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatusBadge color="yellow" label="Pending" desc="Waiting to send" />
              <StatusBadge color="blue" label="Processing" desc="Being sent now" />
              <StatusBadge color="green" label="Sent" desc="Delivered" />
              <StatusBadge color="red" label="Failed" desc="Error - can retry" />
            </div>
          </div>
        </section>

        {/* CUSTOMER PORTAL */}
        <section id="portal" className="mb-16 scroll-mt-20">
          <SectionHeader
            icon={Home}
            title="Customer Portal"
            subtitle="24/7 self-service for customers"
          />
          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800 mb-6">
            <h3 className="text-white font-semibold mb-4">What Customers Can Do</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PortalFeature icon={ClipboardList} title="Track Status" desc="See project progress" />
              <PortalFeature icon={FolderOpen} title="View Documents" desc="Quotes, contracts" />
              <PortalFeature icon={CreditCard} title="Pay Invoices" desc="Online via Stripe" />
              <PortalFeature icon={FileCheck} title="Insurance Help" desc="Storm claim workflow" />
            </div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4 text-sm text-slate-400">
            <strong className="text-white">How it works:</strong> Customers get a link via email/SMS → Create account → Access their project dashboard at <code className="text-[#c9a25c]">/portal</code>
          </div>
        </section>

        {/* TEAM */}
        <section id="team" className="mb-16 scroll-mt-20">
          <SectionHeader
            icon={UserPlus}
            title="Team Management"
            subtitle="Users, roles, and permissions"
            link="/team"
          />
          <div className="grid md:grid-cols-3 gap-4">
            <RoleCard
              icon={Shield}
              role="Admin"
              color="text-[#c9a25c]"
              desc="Full access to everything including settings and user management"
            />
            <RoleCard
              icon={Users}
              role="Sales Rep"
              color="text-blue-400"
              desc="Manage leads, create quotes, view assigned customers"
            />
            <RoleCard
              icon={Eye}
              role="Viewer"
              color="text-green-400"
              desc="Read-only access to dashboards and reports"
            />
          </div>
        </section>

        {/* AUTOMATIONS */}
        <section id="automations" className="mb-16 scroll-mt-20">
          <SectionHeader
            icon={Workflow}
            title="Automations"
            subtitle="Set it and forget it"
            link="/workflows"
          />
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <InfoCard title="Workflows" link="/workflows">
              <p className="text-slate-400 text-sm mb-3">
                Trigger-based automations. When X happens, do Y.
              </p>
              <AutomationExample
                trigger="New lead created"
                action="Send welcome email + notify rep"
              />
              <AutomationExample
                trigger="Quote sent + 3 days"
                action="Send follow-up SMS"
              />
            </InfoCard>
            <InfoCard title="Templates" link="/templates">
              <p className="text-slate-400 text-sm mb-3">
                Pre-written emails and SMS with variable substitution.
              </p>
              <FeatureItem>Email templates with branding</FeatureItem>
              <FeatureItem>SMS templates for quick messages</FeatureItem>
              <FeatureItem>Variables like {'{customer_name}'}</FeatureItem>
            </InfoCard>
          </div>
        </section>

        {/* SETTINGS */}
        <section id="settings" className="mb-16 scroll-mt-20">
          <SectionHeader
            icon={Settings}
            title="Settings"
            subtitle="Configure your platform"
            link="/settings"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <SettingsCard title="Company Info" desc="Name, logo, contact" />
            <SettingsCard title="Business Hours" desc="Operating schedule" />
            <SettingsCard title="Notifications" desc="Email/SMS preferences" />
            <SettingsCard title="Integrations" desc="Stripe, Twilio, etc." />
            <SettingsCard title="Pricing" desc="Base rates, markups" link="/pricing" />
            <SettingsCard title="Security" desc="Passwords, sessions" />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-16 scroll-mt-20">
          <SectionHeader
            icon={HelpCircle}
            title="Common Questions"
            subtitle="Quick answers"
          />
          <div className="space-y-3">
            <FAQ q="How do leads get into the system?">
              From your website funnel, manual entry, CSV import, or API integrations. All go through the same pipeline.
            </FAQ>
            <FAQ q="Can I customize pricing?">
              Yes. Set line item costs, labor rates, markup %, and regional multipliers in Pricing settings.
            </FAQ>
            <FAQ q="How do customers pay?">
              Via the customer portal using Stripe. You create an invoice, they click "Pay Now" and enter card info.
            </FAQ>
            <FAQ q="What if I need to refund?">
              Process refunds directly in your Stripe dashboard. The system will update automatically via webhook.
            </FAQ>
            <FAQ q="Can I export my data?">
              Yes. Export leads to CSV from the Leads page using bulk select.
            </FAQ>
          </div>
        </section>

      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-[#c9a25c] text-[#0c0f14] p-3 rounded-full shadow-lg hover:bg-[#b5893a] transition-colors z-50"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

// ============================================================================
// Helper Components
// ============================================================================

function SectionHeader({ icon: Icon, title, subtitle, link }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  link?: string
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="bg-[#c9a25c] rounded-lg p-2">
          <Icon className="h-5 w-5 text-[#0c0f14]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
      </div>
      {link && (
        <Link href={link} className="text-[#c9a25c] text-sm hover:underline flex items-center gap-1">
          Open <ExternalLink className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-300">
      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
      {children}
    </li>
  )
}

function ViewItem({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded bg-[#c9a25c] text-[#0c0f14] font-bold text-sm flex items-center justify-center flex-shrink-0">
        {number}
      </div>
      <div>
        <p className="text-white font-medium text-sm">{title}</p>
        <p className="text-slate-500 text-xs">{desc}</p>
      </div>
    </div>
  )
}

function InfoCard({ title, children, link, small }: {
  title: string
  children: React.ReactNode
  link?: string
  small?: boolean
}) {
  return (
    <div className={`bg-[#1a1f2e] rounded-xl border border-slate-800 ${small ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-white font-semibold ${small ? 'text-sm' : ''}`}>{title}</h3>
        {link && (
          <Link href={link} className="text-[#c9a25c] text-xs hover:underline">
            Open →
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

function FlowStep({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-5 h-5 rounded-full bg-slate-700 text-[#c9a25c] font-bold text-xs flex items-center justify-center">
        {n}
      </span>
      <span className="text-slate-300">{children}</span>
    </div>
  )
}

function StatusBadge({ color, label, desc }: { color: string; label: string; desc: string }) {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  }
  return (
    <div className="text-center">
      <div className={`w-3 h-3 rounded-full ${colors[color]} mx-auto mb-1`} />
      <p className="text-white text-sm font-medium">{label}</p>
      <p className="text-slate-500 text-xs">{desc}</p>
    </div>
  )
}

function PortalFeature({ icon: Icon, title, desc }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
}) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mx-auto mb-2">
        <Icon className="h-5 w-5 text-[#c9a25c]" />
      </div>
      <p className="text-white text-sm font-medium">{title}</p>
      <p className="text-slate-500 text-xs">{desc}</p>
    </div>
  )
}

function RoleCard({ icon: Icon, role, color, desc }: {
  icon: React.ComponentType<{ className?: string }>
  role: string
  color: string
  desc: string
}) {
  return (
    <div className="bg-[#1a1f2e] rounded-xl p-4 border border-slate-800">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className={`font-semibold ${color}`}>{role}</span>
      </div>
      <p className="text-slate-400 text-xs">{desc}</p>
    </div>
  )
}

function AutomationExample({ trigger, action }: { trigger: string; action: string }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 mb-2 text-xs">
      <p className="text-slate-500"><span className="text-[#c9a25c]">When:</span> {trigger}</p>
      <p className="text-slate-500"><span className="text-[#c9a25c]">Do:</span> {action}</p>
    </div>
  )
}

function SettingsCard({ title, desc, link }: { title: string; desc: string; link?: string }) {
  const content = (
    <div className="bg-[#1a1f2e] rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-colors">
      <p className="text-white text-sm font-medium">{title}</p>
      <p className="text-slate-500 text-xs">{desc}</p>
    </div>
  )

  if (link) {
    return <Link href={link}>{content}</Link>
  }
  return content
}

function FAQ({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group bg-[#1a1f2e] rounded-lg border border-slate-800">
      <summary className="flex items-center justify-between p-4 cursor-pointer text-white text-sm font-medium">
        {q}
        <ChevronRight className="h-4 w-4 text-slate-500 group-open:rotate-90 transition-transform" />
      </summary>
      <div className="px-4 pb-4 text-slate-400 text-sm">
        {children}
      </div>
    </details>
  )
}
