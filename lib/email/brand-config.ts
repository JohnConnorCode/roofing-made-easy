/**
 * Centralized Email Brand Configuration
 * Single source of truth for email styling and company info
 */

import { getBusinessConfigFromDB } from '@/lib/config/business-loader'

// Brand colors for email templates
export const EMAIL_COLORS = {
  // Primary brand colors
  gold: '#c9a25c',
  goldLight: '#d4a853',
  goldDark: '#b08a4a',

  // Background colors
  ink: '#0c0f14',
  slate: '#1a1f2e',

  // Text colors
  text: '#334155',
  textLight: '#64748b',
  textMuted: '#94a3b8',

  // Status colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',

  // UI colors
  background: '#f1f5f9',
  surface: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
}

// Email fonts (safe for email clients)
export const EMAIL_FONTS = {
  primary: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  monospace: "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
}

// Company info for emails (derived from business config)
export async function getEmailCompanyInfo() {
  const config = await getBusinessConfigFromDB()
  return {
    name: config.name,
    legalName: config.legalName,
    phone: config.phone.display,
    phoneRaw: config.phone.raw,
    email: config.email.primary,
    address: {
      street: config.address.street,
      city: config.address.city,
      state: config.address.stateCode,
      zip: config.address.zip,
    },
    fullAddress: `${config.address.street}, ${config.address.city}, ${config.address.stateCode} ${config.address.zip}`,
    website: process.env.NEXT_PUBLIC_APP_URL || 'https://www.smartroofpricing.com',
  }
}

// Type for brand config
export interface EmailBrandConfig {
  colors: typeof EMAIL_COLORS
  fonts: typeof EMAIL_FONTS
  company: Awaited<ReturnType<typeof getEmailCompanyInfo>>
}

// Get complete brand config
export async function getEmailBrandConfig(): Promise<EmailBrandConfig> {
  return {
    colors: EMAIL_COLORS,
    fonts: EMAIL_FONTS,
    company: await getEmailCompanyInfo(),
  }
}

// Helper to generate inline CSS color string
export function colorVar(color: keyof typeof EMAIL_COLORS): string {
  return EMAIL_COLORS[color]
}

// Export individual values for convenience
export const brandColors = EMAIL_COLORS
export const brandFonts = EMAIL_FONTS
