/**
 * Blog post validation utilities.
 * Validates generated content meets quality and SEO requirements.
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    wordCount: number
    h2Count: number
    h3Count: number
    internalLinkCount: number
    boldTermCount: number
  }
}

const AI_CLICHES = [
  "in today's world",
  "in today's",
  "it's important to note",
  "it's worth noting",
  "in conclusion",
  "to sum up",
  "in summary",
  "when it comes to",
  "at the end of the day",
  "whether you're a",
  "let's dive in",
  "let's explore",
  "let's take a look",
  "look no further",
  "navigate the",
  "navigate this process",
  "robust",
  "comprehensive",
  "cutting-edge",
  "game-changer",
  "game changer",
  "leverage",
]

const MISSISSIPPI_CITIES = [
  'tupelo', 'jackson', 'hattiesburg', 'biloxi', 'gulfport',
  'meridian', 'southaven', 'olive branch', 'oxford', 'starkville',
  'columbus', 'vicksburg', 'natchez', 'pearl', 'brandon',
  'madison', 'ridgeland', 'clinton', 'greenville', 'laurel',
  'pascagoula', 'ocean springs', 'gautier', 'desoto county',
  'hinds county', 'harrison county', 'rankin county', 'lee county',
  'forrest county', 'lauderdale county', 'lafayette county',
  'gulf coast', 'mississippi delta', 'pine belt', 'capital city',
  'hub city', 'northeast mississippi', 'east mississippi',
]

const VALID_INTERNAL_PATHS = [
  '/services/roof-replacement',
  '/services/roof-repair',
  '/services/roof-inspection',
  '/services/gutters',
  '/services/roof-maintenance',
  '/services/emergency-repair',
  '/pricing',
  '/pricing/roof-replacement-cost',
  '/pricing/metal-roof-cost',
  '/roofing-materials',
  '/about',
  '/service-areas',
  '/blog/',
]

export function validatePost(content: string, title: string, existingSlugs: string[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const lower = content.toLowerCase()

  // Word count
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length
  if (wordCount < 750) {
    errors.push(`Word count too low: ${wordCount} (minimum 750)`)
  } else if (wordCount > 2500) {
    warnings.push(`Word count high: ${wordCount} (target 900-2500)`)
  }

  // H2 sections
  const h2Matches = content.match(/^## .+$/gm) || []
  const h2Count = h2Matches.length
  if (h2Count < 3) {
    errors.push(`Too few H2 sections: ${h2Count} (minimum 3)`)
  }

  // H3 subsections
  const h3Matches = content.match(/^### .+$/gm) || []
  const h3Count = h3Matches.length

  // Internal links
  const linkMatches = content.match(/\[([^\]]+)\]\(\/[^)]+\)/g) || []
  const internalLinkCount = linkMatches.length
  if (internalLinkCount < 1) {
    errors.push(`No internal links found (minimum 1)`)
  }

  // Validate internal link paths
  for (const link of linkMatches) {
    const pathMatch = link.match(/\]\((\/[^)]+)\)/)
    if (pathMatch) {
      const path = pathMatch[1]
      const isValid = VALID_INTERNAL_PATHS.some(valid => path.startsWith(valid))
      if (!isValid) {
        warnings.push(`Internal link path may be invalid: ${path}`)
      }
    }
  }

  // Bold terms
  const boldMatches = content.match(/\*\*[^*]+\*\*/g) || []
  const boldTermCount = boldMatches.length
  if (boldTermCount < 3) {
    warnings.push(`Few bold terms: ${boldTermCount} (recommend 5+)`)
  }

  // AI cliches
  for (const cliche of AI_CLICHES) {
    if (lower.includes(cliche)) {
      errors.push(`Contains AI cliche: "${cliche}"`)
    }
  }

  // Em-dash overuse
  const emDashCount = (content.match(/—/g) || []).length
  if (emDashCount > 2) {
    warnings.push(`Em-dash overuse: ${emDashCount} (max 2 recommended)`)
  }

  // Mississippi references
  const msRefs = MISSISSIPPI_CITIES.filter(city => lower.includes(city))
  if (msRefs.length < 2) {
    warnings.push(`Few Mississippi location references: ${msRefs.length} (recommend 2+)`)
  }

  // Mississippi weather/climate reference
  const weatherTerms = ['humid', 'hurricane', 'tornado', 'thunderstorm', 'storm season', 'subtropical', 'hail', 'severe weather', 'wind zone']
  const hasWeatherRef = weatherTerms.some(term => lower.includes(term))
  if (!hasWeatherRef) {
    warnings.push('No Mississippi weather/climate reference found')
  }

  // CTA check — should mention Smart Roof Pricing near the end
  const lastThird = content.slice(Math.floor(content.length * 0.66))
  if (!lastThird.toLowerCase().includes('smart roof pricing')) {
    warnings.push('No CTA mentioning Smart Roof Pricing in the last third of the post')
  }

  // Check for duplicate title similarity with existing posts
  // (basic check — could be improved with proper similarity scoring)
  const titleWords = title.toLowerCase().split(/\s+/)
  // No duplicate check needed here — slug uniqueness is checked by the caller

  // Check content doesn't start with the title (we provide it separately)
  if (content.trim().startsWith('# ')) {
    warnings.push('Content starts with H1 — title is provided separately, content should start with opening paragraph')
  }

  const valid = errors.length === 0

  return {
    valid,
    errors,
    warnings,
    stats: {
      wordCount,
      h2Count,
      h3Count,
      internalLinkCount,
      boldTermCount,
    },
  }
}

/**
 * Humanizer pass — remove common AI writing patterns via string processing.
 * This is a code-based cleanup, not a second AI call.
 */
export function humanizerPass(content: string): string {
  let result = content

  // Remove excessive em-dashes (keep first 2, replace rest with commas or periods)
  let emDashCount = 0
  result = result.replace(/—/g, () => {
    emDashCount++
    return emDashCount <= 2 ? '—' : ','
  })

  // Remove "It's worth noting that " / "It's important to note that "
  result = result.replace(/It's worth noting that /gi, '')
  result = result.replace(/It's important to note that /gi, '')
  result = result.replace(/It is worth noting that /gi, '')
  result = result.replace(/It is important to note that /gi, '')

  // Remove "In today's [word],"
  result = result.replace(/In today's \w+,?\s*/gi, '')

  // Remove "In conclusion," / "To sum up," / "In summary,"
  result = result.replace(/In conclusion,?\s*/gi, '')
  result = result.replace(/To sum up,?\s*/gi, '')
  result = result.replace(/In summary,?\s*/gi, '')

  // Replace "When it comes to X," with just "For X,"
  result = result.replace(/When it comes to ([^,]+),/gi, 'For $1,')

  // Replace "At the end of the day," with ""
  result = result.replace(/At the end of the day,?\s*/gi, '')

  // Replace common AI adjectives (catch word variants like robustness, leveraging, etc.)
  result = result.replace(/\brobust\w*/gi, 'solid')
  result = result.replace(/\bcomprehensiv\w*/gi, 'thorough')
  result = result.replace(/\bcutting-edge\b/gi, 'modern')
  result = result.replace(/\bgame-changer\b/gi, 'real advantage')
  result = result.replace(/\bgame changer\b/gi, 'real advantage')
  result = result.replace(/\bleverag\w*/gi, 'use')

  // Replace "navigate the/this" phrases — \S+ handles numbers, mixed-case, etc.
  result = result.replace(/navigate the \S+/gi, (match) => match.replace(/navigate the /i, 'work through the '))
  result = result.replace(/navigate this process/gi, 'work through the process')

  // Replace "Let's dive in" / "Let's explore" / "Let's take a look"
  result = result.replace(/Let's dive in\.?\s*/gi, '')
  result = result.replace(/Let's explore\.?\s*/gi, '')
  result = result.replace(/Let's take a look\.?\s*/gi, '')
  result = result.replace(/Let's take a closer look\.?\s*/gi, '')

  // Replace "look no further"
  result = result.replace(/look no further/gi, 'here\'s what you need')

  // Clean up any double spaces created by removals
  result = result.replace(/  +/g, ' ')

  // Clean up sentences that now start with lowercase after removal
  result = result.replace(/\. ([a-z])/g, (_, letter) => `. ${letter.toUpperCase()}`)

  // Capitalize first character of the string if it's lowercase
  result = result.replace(/^([a-z])/, (_, letter) => letter.toUpperCase())

  // Capitalize first character after newlines if it's lowercase (paragraph starts)
  result = result.replace(/\n([a-z])/g, (_, letter) => `\n${letter.toUpperCase()}`)

  // Clean up empty lines created by removals
  result = result.replace(/\n{3,}/g, '\n\n')

  return result.trim()
}

/**
 * Calculate read time based on word count (assumes 200 wpm average reading speed).
 */
export function calculateReadTime(content: string): number {
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length
  return Math.max(1, Math.ceil(wordCount / 200))
}
