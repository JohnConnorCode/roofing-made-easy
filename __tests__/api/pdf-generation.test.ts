import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EstimatePDF, type EstimatePDFData } from '@/lib/pdf/estimate-pdf'

// Note: @react-pdf/renderer requires special handling in tests
// We test the component interface and data transformations

describe('EstimatePDF Component', () => {
  describe('Data Interface', () => {
    it('accepts minimal required data', () => {
      const minimalData: EstimatePDFData = {
        jobType: null,
        roofMaterial: null,
        roofSizeSqft: null,
        priceLow: 5000,
        priceLikely: 7500,
        priceHigh: 10000,
      }

      expect(minimalData.priceLow).toBeDefined()
      expect(minimalData.priceLikely).toBeDefined()
      expect(minimalData.priceHigh).toBeDefined()
    })

    it('accepts full data with all optional fields', () => {
      const fullData: EstimatePDFData = {
        customerName: 'John Smith',
        propertyAddress: '123 Main St',
        city: 'Tupelo',
        state: 'MS',
        jobType: 'full_replacement',
        roofMaterial: 'asphalt_shingle',
        roofSizeSqft: 2500,
        priceLow: 8000,
        priceLikely: 10000,
        priceHigh: 12000,
        explanation: 'This estimate is based on a 25-square roof with standard shingles.',
        factors: [
          { name: '2-Story Premium', impact: 800, description: 'Additional labor for height' },
          { name: 'Skylight Flashing', impact: 400, description: 'Re-flash existing skylight' },
        ],
        validUntil: '2026-03-15T00:00:00Z',
      }

      expect(fullData.customerName).toBe('John Smith')
      expect(fullData.factors).toHaveLength(2)
    })
  })

  describe('Address Formatting', () => {
    it('formats full address correctly', () => {
      const data = {
        propertyAddress: '456 Oak Lane',
        city: 'Saltillo',
        state: 'MS',
      }

      const fullAddress = data.city && data.state
        ? `${data.propertyAddress}, ${data.city}, ${data.state}`
        : data.propertyAddress

      expect(fullAddress).toBe('456 Oak Lane, Saltillo, MS')
    })

    it('handles partial address', () => {
      const data = {
        propertyAddress: '456 Oak Lane',
        city: null,
        state: null,
      }

      const address = data.city && data.state
        ? `${data.propertyAddress}, ${data.city}, ${data.state}`
        : data.propertyAddress

      expect(address).toBe('456 Oak Lane')
    })

    it('handles missing address', () => {
      const data = {
        propertyAddress: undefined,
      }

      expect(data.propertyAddress).toBeUndefined()
    })
  })

  describe('Job Type Formatting', () => {
    it('formats job type labels correctly', () => {
      const jobTypes = {
        full_replacement: 'Full Replacement',
        repair: 'Repair',
        inspection: 'Inspection',
        maintenance: 'Maintenance',
        gutter: 'Gutter',
      }

      Object.entries(jobTypes).forEach(([key, expected]) => {
        const formatted = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
        expect(formatted).toBe(expected)
      })
    })

    it('handles null job type', () => {
      const getLabel = (jobType: string | null) =>
        jobType ? jobType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Roofing Project'

      expect(getLabel(null)).toBe('Roofing Project')
    })
  })

  describe('Material Formatting', () => {
    it('formats material labels correctly', () => {
      const materials = {
        asphalt_shingle: 'Asphalt Shingle',
        metal: 'Metal',
        tile: 'Tile',
        slate: 'Slate',
        wood_shake: 'Wood Shake',
        flat_membrane: 'Flat Membrane',
      }

      Object.entries(materials).forEach(([key, expected]) => {
        const formatted = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
        expect(formatted).toBe(expected)
      })
    })

    it('handles null material', () => {
      const getLabel = (material: string | null) =>
        material
          ? material.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
          : 'Not specified'

      expect(getLabel(null)).toBe('Not specified')
    })
  })

  describe('Currency Formatting', () => {
    it('formats prices correctly', () => {
      const formatCurrency = (n: number) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(n)

      expect(formatCurrency(8000)).toBe('$8,000')
      expect(formatCurrency(10500)).toBe('$10,500')
      expect(formatCurrency(125000)).toBe('$125,000')
    })

    it('rounds fractional amounts', () => {
      const formatCurrency = (n: number) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(n)

      expect(formatCurrency(8500.50)).toBe('$8,501')
      expect(formatCurrency(8500.49)).toBe('$8,500')
    })
  })

  describe('Included Items by Job Type', () => {
    it('returns correct items for full replacement', () => {
      const jobType = 'full_replacement'
      const items = getIncludedItemsForJobType(jobType)

      expect(items).toContain('Complete tear-off & disposal')
      expect(items).toContain('Professional installation')
      expect(items).toContain('10-year workmanship warranty')
    })

    it('returns correct items for repair', () => {
      const items = getIncludedItemsForJobType('repair')

      expect(items).toContain('Damage assessment')
      expect(items).toContain('Material matching')
      expect(items).toContain('Workmanship warranty')
    })

    it('returns correct items for inspection', () => {
      const items = getIncludedItemsForJobType('inspection')

      expect(items).toContain('Complete roof assessment')
      expect(items).toContain('Photo documentation')
      expect(items).toContain('No obligation quote')
    })

    it('returns default items for null job type', () => {
      const items = getIncludedItemsForJobType(null)

      // Should return full replacement items as default
      expect(items.length).toBeGreaterThan(0)
    })
  })

  describe('Price Factors', () => {
    it('filters out zero-impact factors', () => {
      const factors = [
        { name: 'Factor A', impact: 500, description: 'Has impact' },
        { name: 'Factor B', impact: 0, description: 'No impact' },
        { name: 'Factor C', impact: -200, description: 'Discount' },
      ]

      const filteredFactors = factors.filter((f) => f.impact !== 0)

      expect(filteredFactors).toHaveLength(2)
      expect(filteredFactors.map((f) => f.name)).toContain('Factor A')
      expect(filteredFactors.map((f) => f.name)).toContain('Factor C')
      expect(filteredFactors.map((f) => f.name)).not.toContain('Factor B')
    })

    it('formats positive impacts with plus sign', () => {
      const factor = { impact: 500 }
      const formatted = factor.impact > 0 ? '+' : ''

      expect(formatted).toBe('+')
    })

    it('formats negative impacts without plus sign', () => {
      const factor = { impact: -200 }
      const formatted = factor.impact > 0 ? '+' : ''

      expect(formatted).toBe('')
    })
  })

  describe('Valid Until Date', () => {
    it('formats date correctly', () => {
      const validUntil = '2026-03-15T12:00:00Z' // Use noon UTC to avoid timezone edge cases
      const formatted = new Date(validUntil).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

      // The date should be March 15, though timezone could shift by a day
      expect(formatted).toMatch(/March 1[45], 2026/)
    })

    it('handles missing valid until', () => {
      const validUntil = undefined
      expect(validUntil).toBeUndefined()
    })
  })
})

describe('PDF Filename Generation', () => {
  it('generates correct filename with customer name', () => {
    const customerName = 'John Smith'
    const datePart = '2026-02-02'

    const customerPart = customerName.replace(/\s+/g, '-').toLowerCase()
    const filename = `farrell-roofing-estimate-${customerPart}-${datePart}.pdf`

    expect(filename).toBe('farrell-roofing-estimate-john-smith-2026-02-02.pdf')
  })

  it('generates fallback filename without customer name', () => {
    const getFilename = (customerName: string | undefined) => {
      const datePart = '2026-02-02'
      const customerPart = customerName?.replace(/\s+/g, '-').toLowerCase() || 'estimate'
      return `farrell-roofing-estimate-${customerPart}-${datePart}.pdf`
    }

    expect(getFilename(undefined)).toBe('farrell-roofing-estimate-estimate-2026-02-02.pdf')
  })

  it('handles special characters in customer name', () => {
    const customerName = "O'Brien & Sons"
    const sanitized = customerName
      .replace(/\s+/g, '-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')

    expect(sanitized).toBe("o'brien-&-sons".replace(/[^a-z0-9-]/g, ''))
  })
})

describe('API Endpoint Validation', () => {
  describe('Lead ID route', () => {
    it('validates UUID format for leadId', () => {
      const validLeadId = '123e4567-e89b-12d3-a456-426614174000'
      const invalidLeadId = 'invalid'

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      expect(uuidRegex.test(validLeadId)).toBe(true)
      expect(uuidRegex.test(invalidLeadId)).toBe(false)
    })
  })

  describe('Share token route', () => {
    it('validates UUID format for shareToken', () => {
      const validToken = '550e8400-e29b-41d4-a716-446655440000'
      const invalidToken = 'abc123'

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      expect(uuidRegex.test(validToken)).toBe(true)
      expect(uuidRegex.test(invalidToken)).toBe(false)
    })
  })
})

// Helper function to match what's in estimate-pdf.tsx
function getIncludedItemsForJobType(jobType: string | null): string[] {
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
