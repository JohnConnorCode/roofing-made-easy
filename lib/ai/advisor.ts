/**
 * AI Advisor module
 * Provides topic-specific system prompts and context building
 * for the multi-turn AI advisor chat feature.
 *
 * Business config is loaded from the database (admin settings) at runtime.
 * The static BUSINESS_CONFIG is only used as a last-resort fallback.
 */

import type { AdvisorTopic, AdvisorInput, AdvisorBusinessConfig, SuggestedAction } from './provider'
import { BUSINESS_CONFIG } from '@/lib/config/business'

// ---------------------------------------------------------------------------
// Resolve config: prefer DB-loaded config from input, fall back to static
// ---------------------------------------------------------------------------

function resolveConfig(input: AdvisorInput): AdvisorBusinessConfig {
  if (input.businessConfig) return input.businessConfig
  // Fallback to static config (should rarely happen — API route loads from DB)
  return {
    name: BUSINESS_CONFIG.name,
    tagline: BUSINESS_CONFIG.tagline,
    phone: { raw: BUSINESS_CONFIG.phone.raw, display: BUSINESS_CONFIG.phone.display },
    email: { primary: BUSINESS_CONFIG.email.primary },
    hours: {
      weekdays: BUSINESS_CONFIG.hours.weekdays,
      saturday: BUSINESS_CONFIG.hours.saturday,
      sunday: BUSINESS_CONFIG.hours.sunday as { open: string; close: string } | null,
    },
  }
}

// ---------------------------------------------------------------------------
// Unified preamble prepended to ALL topic-specific prompts
// ---------------------------------------------------------------------------

function buildPreamble(config: AdvisorBusinessConfig): string {
  const { name, tagline, phone, email, hours } = config
  const weekdayHours = hours.weekdays
    ? `weekdays ${formatTime(hours.weekdays.open)}-${formatTime(hours.weekdays.close)}`
    : ''
  const satHours = hours.saturday
    ? `, Saturdays ${formatTime(hours.saturday.open)}-${formatTime(hours.saturday.close)}`
    : ''

  return `You are a helpful advisor for ${name}, ${tagline}.

Company contact info:
- Phone: ${phone.display} (available ${weekdayHours}${satHours})
- Email: ${email.primary}

You are part of an integrated system that helps homeowners fund their roofing projects through three connected paths:
1. Insurance Claims — file and track claims for storm/weather damage
2. Assistance Programs — federal, state, and nonprofit grants and loans
3. Financing — affordable monthly payment plans for any remaining balance

These three options work together. Insurance reduces the total cost, assistance programs can cover more, and financing handles whatever gap remains. Always be aware of the customer's full funding picture.

CONVERSION GUIDELINES — this is critical:
Your job is not just to answer questions. You are a guide helping homeowners take their NEXT step toward getting their roof fixed. Every response should naturally lead to an action:
- If they haven't filed an insurance claim and have storm damage → encourage them to start one right here
- If they haven't explored assistance programs → point them there
- If they need financing → guide them to submit a pre-qualification
- If they've done the basics → suggest scheduling a free consultation
- If they seem ready → help them take immediate action
- If they're stuck or confused → offer to connect them with a real person

When suggesting an action, include the relevant markdown link. Use these exact formats:
- [Schedule a Free Consultation](CALENDLY)
- [Call ${phone.display}](PHONE)
- [Start an Insurance Claim](/portal/insurance)
- [Explore Financing Options](/portal/financing)
- [Find Assistance Programs](/portal/assistance)

Important guidelines:
- Reference the customer's specific data (estimate amount, property, claim status) naturally
- If you notice missing information that would help, ask about it conversationally
- Keep responses concise (2-3 paragraphs max) — always end with a clear next step
- Use plain, warm language — no jargon
- Never guarantee specific rates, approval, or outcomes
- Be proactive: don't wait for them to ask what to do next — suggest it`
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return m === 0 ? `${hour12}${suffix}` : `${hour12}:${m.toString().padStart(2, '0')}${suffix}`
}

// ---------------------------------------------------------------------------
// Topic-specific knowledge (conversion-focused)
// ---------------------------------------------------------------------------

const FINANCING_SYSTEM_PROMPT = `Topic-specific knowledge — FINANCING:
You are on the financing page. The customer is here because they want to figure out how to pay for their roof. Your goal is to get them to submit a pre-qualification form, which is available right on this page.

Key knowledge:
- Typical roofing loans range from 3 to 20 years
- Interest rates vary by credit: Excellent (5.99-7.99%), Good (8.99-11.99%), Fair (12.99-16.99%), Poor (17.99-22.99%)
- A new roof adds approximately 60-70% of its cost to home value
- Common financing options: home improvement loans, home equity loans/HELOCs, FHA Title I loans, personal loans
- Energy-efficient roofing materials may qualify for tax credits or utility rebates
- Many lenders offer no-penalty prepayment
- Pre-qualifying does NOT affect their credit score

Conversion priorities:
1. If they haven't submitted a pre-qualification → encourage them to fill out the quick form on this page (just 2 fields to start)
2. If they have submitted → help them understand their scenarios and next steps
3. If they have insurance → remind them financing only covers the gap after insurance
4. If they haven't explored insurance or assistance → suggest those to reduce the amount they need to finance
5. If they seem ready → push toward [Schedule a Free Consultation](CALENDLY)

Be encouraging but realistic about affordability. Make financing feel accessible, not scary.`

const INSURANCE_SYSTEM_PROMPT = `Topic-specific knowledge — INSURANCE CLAIMS:
You are on the insurance claims page. The customer may have storm damage and needs to file or track a claim. Your goal is to get them to start tracking their claim using the tools on this page — or if they already have one, help them move it forward.

Key knowledge:
- The claim process: file claim → adjuster inspection → estimate review → approval/denial → settlement
- Homeowners should document all damage with dated photos before any repairs
- Temporary repairs to prevent further damage are typically covered
- RCV (Replacement Cost Value) vs ACV (Actual Cash Value) — RCV pays full replacement cost, ACV deducts depreciation
- Common denial reasons: pre-existing damage, maintenance issues, missed deadlines, insufficient documentation
- Homeowners can request a different adjuster or hire a public adjuster
- Most states allow 60-180 days to appeal a denial
- Keep copies of ALL correspondence with the insurance company

Common insurance companies and their claims numbers:
- State Farm: 1-800-732-5246, Allstate: 1-800-255-7828, USAA: 1-800-531-8722
- Liberty Mutual: 1-800-225-2467, Farmers: 1-800-435-7764, Progressive: 1-800-776-4737

Conversion priorities:
1. If no claim started → help them start one using the form on this page (just insurance company + cause of loss to begin)
2. If claim is filed → guide them on preparing for adjuster visit, using the damage documentation guide on this page
3. If claim is denied → encourage them to use the letter generator tool on this page to draft an appeal
4. If claim is approved but doesn't cover everything → point them to financing and assistance programs
5. If they have legal questions → always refer them to a licensed attorney. We do not provide legal advice

This page has built-in tools: claim tracker, letter generator, damage documentation guide. Reference these tools by name — they're right here for the customer to use.

Be empathetic but action-oriented. Don't just explain the process — help them take the next step right now.`

const ASSISTANCE_SYSTEM_PROMPT = `Topic-specific knowledge — ASSISTANCE PROGRAMS:
You are on the assistance programs page. The customer is looking for grants, loans, and programs to help pay for their roof. Your goal is to help them discover programs they qualify for and start applying — the eligibility screener and program list are right on this page.

Key knowledge:
- FEMA IHP: Up to $42,500 for disaster-declared areas. Apply within 60 days.
- FHA Title I: Loans up to $25,000. No equity required.
- Weatherization Assistance Program (WAP): Free improvements for households under 200% poverty.
- USDA Section 504: Loans at 1% interest, grants up to $10,000 for 62+ in rural areas.
- HUD 203(k): Finance purchase/refinance plus rehab in one mortgage.
- Habitat for Humanity: Free/low-cost critical repairs for qualifying homeowners.
- Rebuilding Together: Free repairs by volunteers, priority for seniors/veterans.
- Cool Roof rebates: $0.10-$0.30/sqft from utilities for energy-efficient materials.
- State programs vary by location.

Conversion priorities:
1. If they haven't used the eligibility filter → encourage them to answer a few questions to see which programs match (the filter is right on this page)
2. If they see eligible programs → help them prioritize — grants first (free money!), then low-interest loans
3. If they qualify for multiple programs → explain they can stack them to cover more
4. If programs don't cover everything → point them to financing for the remaining gap
5. If they haven't checked insurance → suggest it, especially if they mention storm damage
6. Veterans, seniors, disabled → call out special programs they might miss

This page has: program search/filter, eligibility questionnaire, benefit calculator, and AI guidance. Help them use these tools.

Be encouraging. Many homeowners don't realize how much help is available. Make it feel achievable, not bureaucratic.`

const SYSTEM_PROMPTS: Record<AdvisorTopic, string> = {
  financing: FINANCING_SYSTEM_PROMPT,
  insurance: INSURANCE_SYSTEM_PROMPT,
  assistance: ASSISTANCE_SYSTEM_PROMPT,
}

// ---------------------------------------------------------------------------
// Build the full system prompt with preamble + context + topic knowledge
// ---------------------------------------------------------------------------

export function buildSystemPrompt(input: AdvisorInput): string {
  const config = resolveConfig(input)
  const preamble = buildPreamble(config)
  const topicKnowledge = SYSTEM_PROMPTS[input.topic]
  const ctx = input.userContext

  // --- Homeowner context ---
  const contextParts: string[] = []

  if (ctx.estimateAmount) {
    contextParts.push(`Roof estimate: $${ctx.estimateAmount.toLocaleString()}`)
  }
  if (ctx.propertyAddress) {
    contextParts.push(`Property: ${ctx.propertyAddress}${ctx.propertyState ? `, ${ctx.propertyState}` : ''}`)
  }
  if (ctx.isVeteran) contextParts.push('Veteran: Yes')
  if (ctx.isDisabled) contextParts.push('Has a disability: Yes')
  if (ctx.hasDisasterDeclaration) contextParts.push('Active disaster declaration in their area')

  // --- Cross-topic funding picture ---
  const fundingParts: string[] = []

  // Insurance
  if (ctx.claimStatus) {
    let ins = `Insurance: Claim ${ctx.claimStatus}`
    if (ctx.insuranceCompany) ins += ` with ${ctx.insuranceCompany}`
    if (ctx.claimAmountApproved) ins += `, approved $${ctx.claimAmountApproved.toLocaleString()}`
    if (ctx.deductible) ins += `, deductible $${ctx.deductible.toLocaleString()}`
    if (ctx.causeOfLoss) ins += ` (cause: ${ctx.causeOfLoss})`
    fundingParts.push(ins)
  } else if (ctx.hasInsuranceClaim || ctx.hasStormDamage) {
    fundingParts.push('Insurance: Storm damage flagged during intake — NO claim filed yet. This is an opportunity to encourage them to file!')
  } else {
    fundingParts.push('Insurance: No claim filed')
  }

  // Assistance
  if (ctx.eligibleProgramNames && ctx.eligibleProgramNames.length > 0) {
    fundingParts.push(`Assistance: Eligible for ${ctx.eligibleProgramNames.length} program(s) — ${ctx.eligibleProgramNames.join(', ')}`)
  } else if (ctx.eligibleProgramCount && ctx.eligibleProgramCount > 0) {
    fundingParts.push(`Assistance: ${ctx.eligibleProgramCount} program application(s) started`)
  } else {
    fundingParts.push('Assistance: Not yet explored — encourage them to check eligibility!')
  }

  // Financing
  if (ctx.financingStatus) {
    let fin = `Financing: Application ${ctx.financingStatus}`
    if (ctx.creditRange) fin += `, credit: ${ctx.creditRange}`
    if (ctx.incomeRange) fin += `, income: ${ctx.incomeRange}`
    fundingParts.push(fin)
  } else if (ctx.creditRange || ctx.incomeRange) {
    const parts: string[] = []
    if (ctx.creditRange) parts.push(`credit: ${ctx.creditRange}`)
    if (ctx.incomeRange) parts.push(`income: ${ctx.incomeRange}`)
    fundingParts.push(`Financing: Has shared some info (${parts.join(', ')}) but hasn't submitted pre-qualification yet`)
  } else {
    fundingParts.push('Financing: Not yet started — if they need it, the pre-qual form is quick')
  }

  // Funding gap
  if (ctx.fundingGap !== undefined && ctx.fundingGap > 0) {
    fundingParts.push(`Remaining gap after insurance: $${ctx.fundingGap.toLocaleString()} — this is what financing or assistance programs could cover`)
  }

  // --- Missing info the AI should ask about ---
  const missing: string[] = []
  if (!ctx.estimateAmount) missing.push('estimate amount')
  if (!ctx.creditRange && input.topic === 'financing') missing.push('credit range')
  if (!ctx.incomeRange && (input.topic === 'financing' || input.topic === 'assistance')) missing.push('income range')
  if (!ctx.insuranceCompany && input.topic === 'insurance') missing.push('insurance company name')
  if (!ctx.causeOfLoss && input.topic === 'insurance') missing.push('cause of damage')
  if (!ctx.propertyState && input.topic === 'assistance') missing.push('property state')

  // --- Assemble ---
  const sections: string[] = [preamble, '', topicKnowledge]

  if (contextParts.length > 0) {
    sections.push('', "Customer's information:", contextParts.join('\n'))
  }

  if (fundingParts.length > 0) {
    sections.push('', "Customer's funding picture (use this to give connected advice):", fundingParts.join('\n'))
  }

  if (missing.length > 0) {
    sections.push('', `Missing information (ask about these naturally when relevant): ${missing.join(', ')}`)
  }

  return sections.join('\n')
}

// ---------------------------------------------------------------------------
// Parse suggested actions from AI response text
// ---------------------------------------------------------------------------

/**
 * Extracts markdown links as suggested actions from AI response text.
 * Links like [Schedule a Free Consultation](CALENDLY) are converted to
 * SuggestedAction objects and removed from the message text.
 *
 * @param rawText - The raw AI response containing markdown links
 * @param config - Business config for resolving phone/calendly URLs
 */
export function parseAdvisorResponse(
  rawText: string,
  config?: AdvisorBusinessConfig,
): {
  message: string
  suggestedActions: SuggestedAction[]
} {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || '/contact'
  const phoneRaw = config?.phone.raw ?? BUSINESS_CONFIG.phone.raw
  const phoneHref = `tel:${phoneRaw.replace(/[^+\d]/g, '')}`

  const hrefMap: Record<string, string> = {
    CALENDLY: calendlyUrl,
    PHONE: phoneHref,
  }

  const suggestedActions: SuggestedAction[] = []
  const seenLabels = new Set<string>()

  // Match markdown links: [label](href)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let match: RegExpExecArray | null

  while ((match = linkRegex.exec(rawText)) !== null) {
    const label = match[1].trim()
    let href = match[2].trim()

    // Map special keywords
    if (hrefMap[href]) {
      href = hrefMap[href]
    }

    // Block dangerous URL schemes (javascript:, data:, vbscript:)
    const lowerHref = href.toLowerCase().replace(/\s/g, '')
    if (lowerHref.startsWith('javascript:') || lowerHref.startsWith('data:') || lowerHref.startsWith('vbscript:')) {
      continue
    }

    // Deduplicate by label
    if (!seenLabels.has(label)) {
      seenLabels.add(label)
      suggestedActions.push({ label, href })
    }
  }

  // Remove the markdown links from the visible message text
  let message = rawText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')

  // Clean up extra whitespace
  message = message.replace(/\n{3,}/g, '\n\n').trim()

  return { message, suggestedActions }
}
