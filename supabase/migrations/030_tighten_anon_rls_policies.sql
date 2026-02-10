-- =============================================================================
-- Migration: 030_tighten_anon_rls_policies.sql
-- Purpose: Remove overly permissive USING (true) anon policies
--
-- Previously, anon users could SELECT/UPDATE ALL records in leads, contacts,
-- properties, intakes, uploads, and estimates. This was justified by "API layer
-- enforces ownership" but the Supabase REST API is publicly accessible with
-- the anon key, bypassing our API routes entirely.
--
-- Fix: Remove all blanket anon SELECT/UPDATE policies. Public-facing features
-- (funnel, estimate page, accept/reject) now use the service role client
-- in their API routes, which bypasses RLS by design.
-- =============================================================================

-- ============================================
-- LEADS TABLE
-- ============================================

-- Drop the open anon policies
DROP POLICY IF EXISTS "Anon read lead by id" ON leads;
DROP POLICY IF EXISTS "Anon update lead" ON leads;

-- Keep: "Public can create leads" (INSERT only, needed for funnel start)
-- But scope it so anon can only create with status='new'
DROP POLICY IF EXISTS "Public can create leads" ON leads;
CREATE POLICY "Public can create leads" ON leads FOR INSERT TO anon
  WITH CHECK (status = 'new');

-- ============================================
-- CONTACTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Anon read contacts" ON contacts;
DROP POLICY IF EXISTS "Anon update contacts" ON contacts;

-- Keep: "Public can create contacts" (INSERT only, for funnel)

-- ============================================
-- PROPERTIES TABLE
-- ============================================

DROP POLICY IF EXISTS "Anon read properties" ON properties;
DROP POLICY IF EXISTS "Anon update properties" ON properties;

-- Keep: "Public can create properties" (INSERT only, for funnel)

-- ============================================
-- INTAKES TABLE
-- ============================================

DROP POLICY IF EXISTS "Anon read intakes" ON intakes;
DROP POLICY IF EXISTS "Anon update intakes" ON intakes;

-- Keep: "Public can create intakes" (INSERT only, for funnel)

-- ============================================
-- UPLOADS TABLE
-- ============================================

DROP POLICY IF EXISTS "Anon read uploads" ON uploads;
DROP POLICY IF EXISTS "Anon update uploads" ON uploads;

-- Keep: "Public can create uploads" (INSERT only, for funnel)

-- ============================================
-- ESTIMATES TABLE
-- ============================================

DROP POLICY IF EXISTS "Anon read estimates" ON estimates;

-- No anon access to estimates at all. Public estimate page
-- and accept/reject routes use the service role client.

-- ============================================
-- AI_OUTPUTS TABLE
-- ============================================

-- Keep: "Anon insert ai_outputs" (needed for AI analysis during funnel)
-- No changes needed here.
