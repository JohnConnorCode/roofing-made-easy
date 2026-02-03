import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Register fonts (using system fonts as fallback)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Inter',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#c9a25c',
  },
  logo: {
    width: 120,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0c0f14',
  },
  companyTagline: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  quoteTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0c0f14',
    textAlign: 'right',
  },
  quoteNumber: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  col: {
    width: '48%',
  },
  label: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    fontWeight: 500,
    color: '#1e293b',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 10,
  },
  tableCell: {
    fontSize: 10,
    color: '#1e293b',
  },
  descriptionCol: {
    width: '70%',
  },
  amountCol: {
    width: '30%',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
    width: 200,
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748b',
    width: 100,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 500,
    color: '#1e293b',
    width: 100,
    textAlign: 'right',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 200,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0c0f14',
    width: 100,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#c9a25c',
    width: 100,
    textAlign: 'right',
  },
  notesBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 4,
    marginTop: 20,
  },
  notesText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
  },
  termsSection: {
    marginTop: 20,
  },
  termsText: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.5,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  signatureBox: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 30,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    marginBottom: 4,
  },
  signatureHint: {
    fontSize: 8,
    color: '#94a3b8',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
})

export interface QuotePDFData {
  quoteNumber: string
  date: string
  validUntil: string
  company: {
    name: string
    tagline?: string
    address: string
    phone: string
    email: string
    license?: string
  }
  customer: {
    name: string
    address: string
    city: string
    state: string
    zip: string
    phone?: string
    email?: string
  }
  project: {
    description: string
    material?: string
    size?: number
  }
  lineItems: Array<{
    description: string
    quantity?: number
    unit?: string
    amount: number
  }>
  subtotal: number
  tax?: number
  total: number
  notes?: string
  terms?: string
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function QuotePDFDocument({ data }: { data: QuotePDFData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{data.company.name}</Text>
            {data.company.tagline && (
              <Text style={styles.companyTagline}>{data.company.tagline}</Text>
            )}
          </View>
          <View>
            <Text style={styles.quoteTitle}>QUOTE</Text>
            <Text style={styles.quoteNumber}>#{data.quoteNumber}</Text>
          </View>
        </View>

        {/* Quote Details */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Quote For</Text>
            <Text style={styles.value}>{data.customer.name}</Text>
            <Text style={[styles.value, { fontWeight: 400, marginTop: 2 }]}>
              {data.customer.address}
            </Text>
            <Text style={[styles.value, { fontWeight: 400 }]}>
              {data.customer.city}, {data.customer.state} {data.customer.zip}
            </Text>
            {data.customer.phone && (
              <Text style={[styles.value, { fontWeight: 400, marginTop: 8 }]}>
                {data.customer.phone}
              </Text>
            )}
            {data.customer.email && (
              <Text style={[styles.value, { fontWeight: 400 }]}>
                {data.customer.email}
              </Text>
            )}
          </View>
          <View style={[styles.col, { alignItems: 'flex-end' }]}>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{data.date}</Text>
            </View>
            <View>
              <Text style={styles.label}>Valid Until</Text>
              <Text style={styles.value}>{data.validUntil}</Text>
            </View>
          </View>
        </View>

        {/* Project Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Description</Text>
          <Text style={[styles.value, { textTransform: 'capitalize' }]}>
            {data.project.description}
          </Text>
          {data.project.material && (
            <Text style={[styles.tableCell, { marginTop: 4, color: '#64748b' }]}>
              Material: {data.project.material}
              {data.project.size && ` • ${data.project.size.toLocaleString()} sq ft`}
            </Text>
          )}
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.descriptionCol]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.amountCol]}>Amount</Text>
          </View>
          {data.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.descriptionCol}>
                <Text style={styles.tableCell}>{item.description}</Text>
                {item.quantity && item.unit && (
                  <Text style={[styles.tableCell, { color: '#64748b', fontSize: 9 }]}>
                    {item.quantity.toLocaleString()} {item.unit}
                  </Text>
                )}
              </View>
              <Text style={[styles.tableCell, styles.amountCol]}>
                {item.amount > 0 ? formatCurrency(item.amount) : 'Included'}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
          </View>
          {data.tax !== undefined && data.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>{formatCurrency(data.tax)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Terms */}
        {data.terms && (
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>{data.terms}</Text>
          </View>
        )}

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Customer Acceptance</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureHint}>Signature & Date</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>{data.company.name}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureHint}>Authorized Representative</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {data.company.name} | {data.company.address} | {data.company.email} | {data.company.phone}
            {data.company.license && ` | License: ${data.company.license}`}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
