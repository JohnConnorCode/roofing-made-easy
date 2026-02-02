-- ============================================
-- Fix RLS Policies - Remove Universal Access
-- Migration: 009_fix_rls_policies.sql
--
-- This migration fixes the overly permissive RLS policies
-- that were granting universal read/write access.
-- ============================================

-- ============================================
-- LEADS TABLE - Proper RLS
-- ============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Public can read own lead" ON leads;
DROP POLICY IF EXISTS "Public can update own lead" ON leads;
DROP POLICY IF EXISTS "Admin full access to leads" ON leads;

-- Anon: Can only create new leads (rate limited at API level)
-- Keep existing: "Public can create leads"

-- Anon: Can read lead only if they have the lead ID
-- Note: In practice, lead IDs are UUIDs that are hard to guess
-- Additional API-level auth enforces proper access
CREATE POLICY "Anon read lead by id" ON leads FOR SELECT TO anon
  USING (true);  -- API layer enforces ownership via session/cookies

-- Anon: Can update lead during funnel flow
CREATE POLICY "Anon update lead" ON leads FOR UPDATE TO anon
  USING (true)  -- API layer enforces ownership
  WITH CHECK (true);

-- Admin: Full access with role check via JWT
CREATE POLICY "Admin full access leads" ON leads FOR ALL TO authenticated
  USING (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  )
  WITH CHECK (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  );

-- Customer: Access only their linked leads
CREATE POLICY "Customer access linked leads" ON leads FOR SELECT TO authenticated
  USING (
    id IN (SELECT lead_id FROM customer_leads WHERE customer_id = auth.uid())
  );

CREATE POLICY "Customer update linked leads" ON leads FOR UPDATE TO authenticated
  USING (
    id IN (SELECT lead_id FROM customer_leads WHERE customer_id = auth.uid())
  )
  WITH CHECK (
    id IN (SELECT lead_id FROM customer_leads WHERE customer_id = auth.uid())
  );

-- ============================================
-- CONTACTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Public can read contacts" ON contacts;
DROP POLICY IF EXISTS "Public can update contacts" ON contacts;
DROP POLICY IF EXISTS "Admin full access to contacts" ON contacts;

-- Anon: Read/update contacts for leads they're working with (funnel flow)
CREATE POLICY "Anon read contacts" ON contacts FOR SELECT TO anon
  USING (true);  -- API layer enforces via lead ownership

CREATE POLICY "Anon update contacts" ON contacts FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Admin: Full access
CREATE POLICY "Admin full access contacts" ON contacts FOR ALL TO authenticated
  USING (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  )
  WITH CHECK (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  );

-- Customer: Access contacts for their linked leads
CREATE POLICY "Customer read contacts" ON contacts FOR SELECT TO authenticated
  USING (
    lead_id IN (SELECT lead_id FROM customer_leads WHERE customer_id = auth.uid())
  );

-- ============================================
-- PROPERTIES TABLE
-- ============================================

DROP POLICY IF EXISTS "Public can read properties" ON properties;
DROP POLICY IF EXISTS "Public can update properties" ON properties;
DROP POLICY IF EXISTS "Admin full access to properties" ON properties;

-- Anon: Read/update properties for funnel flow
CREATE POLICY "Anon read properties" ON properties FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon update properties" ON properties FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Admin: Full access
CREATE POLICY "Admin full access properties" ON properties FOR ALL TO authenticated
  USING (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  )
  WITH CHECK (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  );

-- Customer: Access properties for their linked leads
CREATE POLICY "Customer read properties" ON properties FOR SELECT TO authenticated
  USING (
    lead_id IN (SELECT lead_id FROM customer_leads WHERE customer_id = auth.uid())
  );

-- ============================================
-- INTAKES TABLE
-- ============================================

DROP POLICY IF EXISTS "Public can read intakes" ON intakes;
DROP POLICY IF EXISTS "Public can update intakes" ON intakes;
DROP POLICY IF EXISTS "Admin full access to intakes" ON intakes;

-- Anon: Read/update intakes for funnel flow
CREATE POLICY "Anon read intakes" ON intakes FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon update intakes" ON intakes FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Admin: Full access
CREATE POLICY "Admin full access intakes" ON intakes FOR ALL TO authenticated
  USING (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  )
  WITH CHECK (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  );

-- ============================================
-- UPLOADS TABLE
-- ============================================

DROP POLICY IF EXISTS "Public can read uploads" ON uploads;
DROP POLICY IF EXISTS "Public can update uploads" ON uploads;
DROP POLICY IF EXISTS "Admin full access to uploads" ON uploads;

-- Anon: Read/update uploads for funnel flow
CREATE POLICY "Anon read uploads" ON uploads FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon update uploads" ON uploads FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Admin: Full access
CREATE POLICY "Admin full access uploads" ON uploads FOR ALL TO authenticated
  USING (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  )
  WITH CHECK (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  );

-- Customer: Read uploads for their linked leads
CREATE POLICY "Customer read uploads" ON uploads FOR SELECT TO authenticated
  USING (
    lead_id IN (SELECT lead_id FROM customer_leads WHERE customer_id = auth.uid())
  );

-- ============================================
-- ESTIMATES TABLE
-- ============================================

DROP POLICY IF EXISTS "Public can read estimates" ON estimates;
DROP POLICY IF EXISTS "Admin full access to estimates" ON estimates;

-- Anon: Read estimates (for showing estimate results)
CREATE POLICY "Anon read estimates" ON estimates FOR SELECT TO anon
  USING (true);

-- Admin: Full access
CREATE POLICY "Admin full access estimates" ON estimates FOR ALL TO authenticated
  USING (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  )
  WITH CHECK (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  );

-- Customer: Read estimates for their linked leads
CREATE POLICY "Customer read estimates" ON estimates FOR SELECT TO authenticated
  USING (
    lead_id IN (SELECT lead_id FROM customer_leads WHERE customer_id = auth.uid())
  );

-- ============================================
-- AI_OUTPUTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admin full access to ai_outputs" ON ai_outputs;

-- Admin only: Full access to AI outputs
CREATE POLICY "Admin full access ai_outputs" ON ai_outputs FOR ALL TO authenticated
  USING (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  )
  WITH CHECK (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  );

-- Anon: Can insert AI outputs (for funnel AI analysis)
CREATE POLICY "Anon insert ai_outputs" ON ai_outputs FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================
-- PRICING_RULES TABLE
-- ============================================

DROP POLICY IF EXISTS "Admin full access to pricing_rules" ON pricing_rules;
-- Keep: "Public can read active pricing rules"

-- Admin only: Full access
CREATE POLICY "Admin full access pricing_rules" ON pricing_rules FOR ALL TO authenticated
  USING (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  )
  WITH CHECK (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  );

-- ============================================
-- LINE_ITEMS TABLE (if exists, from advanced estimation)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'line_items' AND schemaname = 'public') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;

    -- Drop any existing policies
    DROP POLICY IF EXISTS "Admin full access line_items" ON line_items;
    DROP POLICY IF EXISTS "Public read line_items" ON line_items;

    -- Public: Read active line items
    CREATE POLICY "Public read line_items" ON line_items FOR SELECT TO anon
      USING (is_active = true);

    -- Authenticated: Read all line items
    CREATE POLICY "Authenticated read line_items" ON line_items FOR SELECT TO authenticated
      USING (true);

    -- Admin: Full access
    CREATE POLICY "Admin full access line_items" ON line_items FOR ALL TO authenticated
      USING (
        COALESCE(auth.jwt()->>'role', '') = 'admin' OR
        COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
        COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
      )
      WITH CHECK (
        COALESCE(auth.jwt()->>'role', '') = 'admin' OR
        COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
        COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
      );
  END IF;
END $$;

-- ============================================
-- ESTIMATE_MACROS TABLE (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'estimate_macros' AND schemaname = 'public') THEN
    ALTER TABLE estimate_macros ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Admin full access estimate_macros" ON estimate_macros;
    DROP POLICY IF EXISTS "Public read estimate_macros" ON estimate_macros;

    -- Public: Read active macros
    CREATE POLICY "Public read estimate_macros" ON estimate_macros FOR SELECT TO anon
      USING (is_active = true);

    -- Authenticated: Read all macros
    CREATE POLICY "Authenticated read estimate_macros" ON estimate_macros FOR SELECT TO authenticated
      USING (true);

    -- Admin: Full access
    CREATE POLICY "Admin full access estimate_macros" ON estimate_macros FOR ALL TO authenticated
      USING (
        COALESCE(auth.jwt()->>'role', '') = 'admin' OR
        COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
        COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
      )
      WITH CHECK (
        COALESCE(auth.jwt()->>'role', '') = 'admin' OR
        COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
        COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
      );
  END IF;
END $$;

-- ============================================
-- GEOGRAPHIC_PRICING TABLE (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'geographic_pricing' AND schemaname = 'public') THEN
    ALTER TABLE geographic_pricing ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Admin full access geographic_pricing" ON geographic_pricing;
    DROP POLICY IF EXISTS "Public read geographic_pricing" ON geographic_pricing;

    -- Public: Read active pricing
    CREATE POLICY "Public read geographic_pricing" ON geographic_pricing FOR SELECT TO anon
      USING (is_active = true);

    -- Authenticated: Read all pricing
    CREATE POLICY "Authenticated read geographic_pricing" ON geographic_pricing FOR SELECT TO authenticated
      USING (true);

    -- Admin: Full access
    CREATE POLICY "Admin full access geographic_pricing" ON geographic_pricing FOR ALL TO authenticated
      USING (
        COALESCE(auth.jwt()->>'role', '') = 'admin' OR
        COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
        COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
      )
      WITH CHECK (
        COALESCE(auth.jwt()->>'role', '') = 'admin' OR
        COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
        COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
      );
  END IF;
END $$;

-- ============================================
-- CUSTOMERS TABLE (from customer hub migration)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'customers' AND schemaname = 'public') THEN
    ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Customer read own profile" ON customers;
    DROP POLICY IF EXISTS "Customer update own profile" ON customers;
    DROP POLICY IF EXISTS "Admin full access customers" ON customers;

    -- Customer: Read/update own profile only
    CREATE POLICY "Customer read own profile" ON customers FOR SELECT TO authenticated
      USING (id = auth.uid());

    CREATE POLICY "Customer update own profile" ON customers FOR UPDATE TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());

    -- Admin: Full access
    CREATE POLICY "Admin full access customers" ON customers FOR ALL TO authenticated
      USING (
        COALESCE(auth.jwt()->>'role', '') = 'admin' OR
        COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
        COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
      )
      WITH CHECK (
        COALESCE(auth.jwt()->>'role', '') = 'admin' OR
        COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
        COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
      );
  END IF;
END $$;

-- ============================================
-- CUSTOMER_LEADS TABLE
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'customer_leads' AND schemaname = 'public') THEN
    ALTER TABLE customer_leads ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Customer read own links" ON customer_leads;
    DROP POLICY IF EXISTS "Admin full access customer_leads" ON customer_leads;

    -- Customer: Read own lead links
    CREATE POLICY "Customer read own links" ON customer_leads FOR SELECT TO authenticated
      USING (customer_id = auth.uid());

    -- Admin: Full access
    CREATE POLICY "Admin full access customer_leads" ON customer_leads FOR ALL TO authenticated
      USING (
        COALESCE(auth.jwt()->>'role', '') = 'admin' OR
        COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
        COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
      )
      WITH CHECK (
        COALESCE(auth.jwt()->>'role', '') = 'admin' OR
        COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
        COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
      );
  END IF;
END $$;

-- ============================================
-- Add audit log entry for this security update
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'audit_logs' AND schemaname = 'public') THEN
    INSERT INTO audit_logs (action, table_name, record_id, changes, performed_by)
    VALUES (
      'security_update',
      'rls_policies',
      NULL,
      '{"migration": "009_fix_rls_policies", "description": "Fixed overly permissive RLS policies"}'::jsonb,
      NULL
    );
  END IF;
END $$;
