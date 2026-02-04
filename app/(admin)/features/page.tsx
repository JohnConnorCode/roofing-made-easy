'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Users,
  FileText,
  BarChart3,
  Settings,
  ArrowRight,
  CheckCircle,
  Shield,
  Kanban,
  Calculator,
  Mail,
  MessageSquare,
  RefreshCw,
  Target,
  HelpCircle,
  FolderOpen,
  ClipboardList,
  Workflow,
  Home,
  Award,
  BookOpen,
  Layers,
  MousePointer,
  Bell,
  CreditCard,
  FileCheck,
  Map,
  Eye,
  Filter,
  ChevronRight,
  Receipt,
  FileSignature,
  Send,
  UserPlus,
} from 'lucide-react'

export default function AdminFeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0c0f14]">
      {/* Hero - Platform Guide Header */}
      <section className="py-12 bg-[#161a23] border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1a1f2e] border border-[#c9a25c]/40 px-4 py-2 text-sm text-[#c9a25c]">
              <BookOpen className="h-4 w-4" />
              Platform Guide & Reference
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-100 md:text-4xl">
            Your Complete{' '}
            <span className="text-[#c9a25c]">Business Command Center</span>
          </h1>

          <p className="mt-4 text-lg text-slate-400 max-w-3xl">
            This guide walks you through every feature of your roofing business platform.
            From capturing your first lead to analyzing your quarterly performance.
          </p>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="border-b border-slate-800 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="text-center mb-4">
            <p className="text-sm text-slate-500 uppercase tracking-wide">Jump to Section</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Dashboard', href: '#dashboard' },
              { label: 'Leads & Pipeline', href: '#leads' },
              { label: 'Estimates & Quotes', href: '#estimates' },
              { label: 'Invoices', href: '#invoices' },
              { label: 'Messages', href: '#messages' },
              { label: 'Customer Portal', href: '#portal' },
              { label: 'Team', href: '#team' },
              { label: 'Automations', href: '#automations' },
              { label: 'Settings', href: '#settings' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 bg-[#1a1f2e] border border-slate-700 rounded-lg text-sm text-slate-300 hover:border-[#c9a25c]/50 hover:text-[#c9a25c] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Business Value Stats */}
      <section className="py-8 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#c9a25c]">3-4</div>
              <div className="text-xs text-slate-400 mt-1">Hours saved per day on admin work</div>
            </div>
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#c9a25c]">0</div>
              <div className="text-xs text-slate-400 mt-1">Leads that slip through the cracks</div>
            </div>
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#c9a25c]">24/7</div>
              <div className="text-xs text-slate-400 mt-1">Customer self-service access</div>
            </div>
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#c9a25c]">100%</div>
              <div className="text-xs text-slate-400 mt-1">Consistent, accurate pricing</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Dashboard Overview */}
      <section id="dashboard" className="py-12 md:py-16 bg-[#0c0f14] scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432]">
              <BarChart3 className="h-5 w-5 text-[#0c0f14]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Dashboard</h2>
              <p className="text-slate-500 text-sm">Your business at a glance</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-slate-400 mb-4">
                The dashboard is your daily command center. Open it first thing each morning to see what needs attention, track your pipeline health, and monitor team performance.
              </p>

              <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5 mb-4">
                <h3 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[#c9a25c]" />
                  Three Dashboard Views
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-[#c9a25c] font-bold text-sm">1</div>
                    <div>
                      <p className="text-slate-200 font-medium text-sm">Overview</p>
                      <p className="text-slate-500 text-xs">Key metrics, pipeline status, lead sources, and recent activity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-[#c9a25c] font-bold text-sm">2</div>
                    <div>
                      <p className="text-slate-200 font-medium text-sm">Analytics</p>
                      <p className="text-slate-500 text-xs">Deeper performance analysis, trend charts, conversion funnels</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-[#c9a25c] font-bold text-sm">3</div>
                    <div>
                      <p className="text-slate-200 font-medium text-sm">Velocity</p>
                      <p className="text-slate-500 text-xs">Pipeline movement speed, deal cycle, bottleneck identification</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1f2e] border border-[#c9a25c]/30 rounded-xl p-5">
                <h3 className="text-base font-semibold text-[#c9a25c] mb-3">Key Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">New Leads (MTD)</span>
                    <span className="text-slate-200">Leads created this month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Win Rate</span>
                    <span className="text-slate-200">Won deals / (Won + Lost)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pipeline Value</span>
                    <span className="text-slate-200">Sum of all active quotes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Conversion Rate</span>
                    <span className="text-slate-200">Quotes sent / Total Leads</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-slate-500 text-xs">Dashboard Preview</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
                  <div className="text-xl font-bold text-slate-100">23</div>
                  <div className="text-xs text-slate-500">New Leads</div>
                  <div className="text-xs text-green-400 mt-0.5">+15%</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
                  <div className="text-xl font-bold text-[#c9a25c]">$184k</div>
                  <div className="text-xs text-slate-500">Pipeline</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
                  <div className="text-xl font-bold text-[#3d7a5a]">68%</div>
                  <div className="text-xs text-slate-500">Win Rate</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
                  <div className="text-xl font-bold text-slate-100">8</div>
                  <div className="text-xs text-slate-500">Quotes Sent</div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-2">Pipeline by Status</div>
                <div className="space-y-1.5">
                  {[
                    { label: 'New', width: '60%', color: 'bg-[#c9a25c]' },
                    { label: 'Estimate Sent', width: '45%', color: 'bg-blue-500' },
                    { label: 'Quote Sent', width: '30%', color: 'bg-purple-500' },
                    { label: 'Won', width: '20%', color: 'bg-emerald-500' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-400">{item.label}</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: item.width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#c9a25c] hover:underline text-sm">
              Open Dashboard <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: Leads & Pipeline */}
      <section id="leads" className="py-12 md:py-16 bg-[#161a23] scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432]">
              <Users className="h-5 w-5 text-[#0c0f14]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Leads & Pipeline</h2>
              <p className="text-slate-500 text-sm">Track every opportunity from first contact to close</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 mb-3">
                <Filter className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-1">List View</h3>
              <p className="text-slate-400 text-sm mb-3">
                Sortable table with search, filters, and bulk actions. Export to CSV.
              </p>
              <Link href="/leads" className="text-[#c9a25c] text-sm hover:underline inline-flex items-center gap-1">
                Open Leads <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20 mb-3">
                <Kanban className="h-4 w-4 text-purple-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-1">Pipeline View</h3>
              <p className="text-slate-400 text-sm mb-3">
                Drag-and-drop kanban board. See pipeline value per stage.
              </p>
              <Link href="/leads/pipeline" className="text-[#c9a25c] text-sm hover:underline inline-flex items-center gap-1">
                Open Pipeline <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/20 mb-3">
                <Target className="h-4 w-4 text-green-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-1">Lead Scoring</h3>
              <p className="text-slate-400 text-sm mb-3">
                AI-powered scoring based on urgency, job size, and engagement.
              </p>
              <span className="text-slate-500 text-sm">Automatic on all leads</span>
            </div>
          </div>

          <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-6">Lead Lifecycle: From Inquiry to Close</h3>

            <div className="relative">
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-700 hidden md:block" />
              <div className="grid md:grid-cols-7 gap-3">
                {[
                  { status: 'New', desc: 'Just submitted', icon: Bell, color: 'bg-[#c9a25c]' },
                  { status: 'Intake', desc: 'Gathering info', icon: ClipboardList, color: 'bg-blue-500' },
                  { status: 'Estimate Ready', desc: 'AI-generated', icon: Calculator, color: 'bg-cyan-500' },
                  { status: 'Estimate Sent', desc: 'Customer received', icon: Send, color: 'bg-teal-500' },
                  { status: 'Quote Created', desc: 'Admin reviewed', icon: FileSignature, color: 'bg-green-500' },
                  { status: 'Quote Sent', desc: 'Awaiting decision', icon: Mail, color: 'bg-purple-500' },
                  { status: 'Won/Lost', desc: 'Deal closed', icon: Award, color: 'bg-emerald-500' },
                ].map((stage) => (
                  <div key={stage.status} className="text-center relative">
                    <div className={`w-10 h-10 ${stage.color} rounded-full flex items-center justify-center mx-auto mb-2 relative z-10`}>
                      <stage.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-slate-200 font-medium text-xs">{stage.status}</p>
                    <p className="text-slate-500 text-xs">{stage.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimate vs Quote Explanation */}
            <div className="mt-8 bg-slate-800/30 rounded-lg p-4 border border-[#c9a25c]/20">
              <h4 className="text-[#c9a25c] font-medium mb-3 flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Estimate vs Quote: What&apos;s the Difference?
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4 text-cyan-400" />
                    <span className="text-slate-200 font-medium">Estimate</span>
                  </div>
                  <ul className="space-y-1 text-slate-400 text-xs">
                    <li>- AI-generated price range from intake data</li>
                    <li>- Approximate, based on property/job details</li>
                    <li>- Sent automatically to give customer an idea</li>
                    <li>- Example: &quot;$10,000 - $15,000&quot;</li>
                  </ul>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSignature className="h-4 w-4 text-green-400" />
                    <span className="text-slate-200 font-medium">Quote</span>
                  </div>
                  <ul className="space-y-1 text-slate-400 text-xs">
                    <li>- Human-reviewed, final pricing</li>
                    <li>- Fixed price with detailed line items</li>
                    <li>- Includes terms, payment schedule, warranty</li>
                    <li>- Example: &quot;$12,500 total&quot;</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-slate-200 font-medium mb-3 flex items-center gap-2 text-sm">
                  <MousePointer className="h-4 w-4 text-[#c9a25c]" />
                  Quick Actions
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[#3d7a5a]" />
                    Change status with dropdown or drag
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[#3d7a5a]" />
                    Bulk select for mass updates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[#3d7a5a]" />
                    Export selected leads to CSV
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[#3d7a5a]" />
                    Click lead name for full detail
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-slate-200 font-medium mb-3 flex items-center gap-2 text-sm">
                  <Filter className="h-4 w-4 text-[#c9a25c]" />
                  Filter & Search
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[#3d7a5a]" />
                    Search by name, email, or city
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[#3d7a5a]" />
                    Filter by status or lead score
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[#3d7a5a]" />
                    Sort by date, name, or step
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-[#3d7a5a]" />
                    Pagination for large lists
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Estimates & Quotes */}
      <section id="estimates" className="py-12 md:py-16 bg-[#0c0f14] scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3d7a5a] to-[#2d5942]">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Estimates & Quotes</h2>
              <p className="text-slate-500 text-sm">From AI approximation to final pricing</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5 mb-4">
                <h3 className="text-base font-semibold text-slate-100 mb-3">18 Line Item Categories</h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    'Tear-Off', 'Underlayment', 'Shingles', 'Metal Roofing',
                    'Tile Roofing', 'Flat Roofing', 'Flashing', 'Ventilation',
                    'Gutters', 'Skylights', 'Chimneys', 'Decking',
                    'Insulation', 'Labor', 'Equipment', 'Disposal',
                    'Permits', 'Misc'
                  ].map((cat) => (
                    <div key={cat} className="bg-slate-800/50 rounded px-2 py-1 text-xs text-slate-300 text-center">
                      {cat}
                    </div>
                  ))}
                </div>
                <Link href="/line-items" className="text-[#c9a25c] text-sm hover:underline mt-3 inline-flex items-center gap-1">
                  Manage Line Items <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5 mb-4">
                <h3 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#c9a25c]" />
                  Quote Templates (Macros)
                </h3>
                <p className="text-slate-400 text-sm mb-3">
                  Pre-built bundles of line items for common job types. Apply a template to quickly build a quote.
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-[#3d7a5a]" />
                    <span className="text-slate-300 text-xs">Full Replacement - Asphalt Shingle</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-[#3d7a5a]" />
                    <span className="text-slate-300 text-xs">Storm Damage - Insurance Claim</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-[#3d7a5a]" />
                    <span className="text-slate-300 text-xs">Metal Roof - Standing Seam</span>
                  </div>
                </div>
                <Link href="/macros" className="text-[#c9a25c] text-sm hover:underline mt-3 inline-flex items-center gap-1">
                  Manage Templates <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
                <h3 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
                  <Map className="h-4 w-4 text-[#c9a25c]" />
                  Geographic Pricing
                </h3>
                <p className="text-slate-400 text-sm mb-3">
                  Set regional multipliers so pricing automatically adjusts for different service areas.
                </p>
                <Link href="/pricing/geographic" className="text-[#c9a25c] text-sm hover:underline inline-flex items-center gap-1">
                  Configure Regions <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div>
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5 mb-4">
                <h3 className="text-base font-semibold text-slate-100 mb-4">How the Process Works</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">1</div>
                    <div>
                      <p className="text-slate-200 font-medium text-sm">Lead submits intake form</p>
                      <p className="text-slate-500 text-xs">Property details, roof type, job type, photos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">2</div>
                    <div>
                      <p className="text-slate-200 font-medium text-sm">AI generates <span className="text-cyan-400">Estimate</span></p>
                      <p className="text-slate-500 text-xs">Approximate price range based on data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">3</div>
                    <div>
                      <p className="text-slate-200 font-medium text-sm">You review and create <span className="text-green-400">Quote</span></p>
                      <p className="text-slate-500 text-xs">Add line items, set final price, terms</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">4</div>
                    <div>
                      <p className="text-slate-200 font-medium text-sm">Send Quote PDF to customer</p>
                      <p className="text-slate-500 text-xs">Professional document with your branding</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1f2e] border border-[#c9a25c]/30 rounded-xl p-5">
                <h3 className="text-base font-semibold text-[#c9a25c] mb-3">Pricing Configuration</h3>
                <p className="text-slate-400 text-sm mb-3">
                  Control how quotes are calculated from the Pricing page.
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-slate-700/50">
                    <span className="text-slate-400 text-xs">Base material costs</span>
                    <span className="text-slate-200 text-xs">Per unit pricing</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-700/50">
                    <span className="text-slate-400 text-xs">Labor rates</span>
                    <span className="text-slate-200 text-xs">Per hour/per square</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-700/50">
                    <span className="text-slate-400 text-xs">Markup percentage</span>
                    <span className="text-slate-200 text-xs">Your profit margin</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400 text-xs">Regional multipliers</span>
                    <span className="text-slate-200 text-xs">Location-based adjustments</span>
                  </div>
                </div>
                <Link href="/pricing" className="text-[#c9a25c] text-sm hover:underline mt-3 inline-flex items-center gap-1">
                  Configure Pricing <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Invoices (NEW) */}
      <section id="invoices" className="py-12 md:py-16 bg-[#161a23] scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Invoices</h2>
              <p className="text-slate-500 text-sm">Bill customers and track payments</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-4">Invoice Management</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-200 text-sm">Create invoices from accepted quotes</p>
                    <p className="text-slate-500 text-xs">Automatically pull line items and pricing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-200 text-sm">Multiple payment types</p>
                    <p className="text-slate-500 text-xs">Deposit, progress payment, final payment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-200 text-sm">Stripe integration</p>
                    <p className="text-slate-500 text-xs">Online card payments with automatic receipts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-200 text-sm">Payment status tracking</p>
                    <p className="text-slate-500 text-xs">Draft, sent, paid, overdue, refunded</p>
                  </div>
                </div>
              </div>
              <Link href="/invoices" className="text-[#c9a25c] text-sm hover:underline mt-4 inline-flex items-center gap-1">
                Manage Invoices <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-4">Payment Flow</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-[#c9a25c] font-bold text-xs">1</div>
                  <div>
                    <p className="text-slate-300 text-sm">Quote accepted by customer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-[#c9a25c] font-bold text-xs">2</div>
                  <div>
                    <p className="text-slate-300 text-sm">Create deposit invoice (typically 30-50%)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-[#c9a25c] font-bold text-xs">3</div>
                  <div>
                    <p className="text-slate-300 text-sm">Customer pays online via portal</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-[#c9a25c] font-bold text-xs">4</div>
                  <div>
                    <p className="text-slate-300 text-sm">Work completes, send final invoice</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-[#c9a25c] font-bold text-xs">5</div>
                  <div>
                    <p className="text-slate-300 text-sm">Lead marked as &quot;Won&quot; when fully paid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Messages (NEW) */}
      <section id="messages" className="py-12 md:py-16 bg-[#0c0f14] scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Messages</h2>
              <p className="text-slate-500 text-sm">Scheduled and automated communication queue</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-4">Message Queue</h3>
              <p className="text-slate-400 text-sm mb-4">
                View and manage all scheduled emails and SMS messages. Messages are triggered by workflows or can be scheduled manually.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a]" />
                  <span className="text-slate-300 text-sm">See pending, sent, and failed messages</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a]" />
                  <span className="text-slate-300 text-sm">Cancel scheduled messages before they send</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a]" />
                  <span className="text-slate-300 text-sm">Retry failed messages</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a]" />
                  <span className="text-slate-300 text-sm">View message content and recipient</span>
                </div>
              </div>
              <Link href="/messages" className="text-[#c9a25c] text-sm hover:underline mt-4 inline-flex items-center gap-1">
                View Message Queue <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-4">Message Statuses</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div>
                    <span className="text-slate-200 text-sm font-medium">Pending</span>
                    <span className="text-slate-500 text-sm ml-2">Scheduled, waiting to send</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div>
                    <span className="text-slate-200 text-sm font-medium">Processing</span>
                    <span className="text-slate-500 text-sm ml-2">Currently being sent</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div>
                    <span className="text-slate-200 text-sm font-medium">Sent</span>
                    <span className="text-slate-500 text-sm ml-2">Successfully delivered</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div>
                    <span className="text-slate-200 text-sm font-medium">Failed</span>
                    <span className="text-slate-500 text-sm ml-2">Delivery error, can retry</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Customer Portal */}
      <section id="portal" className="py-12 md:py-16 bg-[#161a23] scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Customer Portal</h2>
              <p className="text-slate-500 text-sm">24/7 self-service for your customers</p>
            </div>
          </div>

          <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">What Customers Can Do</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 mx-auto mb-2">
                  <ClipboardList className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="text-slate-200 font-medium text-sm mb-1">Track Status</h4>
                <p className="text-slate-500 text-xs">See project progress and next steps</p>
              </div>

              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 mx-auto mb-2">
                  <FolderOpen className="h-6 w-6 text-green-400" />
                </div>
                <h4 className="text-slate-200 font-medium text-sm mb-1">View Documents</h4>
                <p className="text-slate-500 text-xs">Access quotes, contracts, warranties</p>
              </div>

              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 mx-auto mb-2">
                  <CreditCard className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="text-slate-200 font-medium text-sm mb-1">Pay Invoices</h4>
                <p className="text-slate-500 text-xs">Online payment via Stripe</p>
              </div>

              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 mx-auto mb-2">
                  <FileCheck className="h-6 w-6 text-orange-400" />
                </div>
                <h4 className="text-slate-200 font-medium text-sm mb-1">Insurance Help</h4>
                <p className="text-slate-500 text-xs">Guided workflow for storm claims</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-3">Business Value</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-200 text-sm">Fewer &quot;status check&quot; phone calls</p>
                    <p className="text-slate-500 text-xs">Customers get answers 24/7</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-200 text-sm">Higher financing conversion</p>
                    <p className="text-slate-500 text-xs">Easy pre-qualification removes objections</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-200 text-sm">Professional experience</p>
                    <p className="text-slate-500 text-xs">Branded portal builds trust</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-3">How Customers Access</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-[#c9a25c] font-bold text-xs">1</div>
                  <p className="text-slate-300 text-sm">Receive link via email/SMS</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-[#c9a25c] font-bold text-xs">2</div>
                  <p className="text-slate-300 text-sm">Create account or log in</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-[#c9a25c] font-bold text-xs">3</div>
                  <p className="text-slate-300 text-sm">Access their project dashboard</p>
                </div>
              </div>
              <p className="text-slate-500 text-xs mt-3">
                Portal URL: <code className="text-[#c9a25c]">/portal</code>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Team Management */}
      <section id="team" className="py-12 md:py-16 bg-[#0c0f14] scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Team Management</h2>
              <p className="text-slate-500 text-sm">Organize your team and control access</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-3">User Roles</h3>
              <div className="space-y-3">
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-[#c9a25c]/20 flex items-center justify-center">
                      <Shield className="h-3 w-3 text-[#c9a25c]" />
                    </div>
                    <span className="text-slate-200 font-medium text-sm">Admin</span>
                  </div>
                  <p className="text-slate-500 text-xs">Full access to all features and user management</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Users className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-slate-200 font-medium text-sm">Sales Rep</span>
                  </div>
                  <p className="text-slate-500 text-xs">Manage leads, create quotes, view customers</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Eye className="h-3 w-3 text-green-400" />
                    </div>
                    <span className="text-slate-200 font-medium text-sm">Viewer</span>
                  </div>
                  <p className="text-slate-500 text-xs">Read-only access to dashboards and reports</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-3">Team Features</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a]" />
                  <span className="text-slate-300 text-sm">Invite users via email</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a]" />
                  <span className="text-slate-300 text-sm">Assign leads to team members</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a]" />
                  <span className="text-slate-300 text-sm">Track activity and performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a]" />
                  <span className="text-slate-300 text-sm">Create teams for organization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#3d7a5a]" />
                  <span className="text-slate-300 text-sm">Deactivate users without data loss</span>
                </div>
              </div>
              <Link href="/team" className="text-[#c9a25c] text-sm hover:underline mt-4 inline-flex items-center gap-1">
                Manage Team <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Automations */}
      <section id="automations" className="py-12 md:py-16 bg-[#161a23] scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700">
              <Workflow className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Automations & Communications</h2>
              <p className="text-slate-500 text-sm">Set it and forget it workflows</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/20 mb-3">
                <Workflow className="h-4 w-4 text-orange-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-1">Workflows</h3>
              <p className="text-slate-400 text-sm mb-3">
                Trigger-based automations. When X happens, do Y automatically.
              </p>
              <Link href="/workflows" className="text-[#c9a25c] text-sm hover:underline inline-flex items-center gap-1">
                Manage Workflows <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 mb-3">
                <Mail className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-1">Email Templates</h3>
              <p className="text-slate-400 text-sm mb-3">
                Pre-written emails with variable substitution.
              </p>
              <Link href="/templates" className="text-[#c9a25c] text-sm hover:underline inline-flex items-center gap-1">
                Manage Templates <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/20 mb-3">
                <MessageSquare className="h-4 w-4 text-green-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-1">SMS Templates</h3>
              <p className="text-slate-400 text-sm mb-3">
                Text message templates for quick communication.
              </p>
              <Link href="/templates" className="text-[#c9a25c] text-sm hover:underline inline-flex items-center gap-1">
                Manage Templates <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Example Automations</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-slate-200 font-medium mb-2 text-sm">New Lead Welcome</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[#c9a25c]">Trigger:</span> New lead created
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[#c9a25c]">Action:</span> Send welcome email
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[#c9a25c]">Then:</span> Notify assigned rep
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-slate-200 font-medium mb-2 text-sm">Quote Follow-up</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[#c9a25c]">Trigger:</span> Quote sent + 3 days
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[#c9a25c]">Condition:</span> Status still &quot;Quote Sent&quot;
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[#c9a25c]">Action:</span> Send follow-up SMS
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-slate-200 font-medium mb-2 text-sm">Estimate Ready</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[#c9a25c]">Trigger:</span> AI estimate generated
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[#c9a25c]">Action:</span> Email estimate to customer
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[#c9a25c]">Then:</span> Update status to &quot;Estimate Sent&quot;
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-slate-200 font-medium mb-2 text-sm">Won Deal</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[#c9a25c]">Trigger:</span> Status changed to &quot;Won&quot;
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[#c9a25c]">Action:</span> Send thank-you email
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[#c9a25c]">Then:</span> Notify team
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: Settings */}
      <section id="settings" className="py-12 md:py-16 bg-[#0c0f14] scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-700">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Settings & Configuration</h2>
              <p className="text-slate-500 text-sm">Customize the platform for your business</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-2">Company Info</h3>
              <p className="text-slate-400 text-sm mb-3">
                Business name, logo, contact info, and branding.
              </p>
              <Link href="/settings" className="text-[#c9a25c] text-sm hover:underline inline-flex items-center gap-1">
                Edit Company Info <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-2">Business Hours</h3>
              <p className="text-slate-400 text-sm mb-3">
                Operating hours for automations and customer expectations.
              </p>
              <Link href="/settings" className="text-[#c9a25c] text-sm hover:underline inline-flex items-center gap-1">
                Set Hours <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-2">Notifications</h3>
              <p className="text-slate-400 text-sm mb-3">
                Email and SMS notification preferences for your team.
              </p>
              <Link href="/settings" className="text-[#c9a25c] text-sm hover:underline inline-flex items-center gap-1">
                Notification Settings <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-2">Integrations</h3>
              <p className="text-slate-400 text-sm mb-3">
                Connect Stripe, Twilio, Resend, and OpenAI.
              </p>
              <Link href="/settings" className="text-[#c9a25c] text-sm hover:underline inline-flex items-center gap-1">
                Manage Integrations <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-2">Pricing Rules</h3>
              <p className="text-slate-400 text-sm mb-3">
                Base costs, markups, tax rates, and pricing formulas.
              </p>
              <Link href="/pricing" className="text-[#c9a25c] text-sm hover:underline inline-flex items-center gap-1">
                Configure Pricing <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-2">Security</h3>
              <p className="text-slate-400 text-sm mb-3">
                Password requirements, sessions, and access logs.
              </p>
              <Link href="/settings" className="text-[#c9a25c] text-sm hover:underline inline-flex items-center gap-1">
                Security Settings <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-[#161a23]">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#1a1f2e] border border-slate-700 mb-4">
              <HelpCircle className="h-6 w-6 text-[#c9a25c]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">
              Common Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'What\'s the difference between an Estimate and a Quote?',
                a: 'An Estimate is AI-generated from the intake form - it\'s an approximate price range (e.g., $10k-$15k). A Quote is the final pricing you create after reviewing the lead - it has fixed pricing, line items, and terms. Estimates help customers know ballpark cost quickly; Quotes are what they sign to start work.',
              },
              {
                q: 'How do leads get into the system?',
                a: 'Leads come from your website funnel (homepage form), direct API integrations, manual entry, or CSV import. Every lead goes through the same pipeline regardless of source.',
              },
              {
                q: 'Can I customize the pricing line items?',
                a: 'Yes. Go to Line Items to add, edit, or remove any item. Each item has material cost, labor cost, and equipment cost. Create templates (Macros) to bundle items for quick quote creation.',
              },
              {
                q: 'How do customers access the portal?',
                a: 'Customers receive a link via email or SMS. They create an account with their email and password, then can access their project status, documents, invoices, and financing options 24/7.',
              },
              {
                q: 'What integrations are supported?',
                a: 'Stripe for payments, Twilio for SMS, Resend for transactional emails, and OpenAI for AI features. Configure API keys in Settings > Integrations.',
              },
              {
                q: 'How is pricing calculated?',
                a: 'Base line item costs x quantities + labor + equipment + markup percentage + regional adjustments + tax. Everything is configurable in Pricing settings.',
              },
              {
                q: 'Can I export my data?',
                a: 'Yes. Export leads to CSV from the Leads page. Use bulk select to choose which leads to export. All data belongs to you.',
              },
              {
                q: 'How do automations work?',
                a: 'Set triggers (status change, time delay, form submission) and actions (send email, send SMS, update status, notify team). Workflows run automatically in the background.',
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group bg-[#1a1f2e] border border-slate-700 rounded-xl"
              >
                <summary className="flex items-center justify-between cursor-pointer p-4 text-slate-100 font-medium text-sm">
                  {item.q}
                  <span className="ml-4 text-[#c9a25c] transition-transform group-open:rotate-180">&#x25BC;</span>
                </summary>
                <div className="px-4 pb-4 text-slate-400 text-sm">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Footer */}
      <section className="py-12 bg-[#0c0f14] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-xl font-bold text-slate-100 mb-6">
            Quick Links
          </h2>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-sm">
            <Link href="/dashboard" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Dashboard
            </Link>
            <Link href="/leads" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Leads
            </Link>
            <Link href="/leads/pipeline" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Pipeline
            </Link>
            <Link href="/estimates" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Estimates
            </Link>
            <Link href="/invoices" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Invoices
            </Link>
            <Link href="/messages" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Messages
            </Link>
            <Link href="/customers" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Customers
            </Link>
            <Link href="/line-items" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Line Items
            </Link>
            <Link href="/macros" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Templates
            </Link>
            <Link href="/pricing" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Pricing
            </Link>
            <Link href="/team" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Team
            </Link>
            <Link href="/workflows" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Workflows
            </Link>
            <Link href="/templates" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Email/SMS
            </Link>
            <Link href="/settings" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Settings
            </Link>
            <Link href="/pricing/geographic" className="text-slate-400 hover:text-[#c9a25c] transition-colors">
              Regions
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
