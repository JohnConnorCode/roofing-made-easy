'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen,
  Target,
  FileText,
  MapPin,
  TrendingUp,
  Calendar,
  Search,
  Lightbulb,
  Copy,
  CheckCircle,
  ChevronRight,
  ChevronUp,
  BarChart3,
  Globe,
  PenTool,
  RefreshCw,
  Link2,
  Shield,
  Zap,
  AlertTriangle,
  Star,
  CloudLightning,
  HelpCircle,
  Users,
  Camera,
  MessageSquare,
} from 'lucide-react'

// ============================================================================
// Content Strategy Page — SEO Playbook for Farrell Roofing
// ============================================================================

const NAV_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Target },
  { id: 'content-types', label: 'Content Types', icon: FileText },
  { id: 'city-pages', label: 'City Pages', icon: MapPin },
  { id: 'blog-strategy', label: 'Blog Strategy', icon: PenTool },
  { id: 'prompts', label: 'AI Prompts', icon: Lightbulb },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'seo-checklist', label: 'SEO Checklist', icon: Search },
  { id: 'link-building', label: 'Link Building', icon: Link2 },
  { id: 'refresh', label: 'Content Refresh', icon: RefreshCw },
  { id: 'tracking', label: 'Tracking', icon: BarChart3 },
]

export default function ContentStrategyPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)

      const sections = NAV_SECTIONS.map(s => document.getElementById(s.id))
      const scrollPos = window.scrollY + 150

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(NAV_SECTIONS[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const copyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPrompt(id)
    setTimeout(() => setCopiedPrompt(null), 2000)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="-m-4 md:-m-8 min-h-screen bg-[#0c0f14] overflow-x-hidden">
      {/* Sticky Navigation */}
      <nav className="sticky top-16 md:top-0 z-40 bg-[#161a23]/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {NAV_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-[#c9a25c] text-[#0c0f14] font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <section.icon className="h-4 w-4" />
                <span>{section.label}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-gradient-to-b from-[#1a1f2e] to-[#0c0f14] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0c0f14] border border-[#c9a25c]/40 px-4 py-2 text-sm text-[#c9a25c] mb-6">
            <TrendingUp className="h-4 w-4" />
            SEO Content Strategy
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Grow Your Traffic with<br />
            <span className="text-[#c9a25c]">Strategic Content</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A step-by-step playbook for continuously adding pages and posts that
            drive organic traffic, generate leads, and establish Farrell Roofing
            as Mississippi&apos;s most trusted roofing authority.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* OVERVIEW */}
        <section id="overview" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Target}
            title="Strategy Overview"
            subtitle="What drives traffic for roofing businesses in 2026"
          />

          <div className="bg-gradient-to-r from-[#c9a25c]/10 to-emerald-500/10 border border-[#c9a25c]/30 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-3">The Core Principle</h3>
            <p className="text-slate-300 text-sm mb-4">
              Google now rewards <strong className="text-white">entities</strong> over pages. It evaluates who you are,
              where you serve, what you&apos;re known for, and whether real people search for you by name.
              Every piece of content should reinforce that Farrell Roofing is Mississippi&apos;s roofing authority.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard number="36%" label="of local ranking" desc="comes from on-page signals" />
              <StatCard number="26%" label="of local ranking" desc="comes from link signals" />
              <StatCard number="50%+" label="of searches" desc="now show AI Overviews" />
              <StatCard number="76%" label="of AI citations" desc="use content updated in last 30 days" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <PriorityCard
              level="Highest Impact"
              color="text-emerald-400"
              borderColor="border-emerald-500/30"
              items={[
                'City-specific service pages',
                'Storm damage content',
                'Before-and-after case studies',
              ]}
            />
            <PriorityCard
              level="Strong Impact"
              color="text-blue-400"
              borderColor="border-blue-500/30"
              items={[
                'Educational how-to guides',
                'Insurance claim walkthroughs',
                'Material comparison posts',
              ]}
            />
            <PriorityCard
              level="Supporting Content"
              color="text-purple-400"
              borderColor="border-purple-500/30"
              items={[
                'Seasonal maintenance tips',
                'Customer testimonial features',
                'Community involvement posts',
              ]}
            />
          </div>
        </section>

        {/* CONTENT TYPES */}
        <section id="content-types" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={FileText}
            title="Content Types That Drive Traffic"
            subtitle="Ranked by lead generation potential"
          />

          <div className="space-y-4">
            <ContentTypeCard
              icon={MapPin}
              title="Service + City Landing Pages"
              impact="Very High"
              impactColor="text-emerald-400"
              description="Dedicated pages for each service in each city you serve. These capture 'roof replacement [city] MS' searches — the highest-intent local queries."
              example="smartroofpricing.com/roof-replacement-tupelo-ms"
              existing="You already have these! The sitemap generates service+city combos. Add more cities and services to expand coverage."
              tips={[
                'Each page needs unique local content — not just city-name swaps',
                'Include real project photos from that area',
                'Mention local landmarks, neighborhoods, and weather patterns',
                'Add FAQ section with city-specific questions and FAQ schema markup',
              ]}
            />

            <ContentTypeCard
              icon={CloudLightning}
              title="Storm Damage & Emergency Content"
              impact="Very High"
              impactColor="text-emerald-400"
              description="After storms, homeowners rush to Google. Storm damage now accounts for ~25% of all roof claims. Mississippi's hurricane and hail seasons create predictable traffic spikes."
              example="'Hail Damage Roof Repair in Jackson MS — What to Do After a Storm'"
              tips={[
                'Publish storm prep guides BEFORE each season (May for hurricanes, spring for hail)',
                'Create emergency response pages for each service area',
                'Include insurance claim process specific to Mississippi',
                'Add real-time urgency — reference recent storms in your area',
              ]}
            />

            <ContentTypeCard
              icon={Camera}
              title="Before-and-After Case Studies"
              impact="High"
              impactColor="text-blue-400"
              description="Documented real projects with photos, scope of work, and results. Google rewards 'documented experience content' — proof you've done the work."
              example="'Jackson MS Roof Replacement: 25-Year-Old Shingle to Standing Seam Metal'"
              tips={[
                'Photograph EVERY job — before, during, and after',
                'Include city, material, approximate cost range, and timeline',
                'Write 300-500 words about the specific challenges and solutions',
                'Link to the relevant service and city pages',
              ]}
            />

            <ContentTypeCard
              icon={Star}
              title="'Best Roofers in [City]' Comparison Pages"
              impact="High"
              impactColor="text-blue-400"
              description="You already generate these! They target the exact search query homeowners use when comparing contractors. Extremely high conversion intent."
              example="smartroofpricing.com/best-roofers-in-tupelo-ms"
              existing="Already live in your sitemap. Keep them updated with fresh reviews and current info."
              tips={[
                'Update quarterly with latest reviews and ratings',
                'Be honest and fair about competitors — Google rewards authenticity',
                'Include your unique differentiators prominently',
                'Add structured data for local business comparison',
              ]}
            />

            <ContentTypeCard
              icon={BookOpen}
              title="Educational Blog Posts"
              impact="Medium-High"
              impactColor="text-[#c9a25c]"
              description="Long-form guides (1,500-2,500 words) earn 77% more backlinks than short posts. Build topic clusters around your core services."
              example="'The Complete Guide to Roof Insurance Claims in Mississippi'"
              existing={`Current posts: "7 Warning Signs", "Asphalt vs Metal", "Maintenance Checklist", "Insurance Claims", "Choosing a Contractor"`}
              tips={[
                'Target 1,500-2,500 words for pillar guides',
                'Open each post with a 50-70 word summary (optimized for AI Overview extraction)',
                'Use clear H2/H3 structure — Google\'s AI pulls from well-structured content',
                'Link between related posts to build topic clusters',
              ]}
            />
          </div>
        </section>

        {/* CITY PAGES */}
        <section id="city-pages" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={MapPin}
            title="City Page Expansion Plan"
            subtitle="How to add new service areas that rank"
          />

          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800 mb-6">
            <h3 className="text-white font-semibold mb-4">What Makes a City Page Rank</h3>
            <p className="text-slate-400 text-sm mb-4">
              Google can detect city-name-swapped template pages and will not rank them. Each page needs
              genuinely unique content that demonstrates local knowledge.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#0c0f14] rounded-lg p-4">
                <h4 className="text-emerald-400 font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Must Include
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>Real project photos from that city/county</li>
                  <li>Local weather patterns and roofing challenges</li>
                  <li>Neighborhoods and areas you&apos;ve worked in</li>
                  <li>City-specific permit or HOA information</li>
                  <li>Driving distance and response time from your shop</li>
                  <li>Local testimonials from customers in that area</li>
                </ul>
              </div>
              <div className="bg-[#0c0f14] rounded-lg p-4">
                <h4 className="text-red-400 font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Avoid
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>Copy-pasting the same content across city pages</li>
                  <li>Only changing the city name and zip code</li>
                  <li>Generic stock photos not from your work</li>
                  <li>Making claims about areas you haven&apos;t actually served</li>
                  <li>Thin pages with under 300 words</li>
                  <li>Stuffing city name unnaturally into text</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
            <h3 className="text-white font-semibold mb-4">How to Add a New City</h3>
            <div className="space-y-3">
              <FlowStep n="1">Add the city to <code className="text-[#c9a25c]">lib/data/ms-locations.ts</code> with slug, county, population, and priority</FlowStep>
              <FlowStep n="2">The sitemap auto-generates city page URLs and service+city combo URLs</FlowStep>
              <FlowStep n="3">Add city-specific content variations in <code className="text-[#c9a25c]">lib/data/services.ts</code></FlowStep>
              <FlowStep n="4">Upload real project photos from that area</FlowStep>
              <FlowStep n="5">Add a comparison page entry for &quot;Best Roofers in [City]&quot;</FlowStep>
              <FlowStep n="6">Build or update your Google Business Profile for that service area</FlowStep>
            </div>
          </div>
        </section>

        {/* BLOG STRATEGY */}
        <section id="blog-strategy" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={PenTool}
            title="Blog Content Strategy"
            subtitle="Topic clusters that build authority"
          />

          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800 mb-6">
            <h3 className="text-white font-semibold mb-2">Topic Cluster Model</h3>
            <p className="text-slate-400 text-sm mb-4">
              Build &quot;clusters&quot; of related content. One comprehensive pillar page supported by
              shorter posts that link back to it. This signals to Google that you&apos;re the authority on the topic.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ClusterCard
                pillar="Complete Guide to Roof Replacement in Mississippi"
                posts={[
                  'Asphalt vs Metal: Which Is Right for Mississippi Weather?',
                  'How Long Does a Roof Replacement Take?',
                  'What Permits Do You Need for a Roof Replacement in MS?',
                  'Financing Your Roof Replacement: Options for MS Homeowners',
                  'How to Choose Between Repair and Replacement',
                ]}
              />
              <ClusterCard
                pillar="Mississippi Storm Damage & Insurance Claims Guide"
                posts={[
                  'What to Do Immediately After Roof Storm Damage',
                  'How to File a Roof Insurance Claim in Mississippi',
                  'Hail Damage vs Wind Damage: Spotting the Difference',
                  'Working with Your Insurance Adjuster: Tips That Help',
                  'Emergency Tarping: When You Need It and What It Costs',
                ]}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ClusterCard
              pillar="Roof Maintenance Guide for Mississippi Homeowners"
              posts={[
                'Seasonal Roof Maintenance Checklist',
                'How Mississippi Humidity Affects Your Roof',
                'Gutter Maintenance: Why It Matters for Your Roof',
                'Signs of Attic Ventilation Problems',
                'When to Call a Professional vs DIY',
              ]}
            />
            <ClusterCard
              pillar="Choosing the Right Roofing Contractor in Mississippi"
              posts={[
                'Questions to Ask Before Hiring a Roofer',
                'How to Spot Storm Chasers and Roofing Scams',
                'Understanding Roofing Estimates and Quotes',
                'Roofing Warranties Explained: Manufacturer vs Workmanship',
                'Why Local Mississippi Roofers Beat National Chains',
              ]}
            />
          </div>

          <div className="mt-6 bg-slate-800/30 rounded-lg p-4 text-sm text-slate-400">
            <strong className="text-white">Post Length Guidelines:</strong>{' '}
            Pillar pages: 2,000-3,000 words. Supporting posts: 1,000-1,500 words.
            Quick tips and seasonal updates: 500-800 words. Every post should open
            with a 50-70 word direct answer to help Google&apos;s AI Overview cite you.
          </div>
        </section>

        {/* AI PROMPTS */}
        <section id="prompts" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Lightbulb}
            title="AI Content Prompts"
            subtitle="Copy-paste prompts for generating draft content"
          />

          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-[#c9a25c] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold mb-1">Google-Safe AI Content Workflow</h3>
                <p className="text-slate-300 text-sm">
                  Google allows AI-assisted content. The rule: AI generates the draft,
                  but <strong className="text-white">you add real experience</strong> — actual project details,
                  local knowledge, and photos a machine cannot produce. Never publish AI output
                  without adding your expertise.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <PromptCard
              id="city-page"
              title="New City Service Page"
              description="Generate a draft for a new city-specific service page"
              prompt={`Write a 600-800 word landing page for [SERVICE] services in [CITY], Mississippi.

Target keyword: "[SERVICE] [CITY] MS"

Include these sections:
1. Opening paragraph (50-70 words) directly answering "Who provides [SERVICE] in [CITY] MS?"
2. Why [CITY] homes need [SERVICE] — reference local weather patterns, common roof types, and neighborhood characteristics
3. Our process — 4-5 steps from inspection to completion
4. What it costs — general price range for this area (use population-based tier: small town / mid-size city / metro area)
5. FAQ section with 4-5 questions homeowners in [CITY] actually ask
6. Call to action for free inspection

Tone: Professional but approachable. Like a knowledgeable neighbor, not a salesman.

IMPORTANT: Leave [BRACKETS] for any specific details I need to fill in with real local knowledge, project photos, or customer testimonials.`}
              onCopy={copyPrompt}
              copied={copiedPrompt === 'city-page'}
            />

            <PromptCard
              id="blog-pillar"
              title="Blog Pillar Page"
              description="Generate a comprehensive guide targeting a topic cluster"
              prompt={`Write a 2,000-2,500 word comprehensive guide titled "[TITLE]" for Mississippi homeowners.

Target keyword: "[PRIMARY KEYWORD]"
Secondary keywords: [LIST 3-4 RELATED TERMS]

Structure:
1. Opening summary (50-70 words) — a direct answer to the main question, optimized for Google AI Overview extraction
2. Table of contents
3. 5-7 main sections with H2 headers
4. Each section: 200-400 words with actionable advice
5. "Mississippi-Specific Considerations" section
6. FAQ section (5 questions based on "People Also Ask" results for this topic)
7. Conclusion with clear CTA to Farrell Roofing

Requirements:
- Reference Mississippi weather, building codes, and insurance practices
- Include specific numbers, costs, and timeframes where appropriate
- Leave [BRACKETS] for real project examples, photos, and local details I'll add
- Internal links: suggest 3-5 places to link to other pages on our site
- Tone: expert but accessible, no jargon without explanation`}
              onCopy={copyPrompt}
              copied={copiedPrompt === 'blog-pillar'}
            />

            <PromptCard
              id="blog-supporting"
              title="Supporting Blog Post"
              description="Generate a focused post that supports a pillar page"
              prompt={`Write a 1,000-1,500 word blog post titled "[TITLE]" for Mississippi homeowners.

This post supports the pillar page: "[PILLAR PAGE TITLE]"
Target keyword: "[KEYWORD]"

Structure:
1. Direct answer opening (50-70 words) — answer the title question immediately
2. 3-5 H2 sections diving deeper
3. Practical tips or step-by-step process
4. "What Mississippi Homeowners Should Know" section
5. Brief FAQ (3 questions)
6. Conclusion linking back to the pillar page

Include:
- Real numbers and costs specific to Mississippi market
- Reference to local regulations or common practices
- Leave [BRACKETS] for photos and specific examples from our work
- Suggest where to place internal links to service pages and the pillar page`}
              onCopy={copyPrompt}
              copied={copiedPrompt === 'blog-supporting'}
            />

            <PromptCard
              id="case-study"
              title="Project Case Study"
              description="Generate a case study from job details"
              prompt={`Write a 400-600 word case study for a roofing project with these details:

City: [CITY], MS
Job type: [REPLACEMENT / REPAIR / STORM DAMAGE]
Material: [SHINGLE / METAL / OTHER]
Roof size: [SQFT] square feet
Challenges: [LIST ANY SPECIAL CHALLENGES]
Timeline: [HOW LONG]
Approximate cost range: [RANGE]

Structure:
1. Title: "[City] MS [Job Type]: [One-line description of the challenge and solution]"
2. The Challenge — what the homeowner was dealing with
3. Our Approach — how we solved it, materials chosen and why
4. The Result — outcome, homeowner satisfaction
5. Key Details sidebar: City, Job Type, Material, Timeline, and warranty info

Write it as a story, not a spec sheet. Leave [PHOTO PLACEHOLDER] markers where I should insert before/during/after photos.`}
              onCopy={copyPrompt}
              copied={copiedPrompt === 'case-study'}
            />

            <PromptCard
              id="storm-content"
              title="Storm/Seasonal Content"
              description="Generate timely content around weather events"
              prompt={`Write a 800-1,200 word article titled "[TITLE]" for Mississippi homeowners responding to [DESCRIBE WEATHER EVENT OR SEASON].

Urgency level: [EMERGENCY / SEASONAL PREP / GENERAL AWARENESS]

Include:
1. Direct answer opening — what should homeowners do RIGHT NOW (50-70 words)
2. How to assess damage (with safety warnings)
3. Step-by-step process: document damage → contact insurance → get professional inspection → temporary protection → permanent repair
4. Mississippi insurance specifics — filing deadlines, common pitfalls
5. How Farrell Roofing can help — emergency response, insurance claim assistance
6. FAQ (3-4 questions)

Tone: Calm, authoritative, helpful — not fear-mongering. These people may be stressed.
Include a clear emergency contact CTA.
Leave [BRACKETS] for local-specific storm details I'll add.`}
              onCopy={copyPrompt}
              copied={copiedPrompt === 'storm-content'}
            />

            <PromptCard
              id="faq-schema"
              title="FAQ Section with Schema"
              description="Generate FAQ content optimized for rich results"
              prompt={`Generate 5-7 FAQ questions and answers about [TOPIC] for a [SERVICE TYPE] page targeting [CITY], Mississippi.

Requirements:
- Questions should match how real Mississippi homeowners search (natural language)
- Answers should be 2-4 sentences each — concise and direct
- Include at least one question about local pricing/costs
- Include at least one question about timeline/scheduling
- Include one question about insurance or financing
- Each answer should include a keyword naturally
- Leave [BRACKETS] for any details I need to verify

Also generate the JSON-LD FAQ schema markup for these questions so I can paste it into the page's structured data.`}
              onCopy={copyPrompt}
              copied={copiedPrompt === 'faq-schema'}
            />

            <PromptCard
              id="meta-tags"
              title="SEO Meta Tags"
              description="Generate title tags and meta descriptions"
              prompt={`Generate SEO meta tags for these pages:

[LIST PAGE URLS AND THEIR TARGET KEYWORDS]

For each page, provide:
1. Title tag (50-60 characters) — include primary keyword near the front, brand name at end
2. Meta description (150-160 characters) — include keyword, a benefit, and a call to action
3. H1 tag — can be slightly different from title tag, more natural

Rules:
- Every title must include "Mississippi" or "MS"
- Include city name if it's a location page
- Meta descriptions should create urgency or highlight a benefit
- Don't stuff keywords — write for humans who see this in search results`}
              onCopy={copyPrompt}
              copied={copiedPrompt === 'meta-tags'}
            />
          </div>
        </section>

        {/* CONTENT CALENDAR */}
        <section id="calendar" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Calendar}
            title="Content Calendar"
            subtitle="When to publish what throughout the year"
          />

          <div className="space-y-4">
            <CalendarQuarter
              quarter="Q1 — January to March"
              color="text-blue-400"
              borderColor="border-blue-500/30"
              items={[
                { month: 'January', tasks: ['Refresh all pricing on service pages', 'Publish "Year in Review" case study roundup', 'Update "Best Roofers" comparison pages with new reviews'] },
                { month: 'February', tasks: ['Publish spring storm prep guide', 'Create new city pages for any areas you expanded into', 'Update insurance claims guide with current year info'] },
                { month: 'March', tasks: ['Publish "Spring Roof Inspection Checklist"', 'Refresh seasonal maintenance blog post', 'Create 1-2 new case studies from winter jobs'] },
              ]}
            />

            <CalendarQuarter
              quarter="Q2 — April to June"
              color="text-emerald-400"
              borderColor="border-emerald-500/30"
              items={[
                { month: 'April', tasks: ['Publish hail damage content (hail season peaks)', 'Create "What to Do After a Tornado" emergency page', 'Update storm damage service pages with fresh photos'] },
                { month: 'May', tasks: ['Publish hurricane season prep guide', 'Create new material comparison post', 'Add case studies from spring storm jobs'] },
                { month: 'June', tasks: ['Publish "Summer Heat and Your Roof" content', 'Refresh all city pages with new project photos', 'Update Google Business Profile with summer hours'] },
              ]}
            />

            <CalendarQuarter
              quarter="Q3 — July to September"
              color="text-orange-400"
              borderColor="border-orange-500/30"
              items={[
                { month: 'July', tasks: ['Publish "How Heat Affects Mississippi Roofs"', 'Create 1-2 new case studies', 'Check and refresh all FAQ sections'] },
                { month: 'August', tasks: ['Peak hurricane season — have emergency content ready', 'Publish "Understanding Your Roof Warranty"', 'Update financing/assistance programs page'] },
                { month: 'September', tasks: ['Publish fall maintenance prep guide', 'Create end-of-summer project roundup', 'Refresh "Choosing a Roofing Contractor" content'] },
              ]}
            />

            <CalendarQuarter
              quarter="Q4 — October to December"
              color="text-purple-400"
              borderColor="border-purple-500/30"
              items={[
                { month: 'October', tasks: ['Publish "Winterize Your Mississippi Roof" guide', 'Add new city pages for expansion areas', 'Update all service pages with year\'s best photos'] },
                { month: 'November', tasks: ['Publish "Tax Benefits of Roof Replacement" before year-end', 'Create holiday/off-season promotion content', 'Comprehensive site-wide content refresh'] },
                { month: 'December', tasks: ['Plan next year\'s content calendar', 'Archive or update dated content', 'Audit all pages for accuracy and freshness'] },
              ]}
            />
          </div>

          <div className="mt-6 bg-slate-800/30 rounded-lg p-4 text-sm text-slate-400">
            <strong className="text-white">Publishing cadence:</strong>{' '}
            Aim for 2-4 blog posts per month and 1-2 new or refreshed city/service pages per month.
            Consistency matters more than volume — a steady stream of quality content beats sporadic bursts.
          </div>
        </section>

        {/* SEO CHECKLIST */}
        <section id="seo-checklist" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Search}
            title="On-Page SEO Checklist"
            subtitle="Run through this for every page you publish"
          />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">Before Publishing</h3>
              <ul className="space-y-3">
                <ChecklistItem>Title tag under 60 chars with primary keyword near the front</ChecklistItem>
                <ChecklistItem>Meta description under 160 chars with keyword, benefit, and CTA</ChecklistItem>
                <ChecklistItem>H1 includes primary keyword naturally</ChecklistItem>
                <ChecklistItem>Opening 50-70 words directly answer the page&apos;s core question</ChecklistItem>
                <ChecklistItem>URL slug is short, descriptive, includes keyword</ChecklistItem>
                <ChecklistItem>Images have descriptive alt text (not keyword-stuffed)</ChecklistItem>
                <ChecklistItem>At least 3 internal links to related pages on your site</ChecklistItem>
                <ChecklistItem>FAQ section with FAQ schema markup (JSON-LD)</ChecklistItem>
                <ChecklistItem>Mobile-friendly — no horizontal scrolling, readable fonts</ChecklistItem>
                <ChecklistItem>Page loads fast — compress images, no unnecessary scripts</ChecklistItem>
              </ul>
            </div>

            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">Schema Markup Checklist</h3>
              <p className="text-slate-400 text-sm mb-4">
                Structured data drives 20-30% higher click-through rates from search results.
              </p>
              <ul className="space-y-3">
                <ChecklistItem>Homepage: LocalBusiness (RoofingContractor) with NAP and hours</ChecklistItem>
                <ChecklistItem>Service pages: Service schema with description and area served</ChecklistItem>
                <ChecklistItem>City pages: AreaServed with specific zip codes and geo coordinates</ChecklistItem>
                <ChecklistItem>Blog posts: Article schema with author, date, and description</ChecklistItem>
                <ChecklistItem>FAQ sections: FAQPage schema matching visible Q&A text exactly</ChecklistItem>
                <ChecklistItem>Testimonial pages: Review or AggregateRating schema</ChecklistItem>
                <ChecklistItem>How-to guides: HowTo schema with step-by-step structure</ChecklistItem>
                <ChecklistItem>All pages: BreadcrumbList for navigation hierarchy</ChecklistItem>
              </ul>
            </div>

            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800 md:col-span-2">
              <h3 className="text-white font-semibold mb-4">E-E-A-T Signals</h3>
              <p className="text-slate-400 text-sm mb-4">
                Experience, Expertise, Authoritativeness, Trustworthiness — Google&apos;s quality framework.
              </p>
              <div className="grid md:grid-cols-4 gap-4">
                <EEATCard
                  letter="E"
                  title="Experience"
                  items={['Real project photos from your work', 'Case studies with specific details', 'First-person descriptions of challenges solved']}
                />
                <EEATCard
                  letter="E"
                  title="Expertise"
                  items={['Author bio with credentials on blog posts', 'Manufacturer certifications mentioned', 'Technical accuracy in all content']}
                />
                <EEATCard
                  letter="A"
                  title="Authority"
                  items={['Consistent NAP across all platforms', 'Links from local organizations and suppliers', 'Active Google Business Profile']}
                />
                <EEATCard
                  letter="T"
                  title="Trust"
                  items={['Customer reviews and testimonials', 'BBB accreditation and license info', 'Clear contact info and physical address']}
                />
              </div>
            </div>
          </div>
        </section>

        {/* LINK BUILDING */}
        <section id="link-building" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Link2}
            title="Link Building Strategy"
            subtitle="Earn backlinks that boost rankings"
          />

          <div className="space-y-4">
            <LinkBuildCard
              priority="High"
              title="Manufacturer Certification Directories"
              description="Get listed on GAF, Owens Corning, CertainTeed, and other manufacturer certified contractor pages. These are authoritative, relevant backlinks."
              action="Apply for certifications you qualify for. Each typically includes a profile page linking back to your site."
            />
            <LinkBuildCard
              priority="High"
              title="Local Organization Memberships"
              description="Chamber of Commerce (Jackson, Gulf Coast, etc.), BBB, NRCA, Mississippi Roofing Contractors Association. Each provides a profile page with a backlink."
              action="Join or renew memberships. Ensure your profile URL is correct on each directory."
            />
            <LinkBuildCard
              priority="Medium"
              title="Community Sponsorships"
              description="Sponsor Little League teams, charity events, school fundraisers, and community 5Ks across Mississippi. These earn .org and .edu backlinks."
              action="Budget $200-500/month for local sponsorships. Ask for a website link in exchange."
            />
            <LinkBuildCard
              priority="Medium"
              title="Real Estate & Insurance Partnerships"
              description="Get listed as a recommended contractor on local real estate blogs, insurance agency resource pages, and property management company websites."
              action="Reach out to 5 local real estate agents and insurance agents per month. Offer reciprocal referrals."
            />
            <LinkBuildCard
              priority="Ongoing"
              title="Local Media & PR"
              description="Respond to journalist queries about home improvement, storm damage, and local business topics. Target Mississippi news outlets for storm-season coverage."
              action="Sign up for HARO (Help A Reporter Out). Monitor local news for opportunities to provide expert quotes."
            />
          </div>
        </section>

        {/* CONTENT REFRESH */}
        <section id="refresh" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={RefreshCw}
            title="Content Refresh Strategy"
            subtitle="Updating existing content often delivers faster results than publishing new content"
          />

          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-2">Why Refreshing Matters in 2026</h3>
            <p className="text-slate-300 text-sm">
              AI platforms like Google AI Overviews, ChatGPT, and Perplexity cite content that is
              <strong className="text-white"> 25.7% fresher</strong> than what traditional search results show.
              ChatGPT cites pages updated within the last 30 days in 76% of cases. Fresh content
              is no longer optional — it&apos;s required for visibility.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <RefreshCard
              frequency="Monthly"
              color="text-emerald-400"
              items={[
                'Update pricing on all service pages',
                'Refresh storm/weather content with recent data',
                'Add new project photos to relevant pages',
                'Update Google Business Profile posts',
              ]}
            />
            <RefreshCard
              frequency="Quarterly"
              color="text-blue-400"
              items={[
                'Audit all service area pages for accuracy',
                'Refresh top 10 blog posts by traffic',
                'Update FAQ sections with new questions',
                'Check and fix broken internal links',
              ]}
            />
            <RefreshCard
              frequency="Every 6 Months"
              color="text-purple-400"
              items={[
                'Full content audit — identify thin or outdated pages',
                'Refresh statistics and market data site-wide',
                'Update all comparison pages with current reviews',
                'Review and improve schema markup',
              ]}
            />
          </div>

          <div className="bg-slate-800/30 rounded-lg p-4 text-sm text-slate-400">
            <strong className="text-white flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Important Rule from Google
            </strong>
            Only update publication dates when you&apos;ve genuinely changed the content.
            Changing dates without real changes is counterproductive and can hurt rankings.
          </div>
        </section>

        {/* TRACKING */}
        <section id="tracking" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={BarChart3}
            title="Tracking Progress"
            subtitle="How to know if your content is working"
          />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">Key Metrics to Track</h3>
              <ul className="space-y-3">
                <MetricItem name="Organic Sessions" desc="Total visits from Google. Should grow monthly." tool="Google Analytics" />
                <MetricItem name="Keyword Rankings" desc="Track your top 20 target keywords. Focus on page 1." tool="Google Search Console" />
                <MetricItem name="Pages Indexed" desc="How many of your pages Google has found and indexed." tool="Google Search Console" />
                <MetricItem name="Click-Through Rate" desc="% of people who click your result. Title/description quality." tool="Google Search Console" />
                <MetricItem name="Leads from Organic" desc="Form submissions and calls from organic traffic." tool="Google Analytics + CRM" />
                <MetricItem name="Google Business Profile Views" desc="How many people see your GBP listing." tool="GBP Dashboard" />
              </ul>
            </div>

            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">Free Tools to Use</h3>
              <div className="space-y-3">
                <ToolCard
                  name="Google Search Console"
                  desc="See exactly which keywords you rank for, your position, and click-through rates. Set this up first."
                  url="search.google.com/search-console"
                />
                <ToolCard
                  name="Google Analytics"
                  desc="Track all website traffic, where visitors come from, and which pages generate leads."
                  url="analytics.google.com"
                />
                <ToolCard
                  name="Google Business Profile"
                  desc="Your local listing on Google Maps. Critical for 'near me' searches. Update weekly."
                  url="business.google.com"
                />
                <ToolCard
                  name="PageSpeed Insights"
                  desc="Check page load speed. Slow pages rank lower. Test each new page."
                  url="pagespeed.web.dev"
                />
                <ToolCard
                  name="Schema Validator"
                  desc="Verify your structured data is correct before publishing."
                  url="validator.schema.org"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
            <h3 className="text-white font-semibold mb-4">Monthly Review Process</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <FlowStep n="1">Check Search Console for new keyword opportunities and declining pages</FlowStep>
              <FlowStep n="2">Review Analytics for top traffic pages and conversion rates</FlowStep>
              <FlowStep n="3">Refresh any declining content with updated info and photos</FlowStep>
              <FlowStep n="4">Publish 2-4 new pieces based on keyword gaps you found</FlowStep>
            </div>
          </div>
        </section>

      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-[#c9a25c] text-[#0c0f14] p-3 rounded-full shadow-lg hover:bg-[#b5893a] transition-colors z-50"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

// ============================================================================
// Helper Components
// ============================================================================

function SectionHeader({ icon: Icon, title, subtitle }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-[#c9a25c] rounded-lg p-2">
        <Icon className="h-5 w-5 text-[#0c0f14]" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-slate-500 text-sm">{subtitle}</p>
      </div>
    </div>
  )
}

function StatCard({ number, label, desc }: { number: string; label: string; desc: string }) {
  return (
    <div className="bg-[#0c0f14]/50 rounded-lg p-3 text-center">
      <p className="text-2xl font-bold text-[#c9a25c]">{number}</p>
      <p className="text-white text-xs font-medium">{label}</p>
      <p className="text-slate-500 text-xs">{desc}</p>
    </div>
  )
}

function PriorityCard({ level, color, borderColor, items }: {
  level: string
  color: string
  borderColor: string
  items: string[]
}) {
  return (
    <div className={`bg-[#1a1f2e] rounded-xl p-5 border ${borderColor}`}>
      <h3 className={`${color} font-semibold text-sm mb-3`}>{level}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <CheckCircle className={`h-4 w-4 ${color} mt-0.5 flex-shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContentTypeCard({ icon: Icon, title, impact, impactColor, description, example, existing, tips }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  impact: string
  impactColor: string
  description: string
  example: string
  existing?: string
  tips: string[]
}) {
  return (
    <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-[#c9a25c]" />
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-slate-800 ${impactColor}`}>
          {impact}
        </span>
      </div>
      <p className="text-slate-400 text-sm mb-3">{description}</p>
      <div className="bg-[#0c0f14] rounded-lg px-3 py-2 mb-3">
        <p className="text-xs text-slate-500">Example:</p>
        <p className="text-sm text-[#c9a25c]">{example}</p>
      </div>
      {existing && (
        <div className="bg-emerald-500/10 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs text-emerald-400">{existing}</p>
        </div>
      )}
      <ul className="space-y-1.5">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
            <ChevronRight className="h-3 w-3 text-slate-600 mt-0.5 flex-shrink-0" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ClusterCard({ pillar, posts }: { pillar: string; posts: string[] }) {
  return (
    <div className="bg-[#1a1f2e] rounded-xl p-5 border border-slate-800">
      <div className="bg-[#c9a25c]/10 border border-[#c9a25c]/30 rounded-lg px-3 py-2 mb-4">
        <p className="text-xs text-[#c9a25c] font-medium">Pillar Page</p>
        <p className="text-sm text-white font-semibold">{pillar}</p>
      </div>
      <p className="text-xs text-slate-500 mb-2">Supporting Posts:</p>
      <ul className="space-y-1.5">
        {posts.map((post, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
            <FileText className="h-3 w-3 text-slate-600 mt-0.5 flex-shrink-0" />
            {post}
          </li>
        ))}
      </ul>
    </div>
  )
}

function PromptCard({ id, title, description, prompt, onCopy, copied }: {
  id: string
  title: string
  description: string
  prompt: string
  onCopy: (id: string, text: string) => void
  copied: boolean
}) {
  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-slate-800 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-slate-500 text-xs">{description}</p>
          </div>
          <button
            onClick={() => onCopy(id, prompt)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              copied
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="bg-[#0c0f14] rounded-lg p-4 text-xs text-slate-400 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
          {prompt}
        </pre>
      </div>
    </div>
  )
}

function CalendarQuarter({ quarter, color, borderColor, items }: {
  quarter: string
  color: string
  borderColor: string
  items: Array<{ month: string; tasks: string[] }>
}) {
  return (
    <div className={`bg-[#1a1f2e] rounded-xl p-6 border ${borderColor}`}>
      <h3 className={`${color} font-semibold mb-4`}>{quarter}</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.month}>
            <p className="text-white text-sm font-medium mb-2">{item.month}</p>
            <ul className="space-y-1.5">
              {item.tasks.map((task, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <CheckCircle className="h-3 w-3 text-slate-600 mt-0.5 flex-shrink-0" />
                  {task}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChecklistItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-300">
      <div className="w-4 h-4 rounded border border-slate-600 mt-0.5 flex-shrink-0" />
      {children}
    </li>
  )
}

function EEATCard({ letter, title, items }: { letter: string; title: string; items: string[] }) {
  return (
    <div className="bg-[#0c0f14] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded bg-[#c9a25c] text-[#0c0f14] font-bold text-sm flex items-center justify-center">
          {letter}
        </span>
        <span className="text-white font-semibold text-sm">{title}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
            <ChevronRight className="h-3 w-3 text-slate-600 mt-0.5 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function LinkBuildCard({ priority, title, description, action }: {
  priority: string
  title: string
  description: string
  action: string
}) {
  const priorityColor = priority === 'High' ? 'text-emerald-400 bg-emerald-500/10' :
    priority === 'Medium' ? 'text-blue-400 bg-blue-500/10' : 'text-purple-400 bg-purple-500/10'

  return (
    <div className="bg-[#1a1f2e] rounded-xl p-5 border border-slate-800">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColor}`}>{priority}</span>
      </div>
      <p className="text-slate-400 text-sm mb-3">{description}</p>
      <div className="bg-[#0c0f14] rounded-lg px-3 py-2">
        <p className="text-xs text-slate-500">Action:</p>
        <p className="text-xs text-[#c9a25c]">{action}</p>
      </div>
    </div>
  )
}

function RefreshCard({ frequency, color, items }: {
  frequency: string
  color: string
  items: string[]
}) {
  return (
    <div className="bg-[#1a1f2e] rounded-xl p-5 border border-slate-800">
      <h3 className={`${color} font-semibold text-sm mb-3`}>{frequency}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
            <RefreshCw className="h-3 w-3 text-slate-600 mt-0.5 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function FlowStep({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="w-5 h-5 rounded-full bg-slate-700 text-[#c9a25c] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </span>
      <span className="text-slate-300">{children}</span>
    </div>
  )
}

function MetricItem({ name, desc, tool }: { name: string; desc: string; tool: string }) {
  return (
    <li className="flex items-start gap-3">
      <BarChart3 className="h-4 w-4 text-[#c9a25c] mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-white text-sm font-medium">{name}</p>
        <p className="text-slate-500 text-xs">{desc}</p>
        <p className="text-[#c9a25c] text-xs">{tool}</p>
      </div>
    </li>
  )
}

function ToolCard({ name, desc, url }: { name: string; desc: string; url: string }) {
  return (
    <div className="bg-[#0c0f14] rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-white text-sm font-medium">{name}</p>
        <Globe className="h-3.5 w-3.5 text-slate-600" />
      </div>
      <p className="text-slate-500 text-xs mb-1">{desc}</p>
      <p className="text-[#c9a25c] text-xs">{url}</p>
    </div>
  )
}
