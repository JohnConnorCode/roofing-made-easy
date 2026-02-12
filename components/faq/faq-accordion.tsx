'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
  className?: string
}

/**
 * FAQ Accordion Component
 *
 * Expandable accordion for frequently asked questions.
 * Builds trust, captures long-tail SEO, and answers common questions.
 */
export function FAQAccordion({ items, className }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => (
        <FAQAccordionItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onToggle={() => toggleItem(index)}
        />
      ))}
    </div>
  )
}

interface FAQAccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function FAQAccordionItem({ question, answer, isOpen, onToggle }: FAQAccordionItemProps) {
  return (
    <div className={cn(
      'rounded-xl border border-slate-700/50 bg-[#1a1f2e] overflow-hidden transition-all duration-200 hover:border-slate-600',
      isOpen && 'border-[#c9a25c]/30'
    )}>
      <button
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.slice(0, 20).replace(/\s/g, '-')}`}
      >
        <span className="text-base font-medium text-slate-100 pr-4">{question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 flex-shrink-0 text-[#c9a25c] transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <div
        id={`faq-answer-${question.slice(0, 20).replace(/\s/g, '-')}`}
        className={cn(
          'overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none',
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
        role="region"
        aria-hidden={!isOpen}
      >
        <div className="px-6 pb-4 text-slate-400 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  )
}

/**
 * Default FAQ items for the roofing estimate service
 */
export const DEFAULT_FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How accurate is this estimate?',
    answer: 'Our estimates are typically within 10-15% of actual contractor quotes. We use current material costs, local labor rates, and data from thousands of similar projects to provide you with a realistic price range. Final pricing will be confirmed after an on-site inspection.',
  },
  {
    question: 'Is my information secure?',
    answer: 'Yes, absolutely. We use industry-standard encryption to protect your data. We never sell your information to third parties or share it with contractors without your explicit consent. Your privacy is our priority.',
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No account is required. Simply answer a few questions about your roof and you\'ll receive your estimate immediately. If you want to schedule a consultation, you can provide your contact information at that point.',
  },
  {
    question: 'How long does it take to get an estimate?',
    answer: 'Most homeowners complete the questionnaire in under 2 minutes and receive their estimate instantly. The more details you provide (including photos), the more accurate your estimate will be.',
  },
  {
    question: 'Will contractors start calling me?',
    answer: 'No. Unlike other estimate services, we don\'t sell your information to contractors. You\'ll only be contacted if you choose to schedule a consultation with us. No surprise calls, no pressure.',
  },
  {
    question: 'What if my roof is unusual or complex?',
    answer: 'Our estimate tool works for most residential roofs. If your roof has unique features (steep pitch, multiple levels, unusual materials), let us know in the description field and we\'ll factor that into your estimate. For very complex roofs, we recommend scheduling a free consultation.',
  },
]
