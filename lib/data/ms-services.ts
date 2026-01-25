// Mississippi Service + Location Data for SEO
// Creates unique pages for service + location combinations

export interface ServiceLocation {
  serviceSlug: string
  serviceName: string
  serviceDescription: string
  keywords: string[]
  benefits: string[]
  process: string[]
  faqs: Array<{ question: string; answer: string }>
}

export const msServices: ServiceLocation[] = [
  {
    serviceSlug: 'roof-replacement',
    serviceName: 'Roof Replacement',
    serviceDescription: 'Complete roof tear-off and installation with premium materials built to withstand Mississippi weather.',
    keywords: ['roof replacement', 'new roof', 'reroof', 'roof installation'],
    benefits: [
      'Increased home value and curb appeal',
      'Better energy efficiency with modern materials',
      'Full manufacturer warranty protection',
      'Improved storm and wind resistance',
      'Peace of mind for decades to come'
    ],
    process: [
      'Free inspection and detailed estimate',
      'Material selection and color matching',
      'Complete tear-off of old roofing',
      'Deck inspection and repairs as needed',
      'Installation of underlayment and flashing',
      'New shingle or metal roof installation',
      'Final inspection and cleanup'
    ],
    faqs: [
      {
        question: 'How long does a roof replacement take?',
        answer: 'Most residential roof replacements are completed in 1-3 days, depending on the size and complexity of your roof. Larger homes or those requiring structural repairs may take longer.'
      },
      {
        question: 'What roofing materials do you recommend?',
        answer: 'For Mississippi homes, we typically recommend impact-resistant architectural shingles or metal roofing. Both handle our severe weather well and offer excellent longevity.'
      },
      {
        question: 'Do you handle the permit process?',
        answer: 'Yes, we handle all permitting requirements as part of our service, ensuring your project meets local building codes and passes all inspections.'
      }
    ]
  },
  {
    serviceSlug: 'roof-repair',
    serviceName: 'Roof Repair',
    serviceDescription: 'Expert repairs for leaks, damaged shingles, and storm damage to extend the life of your existing roof.',
    keywords: ['roof repair', 'fix roof leak', 'shingle repair', 'roof patching'],
    benefits: [
      'Stop leaks and prevent water damage',
      'Extend the life of your existing roof',
      'More affordable than full replacement',
      'Quick turnaround times',
      'Maintain your home\'s protection'
    ],
    process: [
      'Thorough roof inspection',
      'Identify all damage and problem areas',
      'Provide detailed repair estimate',
      'Source matching materials',
      'Complete professional repairs',
      'Test and verify work quality'
    ],
    faqs: [
      {
        question: 'How do I know if I need repair or replacement?',
        answer: 'If damage is localized to a small area and your roof is less than 15 years old, repair is usually the best option. We provide honest assessments and will recommend replacement only when truly necessary.'
      },
      {
        question: 'Can you match my existing shingles?',
        answer: 'We maintain relationships with all major manufacturers and can typically match or closely approximate your existing shingles. We\'ll show you samples before any work begins.'
      }
    ]
  },
  {
    serviceSlug: 'storm-damage-repair',
    serviceName: 'Storm Damage Repair',
    serviceDescription: 'Emergency response and insurance claim assistance for roofs damaged by Mississippi storms, wind, and hail.',
    keywords: ['storm damage', 'hail damage', 'wind damage', 'emergency roof repair', 'insurance claim'],
    benefits: [
      '24/7 emergency response available',
      'Direct insurance company communication',
      'Detailed damage documentation',
      'Temporary protection while awaiting repairs',
      'Full restoration to pre-storm condition'
    ],
    process: [
      'Emergency tarp or temporary repair if needed',
      'Comprehensive damage assessment',
      'Photo documentation for insurance',
      'Insurance claim filing assistance',
      'Meet with adjuster on-site',
      'Complete repairs once approved',
      'Final walkthrough and warranty'
    ],
    faqs: [
      {
        question: 'Do you work with insurance companies?',
        answer: 'Yes, we have extensive experience working with all major insurance companies. We document all damage, provide detailed estimates, and communicate directly with your adjuster to help ensure fair compensation.'
      },
      {
        question: 'How quickly can you respond to storm damage?',
        answer: 'We offer 24/7 emergency response for active leaks and severe damage. For assessments after storms pass through the area, we typically schedule within 24-48 hours.'
      },
      {
        question: 'Should I file an insurance claim?',
        answer: 'We provide free storm damage inspections and can advise whether the damage warrants a claim. We\'ll give you an honest assessment before you involve your insurance company.'
      }
    ]
  },
  {
    serviceSlug: 'roof-inspection',
    serviceName: 'Roof Inspection',
    serviceDescription: 'Comprehensive roof assessments for home buyers, sellers, and preventive maintenance planning.',
    keywords: ['roof inspection', 'roof assessment', 'home inspection', 'roof condition report'],
    benefits: [
      'Detailed written report with photos',
      'Identify problems before they worsen',
      'Plan and budget for future repairs',
      'Required for real estate transactions',
      'Maintain warranty compliance'
    ],
    process: [
      'Schedule convenient inspection time',
      'Exterior roof examination',
      'Attic inspection (if accessible)',
      'Flashing and penetration check',
      'Gutter and drainage assessment',
      'Detailed report with recommendations'
    ],
    faqs: [
      {
        question: 'How often should I have my roof inspected?',
        answer: 'We recommend annual inspections, ideally in spring after winter weather and before storm season. Homes over 15 years old or after any major storm should be inspected more frequently.'
      },
      {
        question: 'What does a roof inspection include?',
        answer: 'Our inspection covers shingles, flashing, vents, gutters, attic ventilation, and structural components. You\'ll receive a detailed report with photos and maintenance recommendations.'
      }
    ]
  },
  {
    serviceSlug: 'metal-roofing',
    serviceName: 'Metal Roofing',
    serviceDescription: 'Premium metal roof installation for superior durability, energy efficiency, and storm protection.',
    keywords: ['metal roof', 'standing seam', 'metal roofing', 'steel roof'],
    benefits: [
      '50+ year lifespan with minimal maintenance',
      'Superior wind and hail resistance',
      'Energy efficient - reflects heat',
      'Fire resistant Class A rating',
      'Environmentally friendly and recyclable'
    ],
    process: [
      'Design consultation and material selection',
      'Precise measurements and ordering',
      'Remove existing roofing if needed',
      'Install underlayment and trim',
      'Custom panel fabrication and installation',
      'Ridge caps and finishing details'
    ],
    faqs: [
      {
        question: 'Is metal roofing loud when it rains?',
        answer: 'Modern metal roofs installed over solid decking and with proper underlayment are no louder than shingle roofs. The insulation and attic space absorb sound effectively.'
      },
      {
        question: 'Does metal roofing attract lightning?',
        answer: 'No. Metal roofing does not attract lightning. In fact, if struck, metal roofs are safer because they\'re non-combustible and will disperse the energy.'
      },
      {
        question: 'What colors are available?',
        answer: 'Metal roofing comes in dozens of colors and styles, from traditional standing seam to panels that mimic wood shake or slate. We\'ll help you find the perfect match for your home.'
      }
    ]
  }
]

export function getServiceBySlug(slug: string): ServiceLocation | undefined {
  return msServices.find(s => s.serviceSlug === slug)
}

export function getAllServiceSlugs(): string[] {
  return msServices.map(s => s.serviceSlug)
}

// Note: For service + city combinations, import getAllCitySlugs from ms-locations
// in the consuming file to avoid circular dependencies
