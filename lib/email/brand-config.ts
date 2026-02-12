/**
 * Centralized Email Brand Configuration
 * Single source of truth for email styling and company info
 */

import { BUSINESS_CONFIG } from '@/lib/config/business'

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
export function getEmailCompanyInfo() {
  return {
    name: BUSINESS_CONFIG.name,
    legalName: BUSINESS_CONFIG.legalName,
    phone: BUSINESS_CONFIG.phone.display,
    phoneRaw: BUSINESS_CONFIG.phone.raw,
    email: BUSINESS_CONFIG.email.primary,
    address: {
      street: BUSINESS_CONFIG.address.street,
      city: BUSINESS_CONFIG.address.city,
      state: BUSINESS_CONFIG.address.stateCode,
      zip: BUSINESS_CONFIG.address.zip,
    },
    fullAddress: `${BUSINESS_CONFIG.address.street}, ${BUSINESS_CONFIG.address.city}, ${BUSINESS_CONFIG.address.stateCode} ${BUSINESS_CONFIG.address.zip}`,
    website: process.env.NEXT_PUBLIC_APP_URL || 'https://www.smartroofpricing.com',
  }
}

// Type for brand config
export interface EmailBrandConfig {
  colors: typeof EMAIL_COLORS
  fonts: typeof EMAIL_FONTS
  company: ReturnType<typeof getEmailCompanyInfo>
}

// Get complete brand config
export function getEmailBrandConfig(): EmailBrandConfig {
  return {
    colors: EMAIL_COLORS,
    fonts: EMAIL_FONTS,
    company: getEmailCompanyInfo(),
  }
}

// Helper to generate inline CSS color string
export function colorVar(color: keyof typeof EMAIL_COLORS): string {
  return EMAIL_COLORS[color]
}

// Export individual values for convenience
export const brandColors = EMAIL_COLORS
export const brandFonts = EMAIL_FONTS
