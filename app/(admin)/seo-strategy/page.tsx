'use client'

import { useState, useEffect } from 'react'
import {
  Globe,
  Search,
  FileText,
  Map,
  Bot,
  Image,
  Link2,
  Code,
  Shield,
  ChevronUp,
  CheckCircle,
  Copy,
  RefreshCw,
  Layers,
  Zap,
} from 'lucide-react'

// ============================================================================
// SEO Strategy Reference — Complete Implementation Documentation
// ============================================================================

const NAV_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Globe },
  { id: 'schemas', label: 'Structured Data', icon: Code },
  { id: 'sitemap', label: 'Sitemap & Indexing', icon: Map },
  { id: 'ai-discovery', label: 'AI Discovery', icon: Bot },
  { id: 'content-pages', label: 'Content Pages', icon: FileText },
  { id: 'internal-links', label: 'Internal Links', icon: Link2 },
  { id: 'og-images', label: 'OG Images', icon: Image },
  { id: 'technical', label: 'Technical SEO', icon: Shield },
  { id: 'maintenance', label: 'Maintenance', icon: RefreshCw },
]

export default function SEOStrategyPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

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

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
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
            <Search className="h-4 w-4" />
            SEO Implementation Reference
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Complete SEO Strategy<br />
            <span className="text-[#c9a25c]">Implementation Guide</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Everything implemented for search visibility: structured data, sitemap,
            AI discoverability, content pages, and technical SEO. Use this as a
            reference for maintaining and extending the SEO system.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* OVERVIEW */}
        <section id="overview" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Globe}
            title="Overview Dashboard"
            subtitle="What's implemented at a glance"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard number="1,000+" label="Sitemap URLs" desc="Dynamic generation" />
            <StatCard number="13+" label="Schema Types" desc="Structured data" />
            <StatCard number="10" label="Blog Posts" desc="SEO-optimized" />
            <StatCard number="4" label="Pricing Pages" desc="High-intent" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard number="4" label="OG Image Routes" desc="Dynamic generation" />
            <StatCard number="9" label="Link Components" desc="Internal linking" />
            <StatCard number="6" label="AI Bot Rules" desc="robots.txt" />
            <StatCard number="2" label="LLMs.txt Files" desc="AI discovery" />
          </div>

          <div className="bg-gradient-to-r from-[#c9a25c]/10 to-emerald-500/10 border border-[#c9a25c]/30 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-3">Implementation Stack</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#0c0f14]/50 rounded-lg p-4">
                <p className="text-[#c9a25c] font-semibold text-sm mb-2">Search Engines</p>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li>Dynamic XML sitemap (1,000+ URLs)</li>
                  <li>IndexNow (Bing/Yandex instant)</li>
                  <li>robots.txt with AI bot rules</li>
                  <li>Canonical URLs on all pages</li>
                </ul>
              </div>
              <div className="bg-[#0c0f14]/50 rounded-lg p-4">
                <p className="text-emerald-400 font-semibold text-sm mb-2">Structured Data</p>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li>13+ JSON-LD schema types</li>
                  <li>Production-guarded schemas</li>
                  <li>Breadcrumbs on all pages</li>
                  <li>FAQ schema on service pages</li>
                </ul>
              </div>
              <div className="bg-[#0c0f14]/50 rounded-lg p-4">
                <p className="text-blue-400 font-semibold text-sm mb-2">Content & Links</p>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li>10 blog posts with Article schema</li>
                  <li>4 pricing pages (high-intent SEO)</li>
                  <li>9 internal link components</li>
                  <li>4 dynamic OG image endpoints</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* STRUCTURED DATA / SCHEMAS */}
        <section id="schemas" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Code}
            title="Structured Data / Schemas"
            subtitle="13+ JSON-LD schema types across 10 component files"
          />

          <div className="space-y-4">
            <SchemaFileCard
              path="components/seo/json-ld.tsx"
              description="Core schemas for basic pages"
              onCopy={copyPath}
              copied={copiedPath}
              schemas={[
                { name: 'LocalBusinessSchema', desc: 'Main business data (RoofingContractor)', guarded: true },
                { name: 'ServiceSchema', desc: 'Free roofing estimate service' },
                { name: 'FAQSchema', desc: 'FAQ page markup' },
                { name: 'WebPageSchema', desc: 'Individual page metadata' },
              ]}
            />

            <SchemaFileCard
              path="components/seo/advanced-schema.tsx"
              description="Advanced SEO schemas for rich results"
              onCopy={copyPath}
              copied={copiedPath}
              schemas={[
                { name: 'OrganizationSchema', desc: 'Company details with social profiles' },
                { name: 'WebSiteSchema', desc: 'Website root schema' },
                { name: 'EnhancedLocalBusinessSchema', desc: 'Full business with offers/pricing' },
                { name: 'DetailedServiceSchema', desc: 'Service pages with pricing data' },
                { name: 'HowToSchema', desc: 'Step-by-step process markup' },
                { name: 'ReviewSchema', desc: 'Customer testimonials', guarded: true },
                { name: 'ArticleSchema', desc: 'Blog post structured data' },
                { name: 'SitelinksSearchBoxSchema', desc: 'Google sitelinks search' },
                { name: 'GeoMetaTags', desc: 'Geo-targeting meta tags' },
              ]}
            />

            <SchemaFileCard
              path="components/seo/regional-schema.tsx"
              description="Regional and multi-location SEO"
              onCopy={copyPath}
              copied={copiedPath}
              schemas={[
                { name: 'ServiceAreaSchema', desc: 'All served cities/counties' },
                { name: 'ProfessionalCredentialsSchema', desc: 'Licenses and certifications' },
                { name: 'MultiLocationSchema', desc: 'Multi-location presence' },
                { name: 'AggregateReviewSchema', desc: 'Review ratings', guarded: true },
                { name: 'SpeakableSchema', desc: 'Voice search optimization' },
                { name: 'VideoSchema', desc: 'Video content markup' },
                { name: 'ImageGallerySchema', desc: 'Portfolio galleries' },
                { name: 'ServiceAreaGeoSchema', desc: 'Geographic bounding box' },
                { name: 'BrandSameAsSchema', desc: 'Social media consistency' },
                { name: 'SeasonalPromotionSchema', desc: 'Promotional events' },
              ]}
            />

            <SchemaFileCard
              path="components/seo/location-schema.tsx"
              description="City and county location schemas"
              onCopy={copyPath}
              copied={copiedPath}
              schemas={[
                { name: 'CityLocationSchema', desc: 'City-specific LocalBusiness', guarded: true },
                { name: 'CountyLocationSchema', desc: 'County-specific LocalBusiness', guarded: true },
                { name: 'ServiceLocationSchema', desc: 'Service + location combos' },
                { name: 'FAQLocationSchema', desc: 'Location-specific FAQs' },
                { name: 'BreadcrumbSchema', desc: 'Breadcrumb navigation' },
              ]}
            />

            <SchemaFileCard
              path="components/seo/service-schema.tsx"
              description="Service page schemas with auto-generated FAQs"
              onCopy={copyPath}
              copied={copiedPath}
              schemas={[
                { name: 'ServiceSchema', desc: 'Service detail pages' },
                { name: 'ServiceFAQSchema', desc: 'Auto-generated per service type' },
                { name: 'ServiceBreadcrumbSchema', desc: 'Service navigation' },
                { name: 'ServiceSchemaBundle', desc: 'Combined service schemas' },
              ]}
            />

            <SchemaFileCard
              path="components/seo/blog-schema.tsx"
              description="Blog and article schemas"
              onCopy={copyPath}
              copied={copiedPath}
              schemas={[
                { name: 'BlogPostingSchema', desc: 'Blog article structured data' },
                { name: 'BlogBreadcrumbSchema', desc: 'Blog navigation breadcrumbs' },
              ]}
            />

            <SchemaFileCard
              path="components/seo/comparison-schema.tsx"
              description="Best Roofers comparison page schemas"
              onCopy={copyPath}
              copied={copiedPath}
              schemas={[
                { name: 'ComparisonSchemaBundle', desc: 'Complete bundle for comparison pages' },
                { name: 'ComparisonFAQSchema', desc: 'Comparison page FAQs' },
                { name: 'ComparisonBreadcrumbSchema', desc: 'Comparison page navigation' },
                { name: 'ComparisonArticleSchema', desc: 'Editorial credibility' },
                { name: 'FeaturedCompanySchema', desc: 'Featured company highlight' },
              ]}
            />

            <SchemaFileCard
              path="components/seo/nap-schema.tsx"
              description="NAP (Name, Address, Phone) consistency"
              onCopy={copyPath}
              copied={copiedPath}
              schemas={[
                { name: 'NAPSchema', desc: 'Comprehensive NAP for all page types' },
                { name: 'MinimalNAPSchema', desc: 'Minimal footer/header NAP' },
                { name: 'ContactPageNAPSchema', desc: 'Contact page specific NAP' },
              ]}
            />

            <SchemaFileCard
              path="components/seo/itemlist-schema.tsx"
              description="ItemList for contractor comparison content"
              onCopy={copyPath}
              copied={copiedPath}
              schemas={[
                { name: 'ItemListSchema', desc: 'Contractor types as educational content' },
              ]}
            />

            <SchemaFileCard
              path="components/seo/list-schema.tsx"
              description="Collection and about page schemas"
              onCopy={copyPath}
              copied={copiedPath}
              schemas={[
                { name: 'ServicesListSchema', desc: 'Service collection pages' },
                { name: 'CollectionPageSchema', desc: 'Blog/article index pages' },
                { name: 'AboutPageSchema', desc: 'About page specific schema' },
              ]}
            />
          </div>

          <div className="mt-4 bg-slate-800/30 rounded-lg p-4 text-sm text-slate-400">
            <strong className="text-white flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-[#c9a25c]" />
              Production Guards
            </strong>
            Schemas marked as &quot;guarded&quot; check <code className="text-[#c9a25c]">hasRealContactInfo()</code> and{' '}
            <code className="text-[#c9a25c]">hasVerifiedReviews()</code> before rendering, preventing Google penalties for fake data in development.
          </div>
        </section>

        {/* SITEMAP & INDEXING */}
        <section id="sitemap" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Map}
            title="Sitemap & Indexing"
            subtitle="1,000+ URLs dynamically generated"
          />

          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Sitemap URL Categories</h3>
              <PathBadge path="app/sitemap.ts" onCopy={copyPath} copied={copiedPath} />
            </div>
            <div className="space-y-3">
              <SitemapCategory
                name="Static Pages"
                count="14"
                format="/, /about, /services, /contact, etc."
                priority="1.0 (home) - 0.5 (legal)"
                freq="monthly"
              />
              <SitemapCategory
                name="Pricing Pages"
                count="4"
                format="/pricing, /pricing/roof-replacement-cost, etc."
                priority="0.85 - 0.9"
                freq="weekly"
              />
              <SitemapCategory
                name="City Pages"
                count="Dynamic"
                format="/{city-slug}-roofing"
                priority="0.85 - 1.0 (HQ)"
                freq="weekly"
              />
              <SitemapCategory
                name="County Pages"
                count="Dynamic"
                format="/{county-slug}-roofing"
                priority="0.9"
                freq="weekly"
              />
              <SitemapCategory
                name="Service Pages"
                count="Dynamic"
                format="/services/{service-slug}"
                priority="0.85"
                freq="monthly"
              />
              <SitemapCategory
                name="Blog Posts"
                count="10"
                format="/blog/{post-slug}"
                priority="0.6 - 0.7 (featured)"
                freq="monthly"
              />
              <SitemapCategory
                name="Service + City Combos"
                count="Largest"
                format="/{service}-{city-slug}-ms"
                priority="0.7 - 0.85"
                freq="monthly"
              />
              <SitemapCategory
                name="Comparison Pages"
                count="Dynamic"
                format="/best-roofers-in-{city-slug}-{state}"
                priority="0.75 - 0.9"
                freq="monthly"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">IndexNow Integration</h3>
              <PathBadge path="app/api/indexnow/route.ts" onCopy={copyPath} copied={copiedPath} />
              <p className="text-slate-400 text-sm mt-3 mb-3">
                Instant notification to Bing, Yandex, Seznam, and Naver when content changes.
                Eliminates wait time for re-crawling.
              </p>
              <ul className="space-y-2">
                <FeatureItem>POST endpoint accepts URL list</FeatureItem>
                <FeatureItem>Notifies 4 search engines simultaneously</FeatureItem>
                <FeatureItem>Used after content updates or new pages</FeatureItem>
              </ul>
            </div>

            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">robots.txt</h3>
              <PathBadge path="app/robots.ts" onCopy={copyPath} copied={copiedPath} />
              <p className="text-slate-400 text-sm mt-3 mb-3">
                Controls crawler access. Allows all public content, blocks admin/API routes.
              </p>
              <ul className="space-y-2">
                <FeatureItem>All search bots: full public access</FeatureItem>
                <FeatureItem>AI bots: allowed public content</FeatureItem>
                <FeatureItem>Blocked: /api/, /admin/, /login/, /dashboard/</FeatureItem>
                <FeatureItem>References sitemap.xml</FeatureItem>
              </ul>
            </div>
          </div>
        </section>

        {/* AI DISCOVERABILITY */}
        <section id="ai-discovery" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Bot}
            title="AI Discoverability"
            subtitle="How AI assistants find and cite our content"
          />

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-2">llms.txt</h3>
              <PathBadge path="public/llms.txt" onCopy={copyPath} copied={copiedPath} />
              <p className="text-slate-400 text-sm mt-3 mb-3">
                Concise business profile for AI systems. Quick reference with services, pricing ranges,
                service areas, and contact info.
              </p>
              <ul className="space-y-2">
                <FeatureItem>Business overview and history</FeatureItem>
                <FeatureItem>Service list with price ranges</FeatureItem>
                <FeatureItem>Free estimate tool description</FeatureItem>
                <FeatureItem>Service areas and contact</FeatureItem>
              </ul>
            </div>

            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-2">llms-full.txt</h3>
              <PathBadge path="public/llms-full.txt" onCopy={copyPath} copied={copiedPath} />
              <p className="text-slate-400 text-sm mt-3 mb-3">
                Extended version with detailed service descriptions, materials, timelines,
                and comprehensive business information for thorough AI consumption.
              </p>
              <ul className="space-y-2">
                <FeatureItem>Expanded service details</FeatureItem>
                <FeatureItem>Materials and specifications</FeatureItem>
                <FeatureItem>Detailed process descriptions</FeatureItem>
                <FeatureItem>Full geographic coverage</FeatureItem>
              </ul>
            </div>
          </div>

          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
            <h3 className="text-white font-semibold mb-4">AI Bot Rules in robots.txt</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <BotCard name="GPTBot" service="ChatGPT / OpenAI" />
              <BotCard name="Claude-Web" service="Claude / Anthropic" />
              <BotCard name="PerplexityBot" service="Perplexity AI" />
              <BotCard name="Google-Extended" service="Gemini / Bard training" />
              <BotCard name="CCBot" service="Common Crawl (many AI models)" />
              <BotCard name="anthropic-ai" service="Anthropic crawler" />
            </div>
            <div className="mt-4 bg-[#0c0f14] rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Allowed paths for AI bots:</p>
              <p className="text-sm text-[#c9a25c] font-mono">/  /llms.txt  /llms-full.txt  /services/  /blog/  /about  /contact</p>
            </div>
          </div>
        </section>

        {/* CONTENT PAGES */}
        <section id="content-pages" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={FileText}
            title="Content Pages"
            subtitle="All pages targeting SEO keywords"
          />

          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800 mb-6">
            <h3 className="text-white font-semibold mb-4">Pricing Pages (High-Intent)</h3>
            <div className="space-y-2">
              <ContentPageRow
                path="/pricing"
                keyword="roofing prices mississippi"
                volume="720/mo"
                onCopy={copyPath}
                copied={copiedPath}
              />
              <ContentPageRow
                path="/pricing/roof-replacement-cost"
                keyword="roof replacement cost mississippi"
                volume="480/mo"
                onCopy={copyPath}
                copied={copiedPath}
              />
              <ContentPageRow
                path="/pricing/metal-roof-cost"
                keyword="metal roof cost mississippi"
                volume="390/mo"
                onCopy={copyPath}
                copied={copiedPath}
              />
              <ContentPageRow
                path="/pricing/roof-repair-cost"
                keyword="roof repair cost mississippi"
                volume="320/mo"
                onCopy={copyPath}
                copied={copiedPath}
              />
            </div>
          </div>

          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800 mb-6">
            <h3 className="text-white font-semibold mb-4">Blog Posts</h3>
            <PathBadge path="lib/data/blog.ts" onCopy={copyPath} copied={copiedPath} />
            <div className="space-y-2 mt-3">
              <BlogRow slug="signs-you-need-new-roof" title="7 Warning Signs You Need a New Roof in Mississippi" />
              <BlogRow slug="asphalt-vs-metal-roofing" title="Asphalt vs. Metal Roofing: Complete Cost & Performance Comparison" />
              <BlogRow slug="roof-maintenance-checklist" title="Complete Roof Maintenance Checklist for Mississippi Homeowners" />
              <BlogRow slug="roof-insurance-claims" title="Mississippi Roof Insurance Claims: Complete Step-by-Step Guide" />
              <BlogRow slug="choosing-roofing-contractor" title="How to Choose a Roofing Contractor: 15 Essential Questions" />
              <BlogRow slug="new-roof-cost-mississippi-2026" title="How Much Does a New Roof Cost in Mississippi? (2026 Guide)" />
              <BlogRow slug="metal-roof-vs-shingles-cost" title="Metal Roof vs Shingles: Real Cost Difference Over 30 Years" />
              <BlogRow slug="roof-replacement-cost-factors" title="What Factors Affect Your Roof Replacement Cost?" />
              <BlogRow slug="free-roof-inspection-what-to-expect" title="Is a Free Roof Inspection Really Free? What to Expect" />
              <BlogRow slug="mississippi-storm-damage-insurance-coverage" title="Mississippi Storm Damage: What Your Insurance Covers" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#1a1f2e] rounded-xl p-5 border border-slate-800">
              <h3 className="text-white font-semibold text-sm mb-3">Dynamic Pages (Templated)</h3>
              <ul className="space-y-2">
                <FeatureItem>City pages: /{'{city}'}-roofing</FeatureItem>
                <FeatureItem>County pages: /{'{county}'}-roofing</FeatureItem>
                <FeatureItem>Service pages: /services/{'{slug}'}</FeatureItem>
                <FeatureItem>Service+City: /{'{service}'}-{'{city}'}-ms</FeatureItem>
                <FeatureItem>Comparison: /best-roofers-in-{'{city}'}-ms</FeatureItem>
              </ul>
            </div>
            <div className="bg-[#1a1f2e] rounded-xl p-5 border border-slate-800">
              <h3 className="text-white font-semibold text-sm mb-3">Data Source Files</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-slate-600" />
                  <code className="text-[#c9a25c] text-xs">lib/data/ms-locations.ts</code> — Cities & counties
                </li>
                <li className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-slate-600" />
                  <code className="text-[#c9a25c] text-xs">lib/data/services.ts</code> — Service definitions
                </li>
                <li className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-slate-600" />
                  <code className="text-[#c9a25c] text-xs">lib/data/blog.ts</code> — Blog content
                </li>
                <li className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-slate-600" />
                  <code className="text-[#c9a25c] text-xs">lib/data/ms-competitors.ts</code> — Competitor data
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* INTERNAL LINKS */}
        <section id="internal-links" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Link2}
            title="Internal Linking System"
            subtitle="9 components for cross-page SEO linking"
          />

          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Link Components</h3>
              <PathBadge path="components/seo/internal-links.tsx" onCopy={copyPath} copied={copiedPath} />
            </div>
            <div className="space-y-3">
              <LinkComponentRow
                name="RelatedCitiesLinks"
                desc="Shows nearby cities, prioritizing same-county cities first"
                usedOn="City pages"
              />
              <LinkComponentRow
                name="ServiceCrossLinks"
                desc="Same service in different cities"
                usedOn="Service+City combo pages"
              />
              <LinkComponentRow
                name="AllServicesInCity"
                desc="All services available in a given city"
                usedOn="City landing pages"
              />
              <LinkComponentRow
                name="CountyCitiesGrid"
                desc="All cities within a county"
                usedOn="County pages"
              />
              <LinkComponentRow
                name="RegionalNavigation"
                desc="All counties served"
                usedOn="Service area pages"
              />
              <LinkComponentRow
                name="SiloNavigation"
                desc="Main category links (services + locations)"
                usedOn="Multiple page types"
              />
              <LinkComponentRow
                name="FooterLocationLinks"
                desc="Comprehensive location links for footer"
                usedOn="Site-wide footer"
              />
              <LinkComponentRow
                name="ComparisonPageLink"
                desc="Link to Best Roofers comparison pages"
                usedOn="City and service pages"
              />
              <LinkComponentRow
                name="NearbyComparisonLinks"
                desc="Nearby city comparison pages"
                usedOn="Comparison pages"
              />
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-lg p-4 text-sm text-slate-400">
            <strong className="text-white">Linking strategy:</strong> Every page links to related pages via these components,
            creating a web of internal links that distributes page authority (link juice) throughout the site.
            City pages link to services, services link to cities, and comparison pages cross-link to both.
          </div>
        </section>

        {/* OG IMAGES */}
        <section id="og-images" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Image}
            title="Dynamic OG Images"
            subtitle="4 endpoints generating social sharing images"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <OGRouteCard
              path="app/api/og/route.tsx"
              title="General OG Images"
              description="Default social sharing images for service pages, blog posts, and general content."
              params="type, title, subtitle"
              onCopy={copyPath}
              copied={copiedPath}
            />
            <OGRouteCard
              path="app/api/og/location/route.tsx"
              title="Location OG Images"
              description="City and county specific images with location name, service area branding."
              params="city, county, type"
              onCopy={copyPath}
              copied={copiedPath}
            />
            <OGRouteCard
              path="app/api/og/compare/route.tsx"
              title="Comparison OG Images"
              description="Best Roofers comparison page images with city name and year."
              params="city, state"
              onCopy={copyPath}
              copied={copiedPath}
            />
            <OGRouteCard
              path="app/api/og/estimate/route.tsx"
              title="Estimate OG Images"
              description="Dynamic images for shared estimates with price range and project type."
              params="type, range"
              onCopy={copyPath}
              copied={copiedPath}
            />
          </div>
        </section>

        {/* TECHNICAL SEO */}
        <section id="technical" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={Shield}
            title="Technical SEO"
            subtitle="Meta tags, canonicals, Open Graph, and more"
          />

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">Every Page Includes</h3>
              <ul className="space-y-2">
                <FeatureItem>Canonical URL (prevents duplicate content)</FeatureItem>
                <FeatureItem>Title tag with primary keyword</FeatureItem>
                <FeatureItem>Meta description (150-160 chars)</FeatureItem>
                <FeatureItem>Open Graph tags (og:title, og:description, og:image)</FeatureItem>
                <FeatureItem>Twitter Card meta tags</FeatureItem>
                <FeatureItem>Geo meta tags for Mississippi targeting</FeatureItem>
                <FeatureItem>Breadcrumb structured data</FeatureItem>
                <FeatureItem>Viewport and charset declarations</FeatureItem>
              </ul>
            </div>

            <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">Domain Configuration</h3>
              <ul className="space-y-3 text-sm">
                <li className="text-slate-300">
                  <span className="text-slate-500 text-xs block">Primary Domain</span>
                  <code className="text-[#c9a25c]">www.smartroofpricing.com</code>
                </li>
                <li className="text-slate-300">
                  <span className="text-slate-500 text-xs block">Sitemap</span>
                  <code className="text-[#c9a25c]">www.smartroofpricing.com/sitemap.xml</code>
                </li>
                <li className="text-slate-300">
                  <span className="text-slate-500 text-xs block">Robots</span>
                  <code className="text-[#c9a25c]">www.smartroofpricing.com/robots.txt</code>
                </li>
                <li className="text-slate-300">
                  <span className="text-slate-500 text-xs block">Deployment</span>
                  <code className="text-[#c9a25c]">Vercel (production)</code>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
            <h3 className="text-white font-semibold mb-4">Key SEO Utilities</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-[#0c0f14] rounded-lg p-3">
                <code className="text-[#c9a25c] text-xs">components/seo/advanced-schema.tsx</code>
                <p className="text-slate-400 text-xs mt-1"><code>generateComprehensiveMeta()</code> — generates full meta tag sets for any page</p>
              </div>
              <div className="bg-[#0c0f14] rounded-lg p-3">
                <code className="text-[#c9a25c] text-xs">components/seo/nap-schema.tsx</code>
                <p className="text-slate-400 text-xs mt-1"><code>BUSINESS_INFO</code> constant — single source of truth for business contact data</p>
              </div>
              <div className="bg-[#0c0f14] rounded-lg p-3">
                <code className="text-[#c9a25c] text-xs">components/seo/schema-utils.tsx</code>
                <p className="text-slate-400 text-xs mt-1">Client-safe lightweight schemas (no server-only imports)</p>
              </div>
              <div className="bg-[#0c0f14] rounded-lg p-3">
                <code className="text-[#c9a25c] text-xs">components/seo/index.ts</code>
                <p className="text-slate-400 text-xs mt-1">Barrel export for all schema components</p>
              </div>
            </div>
          </div>
        </section>

        {/* MAINTENANCE */}
        <section id="maintenance" className="mb-16 scroll-mt-[7.5rem] md:scroll-mt-20">
          <SectionHeader
            icon={RefreshCw}
            title="What Needs Maintaining"
            subtitle="Regular tasks to keep SEO performing"
          />

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <MaintenanceCard
              frequency="Monthly"
              color="text-emerald-400"
              borderColor="border-emerald-500/30"
              items={[
                'Update pricing data on all service and pricing pages',
                'Add new project photos to city pages',
                'Publish 2-4 blog posts',
                'Refresh storm/weather content if applicable',
                'Check IndexNow is notifying on content changes',
              ]}
            />
            <MaintenanceCard
              frequency="Quarterly"
              color="text-blue-400"
              borderColor="border-blue-500/30"
              items={[
                'Audit all service area pages for accuracy',
                'Refresh top 10 blog posts by traffic',
                'Update FAQ sections with new questions',
                'Verify all schemas pass Google validation',
                'Check for broken internal links',
              ]}
            />
            <MaintenanceCard
              frequency="Every 6 Months"
              color="text-purple-400"
              borderColor="border-purple-500/30"
              items={[
                'Full content audit — remove thin/outdated pages',
                'Refresh llms.txt and llms-full.txt',
                'Update comparison pages with current reviews',
                'Review robots.txt for new AI bots',
                'Verify OG images render correctly',
              ]}
            />
          </div>

          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#c9a25c]" />
              Quick Wins When Adding Content
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-300 text-sm mb-2 font-medium">New City Page</p>
                <ol className="space-y-1 text-sm text-slate-400">
                  <li>1. Add to <code className="text-[#c9a25c]">lib/data/ms-locations.ts</code></li>
                  <li>2. Sitemap auto-generates URLs</li>
                  <li>3. Internal links auto-update</li>
                  <li>4. Hit IndexNow endpoint</li>
                </ol>
              </div>
              <div>
                <p className="text-slate-300 text-sm mb-2 font-medium">New Blog Post</p>
                <ol className="space-y-1 text-sm text-slate-400">
                  <li>1. Add to <code className="text-[#c9a25c]">lib/data/blog.ts</code></li>
                  <li>2. Article schema auto-applies</li>
                  <li>3. Sitemap auto-includes</li>
                  <li>4. Hit IndexNow endpoint</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f2e] rounded-xl p-6 border border-slate-800">
            <h3 className="text-white font-semibold mb-4">Tracking & Monitoring Tools</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ToolBadge name="Google Search Console" purpose="Rankings & clicks" />
              <ToolBadge name="Google Analytics" purpose="Traffic & conversions" />
              <ToolBadge name="Google Business Profile" purpose="Local search visibility" />
              <ToolBadge name="PageSpeed Insights" purpose="Core Web Vitals" />
              <ToolBadge name="Schema Validator" purpose="Structured data testing" />
              <ToolBadge name="Rich Results Test" purpose="Rich snippet preview" />
              <ToolBadge name="IndexNow Dashboard" purpose="Indexing notifications" />
              <ToolBadge name="Bing Webmaster" purpose="Bing search performance" />
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
    <div className="bg-[#1a1f2e] rounded-lg p-3 border border-slate-800 text-center">
      <p className="text-2xl font-bold text-[#c9a25c]">{number}</p>
      <p className="text-white text-xs font-medium">{label}</p>
      <p className="text-slate-500 text-xs">{desc}</p>
    </div>
  )
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-300">
      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
      {children}
    </li>
  )
}

function PathBadge({ path, onCopy, copied }: {
  path: string
  onCopy: (path: string) => void
  copied: string | null
}) {
  return (
    <button
      onClick={() => onCopy(path)}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-colors ${
        copied === path
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-[#0c0f14] text-[#c9a25c] hover:bg-slate-800'
      }`}
    >
      {copied === path ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {path}
    </button>
  )
}

function SchemaFileCard({ path, description, schemas, onCopy, copied }: {
  path: string
  description: string
  schemas: Array<{ name: string; desc: string; guarded?: boolean }>
  onCopy: (path: string) => void
  copied: string | null
}) {
  return (
    <div className="bg-[#1a1f2e] rounded-xl p-5 border border-slate-800">
      <div className="flex items-start justify-between mb-2">
        <div>
          <PathBadge path={path} onCopy={onCopy} copied={copied} />
          <p className="text-slate-400 text-xs mt-1">{description}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {schemas.map((s) => (
          <div key={s.name} className="flex items-center gap-2 text-xs">
            <Code className="h-3 w-3 text-slate-600 flex-shrink-0" />
            <span className="text-white font-mono">{s.name}</span>
            <span className="text-slate-500">— {s.desc}</span>
            {s.guarded && (
              <span className="text-amber-400 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10">guarded</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function SitemapCategory({ name, count, format, priority, freq }: {
  name: string
  count: string
  format: string
  priority: string
  freq: string
}) {
  return (
    <div className="flex items-center gap-3 bg-[#0c0f14] rounded-lg p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white text-sm font-medium">{name}</span>
          <span className="text-[#c9a25c] text-xs bg-[#c9a25c]/10 px-1.5 py-0.5 rounded">{count}</span>
        </div>
        <p className="text-slate-500 text-xs font-mono truncate">{format}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-slate-400 text-xs">Priority: {priority}</p>
        <p className="text-slate-500 text-xs">{freq}</p>
      </div>
    </div>
  )
}

function BotCard({ name, service }: { name: string; service: string }) {
  return (
    <div className="bg-[#0c0f14] rounded-lg p-3 text-center">
      <p className="text-white text-sm font-mono font-medium">{name}</p>
      <p className="text-slate-500 text-xs">{service}</p>
    </div>
  )
}

function ContentPageRow({ path, keyword, volume, onCopy, copied }: {
  path: string
  keyword: string
  volume: string
  onCopy: (path: string) => void
  copied: string | null
}) {
  return (
    <div className="flex items-center gap-3 bg-[#0c0f14] rounded-lg p-3">
      <div className="flex-1 min-w-0">
        <PathBadge path={`app/pricing${path === '/pricing' ? '/page.tsx' : path.replace('/pricing/', '/') + '/page.tsx'}`} onCopy={onCopy} copied={copied} />
        <p className="text-slate-500 text-xs mt-1">Target: <span className="text-slate-300">{keyword}</span></p>
      </div>
      <div className="flex-shrink-0">
        <span className="text-[#c9a25c] text-xs font-medium bg-[#c9a25c]/10 px-2 py-1 rounded">{volume}</span>
      </div>
    </div>
  )
}

function BlogRow({ slug, title }: { slug: string; title: string }) {
  return (
    <div className="flex items-start gap-2 bg-[#0c0f14] rounded-lg p-2.5">
      <FileText className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-white text-xs font-medium truncate">{title}</p>
        <p className="text-slate-500 text-xs font-mono">/blog/{slug}</p>
      </div>
    </div>
  )
}

function LinkComponentRow({ name, desc, usedOn }: {
  name: string
  desc: string
  usedOn: string
}) {
  return (
    <div className="flex items-center gap-3 bg-[#0c0f14] rounded-lg p-3">
      <div className="flex-1 min-w-0">
        <span className="text-white text-sm font-mono">{name}</span>
        <p className="text-slate-500 text-xs">{desc}</p>
      </div>
      <span className="text-[#c9a25c] text-xs bg-[#c9a25c]/10 px-2 py-1 rounded flex-shrink-0">{usedOn}</span>
    </div>
  )
}

function OGRouteCard({ path, title, description, params, onCopy, copied }: {
  path: string
  title: string
  description: string
  params: string
  onCopy: (path: string) => void
  copied: string | null
}) {
  return (
    <div className="bg-[#1a1f2e] rounded-xl p-5 border border-slate-800">
      <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
      <PathBadge path={path} onCopy={onCopy} copied={copied} />
      <p className="text-slate-400 text-xs mt-2 mb-2">{description}</p>
      <div className="bg-[#0c0f14] rounded px-2 py-1">
        <span className="text-slate-500 text-xs">Params: </span>
        <span className="text-[#c9a25c] text-xs font-mono">{params}</span>
      </div>
    </div>
  )
}

function MaintenanceCard({ frequency, color, borderColor, items }: {
  frequency: string
  color: string
  borderColor: string
  items: string[]
}) {
  return (
    <div className={`bg-[#1a1f2e] rounded-xl p-5 border ${borderColor}`}>
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

function ToolBadge({ name, purpose }: { name: string; purpose: string }) {
  return (
    <div className="bg-[#0c0f14] rounded-lg p-3 text-center">
      <p className="text-white text-xs font-medium">{name}</p>
      <p className="text-slate-500 text-[10px]">{purpose}</p>
    </div>
  )
}
