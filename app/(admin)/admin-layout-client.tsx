'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  LogOut,
  Menu,
  X,
  Kanban,
  List,
  Users2,
  Settings,
  FileText,
  Tag,
  Map,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  UserCog,
  Mail,
  Zap,
  ClipboardList,
  BookOpen,
  Receipt,
  MessageSquare,
  TrendingUp,
  Globe,
  Hammer,
  CalendarDays,
  Bell,
  BarChart3,
  PieChart,
  Target,
  Clock,
  Shield,
  Landmark,
  FileCheck,
  Package,
  Crosshair,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AdminLogo } from '@/components/ui/admin-logo'
import { NotificationBell } from '@/components/admin/notification-bell'
import { GlobalSearch } from '@/components/admin/global-search'
import {
  getNavClasses,
  getChildNavClasses,
  getParentNavClasses,
} from '@/lib/styles/admin-theme'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/leads',
    label: 'Leads',
    icon: Users,
    children: [
      { href: '/leads/pipeline', label: 'Pipeline View', icon: Kanban },
      { href: '/leads', label: 'All Leads', icon: List },
      { href: '/estimates', label: 'Estimates', icon: ClipboardList },
      { href: '/invoices', label: 'Invoices', icon: Receipt },
      { href: '/messages', label: 'Messages', icon: MessageSquare },
    ],
  },
  { href: '/jobs', label: 'Jobs', icon: Hammer },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/customers', label: 'Customers', icon: Users2 },
  { href: '/team', label: 'Team', icon: UserCog },
  {
    href: '/automation',
    label: 'Automation',
    icon: Zap,
    children: [
      { href: '/workflows', label: 'Workflows', icon: Zap },
      { href: '/communications', label: 'Communications', icon: Mail },
    ],
  },
  {
    href: '/rate-management',
    label: 'Pricing',
    icon: DollarSign,
    children: [
      { href: '/rate-management', label: 'Base Rates', icon: DollarSign },
      { href: '/rate-management/geographic', label: 'Geographic', icon: Map },
      { href: '/line-items', label: 'Line Items', icon: Tag },
      { href: '/macros', label: 'Estimate Templates', icon: FileText },
    ],
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: BarChart3,
    children: [
      { href: '/reports', label: 'Overview', icon: PieChart },
      { href: '/reports/funnel', label: 'Funnel Analytics', icon: Target },
      { href: '/reports/revenue', label: 'Revenue', icon: TrendingUp },
      { href: '/reports/aging', label: 'AR Aging', icon: DollarSign },
      { href: '/reports/lead-response', label: 'Lead Response', icon: Clock },
      { href: '/reports/operations', label: 'Operations', icon: Hammer },
      { href: '/reports/team', label: 'Team', icon: Users },
      { href: '/reports/insurance-claims', label: 'Insurance Claims', icon: Shield },
      { href: '/reports/financing', label: 'Financing', icon: Landmark },
      { href: '/reports/estimate-accuracy', label: 'Estimate Accuracy', icon: Crosshair },
      { href: '/reports/document-compliance', label: 'Doc Compliance', icon: FileCheck },
      { href: '/reports/material-costs', label: 'Material Costs', icon: Package },
    ],
  },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/content-strategy', label: 'Content Strategy', icon: TrendingUp },
  { href: '/seo-strategy', label: 'SEO Strategy', icon: Globe },
  { href: '/features', label: 'Platform Guide', icon: BookOpen },
]

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Auto-expand parent menu items based on current path
  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) =>
          pathname === child.href || (child.href !== '/' && pathname.startsWith(child.href))
        )
        if (isChildActive) {
          setExpandedItems((prev) => new Set([...prev, item.href]))
        }
      }
    })
  }, [pathname])

  // Monitor auth state changes (session expiration)
  useEffect(() => {
    if (pathname === '/login') return

    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
        router.push('/login?expired=true')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Sign out failed, redirect to login anyway
    }
    router.push('/login')
  }

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(href)) {
        newSet.delete(href)
      } else {
        newSet.add(href)
      }
      return newSet
    })
  }

  const isActive = (href: string, exactMatch: boolean = false) => {
    if (exactMatch) {
      return pathname === href
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  // Don't show admin nav on login page
  if (pathname === '/login') {
    return <>{children}</>
  }

  const renderNavItem = (item: NavItem, isMobile: boolean = false) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.href)
    const isItemActive = hasChildren
      ? item.children!.some((child) => isActive(child.href, child.href === '/leads' || child.href === '/rate-management'))
      : isActive(item.href, item.href === '/leads' || item.href === '/rate-management')

    if (hasChildren) {
      return (
        <li key={item.href}>
          <button
            onClick={() => toggleExpanded(item.href)}
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-lg px-4 py-2.5 transition-colors',
              getParentNavClasses(isItemActive, isMobile)
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              <span className={isMobile ? 'text-lg' : ''}>{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <ul className={cn('mt-1 space-y-1', isMobile ? 'ml-4' : 'ml-7')}>
              {item.children!.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    onClick={() => isMobile && setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-2 transition-colors',
                      getChildNavClasses(
                        isActive(child.href, child.href === '/leads' || child.href === '/rate-management'),
                        isMobile
                      )
                    )}
                  >
                    <child.icon className="h-4 w-4" />
                    <span className={cn('text-sm', isMobile && 'text-base')}>{child.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      )
    }

    return (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className={cn(
            'flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors',
            getNavClasses(isActive(item.href), isMobile)
          )}
        >
          <item.icon className="h-5 w-5" />
          <span className={isMobile ? 'text-lg' : ''}>{item.label}</span>
        </Link>
      </li>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-slate-800 px-4 md:hidden">
        <AdminLogo size="sm" />
        <div className="flex items-center gap-2">
          <GlobalSearch />
          <NotificationBell />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-white md:hidden overflow-y-auto">
          <nav className="flex flex-col p-4">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => renderNavItem(item, true))}
            </ul>
            <button
              onClick={handleLogout}
              className="mt-4 flex items-center gap-3 rounded-lg px-4 py-3 text-lg text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r bg-slate-800 md:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="flex h-16 items-center justify-between border-b border-slate-700 px-6">
              <AdminLogo size="sm" />
              <div className="flex items-center gap-1">
                <GlobalSearch />
                <NotificationBell />
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => renderNavItem(item))}
              </ul>
            </nav>

            <div className="border-t border-slate-700 p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={handleLogout}
                leftIcon={<LogOut className="h-5 w-5" />}
              >
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
