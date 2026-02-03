import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from '@react-pdf/renderer'
import { BUSINESS_CONFIG, getFullAddress } from '@/lib/config/business'

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
  danger: '#ef4444',
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
    alignItems: 'flex-start',
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
  companyInfo: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 5,
  },
  invoiceHeader: {
    textAlign: 'right',
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.ink,
  },
  invoiceNumber: {
    fontSize: 12,
    color: colors.text,
    marginTop: 5,
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  statusPaid: {
    backgroundColor: colors.success,
  },
  statusPending: {
    backgroundColor: colors.gold,
  },
  statusOverdue: {
    backgroundColor: colors.danger,
  },
  statusText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  addressBlock: {
    width: '45%',
  },
  addressLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 11,
    color: colors.text,
    lineHeight: 1.5,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 25,
    gap: 30,
  },
  detailItem: {
    alignItems: 'flex-end',
  },
  detailLabel: {
    fontSize: 9,
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 11,
    color: colors.text,
    fontWeight: 'bold',
    marginTop: 2,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.slate,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  tableRowAlt: {
    backgroundColor: colors.lightGray,
  },
  colDescription: {
    flex: 3,
  },
  colQty: {
    flex: 1,
    textAlign: 'center',
  },
  colPrice: {
    flex: 1,
    textAlign: 'right',
  },
  colTotal: {
    flex: 1,
    textAlign: 'right',
  },
  tableCellText: {
    fontSize: 10,
    color: colors.text,
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalsBox: {
    width: 220,
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 6,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalsLabel: {
    fontSize: 10,
    color: colors.text,
  },
  totalsValue: {
    fontSize: 10,
    color: colors.text,
    textAlign: 'right',
  },
  totalsDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.gold,
    marginVertical: 8,
  },
  totalFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalFinalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.ink,
  },
  totalFinalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gold,
  },
  balanceDue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    marginTop: 5,
  },
  balanceDueLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.danger,
  },
  balanceDueValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.danger,
  },
  notesSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.ink,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
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
  paymentInstructions: {
    fontSize: 10,
    color: colors.text,
    fontWeight: 'bold',
  },
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Upon receipt'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
  is_taxable: boolean
}

export interface InvoicePDFData {
  id: string
  invoice_number: string
  status: string
  issue_date: string
  due_date: string | null
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_percent: number
  discount_amount: number
  total: number
  amount_paid: number
  balance_due: number
  bill_to_name: string | null
  bill_to_email: string | null
  bill_to_phone: string | null
  bill_to_address: string | null
  notes: string | null
  terms: string | null
  invoice_line_items: InvoiceLineItem[]
  leads?: {
    id: string
    contacts: Array<{
      first_name?: string
      last_name?: string
      email?: string
      phone?: string
    }>
    properties: Array<{
      street_address?: string
      city?: string
      state?: string
      zip_code?: string
    }>
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'paid':
      return styles.statusPaid
    case 'overdue':
      return styles.statusOverdue
    default:
      return styles.statusPending
  }
}

function InvoicePDF({ data }: { data: InvoicePDFData }) {
  const contact = data.leads?.contacts?.[0]
  const property = data.leads?.properties?.[0]

  // Build recipient info
  const billToName = data.bill_to_name ||
    (contact ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() : 'Customer')
  const billToEmail = data.bill_to_email || contact?.email || ''
  const billToPhone = data.bill_to_phone || contact?.phone || ''
  const billToAddress = data.bill_to_address ||
    (property ? `${property.street_address || ''}\n${property.city || ''}, ${property.state || ''} ${property.zip_code || ''}` : '')

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              <Text style={styles.logoGold}>{BUSINESS_CONFIG.name.split(' ')[0]}</Text>
              <Text style={styles.logoBlack}> {BUSINESS_CONFIG.name.split(' ').slice(1).join(' ')}</Text>
            </Text>
            <Text style={styles.companyInfo}>{getFullAddress()}</Text>
            <Text style={styles.companyInfo}>{BUSINESS_CONFIG.phone.display} | {BUSINESS_CONFIG.email.primary}</Text>
          </View>
          <View style={styles.invoiceHeader}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{data.invoice_number}</Text>
            <View style={[styles.statusBadge, getStatusStyle(data.status)]}>
              <Text style={styles.statusText}>{data.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Bill To / Details Row */}
        <View style={styles.addressRow}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Bill To</Text>
            <Text style={styles.addressText}>{billToName}</Text>
            {billToEmail && <Text style={styles.addressText}>{billToEmail}</Text>}
            {billToPhone && <Text style={styles.addressText}>{billToPhone}</Text>}
            {billToAddress && <Text style={styles.addressText}>{billToAddress}</Text>}
          </View>
          <View style={styles.addressBlock}>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Invoice Date</Text>
                <Text style={styles.detailValue}>{formatDate(data.issue_date)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Due Date</Text>
                <Text style={styles.detailValue}>{formatDate(data.due_date)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>

          {/* Table Rows */}
          {data.invoice_line_items.map((item, index) => (
            <View
              key={item.id}
              style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
            >
              <Text style={[styles.tableCellText, styles.colDescription]}>{item.description}</Text>
              <Text style={[styles.tableCellText, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCellText, styles.colPrice]}>{formatCurrency(item.unit_price)}</Text>
              <Text style={[styles.tableCellText, styles.colTotal]}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatCurrency(data.subtotal)}</Text>
            </View>

            {data.discount_amount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>
                  Discount ({data.discount_percent}%)
                </Text>
                <Text style={styles.totalsValue}>-{formatCurrency(data.discount_amount)}</Text>
              </View>
            )}

            {data.tax_amount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>
                  Tax ({(data.tax_rate * 100).toFixed(2)}%)
                </Text>
                <Text style={styles.totalsValue}>{formatCurrency(data.tax_amount)}</Text>
              </View>
            )}

            <View style={styles.totalsDivider} />

            <View style={styles.totalFinal}>
              <Text style={styles.totalFinalLabel}>Total</Text>
              <Text style={styles.totalFinalValue}>{formatCurrency(data.total)}</Text>
            </View>

            {data.amount_paid > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Amount Paid</Text>
                <Text style={styles.totalsValue}>-{formatCurrency(data.amount_paid)}</Text>
              </View>
            )}

            {data.balance_due > 0 && data.status !== 'paid' && (
              <View style={styles.balanceDue}>
                <Text style={styles.balanceDueLabel}>Balance Due</Text>
                <Text style={styles.balanceDueValue}>{formatCurrency(data.balance_due)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {(data.notes || data.terms) && (
          <View style={styles.notesSection}>
            {data.notes && (
              <>
                <Text style={styles.notesTitle}>Notes</Text>
                <Text style={styles.notesText}>{data.notes}</Text>
              </>
            )}
            {data.terms && (
              <>
                <Text style={[styles.notesTitle, { marginTop: data.notes ? 10 : 0 }]}>Terms & Conditions</Text>
                <Text style={styles.notesText}>{data.terms}</Text>
              </>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.paymentInstructions}>
            Questions? Contact us at {BUSINESS_CONFIG.phone.display} or {BUSINESS_CONFIG.email.primary}
          </Text>
          <Text style={styles.footerText}>
            Thank you for your business!
          </Text>
          <Text style={styles.footerText}>
            {BUSINESS_CONFIG.legalName} | Licensed & Insured{BUSINESS_CONFIG.credentials.stateContractorLicense ? ` | ${BUSINESS_CONFIG.address.stateCode} License #${BUSINESS_CONFIG.credentials.stateContractorLicense}` : ''}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateInvoicePdf(data: InvoicePDFData): Promise<Buffer> {
  const pdfBuffer = await renderToBuffer(<InvoicePDF data={data} />)
  return Buffer.from(pdfBuffer)
}

export { InvoicePDF }
