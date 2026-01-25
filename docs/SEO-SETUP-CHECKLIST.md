# SEO Setup Checklist

## Before Launch - REQUIRED

### 1. Business Configuration (`/lib/config/business.ts`)

Edit this file with REAL business data:

- [ ] **Phone Number** - Replace `+1-662-555-0123` with actual phone
- [ ] **Address** - Replace `123 Main Street` with actual address
- [ ] **Set `isReal: true`** for phone and address once updated
- [ ] **GPS Coordinates** - Verify lat/lng are accurate for your location
- [ ] **Email** - Confirm email addresses are correct

### 2. Social Media & External Profiles

In `/lib/config/business.ts`, add your real profile URLs:

- [ ] Google Business Profile (get CID from Google Maps)
- [ ] Facebook Page
- [ ] Instagram
- [ ] Yelp
- [ ] BBB
- [ ] HomeAdvisor / Angi (if applicable)

### 3. Certifications

Only set to `true` if you ACTUALLY have these:

- [ ] `gafCertified` - GAF Certified Contractor
- [ ] `owensCorningPreferred` - Owens Corning Preferred
- [ ] `certainteedMaster` - CertainTeed SELECT ShingleMaster
- [ ] `stateLicensed` - Add your license number

### 4. Reviews

**CRITICAL: Only use real reviews with permission**

- [ ] Add `googleRating` from your Google Business Profile
- [ ] Add `googleReviewCount` from your Google Business Profile
- [ ] Add `featured` reviews only from customers who gave permission

### 5. Verification Codes

- [ ] Google Search Console verification code
- [ ] Bing Webmaster verification code

### 6. Required Assets

Create/add these files:

- [ ] `/public/images/og-default.jpg` (1200x630px) - Social sharing image
- [ ] `/public/apple-touch-icon.png` (180x180px) - iOS icon
- [ ] Replace `/public/favicon.ico` with proper ICO file
- [ ] Location photos in `/public/images/locations/`

---

## What's Implemented

### Schema Markup
- Organization Schema
- WebSite Schema
- LocalBusiness Schema (per city)
- Service Schema (per service+city)
- HowTo Schema (service processes)
- FAQ Schema
- Breadcrumb Schema
- Service Area Schema (all 20+ cities)
- GeoShape Schema (service area boundaries)
- Speakable Schema (voice search)

### Safety Features
- Schemas with placeholder data are **hidden in production**
- Review schemas only render if `hasVerifiedReviews()` returns true
- Social links only included if real URLs configured
- Credentials only included if verified

### Files Created
- `/lib/config/business.ts` - Centralized config (EDIT THIS)
- `/components/seo/regional-schema.tsx` - Regional SEO schemas
- `/components/seo/nap-schema.tsx` - NAP consistency
- `/components/seo/internal-links.tsx` - Internal linking components
- `/components/seo/advanced-schema.tsx` - Core schemas

### Pages with Full SEO
- 20 city pages (`/[city]-roofing`)
- 10 county pages (`/[county]-county-roofing`)
- 100 service+city pages (`/[service]-[city]-ms`)
- Sitemap with 130+ URLs

---

## Post-Launch

- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster
- [ ] Verify all pages indexed
- [ ] Monitor for schema errors in GSC
- [ ] Set up Google Analytics 4
- [ ] Set up call tracking

---

## Testing

Before launch, validate schemas at:
- https://search.google.com/test/rich-results
- https://validator.schema.org/

Test pages:
- Homepage
- At least 2 city pages
- At least 2 service+city pages
- Contact page
