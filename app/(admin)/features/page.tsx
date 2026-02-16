'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  BarChart3,
  Settings,
  CheckCircle,
  Shield,
  Calculator,
  Mail,
  HelpCircle,
  ClipboardList,
  Workflow,
  Home,
  Award,
  BookOpen,
  Bell,
  Eye,
  ChevronRight,
  Receipt,
  FileSignature,
  Send,
  UserPlus,
  ChevronUp,
  ExternalLink,
  Hammer,
  CalendarDays,
  CheckSquare,
  Users2,
  PieChart,
  Sparkles,
  DollarSign,
  HardHat,
  Briefcase,
  UserCog,
} from 'lucide-react'

const NAV_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'estimates', label: 'Estimates', icon: Calculator },
  { id: 'jobs', label: 'Jobs', icon: Hammer },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'customers', label: 'Customers', icon: Users2 },
  { id: 'communications', label: 'Comms', icon: Mail },
  { id: 'automations', label: 'Automations', icon: Workflow },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'portal', label: 'Portal', icon: Home },
  { id: 'ai', label: 'AI', icon: Sparkles },
  { id: 'team', label: 'Team', icon: UserPlus },
  { id: 'reports', label: 'Reports', icon: PieChart },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
]

export default function AdminFeaturesPage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setShowBackToTop(window.scrollY > 400)
          const sections = NAV_SECTIONS.map(s => document.getElementById(s.id))
          const scrollPos = window.scrollY + 150
          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i]
            if (section && section.offsetTop <= scrollPos) {
              setActiveSection(NAV_SECTIONS[i].id)
              break
            }
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="-m-4 md:-m-8 min-h-screen bg-[#0c0f14] overflow-x-hidden">
      {/* Sticky Navigation */}
      <nav aria-label="Platform guide sections" className="sticky top-16 md:top-0 z-40 bg-[#161a23]/95 backdrop-blur border-b border-slate-800">
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
                <span>{section.label}</span>
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
            Everything you need to know about managing leads, running jobs, tracking finances, and delivering a great customer experience — all powered by AI.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* ══════════════════════════════════════════════════════════ */}
        <SectionDivider label="Core Business Workflow" />
        {/* ══════════════════════════════════════════════════════════ */}

        {/* DASHBOARD */}
        <section id="dashboard" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={BarChart3}
            title="Dashboard"
            subtitle="Your daily command center"
            link="/dashboard"
          />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">What You&apos;ll See</h3>
              <ul className="space-y-3">
                <FeatureItem>New leads this month with trend indicator</FeatureItem>
                <FeatureItem>Total pipeline value (active quotes)</FeatureItem>
                <FeatureItem>Win rate percentage</FeatureItem>
                <FeatureItem>Recent activity feed</FeatureItem>
                <FeatureItem>Lead sources breakdown</FeatureItem>
                <FeatureItem>Global search — press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">&#8984;K</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">Ctrl+K</kbd> to find anything</FeatureItem>
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
        <section id="leads" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
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

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <InfoCard title="List View" link="/leads">
              <p className="text-slate-400 text-sm mb-3">
                Sortable table with all your leads. Search, filter by status, and bulk export to CSV.
              </p>
              <ul className="space-y-2">
                <FeatureItem>Search by name, email, city</FeatureItem>
                <FeatureItem>Filter by status or score</FeatureItem>
                <FeatureItem>Bulk select and update</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="Pipeline View" link="/leads/pipeline">
              <p className="text-slate-400 text-sm mb-3">
                Visual kanban board. Drag leads between stages and see value per column.
              </p>
              <ul className="space-y-2">
                <FeatureItem>Drag-and-drop to change status</FeatureItem>
                <FeatureItem>See pipeline value per stage</FeatureItem>
                <FeatureItem>Click any card for details</FeatureItem>
              </ul>
            </InfoCard>
          </div>

          <InfoCard title="Lead Scoring">
            <p className="text-slate-400 text-sm mb-3">
              Every lead is automatically scored based on key signals, grouped into Hot, Warm, and Cold tiers.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {['Job type', 'Timeline urgency', 'Photos uploaded', 'Insurance claim', 'Roof size'].map((factor) => (
                <div key={factor} className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <p className="text-slate-300 text-xs">{factor}</p>
                </div>
              ))}
            </div>
          </InfoCard>
        </section>

        {/* ESTIMATES & QUOTES */}
        <section id="estimates" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Calculator}
            title="Estimates & Quotes"
            subtitle="From AI approximation to final pricing"
            link="/estimates"
          />

          <div className="bg-gradient-to-r from-cyan-500/10 to-green-500/10 border border-cyan-500/30 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#c9a25c]" />
              Estimate vs Quote — What&apos;s the Difference?
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
                  <li>• Customer can&apos;t sign this</li>
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
            <InfoCard title="Geographic Pricing" link="/rate-management/geographic" small>
              <p className="text-slate-400 text-sm">
                Auto-adjust prices by region with multipliers.
              </p>
            </InfoCard>
          </div>
        </section>

        {/* JOBS */}
        <section id="jobs" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Hammer}
            title="Jobs Management"
            subtitle="Track every project from start to warranty"
            link="/jobs"
          />

          {/* Job Lifecycle */}
          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800 mb-6">
            <h3 className="text-white font-semibold mb-4">Job Lifecycle</h3>
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {[
                { label: 'Pending Start', color: 'bg-slate-500' },
                { label: 'Materials Ordered', color: 'bg-amber-500' },
                { label: 'Scheduled', color: 'bg-blue-500' },
                { label: 'In Progress', color: 'bg-indigo-500' },
                { label: 'Inspection Pending', color: 'bg-purple-500' },
                { label: 'Punch List', color: 'bg-orange-500' },
                { label: 'Completed', color: 'bg-green-500' },
                { label: 'Warranty Active', color: 'bg-teal-500' },
                { label: 'Closed', color: 'bg-slate-400' },
              ].map((status, i) => (
                <div key={status.label} className="flex items-center">
                  <div className={`${status.color} rounded-lg px-3 py-1.5`}>
                    <span className="text-white text-xs font-medium">{status.label}</span>
                  </div>
                  {i < 8 && <ChevronRight className="h-3 w-3 text-slate-600 mx-0.5" />}
                </div>
              ))}
            </div>
          </div>

          {/* Views + Detail Page */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <InfoCard title="Views" link="/jobs">
              <p className="text-slate-400 text-sm mb-3">
                Two ways to manage your active jobs.
              </p>
              <ul className="space-y-2">
                <FeatureItem>Table view with search, status filter, and pagination</FeatureItem>
                <FeatureItem>Kanban board with drag-and-drop columns</FeatureItem>
                <FeatureItem>Quick-access job details on click</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="Job Detail Page">
              <p className="text-slate-400 text-sm mb-3">
                Every job has 9 tabs for full project management.
              </p>
              <TabPreview tabs={['Overview', 'Billing', 'Change Orders', 'Documents', 'Time Tracking', 'Daily Logs', 'Expenses', 'Communications', 'Status History']} />
            </InfoCard>
          </div>

          {/* Key sub-features */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <InfoCard title="Progress Billing" small>
              <ul className="space-y-2">
                <FeatureItem>Billing schedules (30/50/20, 50/50)</FeatureItem>
                <FeatureItem>Milestone-triggered invoicing</FeatureItem>
                <FeatureItem>Financial rollups per job</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="Change Orders" small>
              <ul className="space-y-2">
                <FeatureItem>Create with cost delta</FeatureItem>
                <FeatureItem>Approve/reject workflow</FeatureItem>
                <FeatureItem>Tracks impact on contract amount</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="Lien Waivers" small>
              <ul className="space-y-2">
                <FeatureItem>Conditional &amp; unconditional waivers</FeatureItem>
                <FeatureItem>PDF download</FeatureItem>
                <FeatureItem>Status tracking per payment</FeatureItem>
              </ul>
            </InfoCard>
          </div>

          {/* Tracking */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <InfoCard title="Time Tracking">
              <ul className="space-y-2">
                <FeatureItem>Clock in/out per employee per job</FeatureItem>
                <FeatureItem>Break minutes and total hours calculation</FeatureItem>
                <FeatureItem>Edit/void entries with audit trail</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="Daily Logs">
              <ul className="space-y-2">
                <FeatureItem>Crew members and work performed</FeatureItem>
                <FeatureItem>Hours, weather conditions, delays</FeatureItem>
                <FeatureItem>Materials used and safety incidents</FeatureItem>
              </ul>
            </InfoCard>
          </div>

          <InfoCard title="Expense Tracking">
            <p className="text-slate-400 text-sm mb-3">
              Track every dollar spent on a job across 7 categories.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Materials', 'Labor', 'Subcontractor', 'Permit', 'Equipment', 'Disposal', 'Other'].map((cat) => (
                <div key={cat} className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <p className="text-slate-300 text-xs">{cat}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-3">
              Vendor tracking, receipt uploads, and approval workflow included.
            </p>
          </InfoCard>
        </section>

        {/* INVOICES & BILLING */}
        <section id="invoices" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Receipt}
            title="Invoices & Billing"
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
                <FeatureItem>Progress billing integration with jobs</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="Payment Flow">
              <div className="space-y-3">
                <FlowStep n="1">Customer accepts quote</FlowStep>
                <FlowStep n="2">You create deposit invoice (30-50%)</FlowStep>
                <FlowStep n="3">Customer pays online via portal</FlowStep>
                <FlowStep n="4">Progress invoices at milestones</FlowStep>
                <FlowStep n="5">Work completes → final invoice</FlowStep>
                <FlowStep n="6">Record payments and mark paid</FlowStep>
              </div>
            </InfoCard>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        <SectionDivider label="Planning & Scheduling" />
        {/* ══════════════════════════════════════════════════════════ */}

        {/* CALENDAR */}
        <section id="calendar" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={CalendarDays}
            title="Calendar"
            subtitle="Schedule and track everything"
            link="/calendar"
          />
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <InfoCard title="Calendar Views" link="/calendar">
              <p className="text-slate-400 text-sm mb-3">
                Month, week, and day views with navigation (prev / next / today). Events shown on grid with &quot;+X more&quot; overflow.
              </p>
              <ul className="space-y-2">
                <FeatureItem>Click any date to create an event</FeatureItem>
                <FeatureItem>Drag events to reschedule</FeatureItem>
                <FeatureItem>Filter by event type</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="Event Types">
              <div className="space-y-2">
                {[
                  { label: 'Appointment', color: 'bg-blue-500' },
                  { label: 'Job Work', color: 'bg-purple-500' },
                  { label: 'Inspection', color: 'bg-amber-500' },
                  { label: 'Material Delivery', color: 'bg-green-500' },
                  { label: 'Crew Meeting', color: 'bg-indigo-500' },
                  { label: 'Other', color: 'bg-slate-400' },
                ].map((type) => (
                  <div key={type.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${type.color}`} />
                    <span className="text-slate-300 text-sm">{type.label}</span>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>
          <InfoCard title="Team Schedule" link="/calendar/team">
            <p className="text-slate-400 text-sm">
              View team availability and resource allocation. See who&apos;s assigned to what and identify scheduling conflicts.
            </p>
          </InfoCard>
        </section>

        {/* TASKS */}
        <section id="tasks" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={CheckSquare}
            title="Tasks"
            subtitle="Assign, track, and complete work"
            link="/tasks"
          />
          <div className="grid md:grid-cols-2 gap-6">
            <InfoCard title="Task Features" link="/tasks">
              <p className="text-slate-400 text-sm mb-3">
                7 task types with priority levels, assignees, due dates, and linked records.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {['Call', 'Email', 'Site Visit', 'Follow-up', 'Internal', 'Meeting', 'Inspection'].map((t) => (
                  <div key={t} className="bg-slate-800/50 rounded px-2 py-1 text-center">
                    <span className="text-slate-300 text-xs">{t}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Low', color: 'text-slate-400' },
                  { label: 'Medium', color: 'text-blue-400' },
                  { label: 'High', color: 'text-amber-400' },
                  { label: 'Urgent', color: 'text-red-400' },
                ].map((p) => (
                  <span key={p.label} className={`text-xs font-medium ${p.color}`}>{p.label}</span>
                ))}
              </div>
            </InfoCard>
            <InfoCard title="Task Workflow">
              <p className="text-slate-400 text-sm mb-3">
                Track tasks from creation to completion.
              </p>
              <div className="flex flex-wrap gap-2 items-center mb-4">
                {['Pending', 'In Progress', 'Completed', 'Cancelled'].map((s, i) => (
                  <div key={s} className="flex items-center">
                    <span className="bg-slate-800 rounded px-2 py-1 text-xs text-slate-300">{s}</span>
                    {i < 2 && <ChevronRight className="h-3 w-3 text-slate-600 mx-1" />}
                    {i === 2 && <span className="text-slate-600 text-xs mx-1">/</span>}
                  </div>
                ))}
              </div>
              <ul className="space-y-2">
                <FeatureItem>Summary cards showing counts per status</FeatureItem>
                <FeatureItem>Overdue tracking with alerts</FeatureItem>
                <FeatureItem>Link tasks to leads or customers</FeatureItem>
              </ul>
            </InfoCard>
          </div>
        </section>

        {/* CUSTOMERS */}
        <section id="customers" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Users2}
            title="Customers"
            subtitle="Manage your customer base"
            link="/customers"
          />
          <InfoCard title="Customer Management" link="/customers">
            <p className="text-slate-400 text-sm mb-3">
              Central hub for all customer data with search, stats, and full relationship history.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2">
                <FeatureItem>Search by name, email, or phone</FeatureItem>
                <FeatureItem>Summary stats — total customers, lifetime value, won deals</FeatureItem>
              </ul>
              <ul className="space-y-2">
                <FeatureItem>Customer detail shows all associated leads, invoices, and jobs</FeatureItem>
                <FeatureItem>Contact history and communication log</FeatureItem>
              </ul>
            </div>
          </InfoCard>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        <SectionDivider label="Communication & Automation" />
        {/* ══════════════════════════════════════════════════════════ */}

        {/* COMMUNICATIONS */}
        <section id="communications" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Mail}
            title="Communications"
            subtitle="Control all outbound messaging"
            link="/communications"
          />
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <InfoCard title="Email & SMS Templates" link="/communications">
              <p className="text-slate-400 text-sm mb-3">
                Edit all system email and SMS templates from one place. Customize wording, preview emails, and reset to defaults.
              </p>
              <ul className="space-y-2">
                <FeatureItem>Edit email subject lines and body content</FeatureItem>
                <FeatureItem>SMS character counter with segment tracking</FeatureItem>
                <FeatureItem>Preview emails before sending</FeatureItem>
                <FeatureItem>Reset any template to its default</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="Estimate Content" link="/communications">
              <p className="text-slate-400 text-sm mb-3">
                Customize the text that appears on customer-facing estimates and quotes.
              </p>
              <ul className="space-y-2">
                <FeatureItem>Edit warranty descriptions</FeatureItem>
                <FeatureItem>Customize scope of work text</FeatureItem>
                <FeatureItem>Update payment terms and conditions</FeatureItem>
                <FeatureItem>Changes reflect instantly on quotes</FeatureItem>
              </ul>
            </InfoCard>
          </div>

          {/* Message Queue */}
          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800 mb-6">
            <h3 className="text-white font-semibold mb-3">Message Queue</h3>
            <p className="text-slate-400 text-sm mb-4">
              View all scheduled emails and SMS. Messages are triggered by workflows or scheduled manually.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatusBadge color="yellow" label="Pending" desc="Waiting to send" />
              <StatusBadge color="blue" label="Processing" desc="Being sent now" />
              <StatusBadge color="green" label="Sent" desc="Delivered" />
              <StatusBadge color="red" label="Failed" desc="Error - can retry" />
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-lg p-4 text-sm text-slate-400">
            <strong className="text-white">Variable System:</strong> Use placeholders like <code className="text-[#c9a25c]">{'{'}{'{'} customer_name {'}'}{'}'}</code> in templates. They get replaced with real values when messages are sent. See the Variables tab in Communications for the full reference.
          </div>
        </section>

        {/* AUTOMATIONS */}
        <section id="automations" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Workflow}
            title="Automations"
            subtitle="Set it and forget it"
            link="/workflows"
          />
          <div className="grid md:grid-cols-2 gap-6">
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
              <AutomationExample
                trigger="Invoice overdue + 7 days"
                action="Send payment reminder"
              />
              <AutomationExample
                trigger="Job status → Completed"
                action="Send warranty info + request review"
              />
            </InfoCard>
            <InfoCard title="Scheduled Messages" link="/messages">
              <p className="text-slate-400 text-sm mb-3">
                View and manage all scheduled and sent messages triggered by workflows.
              </p>
              <ul className="space-y-2">
                <FeatureItem>See pending, sent, and failed messages</FeatureItem>
                <FeatureItem>Retry failed deliveries</FeatureItem>
                <FeatureItem>Track email and SMS delivery status</FeatureItem>
              </ul>
            </InfoCard>
          </div>
        </section>

        {/* NOTIFICATIONS & SEARCH */}
        <section id="notifications" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Bell}
            title="Notifications & Search"
            subtitle="Stay informed, find anything"
          />
          <div className="grid md:grid-cols-2 gap-6">
            <InfoCard title="Notification Bell">
              <p className="text-slate-400 text-sm mb-3">
                Real-time badge with unread count. 13 event types across 4 priority levels.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mb-3">
                {[
                  'New lead', 'Task assigned', 'Task overdue', 'Job status changed',
                  'Calendar reminder', 'Invoice paid', 'Invoice overdue', 'Invoice created',
                  'Estimate accepted', 'Message received', 'Customer registered',
                  'Change order', 'System alert',
                ].map((type) => (
                  <span key={type} className="text-xs text-slate-400">• {type}</span>
                ))}
              </div>
              <div className="flex gap-3">
                {[
                  { label: 'Low', color: 'text-slate-400' },
                  { label: 'Normal', color: 'text-blue-400' },
                  { label: 'High', color: 'text-amber-400' },
                  { label: 'Urgent', color: 'text-red-400' },
                ].map((p) => (
                  <span key={p.label} className={`text-xs font-medium ${p.color}`}>{p.label}</span>
                ))}
              </div>
            </InfoCard>
            <InfoCard title="Global Search">
              <p className="text-slate-400 text-sm mb-3">
                Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">&#8984;K</kbd> (Mac) or <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">Ctrl+K</kbd> (Windows) to open the search modal.
              </p>
              <ul className="space-y-2">
                <FeatureItem>Searches across leads, jobs, invoices, and customers</FeatureItem>
                <FeatureItem>Results grouped by type with icons</FeatureItem>
                <FeatureItem>Debounced input for fast results</FeatureItem>
                <FeatureItem>Full keyboard navigation</FeatureItem>
              </ul>
            </InfoCard>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        <SectionDivider label="Customer Experience" />
        {/* ══════════════════════════════════════════════════════════ */}

        {/* CUSTOMER PORTAL */}
        <section id="portal" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Home}
            title="Customer Portal"
            subtitle="24/7 self-service for customers"
          />

          {/* Portal Overview */}
          <div className="bg-slate-800/30 rounded-lg p-4 text-sm text-slate-400 mb-6">
            <strong className="text-white">How it works:</strong> Customer gets a link via email/SMS → Creates account → Accesses portal at <code className="text-[#c9a25c]">/portal</code>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Dashboard', 'Project', 'Financing', 'Insurance', 'Programs', 'Invoices', 'Settings'].map((s) => (
                <span key={s} className="bg-slate-700/50 rounded px-2 py-1 text-xs text-slate-300">{s}</span>
              ))}
            </div>
          </div>

          {/* Quote Funnel + Project Tracking */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <InfoCard title="Quote Funnel (Public)">
              <p className="text-slate-400 text-sm mb-3">
                11-step intake that generates an AI estimate for new customers.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                {['Property', 'Job Type', 'Address', 'Measurements', 'Roof Details', 'Issues', 'Photos', 'Timeline', 'Details', 'Contact', 'AI Estimate'].map((step) => (
                  <span key={step} className="bg-slate-800/50 rounded px-2 py-1 text-xs text-slate-400 text-center">{step}</span>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-3">Photo upload with AI analysis. PDF download and share.</p>
            </InfoCard>
            <InfoCard title="Project Tracking">
              <p className="text-slate-400 text-sm mb-3">
                Customers see real-time progress on their roofing project.
              </p>
              <ul className="space-y-2">
                <FeatureItem>Job progress timeline with status updates</FeatureItem>
                <FeatureItem>Photo and document hub</FeatureItem>
                <FeatureItem>Next-step guidance at each stage</FeatureItem>
              </ul>
            </InfoCard>
          </div>

          {/* Financial Tools */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <InfoCard title="Financing Center" small>
              <ul className="space-y-2">
                <FeatureItem>Payment calculator (term, rate, monthly)</FeatureItem>
                <FeatureItem>AI payment scenarios (3 pre-built)</FeatureItem>
                <FeatureItem>Affordability analyzer</FeatureItem>
                <FeatureItem>Pre-qualification form</FeatureItem>
                <FeatureItem>Application status tracking</FeatureItem>
                <FeatureItem>AI financing advisor chat</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="Insurance Claims" small>
              <ul className="space-y-2">
                <FeatureItem>Claim tracker with 6-stage timeline</FeatureItem>
                <FeatureItem>AI claim letter generator (initial / supplement / appeal)</FeatureItem>
                <FeatureItem>Coverage gap calculator (RCV vs ACV)</FeatureItem>
                <FeatureItem>Deductible modeling</FeatureItem>
                <FeatureItem>20+ insurance company directory</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="Assistance Programs" small>
              <ul className="space-y-2">
                <FeatureItem>60+ programs database</FeatureItem>
                <FeatureItem>Eligibility screener (income, age, veteran, disability)</FeatureItem>
                <FeatureItem>Program search &amp; filter</FeatureItem>
                <FeatureItem>Benefit calculator</FeatureItem>
                <FeatureItem>AI program advisor</FeatureItem>
              </ul>
            </InfoCard>
          </div>

          <InfoCard title="Invoice Portal">
            <p className="text-slate-400 text-sm">
              Customers view all invoices with status badges, make payments via Stripe, and track their balance — all from the portal.
            </p>
          </InfoCard>
        </section>

        {/* AI FEATURES */}
        <section id="ai" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Sparkles}
            title="AI Features"
            subtitle="Intelligence built into every workflow"
          />
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <InfoCard title="AI Estimation" small>
              <ul className="space-y-2">
                <FeatureItem>Price ranges from intake data</FeatureItem>
                <FeatureItem>Based on 50,000+ projects</FeatureItem>
                <FeatureItem>Pricing factor breakdown</FeatureItem>
                <FeatureItem>Material recommendations</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="AI Photo Analysis" small>
              <ul className="space-y-2">
                <FeatureItem>Detects roof material and condition</FeatureItem>
                <FeatureItem>Identifies damage from photos</FeatureItem>
                <FeatureItem>Measurement detection</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="AI Claim Letters" small>
              <ul className="space-y-2">
                <FeatureItem>Initial claim filing</FeatureItem>
                <FeatureItem>Supplement request</FeatureItem>
                <FeatureItem>Appeal letter</FeatureItem>
                <FeatureItem>Auto-fills customer data</FeatureItem>
              </ul>
            </InfoCard>
          </div>
          <InfoCard title="3 AI Advisor Chatbots">
            <p className="text-slate-400 text-sm mb-3">
              Context-aware advisors that know the customer&apos;s situation and provide actionable guidance.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-green-400 text-sm font-medium mb-1">Financing Advisor</p>
                <p className="text-slate-400 text-xs">Knows estimate, credit, income, and insurance details. Suggests payment plans.</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-blue-400 text-sm font-medium mb-1">Insurance Advisor</p>
                <p className="text-slate-400 text-xs">Knows claim, deductible, and coverage. Guides through the claims process.</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-purple-400 text-sm font-medium mb-1">Assistance Advisor</p>
                <p className="text-slate-400 text-xs">Knows location, income, and eligibility. Finds applicable programs.</p>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-3">All advisors include suggested questions and actionable links.</p>
          </InfoCard>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        <SectionDivider label="Administration" />
        {/* ══════════════════════════════════════════════════════════ */}

        {/* TEAM & ROLES */}
        <section id="team" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={UserPlus}
            title="Team & Roles"
            subtitle="Users, roles, and permissions"
            link="/team"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <RoleCard
              icon={Shield}
              role="Admin"
              color="text-[#c9a25c]"
              desc="Full access to everything including settings and user management"
            />
            <RoleCard
              icon={UserCog}
              role="Manager"
              color="text-purple-400"
              desc="Team management, reporting, most admin capabilities except destructive actions"
            />
            <RoleCard
              icon={Briefcase}
              role="Sales Rep"
              color="text-blue-400"
              desc="Manage leads, create quotes, view assigned customers"
            />
            <RoleCard
              icon={HardHat}
              role="Crew Lead"
              color="text-green-400"
              desc="Job supervision, task management, calendar access"
            />
            <RoleCard
              icon={Eye}
              role="Crew"
              color="text-teal-400"
              desc="View-only for most things, can update assigned tasks and view calendar"
            />
          </div>
        </section>

        {/* REPORTS */}
        <section id="reports" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={PieChart}
            title="Reports & Analytics"
            subtitle="Data-driven insights"
            link="/reports"
          />
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <InfoCard title="Revenue Reports" link="/reports" small>
              <ul className="space-y-2">
                <FeatureItem>Monthly trends and growth tracking</FeatureItem>
                <FeatureItem>Revenue by job type and team</FeatureItem>
                <FeatureItem>Forecasting</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="A/R Aging" link="/reports" small>
              <ul className="space-y-2">
                <FeatureItem>Aging buckets: Current, 1-30, 31-60, 61-90, 90+ days</FeatureItem>
                <FeatureItem>Collection priority indicators</FeatureItem>
                <FeatureItem>Late payment tracking</FeatureItem>
              </ul>
            </InfoCard>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <InfoCard title="Lead Funnel" small>
              <ul className="space-y-2">
                <FeatureItem>Conversion funnel from New through Won</FeatureItem>
                <FeatureItem>Conversion rate analysis</FeatureItem>
                <FeatureItem>Stage velocity tracking</FeatureItem>
              </ul>
            </InfoCard>
            <InfoCard title="Profitability" small>
              <ul className="space-y-2">
                <FeatureItem>Cost breakdown per job</FeatureItem>
                <FeatureItem>Margin analysis</FeatureItem>
                <FeatureItem>Team profitability</FeatureItem>
              </ul>
            </InfoCard>
          </div>
          <InfoCard title="Export">
            <p className="text-slate-400 text-sm">
              Export all reports to CSV with date range filtering.
            </p>
          </InfoCard>
        </section>

        {/* PRICING */}
        <section id="pricing" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={DollarSign}
            title="Pricing"
            subtitle="Rates, line items, and geographic adjustments"
            link="/rate-management"
          />
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <InfoCard title="Base Rates" link="/rate-management" small>
              <p className="text-slate-400 text-sm">
                Pricing rules, multipliers, flat fees, and unit types (SQ, SF, LF, EA, HR).
              </p>
            </InfoCard>
            <InfoCard title="Line Items" link="/line-items" small>
              <p className="text-slate-400 text-sm">
                18 categories of materials, labor, and equipment. Waste factor, formulas, taxable flags.
              </p>
            </InfoCard>
            <InfoCard title="Geographic Pricing" link="/rate-management/geographic" small>
              <p className="text-slate-400 text-sm">
                Regional multipliers by location. Auto-adjust pricing for your service area.
              </p>
            </InfoCard>
          </div>
          <InfoCard title="Estimate Templates (Macros)" link="/macros">
            <p className="text-slate-400 text-sm">
              Pre-built bundles for common job types — replacement, repair, storm damage. Apply with one click. Usage tracking included.
            </p>
          </InfoCard>
        </section>

        {/* SETTINGS */}
        <section id="settings" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Settings}
            title="Settings"
            subtitle="Configure your platform"
            link="/settings"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <SettingsCard title="Company Info" desc="Name, logo, contact" />
            <SettingsCard title="Business Hours" desc="Operating schedule" />
            <SettingsCard title="Notifications" desc="Email/SMS preferences" />
            <SettingsCard title="Integrations" desc="Stripe, Twilio, etc." />
            <SettingsCard title="Pricing" desc="Base rates, markups" link="/rate-management" />
            <SettingsCard title="Security" desc="Passwords, sessions" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <InfoCard title="Content Strategy" link="/content-strategy" small>
              <p className="text-slate-400 text-sm">
                Blog content planning, topic research, and publishing calendar for your roofing website.
              </p>
            </InfoCard>
            <InfoCard title="SEO Strategy" link="/seo-strategy" small>
              <p className="text-slate-400 text-sm">
                Search engine optimization tools — keyword tracking, local SEO, service area pages, and ranking insights.
              </p>
            </InfoCard>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        <SectionDivider label="Help" />
        {/* ══════════════════════════════════════════════════════════ */}

        {/* FAQ */}
        <section id="faq" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
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
              Via the customer portal using Stripe. You create an invoice, they click &quot;Pay Now&quot; and enter card info.
            </FAQ>
            <FAQ q="What if I need to refund?">
              Process refunds directly in your Stripe dashboard. The system will update automatically via webhook.
            </FAQ>
            <FAQ q="Can I export my data?">
              Yes. Export leads to CSV from the Leads page, and export all reports with date range filtering.
            </FAQ>
            <FAQ q="How does job management work?">
              When a quote is accepted, a job is created automatically. Track it through 9 statuses — from Pending Start through Completed to Warranty Active. Manage billing, change orders, time tracking, daily logs, and expenses from the job detail page.
            </FAQ>
            <FAQ q="What AI features are included?">
              Photo analysis, estimate generation from intake data, 3 AI advisor chatbots (financing, insurance, assistance), and an AI claim letter generator for initial claims, supplements, and appeals.
            </FAQ>
            <FAQ q="What can customers do in the portal?">
              Track their project progress, manage insurance claims and financing, browse assistance programs, pay invoices, and chat with AI advisors — all from a self-service portal.
            </FAQ>
            <FAQ q="How do notifications work?">
              A real-time bell icon shows unread count. 13 event types fire automatically from business events — new leads, task assignments, job status changes, invoice payments, and more. 4 priority levels: Low, Normal, High, Urgent.
            </FAQ>
            <FAQ q="How does the calendar work?">
              Schedule appointments, job work, inspections, material deliveries, and crew meetings. View by month, week, or day. Use the team schedule view to check availability and avoid conflicts.
            </FAQ>
          </div>
        </section>

      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
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

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 my-12">
      <div className="flex-1 h-px bg-slate-800" />
      <span className="text-slate-500 text-xs font-medium uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  )
}

function TabPreview({ tabs }: { tabs: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tabs.map((tab) => (
        <span key={tab} className="bg-slate-800 rounded-full px-2.5 py-1 text-xs text-slate-300">
          {tab}
        </span>
      ))}
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
