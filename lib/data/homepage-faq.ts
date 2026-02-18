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
    question: 'How can an online estimate be accurate without seeing my roof?',
    answer: "We combine satellite imagery of your property with data from 50,000+ roofing projects to calculate material costs, regional labor rates, and complexity factors. Our estimates typically land within 10-15% of final contractor quotes. For unusual or complex roofs, we recommend uploading photos for even greater accuracy.",
  },
  {
    question: 'Do you sell my information to contractors?',
    answer: "Absolutely not. Unlike lead-generation sites that sell your info to 5+ contractors (who then bombard you with calls), we keep your information private. You'll only hear from us if you explicitly request a consultation. No surprise calls, no pressure.",
  },
  {
    question: 'What makes this different from getting quotes the traditional way?',
    answer: "Traditional quoting means scheduling 3+ appointments, waiting days for callbacks, and getting wildly different numbers. One contractor quotes $12k, another says $24k—how do you know who's right? Our AI-powered system analyzes real market data so you know the fair price BEFORE talking to anyone.",
  },
  {
    question: 'Who built this and why should I trust it?',
    answer: "We're Smart Roof Pricing, a local Mississippi roofing company with 20+ years of experience. We built this because we were tired of seeing homeowners get ripped off by storm chasers and high-pressure salespeople. We use the same pricing methodology we use for our own jobs—honest, data-driven, no games.",
  },
  {
    question: 'What if I need more than just an estimate?',
    answer: "Your estimate is just the beginning. From there, you can explore financing options (pre-qualify with no credit impact), get help navigating insurance claims, or discover assistance programs you may qualify for. Everything connects so you can go from estimate to new roof with confidence.",
  },
  {
    question: 'Is this really free?',
    answer: "Yes, 100% free with no strings attached. No account required, no payment info needed. We believe homeowners deserve to know what their roof costs before making any decisions. The estimate tool will always be free.",
  },
  {
    question: 'What happens after I get my estimate?',
    answer: "You get access to a personal dashboard where you can download your estimate as a PDF, share it with family or contractors, explore financing options with our payment calculator, check if your roof qualifies for insurance coverage, and browse 50+ assistance programs. Everything you need to go from estimate to new roof is in one place.",
  },
  {
    question: 'How is this different from HomeAdvisor or Angi?',
    answer: "Those sites are lead generators\u2014they collect your info and sell it to multiple contractors who then call you nonstop. We do the opposite. You get an instant price range powered by real data, keep your information private, and decide on your own terms whether to move forward. No middleman, no info selling, no pressure calls.",
  },
]
