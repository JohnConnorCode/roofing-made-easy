import { describe, it, expect } from 'vitest'
import { validatePost, humanizerPass, calculateReadTime } from '@/scripts/blog/validate'

describe('Blog Validation', () => {
  const makeContent = (overrides?: {
    wordCount?: number
    h2Count?: number
    internalLinks?: number
    msRefs?: string[]
    aiCliches?: string[]
    boldTerms?: number
  }) => {
    const {
      wordCount = 1600,
      h2Count = 4,
      internalLinks = 3,
      msRefs = ['tupelo', 'jackson', 'hattiesburg'],
      aiCliches = [],
      boldTerms = 5,
    } = overrides || {}

    const h2s = Array.from({ length: h2Count }, (_, i) => `## Section ${i + 1}`).join('\n\n')
    const links = Array.from(
      { length: internalLinks },
      (_, i) => `[link ${i}](/services/roof-replacement)`
    ).join(' ')
    const cities = msRefs.join(' ')
    const cliches = aiCliches.join(' ')
    const bolds = Array.from({ length: boldTerms }, (_, i) => `**term ${i}**`).join(' ')
    const filler = Array(Math.max(0, wordCount - 100))
      .fill('word')
      .join(' ')

    return `${h2s}\n\n${links}\n\n${cities}\n\n${cliches}\n\n${bolds}\n\nSome humid weather info.\n\n${filler}`
  }

  describe('validatePost', () => {
    it('passes valid content', () => {
      const content = makeContent()
      const result = validatePost(content, 'Test Title', [])
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('fails when word count is below 1500', () => {
      const content = makeContent({ wordCount: 500 })
      const result = validatePost(content, 'Test Title', [])
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(expect.stringContaining('Word count too low'))
    })

    it('warns when word count exceeds 2500', () => {
      const content = makeContent({ wordCount: 3000 })
      const result = validatePost(content, 'Test Title', [])
      expect(result.warnings).toContainEqual(expect.stringContaining('Word count high'))
    })

    it('fails when fewer than 3 H2 sections', () => {
      const content = makeContent({ h2Count: 2 })
      const result = validatePost(content, 'Test Title', [])
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(expect.stringContaining('Too few H2 sections'))
    })

    it('fails when fewer than 2 internal links', () => {
      const content = makeContent({ internalLinks: 1 })
      const result = validatePost(content, 'Test Title', [])
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(expect.stringContaining('Too few internal links'))
    })

    it('fails when fewer than 2 Mississippi location references', () => {
      const content = makeContent({ msRefs: ['tupelo'] })
      const result = validatePost(content, 'Test Title', [])
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('Too few Mississippi location references')
      )
    })

    it('fails when AI cliches are present', () => {
      const content = makeContent({ aiCliches: ["in today's world", 'robust'] })
      const result = validatePost(content, 'Test Title', [])
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(expect.stringContaining('AI cliche'))
    })

    it('warns when few bold terms', () => {
      const content = makeContent({ boldTerms: 1 })
      const result = validatePost(content, 'Test Title', [])
      expect(result.warnings).toContainEqual(expect.stringContaining('Few bold terms'))
    })

    it('warns on em-dash overuse', () => {
      const content = makeContent() + ' one — two — three — four'
      const result = validatePost(content, 'Test Title', [])
      expect(result.warnings).toContainEqual(expect.stringContaining('Em-dash overuse'))
    })

    it('warns when content starts with H1', () => {
      const content = '# My Title\n\n' + makeContent()
      const result = validatePost(content, 'Test Title', [])
      expect(result.warnings).toContainEqual(
        expect.stringContaining('Content starts with H1')
      )
    })

    it('warns on invalid internal link paths', () => {
      const content = makeContent({ internalLinks: 0 }) + '\n[link](/fake-path)\n[link2](/also-fake)\n[a](/services/roof-replacement)'
      const result = validatePost(content, 'Test Title', [])
      expect(result.warnings).toContainEqual(
        expect.stringContaining('Internal link path may be invalid')
      )
    })

    it('returns correct stats', () => {
      const content = makeContent({ h2Count: 5, internalLinks: 4, boldTerms: 7 })
      const result = validatePost(content, 'Test Title', [])
      expect(result.stats.h2Count).toBe(5)
      expect(result.stats.internalLinkCount).toBe(4)
      expect(result.stats.boldTermCount).toBe(7)
      expect(result.stats.wordCount).toBeGreaterThan(0)
    })
  })

  describe('humanizerPass', () => {
    it('removes "It\'s worth noting that"', () => {
      const result = humanizerPass("It's worth noting that roofs need maintenance.")
      expect(result).toBe('Roofs need maintenance.')
    })

    it('removes "In conclusion,"', () => {
      const result = humanizerPass('In conclusion, you should replace your roof.')
      expect(result).toBe('You should replace your roof.')
    })

    it('replaces "When it comes to X," with "For X,"', () => {
      const result = humanizerPass('When it comes to roofing, quality matters.')
      expect(result).toBe('For roofing, quality matters.')
    })

    it('removes "Let\'s dive in"', () => {
      const result = humanizerPass("Let's dive in. First, inspect the shingles.")
      expect(result).toBe('First, inspect the shingles.')
    })

    it('replaces "look no further"', () => {
      const result = humanizerPass('If you need a roofer, look no further.')
      expect(result).toBe("If you need a roofer, here's what you need.")
    })

    it('limits em-dashes to 2', () => {
      const result = humanizerPass('one — two — three — four — five')
      expect((result.match(/—/g) || []).length).toBe(2)
    })

    it('cleans up double spaces after removals', () => {
      const result = humanizerPass("In conclusion,  fix your roof.")
      expect(result).not.toContain('  ')
    })

    it('capitalizes sentences after removals', () => {
      const result = humanizerPass("Something. in conclusion, roofs matter.")
      expect(result).toBe('Something. Roofs matter.')
    })
  })

  describe('calculateReadTime', () => {
    it('returns 1 minute for short content', () => {
      expect(calculateReadTime('hello world')).toBe(1)
    })

    it('calculates correctly for ~1000 words', () => {
      const content = Array(1000).fill('word').join(' ')
      expect(calculateReadTime(content)).toBe(5)
    })

    it('calculates correctly for ~2000 words', () => {
      const content = Array(2000).fill('word').join(' ')
      expect(calculateReadTime(content)).toBe(10)
    })
  })
})
