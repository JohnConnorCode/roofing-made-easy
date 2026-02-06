# Communications Admin System - Handoff Document

## Overview
Implementing a unified Communications admin page for deep control over all outbound communications: email templates, SMS templates, estimate/quote content, and payment terms.

---

## Completed Tasks

### 1. Database Migration ✅
**File:** `supabase/migrations/025_communications_content.sql`
- Created `estimate_content` table for warranties, scope, terms, payment_terms
- Added SMS templates to `message_templates` table
- Seeded default content for all estimate sections
- RLS policies configured

### 2. Estimate Content Service Layer ✅
**File:** `lib/communications/estimate-content-service.ts`
- `getEstimateContent(type)` - Get content by type with fallbacks
- `getAllEstimateContent()` - Admin listing
- `getEstimateContentById(id)` - Single item
- `updateEstimateContent(id, updates)` - Update content
- `resetEstimateContent(id)` - Reset to default
- `getGroupedEstimateContent()` - Get all grouped by type

### 3. API Routes ✅
Created all CRUD endpoints:
- `app/api/admin/communications/templates/route.ts` - GET list templates
- `app/api/admin/communications/templates/[id]/route.ts` - GET/PUT template
- `app/api/admin/communications/templates/[id]/reset/route.ts` - POST reset
- `app/api/admin/communications/estimate-content/route.ts` - GET list content
- `app/api/admin/communications/estimate-content/[id]/route.ts` - GET/PUT content
- `app/api/admin/communications/estimate-content/[id]/reset/route.ts` - POST reset

---

## In Progress

### 4. Communications Admin Page 🔄
**File to create:** `app/(admin)/communications/page.tsx`

Should have:
- Tabbed interface: Email Templates | SMS Templates | Estimate Content | Variables
- Template list with edit/preview/reset actions
- Rich text editor for email HTML (or code editor toggle)
- Plain text editor for SMS (with character counter, 160 char segments)
- Content editor for estimate sections with preview
- Variable reference panel showing all available `{{variables}}`

**UI Reference:** See `app/(admin)/templates/page.tsx` for patterns (existing templates page)
**Modal Reference:** See `components/admin/EmailPreviewModal.tsx` for preview modal

---

## Remaining Tasks

### 5. Update QuoteViewer to use dynamic content
**File:** `components/customer/QuoteViewer.tsx`
- Currently has hardcoded "What's Included" section (lines 376-391)
- Should fetch from `getGroupedEstimateContent()` instead
- Display warranties, scope, terms dynamically

### 6. Update Features Page Documentation
**File:** `app/(admin)/features/page.tsx`
- Add new section for Communications Management
- Document email/SMS templates, estimate content editing

### 7. Run Migration & Verify Build
- Run `supabase db push` to apply migration
- Run `npx tsc --noEmit`
- Run `npm run build`

---

## Key Patterns Used

### API Auth Pattern
```typescript
import { requirePermission } from '@/lib/team/permissions'

const { error: authError } = await requirePermission('settings', 'view')
if (authError) return authError
```

### Admin Page Pattern
- Uses `'use client'` directive
- Card components from `@/components/ui/card`
- Button from `@/components/ui/button`
- Input/Select from `@/components/ui/input` and `@/components/ui/select`
- useConfirmDialog for destructive actions

### Variable Reference (for admin page)
| Variable | Description |
|----------|-------------|
| `{{customer_name}}` | Full customer name |
| `{{customer_first_name}}` | First name only |
| `{{customer_email}}` | Customer email |
| `{{quote_url}}` | Link to view quote |
| `{{invoice_url}}` | Link to pay invoice |
| `{{amount}}` | Dollar amount |
| `{{company_name}}` | Business name |
| `{{company_phone}}` | Business phone |
| `{{company_email}}` | Business email |
| `{{appointment_time}}` | Formatted appointment time |

---

## File Summary

| # | File | Status |
|---|------|--------|
| 1 | `supabase/migrations/025_communications_content.sql` | ✅ Created |
| 2 | `lib/communications/estimate-content-service.ts` | ✅ Created |
| 3 | `app/api/admin/communications/templates/route.ts` | ✅ Created |
| 4 | `app/api/admin/communications/templates/[id]/route.ts` | ✅ Created |
| 5 | `app/api/admin/communications/templates/[id]/reset/route.ts` | ✅ Created |
| 6 | `app/api/admin/communications/estimate-content/route.ts` | ✅ Created |
| 7 | `app/api/admin/communications/estimate-content/[id]/route.ts` | ✅ Created |
| 8 | `app/api/admin/communications/estimate-content/[id]/reset/route.ts` | ✅ Created |
| 9 | `app/(admin)/communications/page.tsx` | ❌ TO CREATE |
| 10 | `components/customer/QuoteViewer.tsx` | ❌ TO MODIFY |
| 11 | `app/(admin)/features/page.tsx` | ❌ TO MODIFY |

---

## Task List Status

```
#1. [completed] Create database migration for communications content
#2. [completed] Create estimate content service layer
#3. [completed] Create API routes for templates and estimate content
#4. [in_progress] Create Communications admin page
#5. [pending] Update QuoteViewer to use dynamic content
#6. [pending] Update Features page documentation
#7. [pending] Verify build and type checks pass
```
