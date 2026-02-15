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

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
})

const colors = {
  gold: '#c9a25c',
  ink: '#0c0f14',
  text: '#334155',
  textLight: '#64748b',
  white: '#ffffff',
  lightGray: '#f1f5f9',
}

const styles = StyleSheet.create({
  page: {
    padding: 50,
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
    fontSize: 20,
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
    marginTop: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 9,
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 11,
    color: colors.text,
    lineHeight: 1.6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  col: {
    width: '48%',
  },
  bodyText: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.8,
    marginBottom: 20,
  },
  amountBox: {
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 6,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 11,
    color: colors.text,
    fontWeight: 'bold',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gold,
  },
  signatureSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
    width: '60%',
    marginTop: 40,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 9,
    color: colors.textLight,
  },
  dateLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
    width: '30%',
    marginTop: 40,
    marginBottom: 5,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: colors.textLight,
  },
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export interface LienWaiverPDFData {
  waiver_type: 'conditional' | 'unconditional'
  through_date: string
  amount: number
  claimant_name: string | null
  owner_name: string | null
  property_description: string | null
  job_number: string
}

function ConditionalWaiver({ data }: { data: LienWaiverPDFData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              <Text style={styles.logoGold}>{BUSINESS_CONFIG.name.split(' ')[0]}</Text>
              <Text style={styles.logoBlack}> {BUSINESS_CONFIG.name.split(' ').slice(1).join(' ')}</Text>
            </Text>
            <Text style={styles.companyInfo}>{getFullAddress()}</Text>
            <Text style={styles.companyInfo}>{BUSINESS_CONFIG.phone.display} | {BUSINESS_CONFIG.email.primary}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 9, color: colors.textLight }}>Job: {data.job_number}</Text>
          </View>
        </View>

        <Text style={styles.title}>CONDITIONAL WAIVER AND RELEASE ON PROGRESS PAYMENT</Text>
        <Text style={styles.subtitle}>Upon receipt of payment</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Claimant</Text>
            <Text style={styles.value}>{data.claimant_name || BUSINESS_CONFIG.legalName}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Owner</Text>
            <Text style={styles.value}>{data.owner_name || 'Property Owner'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Property Description</Text>
          <Text style={styles.value}>{data.property_description || 'See job documents'}</Text>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Through Date: {formatDate(data.through_date)}</Text>
          <Text style={styles.amountValue}>{formatCurrency(data.amount)}</Text>
        </View>

        <Text style={styles.bodyText}>
          Upon receipt of a check from {data.owner_name || 'the Owner'} in the sum of {formatCurrency(data.amount)}{' '}
          payable to {data.claimant_name || BUSINESS_CONFIG.legalName} and when the check has been properly endorsed and has been{' '}
          paid by the bank upon which it is drawn, this document shall become effective to release any mechanic&apos;s lien,{' '}
          stop payment notice, or bond right the claimant has on the job of {data.owner_name || 'the Owner'} located at{' '}
          the property described above to the extent of the amount stated.
        </Text>

        <Text style={styles.bodyText}>
          This release covers a progress payment for work, services, equipment, or materials furnished to the above-referenced{' '}
          property through {formatDate(data.through_date)} only and does not cover any retention, pending modifications,{' '}
          or items furnished after that date. Before any recipient of this document relies on it, said party should verify{' '}
          evidence of payment to the claimant named above.
        </Text>

        <View style={styles.signatureSection}>
          <View style={styles.signatureRow}>
            <View>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Claimant Signature</Text>
            </View>
            <View>
              <View style={styles.dateLine} />
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {BUSINESS_CONFIG.legalName} | {getFullAddress()}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

function UnconditionalWaiver({ data }: { data: LienWaiverPDFData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              <Text style={styles.logoGold}>{BUSINESS_CONFIG.name.split(' ')[0]}</Text>
              <Text style={styles.logoBlack}> {BUSINESS_CONFIG.name.split(' ').slice(1).join(' ')}</Text>
            </Text>
            <Text style={styles.companyInfo}>{getFullAddress()}</Text>
            <Text style={styles.companyInfo}>{BUSINESS_CONFIG.phone.display} | {BUSINESS_CONFIG.email.primary}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 9, color: colors.textLight }}>Job: {data.job_number}</Text>
          </View>
        </View>

        <Text style={styles.title}>UNCONDITIONAL WAIVER AND RELEASE ON PROGRESS PAYMENT</Text>
        <Text style={styles.subtitle}>Effective immediately upon signing</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Claimant</Text>
            <Text style={styles.value}>{data.claimant_name || BUSINESS_CONFIG.legalName}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Owner</Text>
            <Text style={styles.value}>{data.owner_name || 'Property Owner'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Property Description</Text>
          <Text style={styles.value}>{data.property_description || 'See job documents'}</Text>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Through Date: {formatDate(data.through_date)}</Text>
          <Text style={styles.amountValue}>{formatCurrency(data.amount)}</Text>
        </View>

        <Text style={styles.bodyText}>
          The claimant, {data.claimant_name || BUSINESS_CONFIG.legalName}, has been paid and has received a progress payment in the{' '}
          sum of {formatCurrency(data.amount)} for work, services, equipment, or materials furnished to the property described above{' '}
          and owned by {data.owner_name || 'the Owner'}.
        </Text>

        <Text style={styles.bodyText}>
          The claimant unconditionally waives and releases any right to a mechanic&apos;s lien, stop payment notice, or any right{' '}
          against a labor and material bond on the job to the extent of the amount stated. This release covers a progress payment{' '}
          for work through {formatDate(data.through_date)} only and does not cover any retention, pending modifications, or items{' '}
          furnished after that date.
        </Text>

        <View style={styles.signatureSection}>
          <View style={styles.signatureRow}>
            <View>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Claimant Signature</Text>
            </View>
            <View>
              <View style={styles.dateLine} />
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {BUSINESS_CONFIG.legalName} | {getFullAddress()}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateLienWaiverPdf(data: LienWaiverPDFData): Promise<Buffer> {
  const component = data.waiver_type === 'conditional'
    ? <ConditionalWaiver data={data} />
    : <UnconditionalWaiver data={data} />

  const pdfBuffer = await renderToBuffer(component)
  return Buffer.from(pdfBuffer)
}
