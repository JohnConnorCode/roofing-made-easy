/**
 * Centralized admin theme - DRY style definitions
 *
 * Uses CSS custom properties defined in globals.css:
 * --color-gold: #b5893a (primary brand)
 * --color-gold-muted: #9a7432 (darker)
 * --color-gold-light: #c9a25c (lighter)
 * --color-ink: #0c0f14 (dark bg)
 *
 * These generate Tailwind classes: text-gold, bg-gold-light, etc.
 */

/**
 * Admin navigation styles
 */
export const adminNav = {
  // Desktop sidebar - active state
  active: 'bg-gold text-white',
  // Desktop sidebar - inactive state
  inactive: 'text-slate-300 hover:bg-slate-700 hover:text-white',
  // Desktop sidebar - parent with active child
  parentActive: 'bg-slate-700 text-white',
  // Desktop sidebar - child items
  childActive: 'bg-gold text-white',
  childInactive: 'text-slate-400 hover:bg-slate-700 hover:text-white',
  // Mobile nav
  mobileActive: 'bg-gold/10 text-gold',
  mobileInactive: 'text-slate-600 hover:bg-slate-50',
  // Settings section tabs
  sectionActive: 'bg-gold/10 text-gold',
  sectionInactive: 'text-slate-600 hover:bg-slate-50',
} as const

/**
 * Badge/tag styles
 */
export const adminBadge = {
  // Connected/success state
  success: 'bg-gold-light/20 text-gold-muted',
  // Neutral/default state
  neutral: 'bg-slate-100 text-slate-600',
  // Warning state
  warning: 'bg-amber-100 text-amber-700',
  // Error state
  error: 'bg-red-100 text-red-700',
  // Info state
  info: 'bg-blue-100 text-blue-700',
} as const

/**
 * Icon colors
 */
export const adminIcon = {
  primary: 'text-gold',
  muted: 'text-gold-muted',
  light: 'text-gold-light',
  inactive: 'text-slate-400',
  warning: 'text-amber-500',
  error: 'text-red-500',
  success: 'text-emerald-500',
} as const

/**
 * Card/container styles
 */
export const adminCard = {
  // Configured/active state
  configured: 'border-slate-200 bg-slate-50 hover:border-slate-300',
  // Not configured state
  notConfigured: 'border-gold-light/30 bg-gold-light/5 hover:border-gold-light/50',
  // Hover effect
  hover: 'hover:border-gold-light hover:shadow-md',
} as const

/**
 * Result/alert box styles
 */
export const adminResult = {
  success: 'bg-gold-light/10 border border-gold-light/30 text-gold-muted',
  error: 'bg-red-50 border border-red-200 text-red-700',
  warning: 'bg-amber-50 border border-amber-200 text-amber-700',
  info: 'bg-blue-50 border border-blue-200 text-blue-700',
} as const

/**
 * Stat card icon backgrounds
 */
export const adminStatIcon = {
  gold: 'bg-gold-light/20',
  green: 'bg-green-100',
  emerald: 'bg-emerald-100',
  blue: 'bg-blue-100',
  slate: 'bg-slate-100',
} as const

/**
 * Loading spinner
 */
export const adminSpinner = 'text-gold'

/**
 * Link styles
 */
export const adminLink = 'text-gold hover:underline'

/**
 * Selected row background
 */
export const adminSelectedRow = 'bg-gold-light/10'

/**
 * Drop target styles (drag & drop)
 */
export const adminDropTarget = 'bg-gold-light/10 ring-2 ring-gold-light'

// =============================================================================
// Helper functions for dynamic class generation
// =============================================================================

/**
 * Get navigation link classes based on active state
 */
export function getNavClasses(isActive: boolean, isMobile = false): string {
  if (isMobile) {
    return isActive ? adminNav.mobileActive : adminNav.mobileInactive
  }
  return isActive ? adminNav.active : adminNav.inactive
}

/**
 * Get child navigation link classes
 */
export function getChildNavClasses(isActive: boolean, isMobile = false): string {
  if (isMobile) {
    return isActive ? adminNav.mobileActive : adminNav.mobileInactive
  }
  return isActive ? adminNav.childActive : adminNav.childInactive
}

/**
 * Get parent nav classes (expandable sections)
 */
export function getParentNavClasses(hasActiveChild: boolean, isMobile = false): string {
  if (isMobile) {
    return hasActiveChild ? adminNav.mobileActive : adminNav.mobileInactive
  }
  return hasActiveChild ? adminNav.parentActive : adminNav.inactive
}

/**
 * Get section nav classes (settings page tabs)
 */
export function getSectionNavClasses(isActive: boolean): string {
  return isActive ? adminNav.sectionActive : adminNav.sectionInactive
}

/**
 * Get badge classes based on status type
 */
export function getBadgeClasses(
  status: 'success' | 'neutral' | 'warning' | 'error' | 'info' = 'neutral'
): string {
  const base = 'text-xs font-medium px-2 py-1 rounded-full'
  return `${base} ${adminBadge[status]}`
}

/**
 * Get result/alert box classes
 */
export function getResultClasses(success: boolean): string {
  const base = 'flex items-center gap-2 p-3 rounded-lg'
  return `${base} ${success ? adminResult.success : adminResult.error}`
}

/**
 * Get icon classes based on status
 */
export function getIconClasses(
  status: 'primary' | 'muted' | 'light' | 'inactive' | 'warning' | 'error' | 'success'
): string {
  return adminIcon[status]
}
