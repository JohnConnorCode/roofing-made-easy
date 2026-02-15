import { vi, describe, it, expect } from 'vitest'

// Mock the business config module so the import inside advisor.ts resolves
// without pulling in real config or environment dependencies.
vi.mock('@/lib/config/business', () => ({
  BUSINESS_CONFIG: {
    name: 'Test Roofing Co',
    tagline: 'Test tagline',
    phone: { raw: '+1-555-000-1234', display: '(555) 000-1234' },
    email: { primary: 'test@example.com' },
    hours: {
      weekdays: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '13:00' },
      sunday: null,
    },
  },
}))

import { parseAdvisorResponse } from '@/lib/ai/advisor'

// ---------------------------------------------------------------------------
// Helper to build raw AI text containing a single markdown link.
// Uses hrefs without parentheses so the markdown regex matches cleanly.
// ---------------------------------------------------------------------------
function textWithLink(label: string, href: string): string {
  return `Here is some advice. [${label}](${href})`
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('parseAdvisorResponse -- href validation', () => {
  describe('safe hrefs pass through', () => {
    it('allows a relative path like /portal/insurance', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Start a Claim', '/portal/insurance'),
      )

      expect(suggestedActions).toHaveLength(1)
      expect(suggestedActions[0].href).toBe('/portal/insurance')
      expect(suggestedActions[0].label).toBe('Start a Claim')
    })

    it('allows a relative path like /portal/financing', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Explore Financing', '/portal/financing'),
      )

      expect(suggestedActions).toHaveLength(1)
      expect(suggestedActions[0].href).toBe('/portal/financing')
    })

    it('allows a relative path like /portal/assistance', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Find Programs', '/portal/assistance'),
      )

      expect(suggestedActions).toHaveLength(1)
      expect(suggestedActions[0].href).toBe('/portal/assistance')
    })

    it('allows an https URL', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Book Now', 'https://calendly.com/example'),
      )

      expect(suggestedActions).toHaveLength(1)
      expect(suggestedActions[0].href).toBe('https://calendly.com/example')
    })

    it('resolves the CALENDLY keyword', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Schedule a Free Consultation', 'CALENDLY'),
      )

      expect(suggestedActions).toHaveLength(1)
      // Falls back to /contact when NEXT_PUBLIC_CALENDLY_URL is not set
      expect(suggestedActions[0].href).toBe('/contact')
    })

    it('resolves the PHONE keyword to a tel: link', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Call Us', 'PHONE'),
      )

      expect(suggestedActions).toHaveLength(1)
      expect(suggestedActions[0].href).toMatch(/^tel:\+?[\d]+$/)
    })
  })

  describe('dangerous schemes are filtered out', () => {
    it('filters out javascript: hrefs', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Click Me', 'javascript:void'),
      )

      expect(suggestedActions).toHaveLength(0)
    })

    it('filters out javascript: with document.cookie payload', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('XSS', 'javascript:document.cookie'),
      )

      expect(suggestedActions).toHaveLength(0)
    })

    it('filters out data: hrefs', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Payload', 'data:text/html,<h1>XSS</h1>'),
      )

      expect(suggestedActions).toHaveLength(0)
    })

    it('filters out data: with base64 encoding', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Hidden', 'data:text/html;base64,PHNjcmlwdD4='),
      )

      expect(suggestedActions).toHaveLength(0)
    })

    it('filters out vbscript: hrefs', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('VB', 'vbscript:MsgBox'),
      )

      expect(suggestedActions).toHaveLength(0)
    })
  })

  describe('case-insensitive blocking', () => {
    it('filters out JavaScript: with mixed case', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Click', 'JavaScript:void'),
      )

      expect(suggestedActions).toHaveLength(0)
    })

    it('filters out JAVASCRIPT: in all caps', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Click', 'JAVASCRIPT:void'),
      )

      expect(suggestedActions).toHaveLength(0)
    })

    it('filters out JaVaScRiPt: with alternating case', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Click', 'JaVaScRiPt:void'),
      )

      expect(suggestedActions).toHaveLength(0)
    })

    it('filters out DATA: in uppercase', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Click', 'DATA:text/html,<h1>XSS</h1>'),
      )

      expect(suggestedActions).toHaveLength(0)
    })

    it('filters out VbScript: with mixed case', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Click', 'VbScript:MsgBox'),
      )

      expect(suggestedActions).toHaveLength(0)
    })
  })

  describe('whitespace bypass attempts', () => {
    it('filters out "java script:" with embedded space', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Click', 'java script:void'),
      )

      expect(suggestedActions).toHaveLength(0)
    })

    it('filters out "j a v a s c r i p t:" with spaces between every letter', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Click', 'j a v a s c r i p t:void'),
      )

      expect(suggestedActions).toHaveLength(0)
    })

    it('filters out javascript with tab characters', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Click', 'java\tscript:void'),
      )

      expect(suggestedActions).toHaveLength(0)
    })

    it('filters out javascript with newline characters', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Click', 'java\nscript:void'),
      )

      expect(suggestedActions).toHaveLength(0)
    })

    it('filters out "d ata:" with embedded space', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Click', 'd ata:text/html,<h1>XSS</h1>'),
      )

      expect(suggestedActions).toHaveLength(0)
    })

    it('filters out "vb script:" with embedded space', () => {
      const { suggestedActions } = parseAdvisorResponse(
        textWithLink('Click', 'vb script:MsgBox'),
      )

      expect(suggestedActions).toHaveLength(0)
    })
  })

  describe('message text extraction', () => {
    it('strips markdown links from the message text', () => {
      const { message } = parseAdvisorResponse(
        'Check out [Financing Options](/portal/financing) for more details.',
      )

      expect(message).toBe('Check out Financing Options for more details.')
    })

    it('strips dangerous links from text even though actions are filtered', () => {
      const { message, suggestedActions } = parseAdvisorResponse(
        'Try [this](javascript:void) link.',
      )

      // The dangerous action is filtered from suggestedActions
      expect(suggestedActions).toHaveLength(0)
      // But the label text is still preserved in the message
      expect(message).toBe('Try this link.')
    })
  })

  describe('deduplication', () => {
    it('deduplicates suggested actions by label', () => {
      const raw =
        'First [Start a Claim](/portal/insurance) and then [Start a Claim](/portal/insurance) again.'

      const { suggestedActions } = parseAdvisorResponse(raw)

      expect(suggestedActions).toHaveLength(1)
      expect(suggestedActions[0].label).toBe('Start a Claim')
    })
  })

  describe('mixed safe and dangerous links', () => {
    it('keeps safe links and filters dangerous ones from the same response', () => {
      const raw = [
        'You can [Explore Financing](/portal/financing) to get started.',
        'Also try [Click Here](javascript:void) for more info.',
        'Or [Find Programs](/portal/assistance) to see what you qualify for.',
      ].join('\n')

      const { suggestedActions } = parseAdvisorResponse(raw)

      expect(suggestedActions).toHaveLength(2)
      expect(suggestedActions.map((a) => a.label)).toEqual([
        'Explore Financing',
        'Find Programs',
      ])
      expect(suggestedActions.map((a) => a.href)).toEqual([
        '/portal/financing',
        '/portal/assistance',
      ])
    })
  })
})
