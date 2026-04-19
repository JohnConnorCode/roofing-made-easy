/**
 * Homepage FAQ Items
 *
 * Shared between the homepage client component and server-side metadata/schemas.
 */

export interface FAQItem {
  question: string
  answer: string
}

export const HOMEPAGE_FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How can you give me an accurate estimate online?',
    answer: "We calculate it the same way a local roofer would — using current material costs, regional labor rates, and the specifics of your roof (size, pitch, complexity, tear-off). For an average replacement, the range we give lands close to the final bid. For unusual roofs or big storm damage, we'll tell you directly that an in-person look is worth it.",
  },
  {
    question: 'Can this help with an insurance claim?',
    answer: "Yes. After hail or wind damage, we document the roof with drone photos, match it to the coverage language your adjuster expects, and walk the claim through with you. It's included with any job we take on, and the estimate PDF gives you a starting point even if you're shopping your claim around.",
  },
  {
    question: "What's different from getting quotes the usual way?",
    answer: "You skip the part where three contractors come to your house and give you three wildly different numbers. You get a grounded range first — built from real local material and labor rates — plus the tools to navigate insurance, financing, and assistance. When you're ready to talk, you already know what's fair.",
  },
  {
    question: 'Who built this?',
    answer: "Smart Roof Pricing is a tool built and operated by Farrell Roofing, a family roofing business in Northeast Mississippi. We put it together because homeowners kept getting quotes all over the map after storms — and because the methodology works. The pricing here is the same one we run on our own jobs.",
  },
  {
    question: 'What happens after I get the estimate?',
    answer: "You get a PDF you can keep, share with family, or hand to your insurance adjuster. If you want us to come do the work, reach out. If you'd rather use the estimate to sanity-check another contractor, that's fine too. No pressure either way.",
  },
  {
    question: 'Is this really free?',
    answer: "Yes. No account, no payment info, no trial. We'd rather give you the number up front than have you guess.",
  },
  {
    question: 'What if my roof needs more than just shingles?',
    answer: "The estimate covers the most common path — tear-off, underlayment, shingles or metal, and labor. If there's deck rot, chimney flashing issues, or structural problems, those come up once we see it in person. We'll tell you honestly what's standard and what's an add-on.",
  },
  {
    question: "What if I can't pay out of pocket?",
    answer: "That's what the insurance, assistance, and financing stack is for. Most homeowners don't end up paying sticker — we walk you through what your claim covers, which state or county programs you qualify for, and what a real monthly number looks like on what's left. You don't need a plan before you start — the tool helps you build one.",
  },
]
