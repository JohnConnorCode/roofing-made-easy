/**
 * Integration status styles - DRY definitions using Tailwind theme classes
 * Used by IntegrationCard and settings page
 */

export const integrationStatusStyles = {
  // Card/container borders
  container: {
    configured: 'border-slate-200 bg-slate-50 hover:border-slate-300',
    notConfigured: 'border-gold-light/30 bg-gold-light/5 hover:border-gold-light/50',
    base: 'border-2 transition-colors rounded-lg',
  },

  // Status icons
  icon: {
    configured: 'text-gold',
    notConfigured: 'text-slate-400',
    warning: 'text-amber-500',
  },

  // Status badges
  badge: {
    configured: 'bg-gold-light/20 text-gold-muted',
    notConfigured: 'bg-slate-100 text-slate-600',
    envConfigured: 'bg-blue-100 text-blue-700',
    dbConfigured: 'bg-gold-light/20 text-gold-muted',
  },

  // Alert/result boxes
  result: {
    success: 'bg-gold-light/10 border border-gold-light/30 text-gold-muted',
    error: 'bg-red-50 border border-red-200 text-red-700',
  },
} as const

/**
 * Get the appropriate container classes for an integration based on its configuration status
 */
export function getContainerClasses(configured: boolean): string {
  return `${integrationStatusStyles.container.base} ${
    configured
      ? integrationStatusStyles.container.configured
      : integrationStatusStyles.container.notConfigured
  }`
}

/**
 * Get the appropriate icon classes for an integration based on its configuration status
 */
export function getIconClasses(configured: boolean): string {
  return configured
    ? integrationStatusStyles.icon.configured
    : integrationStatusStyles.icon.notConfigured
}

/**
 * Get the appropriate badge classes for an integration based on its configuration status
 */
export function getBadgeClasses(configured: boolean): string {
  return `text-xs font-medium px-2 py-1 rounded-full ${
    configured
      ? integrationStatusStyles.badge.configured
      : integrationStatusStyles.badge.notConfigured
  }`
}

/**
 * Get the appropriate source badge classes based on configuration source
 */
export function getSourceBadgeClasses(configuredVia: 'db' | 'env' | 'none'): string {
  const baseClasses = 'text-xs font-medium px-2 py-0.5 rounded-full'
  switch (configuredVia) {
    case 'db':
      return `${baseClasses} ${integrationStatusStyles.badge.dbConfigured}`
    case 'env':
      return `${baseClasses} bg-slate-100 text-slate-600`
    default:
      return `${baseClasses} ${integrationStatusStyles.badge.notConfigured}`
  }
}

/**
 * Get the appropriate result box classes based on success/error state
 */
export function getResultClasses(success: boolean): string {
  return `flex items-center gap-2 p-3 rounded-lg ${
    success
      ? integrationStatusStyles.result.success
      : integrationStatusStyles.result.error
  }`
}
