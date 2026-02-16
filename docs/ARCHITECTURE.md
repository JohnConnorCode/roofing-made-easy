# Architecture Overview

This document describes the system architecture for developers picking up the codebase.

## System Architecture

The app is a Next.js 16 application using the App Router with React Server Components. It runs on Vercel with a Supabase PostgreSQL backend.

```
┌─────────────────────────────────────────────────┐
│                    Vercel                        │
│  ┌───────────────────────────────────────────┐  │
│  │           Next.js App Router              │  │
│  │                                           │  │
│  │  Server Components ──► API Routes ◄── Middleware
│  │        │                    │         (auth, rate limit)
│  │  Client Components    Route Handlers      │  │
│  │   (Zustand state)     (requireAdmin)      │  │
│  └───────────┬──────────────┬────────────────┘  │
└──────────────┼──────────────┼───────────────────┘
               │              │
    ┌──────────▼──────────────▼──────────┐
    │         Supabase                    │
    │  PostgreSQL │ Auth │ Storage        │
    │  (RLS)      │      │ (uploads)      │
    └─────────────────────────────────────┘
               │
    ┌──────────▼──────────────────────────┐
    │      External Services              │
    │  Stripe │ Resend │ Twilio │ OpenAI  │
    │  Anthropic │ Upstash │ Sentry       │
    └─────────────────────────────────────┘
```

### Server vs. Client Components

- **Server Components** (default) — Used for pages that fetch data. Database queries run server-side, no client JS shipped.
- **Client Components** (`'use client'`) — Used for interactive pages (forms, tabs, modals, real-time updates). Most admin pages are client components since they involve user interaction.
- **API Route Handlers** — All under `app/api/`. Handle mutations, external service calls, and authenticated operations.

## Route Groups

Next.js route groups organize the app without affecting URL paths:

| Group | URL Prefix | Purpose | Layout |
|-------|-----------|---------|--------|
| `(admin)` | `/dashboard`, `/leads`, `/jobs`, etc. | Admin dashboard | Admin sidebar + header |
| `(customer)` | `/portal/*` | Customer portal | Portal nav + breadcrumbs |
| `(funnel)` | `/[leadId]/*` | Lead capture funnel | Minimal funnel chrome |
| `(location)` | `/city/*`, `/county/*`, etc. | SEO landing pages | Public layout |
| `(public)` | `/about`, `/services`, etc. | Marketing pages | Public layout with nav/footer |

Each group has its own `layout.tsx` that wraps all pages in the group.

## Database

### Supabase PostgreSQL

The schema is defined across 46 migrations in `supabase/migrations/`. Changes are applied with `supabase db push --include-all`.

### Key Tables

**Lead Pipeline:**
- `leads` — Core lead record (status, source, priority, assigned_to)
- `contacts` — Contact info linked to leads
- `properties` — Property details (address, roof type, sq ft)
- `lead_activities` — Activity timeline for each lead

**Estimation:**
- `estimates` — Generated estimates linked to leads
- `line_items` — Catalog of pricing items (admin-managed)
- `estimate_macros` — Reusable estimate templates
- `estimate_content` — Editable warranty/scope/terms content
- `roof_variables` — Roof measurement variables for detailed estimates
- `detailed_estimates` — Xactimate-style detailed estimate data

**Jobs:**
- `jobs` — Active jobs created from accepted estimates
- `job_status_history` — Status change audit trail
- `crew_assignments` — Crew member assignments to jobs
- `time_entries` — Time tracking for job labor
- `change_orders` — Scope/price changes during a job

**Financial:**
- `invoices` — Invoices linked to jobs/estimates
- `payments` — Payment records (Stripe integration)

**Communication:**
- `message_templates` — Email and SMS templates with variable substitution
- `scheduled_messages` — Queued outbound messages
- `communication_workflows` — Automated communication sequences

**Scheduling:**
- `calendar_events` — Scheduled events
- `calendar_resources` — Equipment, crew, vehicles

**Team:**
- `user_profiles` — Extended user data (role, permissions, team)
- `teams` — Team groupings

**System:**
- `settings` — Runtime key-value configuration
- `notifications` — In-app notification queue

### Row Level Security

Every table has RLS policies. The pattern:

- **Admin** — Full CRUD via JWT role claim (`auth.jwt() ->> 'user_metadata'::json ->> 'role' = 'admin'`)
- **Customer** — Read/update own records via `auth.uid()` matching the record's user ID
- **Anonymous** — Limited INSERT for funnel flow (creating leads, contacts, properties), limited SELECT for public data

## Authentication

### Admin Auth

Supabase Auth with email/password. Admin users have `user_metadata.role = 'admin'` (or other team roles). The middleware (`middleware.ts`) protects all admin routes — unauthenticated requests redirect to `/login`.

API routes enforce auth with helpers from `lib/api/auth.ts`:

```typescript
// Require any authenticated admin-side user
const { user, error } = await requireAdmin()
if (error) return error

// Require specific permission
const { error: authError } = await requirePermission('leads', 'edit')
if (authError) return authError
```

### Customer Auth

Separate auth flow. Customers register via the portal with their lead's email. Protected by middleware — unauthenticated requests redirect to `/customer/login`.

API routes use `requireCustomer()` and `requireLeadOwnership(leadId)`.

### Permission System

Five roles with hierarchical permissions defined in `lib/team/permissions.ts`:

| Role | Access Level |
|------|-------------|
| `admin` | Full system access |
| `manager` | All except delete and system config |
| `sales` | Leads, estimates, customers |
| `crew_lead` | Jobs, tasks, crew |
| `crew` | View assigned jobs, log time |

Permissions cover 9 resource types: leads, estimates, customers, tasks, team, settings, reports, jobs, calendar. Each resource supports actions: view, edit, delete, assign (where applicable).

Per-user permission overrides are stored in `user_profiles.custom_permissions`.

## Key Services (`lib/`)

### AI (`lib/ai/`)
- `providers/` — OpenAI and Anthropic client wrappers
- Photo measurement extraction (OpenAI Vision)
- Line-item suggestions from project descriptions
- Customer-facing AI advisors (financing, insurance, assistance)

### Estimation (`lib/estimation/`)
- Pricing engine with formula parser
- Pricing tiers and geographic adjustments
- Roof variable calculations
- Detailed estimate builder

### Communication (`lib/communication/`)
- Workflow engine — triggers automated email/SMS sequences based on events
- Template renderer — Mustache-style `{{variable}}` substitution

### Email (`lib/email/`)
- Resend integration for transactional email
- HTML email templates with brand configuration
- Notification emails (new lead, estimate ready, invoice sent)

### SMS (`lib/sms/`)
- Twilio integration for outbound SMS
- Appointment reminders, status updates

### PDF (`lib/pdf/`)
- Estimate/quote PDFs with branding
- Invoice PDFs
- Lien waiver documents

### Payments (`lib/stripe/`)
- Payment intent creation
- Webhook handler for payment events
- Invoice payment links

### Team (`lib/team/`)
- Permission checking (`hasPermission`, `requirePermission`)
- Role hierarchy enforcement
- Activity logging for audit trail

## External Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| **Supabase** | Database, auth, file storage | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Stripe** | Payment processing, webhooks | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **OpenAI** | Photo analysis, AI suggestions | `OPENAI_API_KEY` |
| **Anthropic** | AI customer advisors | `ANTHROPIC_API_KEY` |
| **Resend** | Transactional email | `RESEND_API_KEY` |
| **Twilio** | SMS notifications | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` |
| **Upstash** | Distributed rate limiting (Redis) | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| **Sentry** | Error tracking and monitoring | `SENTRY_DSN` |
| **Google** | Address autocomplete (Places API) | `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` |

## Configuration

### Business Config (`lib/config/business.ts`)

Central source of truth for company information: name, phone, address, certifications, service area, business hours, social links, and review data. Used throughout the app for branding, SEO metadata, schema markup, and email templates.

Includes build-time validation — production builds fail if placeholder data is detected, ensuring real business information is configured before deploy.

### Runtime Settings (`settings` table)

Key-value store for configuration that can change without redeployment. Managed from the admin Settings page. Used for feature toggles, business rules, and integration settings.

### Rate Limiting

Configured in `middleware.ts` and `lib/rate-limit.ts`:

- General API: 100 requests/minute
- Auth endpoints: 5 requests/minute (brute-force protection)
- AI endpoints: 10 requests/minute (standard), 5 requests/minute (vision)

Uses Upstash Redis in production, falls back to in-memory rate limiting for development.

## State Management

### Server State
Data is fetched in Server Components or via API calls from Client Components using `fetch`. No client-side caching layer — data is always fresh from the API.

### Client State (Zustand)

Two stores with localStorage persistence:

- **`funnelStore`** — Manages the multi-step lead capture funnel. Tracks property details, roof info, photos, contact info, and the generated estimate. Persisted so users can resume an incomplete funnel.
- **`customerStore`** — Manages customer portal state. Tracks profile, linked leads, financing applications, insurance claims, and job progress.

Both stores use selective persistence (heavy data like photos excluded) and typed selector hooks for render optimization.

## Middleware (`middleware.ts`)

Runs on every request. Handles:

1. **Rate limiting** — Token bucket per IP for API routes
2. **Auth protection** — Redirects unauthenticated users from admin/portal routes
3. **Role enforcement** — Blocks non-admin users from admin routes
4. **Session refresh** — Refreshes Supabase auth tokens approaching expiry

## Testing

- **Unit tests** (`__tests__/`, Vitest) — Business logic, utilities, services
- **E2E tests** (`e2e/`, Playwright) — Full browser tests covering admin flows, critical journeys, and customer interactions
- **CI** — GitHub Actions runs `tsc --noEmit`, `npm run build`, and `npm test` on every push
