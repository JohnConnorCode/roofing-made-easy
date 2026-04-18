/**
 * Admin theme tokens — dark + glass treatment to match the public site.
 *
 * Base palette:
 *   bg base:      #0a0d14 (ink, slightly darker than public #0c0f14 for contrast)
 *   surface:      glass card with backdrop-blur + low-opacity dark bg
 *   accent gold:  #c9a25c (matches homepage)
 *   text:         slate-50 / slate-300 / slate-500
 */

/**
 * Admin navigation styles
 */
export const adminNav = {
  active: 'bg-[#c9a25c] text-[#0c0f14] font-semibold shadow-sm',
  inactive: 'text-slate-300 hover:bg-white/5 hover:text-slate-50',
  parentActive: 'bg-white/5 text-slate-50',
  childActive: 'bg-[#c9a25c]/15 text-[#e6c588] border-l-2 border-[#c9a25c] pl-[14px]',
  childInactive: 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
  mobileActive: 'bg-[#c9a25c]/10 text-[#e6c588]',
  mobileInactive: 'text-slate-400 hover:bg-white/5',
  sectionActive: 'bg-[#c9a25c]/10 text-[#e6c588] border-l-2 border-[#c9a25c]',
  sectionInactive: 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent',
} as const

/**
 * Badge/tag styles
 */
export const adminBadge = {
  success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  neutral: 'bg-slate-800/60 text-slate-400 border border-slate-700/60',
  warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
  error: 'bg-red-500/15 text-red-300 border border-red-500/25',
  info: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
} as const

/**
 * Icon colors
 */
export const adminIcon = {
  primary: 'text-[#c9a25c]',
  muted: 'text-[#b5893a]',
  light: 'text-[#e6c588]',
  inactive: 'text-slate-500',
  warning: 'text-amber-400',
  error: 'text-red-400',
  success: 'text-emerald-400',
} as const

/**
 * Glass card surface — backdrop-blur + translucent dark bg + subtle border.
 */
export const adminCard = {
  base: 'rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02)]',
  hover: 'hover:border-white/10 hover:bg-slate-950/60 transition-colors',
  configured: 'border-white/5 bg-slate-950/40',
  notConfigured: 'border-[#c9a25c]/25 bg-[#c9a25c]/[0.04]',
} as const

/**
 * Result/alert box styles
 */
export const adminResult = {
  success: 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-200',
  error: 'bg-red-500/10 border border-red-500/25 text-red-200',
  warning: 'bg-amber-500/10 border border-amber-500/25 text-amber-200',
  info: 'bg-blue-500/10 border border-blue-500/25 text-blue-200',
} as const

/**
 * Stat card icon backgrounds
 */
export const adminStatIcon = {
  gold: 'bg-[#c9a25c]/15 text-[#e6c588]',
  green: 'bg-emerald-500/15 text-emerald-400',
  emerald: 'bg-emerald-500/15 text-emerald-400',
  blue: 'bg-blue-500/15 text-blue-400',
  slate: 'bg-slate-800/60 text-slate-300',
} as const

export const adminSpinner = 'text-[#c9a25c]'
export const adminLink = 'text-[#c9a25c] hover:text-[#e6c588] underline-offset-4 hover:underline'
export const adminSelectedRow = 'bg-[#c9a25c]/10'
export const adminDropTarget = 'bg-[#c9a25c]/10 ring-2 ring-[#c9a25c]/60'

// =============================================================================
// Helper functions
// =============================================================================

export function getNavClasses(isActive: boolean, isMobile = false): string {
  if (isMobile) return isActive ? adminNav.mobileActive : adminNav.mobileInactive
  return isActive ? adminNav.active : adminNav.inactive
}

export function getChildNavClasses(isActive: boolean, isMobile = false): string {
  if (isMobile) return isActive ? adminNav.mobileActive : adminNav.mobileInactive
  return isActive ? adminNav.childActive : adminNav.childInactive
}

export function getParentNavClasses(hasActiveChild: boolean, isMobile = false): string {
  if (isMobile) return hasActiveChild ? adminNav.mobileActive : adminNav.mobileInactive
  return hasActiveChild ? adminNav.parentActive : adminNav.inactive
}

export function getSectionNavClasses(isActive: boolean): string {
  return isActive ? adminNav.sectionActive : adminNav.sectionInactive
}

export function getBadgeClasses(
  status: 'success' | 'neutral' | 'warning' | 'error' | 'info' = 'neutral'
): string {
  const base = 'text-xs font-medium px-2.5 py-1 rounded-full'
  return `${base} ${adminBadge[status]}`
}

export function getResultClasses(success: boolean): string {
  const base = 'flex items-center gap-2 p-3 rounded-lg'
  return `${base} ${success ? adminResult.success : adminResult.error}`
}

export function getIconClasses(
  status: 'primary' | 'muted' | 'light' | 'inactive' | 'warning' | 'error' | 'success'
): string {
  return adminIcon[status]
}

/**
 * Consistent admin page container class — use this as the wrapper around
 * page content so every admin route sits on the same glass surface.
 */
export const adminPageContainer =
  'rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-xl p-6 md:p-8'
