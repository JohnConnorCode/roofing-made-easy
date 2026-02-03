import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { JobType, RoofMaterial } from '@/lib/supabase/types'

// Register fonts (using system fonts for simplicity)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
})

// Brand colors
const colors = {
  gold: '#c9a25c',
  ink: '#0c0f14',
  slate: '#1a1f2e',
  text: '#334155',
  textLight: '#64748b',
  success: '#22c55e',
  white: '#ffffff',
  lightGray: '#f1f5f9',
}

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.gold,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoGold: {
    color: colors.gold,
  },
  logoBlack: {
    color: colors.ink,
  },
  headerRight: {
    textAlign: 'right',
  },
  companyName: {
    fontSize: 10,
    color: colors.textLight,
  },
  companyPhone: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.ink,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.ink,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  priceBox: {
    backgroundColor: colors.lightGray,
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  priceLow: {
    fontSize: 16,
    color: colors.text,
  },
  priceMain: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.gold,
    textAlign: 'center',
    marginVertical: 10,
  },
  priceHigh: {
    fontSize: 16,
    color: colors.text,
  },
  priceNote: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 10,
  },
  infoTable: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textLight,
    width: 120,
  },
  infoValue: {
    fontSize: 11,
    color: colors.text,
    flex: 1,
  },
  includedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  includedItem: {
    flexDirection: 'row',
    width: '50%',
    marginBottom: 8,
    paddingRight: 10,
  },
  checkmark: {
    color: colors.success,
    fontSize: 12,
    marginRight: 8,
  },
  includedText: {
    fontSize: 10,
    color: colors.text,
    flex: 1,
  },
  explanation: {
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
  },
  explanationText: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: colors.textLight,
    marginBottom: 5,
  },
  validUntil: {
    fontSize: 10,
    color: colors.text,
    fontWeight: 'bold',
  },
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function getJobTypeLabel(jobType: JobType | null): string {
  if (!jobType) return 'Roofing Project'
  return jobType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

function getMaterialLabel(material: RoofMaterial | null): string {
  if (!material) return 'Not specified'
  return material.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

function getIncludedItems(jobType: JobType | null): string[] {
  switch (jobType) {
    case 'inspection':
      return [
        'Complete roof assessment',
        'Damage identification',
        'Photo documentation',
        'Written condition report',
        'Repair recommendations',
        'No obligation quote',
      ]
    case 'maintenance':
      return [
        'Debris & leaf removal',
        'Gutter cleaning',
        'Minor sealant repairs',
        'Flashing inspection',
        'Condition assessment',
        'Maintenance report',
      ]
    case 'repair':
      return [
        'Damage assessment',
        'Material matching',
        'Professional repair work',
        'Weatherproof sealing',
        'Site cleanup',
        'Workmanship warranty',
      ]
    case 'gutter':
      return [
        'Old gutter removal',
        'Fascia inspection',
        'Seamless gutter install',
        'Downspout routing',
        'Leak testing',
        'Cleanup & disposal',
      ]
    default:
      return [
        'Complete tear-off & disposal',
        'Deck inspection & repair',
        'Premium underlayment',
        'Quality roofing materials',
        'Professional installation',
        'Full cleanup & inspection',
        '10-year workmanship warranty',
        'Manufacturer warranty',
      ]
  }
}

export interface EstimatePDFData {
  customerName?: string
  propertyAddress?: string
  city?: string
  state?: string
  jobType: JobType | null
  roofMaterial: RoofMaterial | null
  roofSizeSqft: number | null
  priceLow: number
  priceLikely: number
  priceHigh: number
  explanation?: string
  factors?: Array<{
    name: string
    impact: number
    description: string
  }>
  validUntil?: string
}

export function EstimatePDF({ data }: { data: EstimatePDFData }) {
  const fullAddress = data.propertyAddress
    ? data.city && data.state
      ? `${data.propertyAddress}, ${data.city}, ${data.state}`
      : data.propertyAddress
    : null

  const includedItems = getIncludedItems(data.jobType)

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              <Text style={styles.logoGold}>Farrell</Text>
              <Text style={styles.logoBlack}> Roofing</Text>
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>Professional Roofing Services</Text>
            <Text style={styles.companyPhone}>(662) 555-0123</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {data.customerName ? `Estimate for ${data.customerName}` : 'Roofing Estimate'}
        </Text>
        {fullAddress && <Text style={styles.subtitle}>{fullAddress}</Text>}

        {/* Price Box */}
        <View style={styles.priceBox}>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Low Estimate</Text>
              <Text style={styles.priceLow}>{formatCurrency(data.priceLow)}</Text>
            </View>
            <View>
              <Text style={styles.priceLabel}>High Estimate</Text>
              <Text style={styles.priceHigh}>{formatCurrency(data.priceHigh)}</Text>
            </View>
          </View>
          <Text style={styles.priceMain}>{formatCurrency(data.priceLikely)}</Text>
          <Text style={styles.priceLabel}>Most Likely Price</Text>
          <Text style={styles.priceNote}>
            Final price confirmed after free on-site inspection
          </Text>
        </View>

        {/* Project Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.infoTable}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Project Type</Text>
              <Text style={styles.infoValue}>{getJobTypeLabel(data.jobType)}</Text>
            </View>
            {data.roofMaterial && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Roofing Material</Text>
                <Text style={styles.infoValue}>{getMaterialLabel(data.roofMaterial)}</Text>
              </View>
            )}
            {data.roofSizeSqft && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Roof Size</Text>
                <Text style={styles.infoValue}>{data.roofSizeSqft.toLocaleString()} sq ft</Text>
              </View>
            )}
          </View>
        </View>

        {/* Price Factors */}
        {data.factors && data.factors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Factors</Text>
            <View style={styles.infoTable}>
              {data.factors.map((factor, index) => (
                <View key={index} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{factor.name}</Text>
                  <Text style={styles.infoValue}>
                    {factor.impact > 0 ? '+' : ''}
                    {formatCurrency(factor.impact)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* What's Included */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What&apos;s Included</Text>
          <View style={styles.includedGrid}>
            {includedItems.map((item, index) => (
              <View key={index} style={styles.includedItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.includedText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Explanation */}
        {data.explanation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estimate Details</Text>
            <View style={styles.explanation}>
              <Text style={styles.explanationText}>{data.explanation}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is a preliminary estimate based on the information provided.
            Final pricing confirmed after free on-site inspection.
          </Text>
          {data.validUntil && (
            <Text style={styles.validUntil}>
              Valid until{' '}
              {new Date(data.validUntil).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          )}
          <Text style={styles.footerText}>
            Farrell Roofing LLC | 123 Main Street, Tupelo, MS 38801 | (662) 555-0123
          </Text>
        </View>
      </Page>
    </Document>
  )
}
