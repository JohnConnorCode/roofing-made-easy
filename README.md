# Roofing Made Easy

AI-powered roofing business management platform. Handles the full lifecycle from lead capture through job completion — estimates, invoicing, scheduling, crew management, customer portal, and automated communications.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React Server Components), React 19, TypeScript 5
- **Database:** Supabase (PostgreSQL with Row Level Security, Auth, Storage)
- **Styling:** Tailwind CSS 4, Lucide icons
- **State:** Zustand (client), React Hook Form + Zod (forms)
- **AI:** OpenAI (photo analysis, line-item suggestions), Anthropic Claude (customer advisors)
- **Payments:** Stripe (invoicing, payment intents, webhooks)
- **Email:** Resend (transactional emails, templates)
- **SMS:** Twilio (notifications, reminders)
- **PDF:** @react-pdf/renderer (estimates, invoices, lien waivers)
- **Monitoring:** Sentry (error tracking), Upstash Redis (rate limiting)
- **Testing:** Vitest (unit), Playwright (E2E), Testing Library (components)
- **Deployment:** Vercel

## Features

- **Lead Funnel** — 11-step capture flow with AI photo analysis and instant estimates
- **Lead Management** — Pipeline/kanban view, activity tracking, bulk operations
- **Estimation** — Quick estimates, detailed Xactimate-style builder, line-item catalog, macros, geographic pricing
- **Job Management** — Crew assignment, scheduling, time tracking, documents, change orders, progress billing
- **Invoicing** — Generate, send, and collect payments via Stripe
- **Calendar** — Team scheduling with availability and resource management
- **Customer Portal** — Project dashboard, document hub, invoice payments, AI financing/insurance/assistance advisors
- **Communications** — Workflow automation engine, email/SMS templates, scheduled messages
- **Team** — 5-role permission system (Admin, Manager, Sales, Crew Lead, Crew) with per-user overrides
- **Reports** — Revenue analysis, accounts aging, lead velocity
- **SEO** — Dynamic location pages, competitor comparisons, schema markup, IndexNow

## Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project
- Supabase CLI (`npm install -g supabase`)

## Getting Started

```bash
# Clone and install
git clone <repo-url>
cd roofing-made-easy
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys (see Environment Variables below)

# Push database migrations
supabase link --project-ref <your-project-ref>
supabase db push --include-all

# Start development server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local`. The file is fully documented with setup links for each service. Key groups:

| Group | Variables | Where to Get |
|-------|-----------|--------------|
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD` | Supabase Dashboard → Project Settings → API / Database |
| **AI** | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | [OpenAI](https://platform.openai.com/api-keys), [Anthropic](https://console.anthropic.com/) |
| **Payments** | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| **Email** | `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME` | [Resend](https://resend.com/api-keys) |
| **SMS** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | [Twilio Console](https://console.twilio.com/) |
| **Google** | `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Google Cloud Console (Places API) |
| **Monitoring** | `SENTRY_DSN`, `UPSTASH_REDIS_REST_URL` | [Sentry](https://sentry.io/), [Upstash](https://console.upstash.com/) |
| **App** | `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`, `API_KEYS_ENCRYPTION_KEY` | Self-generated |

For production, all variables are stored in Vercel. Pull them with `vercel env pull .env.local`.

## Database

The database schema is managed through 46 sequential migrations in `supabase/migrations/`. Key tables:

- `leads`, `contacts`, `properties` — Lead capture and customer data
- `estimates`, `line_items`, `estimate_macros` — Pricing and estimation
- `jobs`, `job_status_history`, `crew_assignments` — Job management
- `invoices`, `payments`, `change_orders` — Financial
- `message_templates`, `scheduled_messages`, `communication_workflows` — Communications
- `user_profiles`, `teams` — Team and permissions
- `calendar_events`, `calendar_resources` — Scheduling
- `notifications` — Notification system
- `settings` — Runtime configuration

All tables use Row Level Security with policies for admin, customer, and anonymous access.

To apply migrations:

```bash
supabase db push --include-all
```

## Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint
npm test                 # Unit tests (Vitest)
npm run test:watch       # Unit tests in watch mode
npm run test:coverage    # Unit tests with coverage
npm run test:e2e         # End-to-end tests (Playwright)
npm run test:e2e:ui      # Playwright UI mode
npm run test:e2e:headed  # E2E tests with browser visible
```

## Deployment

The app deploys to Vercel:

```bash
# Set environment variables in Vercel Dashboard first
vercel --prod
```

CI runs type checking (`tsc --noEmit`), build, and unit tests via GitHub Actions on every push.

## Project Structure

```
app/
├── (admin)/          # Admin dashboard — 33 routes (leads, estimates, jobs, invoices,
│                     #   team, calendar, reports, settings, communications, etc.)
├── (customer)/       # Customer portal — 8 routes (dashboard, invoices, financing,
│                     #   insurance, assistance, project, settings)
├── (funnel)/         # Lead capture funnel — 11 steps (property → photos → estimate)
├── (location)/       # SEO location pages — city, county, service-city, comparisons
├── (public)/         # Marketing pages — about, services, pricing, portfolio, blog, etc.
├── api/              # API routes — 25 route groups, 100+ endpoints
├── layout.tsx        # Root layout
└── page.tsx          # Homepage

components/
├── admin/            # Admin UI (35+ components)
├── customer/         # Portal UI (19+ components)
├── ui/               # Shared primitives (button, card, input, dialog, etc.)
└── [feature]/        # Feature-specific (estimation, financing, insurance, etc.)

lib/
├── ai/               # AI services (photo analysis, advisors, suggestions)
├── api/              # Auth helpers (requireAdmin, requireAuth, requireCustomer)
├── communication/    # Workflow engine, template renderer
├── config/           # Business config, database config
├── data/             # Static data (services, locations, testimonials, FAQs)
├── email/            # Resend integration, email templates
├── estimation/       # Pricing engine (formulas, tiers, variables)
├── jobs/             # Job management
├── pdf/              # PDF generation (estimates, invoices, lien waivers)
├── sms/              # Twilio integration
├── stripe/           # Payment processing
├── supabase/         # Database client (server/client)
├── team/             # Permissions, roles, activity logging
└── ...               # validation, crypto, notifications, hooks, etc.

stores/               # Zustand stores (funnel, customer portal)
supabase/migrations/  # 46 database migrations
e2e/                  # Playwright tests (admin, critical journeys)
__tests__/            # Vitest unit tests
```

## Key Patterns

**Authentication** — All admin API routes use `requireAdmin()` or `requirePermission(resource, action)` from `lib/api/auth.ts` and `lib/team/permissions.ts`. Customer routes use `requireCustomer()`.

**5-Role Permission System** — Admin, Manager, Sales Rep, Crew Lead, Crew. Each role has default permissions across 9 resource types (leads, estimates, customers, tasks, team, settings, reports, jobs, calendar). Per-user overrides are supported.

**Rate Limiting** — Middleware applies rate limits to all API routes (100/min general, 5/min auth). AI endpoints have additional limits (10/min standard, 5/min vision).

**Row Level Security** — Database policies enforce access control at the Postgres level. Admin role gets full access, customers see only their own records, anonymous users have limited read/create for the funnel flow.

**Business Configuration** — `lib/config/business.ts` centralizes company info (name, phone, address, certifications, service area). Build-time validation blocks production deployment with placeholder data.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a detailed architecture overview.

## Developer Reference

See [CLAUDE.md](CLAUDE.md) for database connection details, API patterns, troubleshooting, and development workflow.
