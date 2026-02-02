// Insurance resources for the customer portal
// Guides, checklists, and templates for insurance claim assistance

export interface InsuranceResource {
  id: string
  title: string
  description: string
  type: 'checklist' | 'guide' | 'template' | 'video'
  category: 'filing' | 'documentation' | 'adjuster' | 'appeal' | 'general'
  content: string | string[]  // String for guides, string[] for checklists
  downloadUrl?: string
  videoUrl?: string
}

export interface InsuranceCompanyInfo {
  name: string
  claimsPhone: string
  claimsUrl?: string
  averageProcessingDays?: number
  notes?: string
}

// Common insurance companies and their claims contact info
export const INSURANCE_COMPANIES: InsuranceCompanyInfo[] = [
  {
    name: 'State Farm',
    claimsPhone: '1-800-732-5246',
    claimsUrl: 'https://www.statefarm.com/claims',
    averageProcessingDays: 14,
  },
  {
    name: 'Allstate',
    claimsPhone: '1-800-255-7828',
    claimsUrl: 'https://www.allstate.com/claims',
    averageProcessingDays: 15,
  },
  {
    name: 'USAA',
    claimsPhone: '1-800-531-8722',
    claimsUrl: 'https://www.usaa.com/claims',
    averageProcessingDays: 10,
  },
  {
    name: 'Liberty Mutual',
    claimsPhone: '1-800-225-2467',
    claimsUrl: 'https://www.libertymutual.com/claims-center',
    averageProcessingDays: 14,
  },
  {
    name: 'Farmers',
    claimsPhone: '1-800-435-7764',
    claimsUrl: 'https://www.farmers.com/claims',
    averageProcessingDays: 15,
  },
  {
    name: 'Progressive',
    claimsPhone: '1-800-776-4737',
    claimsUrl: 'https://www.progressive.com/claims',
    averageProcessingDays: 12,
  },
  {
    name: 'Nationwide',
    claimsPhone: '1-800-421-3535',
    claimsUrl: 'https://www.nationwide.com/personal/insurance/claims',
    averageProcessingDays: 14,
  },
  {
    name: 'Travelers',
    claimsPhone: '1-800-252-4633',
    claimsUrl: 'https://www.travelers.com/claims',
    averageProcessingDays: 14,
  },
  {
    name: 'American Family',
    claimsPhone: '1-800-692-6326',
    claimsUrl: 'https://www.amfam.com/claims',
    averageProcessingDays: 14,
  },
  {
    name: 'GEICO',
    claimsPhone: '1-800-841-3000',
    claimsUrl: 'https://www.geico.com/claims',
    averageProcessingDays: 12,
  },
]

export const INSURANCE_RESOURCES: InsuranceResource[] = [
  // Filing Guides
  {
    id: 'filing-guide',
    title: 'How to File a Roof Damage Claim',
    description: 'Step-by-step guide to filing your insurance claim correctly the first time.',
    type: 'guide',
    category: 'filing',
    content: `
# How to File a Roof Damage Claim

## Step 1: Document the Damage Immediately
- Take photos and videos of all visible damage
- Document the date and time of the storm/event
- Note any temporary repairs you make

## Step 2: Review Your Policy
- Find your policy declarations page
- Note your deductible amount
- Check coverage limits and exclusions
- Look for time limits for filing claims

## Step 3: Contact Your Insurance Company
- Call your claims hotline (see our company directory)
- Have your policy number ready
- Describe the damage clearly and factually
- Ask for a claim number and write it down

## Step 4: Prevent Further Damage
- Make temporary repairs to prevent additional damage
- Keep all receipts for materials
- Document all work done
- Don't make permanent repairs before inspection

## Step 5: Schedule the Adjuster Visit
- Request an appointment that works for you
- Plan to be present during the inspection
- Prepare your documentation and photos

## Step 6: Get Professional Estimates
- Get at least two contractor estimates
- Ensure contractors are licensed and insured
- Don't sign any contracts before approval

## Important Tips
- Never sign a contractor agreement before your claim is approved
- Keep copies of all correspondence
- Follow up in writing after phone calls
- Don't accept the first settlement if it seems low
    `,
  },

  // Documentation Checklist
  {
    id: 'documentation-checklist',
    title: 'Claim Documentation Checklist',
    description: 'Everything you need to gather before filing your insurance claim.',
    type: 'checklist',
    category: 'documentation',
    content: [
      'Photos of roof damage from multiple angles',
      'Photos showing the extent of damage',
      'Close-up photos of specific damaged areas',
      'Video walkthrough of damage if possible',
      'Date and time of damage event recorded',
      'Weather reports for the date of damage',
      'Copy of your insurance policy declarations page',
      'Policy number readily available',
      'List of all damaged items and areas',
      'Receipts for any temporary repairs',
      'Contact information for your insurance company',
      'Previous inspection reports if available',
      'Contractor estimates (at least two)',
      'Notes from any conversations with insurance',
    ],
  },

  // Adjuster Visit Preparation
  {
    id: 'adjuster-prep',
    title: 'Preparing for the Adjuster Visit',
    description: 'How to prepare for and handle your insurance adjuster inspection.',
    type: 'guide',
    category: 'adjuster',
    content: `
# Preparing for Your Adjuster Visit

## Before the Visit

### Gather Your Documentation
- All photos and videos of damage
- Receipts for temporary repairs
- Your insurance policy
- List of damaged areas

### Prepare Your Property
- Ensure safe access to the roof
- Clear any debris blocking access
- Mark damaged areas if possible
- Have a ladder available if needed

### Know Your Coverage
- Review your policy limits
- Understand your deductible
- Know what's covered and excluded

## During the Visit

### Be Present
- Always be there during the inspection
- Ask the adjuster to explain what they're looking at
- Point out all areas of damage you've documented

### Take Notes
- Write down everything the adjuster says
- Note what areas they inspect
- Record their name and contact information
- Ask for a copy of their report

### Don't Rush
- Ensure every area is inspected
- Ask questions if something is unclear
- Request they check areas you've identified

## After the Visit

### Follow Up
- Request a copy of the adjuster's report
- Review the report carefully
- Note any discrepancies with your documentation
- Contact your adjuster with questions

### Get Estimates
- Obtain professional roofing estimates
- Compare with adjuster's assessment
- Document any significant differences
    `,
  },

  // What Adjusters Look For
  {
    id: 'adjuster-inspection-guide',
    title: 'What Adjusters Look For',
    description: 'Understanding how adjusters evaluate roof damage claims.',
    type: 'guide',
    category: 'adjuster',
    content: `
# What Insurance Adjusters Look For

## Common Damage Signs

### Hail Damage
- Dents or dings on metal surfaces (vents, gutters)
- Bruising on shingles (soft spots)
- Granule loss on shingles
- Cracked or broken shingles
- Damage to skylights or roof accessories

### Wind Damage
- Missing shingles
- Lifted or curled shingles
- Exposed underlayment
- Damaged flashing
- Ridge cap damage

### Storm Damage
- Debris impact marks
- Tree limb damage
- Structural damage to decking
- Water intrusion signs

## Red Flags for Adjusters

### Pre-existing Damage
- Worn or aged shingles
- Previous improper repairs
- Normal wear and deterioration
- Damage inconsistent with storm patterns

### Maintenance Issues
- Moss or algae growth
- Clogged gutters
- Poor ventilation damage
- Neglected repairs

## How to Present Your Case

1. **Show the pattern** - Storm damage typically follows consistent patterns across the roof
2. **Point out collateral damage** - Show damage to vents, gutters, and other surfaces
3. **Provide timeline** - Show the roof was in good condition before the event
4. **Document everything** - Photos, receipts, and professional assessments
    `,
  },

  // Appeal Guide
  {
    id: 'appeal-guide',
    title: 'How to Appeal a Denied Claim',
    description: 'Steps to take if your insurance claim is denied or underpaid.',
    type: 'guide',
    category: 'appeal',
    content: `
# How to Appeal a Denied or Underpaid Claim

## Understanding the Denial

### Get It in Writing
- Request a written denial letter
- Review the specific reasons for denial
- Note any policy language they cite

### Common Denial Reasons
- Pre-existing damage
- Maintenance issues
- Damage not covered by policy
- Missed filing deadlines
- Insufficient documentation

## Building Your Appeal

### Step 1: Review Your Policy
- Read your policy carefully
- Find language that supports your claim
- Identify any misinterpretations by the adjuster

### Step 2: Gather Additional Evidence
- Get a professional roof inspection
- Obtain detailed contractor estimates
- Collect weather data from the event
- Take additional photos if needed

### Step 3: Write Your Appeal Letter
- State your claim number and policy number
- Explain why you disagree with the decision
- Cite specific policy language
- Include all supporting documentation
- Request a re-inspection if appropriate

### Step 4: Request a Re-Inspection
- Ask for a different adjuster
- Be present during the re-inspection
- Present your additional evidence
- Document everything again

## Escalation Options

### Internal Appeal
- Request supervisor review
- File formal complaint with company

### External Options
- Contact your state insurance commissioner
- Consider hiring a public adjuster
- Consult with an attorney if needed

## Important Deadlines
- Most states have appeal deadlines (typically 60-180 days)
- Check your policy for specific timeframes
- Keep records of all communication dates
    `,
  },

  // Sample Letter Templates
  {
    id: 'claim-letter-template',
    title: 'Claim Letter Template',
    description: 'Template letter for filing your initial roof damage claim.',
    type: 'template',
    category: 'filing',
    content: `
[Your Name]
[Your Address]
[City, State ZIP]
[Date]

[Insurance Company Name]
[Claims Department Address]
[City, State ZIP]

RE: Property Damage Claim
Policy Number: [Your Policy Number]
Date of Loss: [Date of Damage]
Property Address: [Your Property Address]

Dear Claims Department,

I am writing to report damage to my roof caused by [describe event: hail, wind, storm, etc.] that occurred on [date of damage].

DESCRIPTION OF DAMAGE:
[Describe the damage you observed, including:]
- Location of damage on the roof
- Type of damage (missing shingles, dents, leaks, etc.)
- Any interior damage resulting from roof damage
- Damage to other property (gutters, vents, etc.)

DOCUMENTATION:
I have attached the following documentation:
- Photographs of the damage (dated)
- Weather reports from the date of loss
- [Any other relevant documentation]

TEMPORARY REPAIRS:
To prevent further damage to my property, I have [describe any temporary repairs made]. Receipts for these repairs are attached.

I request that an adjuster be assigned to inspect my property at their earliest convenience. Please contact me at [phone number] or [email] to schedule an inspection.

Thank you for your prompt attention to this matter.

Sincerely,
[Your Signature]
[Your Printed Name]

Attachments:
1. Photos of damage
2. Weather reports
3. Temporary repair receipts
    `,
  },

  // Appeal Letter Template
  {
    id: 'appeal-letter-template',
    title: 'Appeal Letter Template',
    description: 'Template letter for appealing a denied or underpaid claim.',
    type: 'template',
    category: 'appeal',
    content: `
[Your Name]
[Your Address]
[City, State ZIP]
[Date]

[Insurance Company Name]
[Claims Department Address]
[City, State ZIP]

RE: Appeal of Claim Decision
Policy Number: [Your Policy Number]
Claim Number: [Your Claim Number]
Date of Loss: [Date of Damage]

Dear Claims Department,

I am writing to formally appeal the decision regarding my roof damage claim dated [date of original decision].

REASON FOR APPEAL:
The claim was [denied/underpaid] for the following stated reason(s):
[List the reasons given by the insurance company]

I respectfully disagree with this decision for the following reasons:

1. [First reason with supporting evidence]
2. [Second reason with supporting evidence]
3. [Additional reasons as needed]

SUPPORTING DOCUMENTATION:
I have attached additional documentation to support my appeal:
- Professional roof inspection report from [licensed contractor]
- Additional photographs showing [describe]
- Weather data from [source]
- Contractor estimates totaling $[amount]

POLICY LANGUAGE:
According to my policy, section [X] states: "[Quote relevant policy language]"
This language supports coverage for my claim because [explanation].

REQUEST:
I request that you:
1. Review this appeal and the attached documentation
2. Assign a different adjuster to re-inspect my property
3. Reconsider the claim decision based on this new information

I expect a response within [timeframe per your state regulations] days as required by [state] insurance regulations.

Please contact me at [phone] or [email] with any questions.

Sincerely,
[Your Signature]
[Your Printed Name]

Attachments:
1. Professional inspection report
2. Additional photographs
3. Weather documentation
4. Contractor estimates
5. Copy of original denial letter
    `,
  },

  // Damage Prevention Guide
  {
    id: 'prevention-checklist',
    title: 'Roof Maintenance Checklist',
    description: 'Regular maintenance to prevent damage and support future claims.',
    type: 'checklist',
    category: 'general',
    content: [
      'Inspect roof twice yearly (spring and fall)',
      'Check for missing or damaged shingles',
      'Look for signs of moss, algae, or mold',
      'Examine flashing around chimneys and vents',
      'Clean gutters and downspouts regularly',
      'Trim overhanging tree branches',
      'Check for signs of water damage in attic',
      'Ensure adequate ventilation in attic',
      'Document roof condition with dated photos',
      'Keep records of all maintenance performed',
      'Save receipts for all roof-related work',
      'Review insurance policy annually',
      'Update coverage if you make improvements',
    ],
  },
]

// Status display helpers
export const CLAIM_STATUS_LABELS: Record<string, { label: string; color: string; description: string }> = {
  not_started: {
    label: 'Not Started',
    color: 'text-slate-400',
    description: 'Claim has not been filed yet',
  },
  filed: {
    label: 'Claim Filed',
    color: 'text-blue-400',
    description: 'Your claim has been submitted to the insurance company',
  },
  adjuster_scheduled: {
    label: 'Adjuster Scheduled',
    color: 'text-yellow-400',
    description: 'An adjuster has been assigned and inspection is scheduled',
  },
  adjuster_visited: {
    label: 'Inspection Complete',
    color: 'text-purple-400',
    description: 'The adjuster has inspected your property',
  },
  under_review: {
    label: 'Under Review',
    color: 'text-orange-400',
    description: 'Your claim is being reviewed by the insurance company',
  },
  approved: {
    label: 'Approved',
    color: 'text-green-400',
    description: 'Your claim has been approved',
  },
  denied: {
    label: 'Denied',
    color: 'text-red-400',
    description: 'Your claim has been denied - consider appealing',
  },
  appealing: {
    label: 'Appealing',
    color: 'text-yellow-400',
    description: 'You are appealing the claim decision',
  },
  settled: {
    label: 'Settled',
    color: 'text-green-500',
    description: 'Your claim has been settled and payment issued',
  },
}

// Get resource by ID
export function getInsuranceResource(id: string): InsuranceResource | undefined {
  return INSURANCE_RESOURCES.find((r) => r.id === id)
}

// Get resources by category
export function getResourcesByCategory(category: InsuranceResource['category']): InsuranceResource[] {
  return INSURANCE_RESOURCES.filter((r) => r.category === category)
}

// Get resources by type
export function getResourcesByType(type: InsuranceResource['type']): InsuranceResource[] {
  return INSURANCE_RESOURCES.filter((r) => r.type === type)
}

// Get insurance company info by name
export function getInsuranceCompanyInfo(name: string): InsuranceCompanyInfo | undefined {
  return INSURANCE_COMPANIES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  )
}
