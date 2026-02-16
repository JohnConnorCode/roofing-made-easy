'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  DollarSign,
  Shield,
  HandHeart,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ChevronDown,
  Hammer,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { useCustomerStore } from '@/stores/customerStore'
import { CustomerNotificationBell } from '@/components/customer/CustomerNotificationBell'

const NAV_ITEMS = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/portal/project', label: 'Project', icon: Hammer },
  { href: '/portal/financing', label: 'Financing', icon: DollarSign },
  { href: '/portal/insurance', label: 'Insurance', icon: Shield },
  { href: '/portal/assistance', label: 'Programs', icon: HandHeart },
  { href: '/portal/invoices', label: 'Invoices', icon: FileText },
  { href: '/portal/settings', label: 'Settings', icon: Settings },
]

export default function CustomerLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false)
  const { customer, linkedLeads, selectedLeadId, setSelectedLeadId, resetCustomerStore } = useCustomerStore()

  // Monitor auth state changes
  useEffect(() => {
    if (pathname.startsWith('/customer/')) return

    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
        resetCustomerStore()
        router.push('/customer/login?expired=true')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router, resetCustomerStore])

  const handleLogout = async () => {
    resetCustomerStore() // Clear PII first — even if signOut fails
    const supabase = createClient()
    await supabase.auth.signOut().catch(() => {})
    router.push('/customer/login')
  }

  // Get the current property name
  const currentProperty = linkedLeads.find((l) => l.lead_id === selectedLeadId)
  const propertyName = currentProperty?.nickname ||
    currentProperty?.lead?.property?.formatted_address ||
    currentProperty?.lead?.property?.street_address ||
    'Select Property'

  // Check if current nav item is active
  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  // Don't show portal nav on auth pages
  if (pathname.startsWith('/customer/login') || pathname.startsWith('/customer/register')) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-800 bg-ink px-4 md:hidden">
        <Link href="/portal">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-1">
          <CustomerNotificationBell />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-300"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-ink md:hidden">
          {/* Property selector */}
          {linkedLeads.length > 0 && (
            <div className="border-b border-slate-800 p-4">
              <p className="mb-2 text-xs text-slate-500 uppercase tracking-wider">Property</p>
              <button
                onClick={() => setIsPropertyDropdownOpen(!isPropertyDropdownOpen)}
                className="flex w-full items-center justify-between rounded-lg bg-slate-deep px-4 py-3 text-slate-100"
              >
                <span className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gold-light" />
                  <span className="truncate">{propertyName}</span>
                </span>
                <ChevronDown className={cn(
                  'h-4 w-4 text-slate-500 transition-transform',
                  isPropertyDropdownOpen && 'rotate-180'
                )} />
              </button>
              {isPropertyDropdownOpen && linkedLeads.length > 1 && (
                <div className="mt-2 space-y-1">
                  {linkedLeads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => {
                        setSelectedLeadId(lead.lead_id)
                        setIsPropertyDropdownOpen(false)
                      }}
                      className={cn(
                        'w-full rounded-lg px-4 py-2 text-left text-sm',
                        lead.lead_id === selectedLeadId
                          ? 'bg-gold-light/10 text-gold-light'
                          : 'text-slate-400 hover:bg-slate-800'
                      )}
                    >
                      {lead.nickname || lead.lead?.property?.street_address || 'Property'}
                      {lead.is_primary && (
                        <span className="ml-2 text-xs text-slate-500">(Primary)</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <nav className="flex flex-col p-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-lg',
                  isActive(item.href, item.exact)
                    ? 'bg-gold-light/10 text-gold-light'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="mt-4 flex items-center gap-3 rounded-lg px-4 py-3 text-lg text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-ink md:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
              <Link href="/portal">
                <Logo size="sm" />
              </Link>
              <CustomerNotificationBell />
            </div>

            {/* Property selector */}
            {linkedLeads.length > 0 && (
              <div className="border-b border-slate-800 p-4">
                <p className="mb-2 text-xs text-slate-500 uppercase tracking-wider">Property</p>
                <button
                  onClick={() => setIsPropertyDropdownOpen(!isPropertyDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-lg bg-slate-deep px-3 py-2 text-sm text-slate-100 hover:bg-[#242938]"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Home className="h-4 w-4 text-gold-light shrink-0" />
                    <span className="truncate">{propertyName}</span>
                  </span>
                  <ChevronDown className={cn(
                    'h-4 w-4 text-slate-500 transition-transform shrink-0',
                    isPropertyDropdownOpen && 'rotate-180'
                  )} />
                </button>
                {isPropertyDropdownOpen && linkedLeads.length > 1 && (
                  <div className="mt-2 space-y-1">
                    {linkedLeads.map((lead) => (
                      <button
                        key={lead.id}
                        onClick={() => {
                          setSelectedLeadId(lead.lead_id)
                          setIsPropertyDropdownOpen(false)
                        }}
                        className={cn(
                          'w-full rounded-lg px-3 py-2 text-left text-sm',
                          lead.lead_id === selectedLeadId
                            ? 'bg-gold-light/10 text-gold-light'
                            : 'text-slate-400 hover:bg-slate-800'
                        )}
                      >
                        <span className="block truncate">
                          {lead.nickname || lead.lead?.property?.street_address || 'Property'}
                        </span>
                        {lead.is_primary && (
                          <span className="text-xs text-slate-500">Primary</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <nav className="flex-1 p-4">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors',
                        isActive(item.href, item.exact)
                          ? 'bg-gold-light/10 text-gold-light'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User section */}
            <div className="border-t border-slate-800 p-4">
              {customer && (
                <div className="mb-3 px-4">
                  <p className="text-sm font-medium text-slate-200">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{customer.email}</p>
                </div>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                onClick={handleLogout}
                leftIcon={<LogOut className="h-5 w-5" />}
              >
                Log Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
