-- ============================================
-- Fix Customer RLS Policies - Wrong Column
-- Migration: 044_fix_customer_rls_column.sql
--
-- The customers table RLS policies used `id = auth.uid()` which is wrong.
-- The `id` column is the table's own primary key (auto-generated UUID).
-- The correct column is `auth_user_id` which links to the auth user.
--
-- Similarly, customer_leads used `customer_id = auth.uid()` which is wrong
-- because customer_id references customers.id, not auth.uid().
-- ============================================

-- ============================================
-- CUSTOMERS TABLE - Fix column reference
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'customers' AND schemaname = 'public') THEN
    -- Drop the broken policies
    DROP POLICY IF EXISTS "Customer read own profile" ON customers;
    DROP POLICY IF EXISTS "Customer update own profile" ON customers;

    -- Recreate with correct column: auth_user_id = auth.uid()
    CREATE POLICY "Customer read own profile" ON customers FOR SELECT TO authenticated
      USING (auth_user_id = auth.uid());

    CREATE POLICY "Customer update own profile" ON customers FOR UPDATE TO authenticated
      USING (auth_user_id = auth.uid())
      WITH CHECK (auth_user_id = auth.uid());
  END IF;
END $$;

-- ============================================
-- CUSTOMER_LEADS TABLE - Fix column reference
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'customer_leads' AND schemaname = 'public') THEN
    -- Drop the broken policy
    DROP POLICY IF EXISTS "Customer read own links" ON customer_leads;

    -- Recreate: customer_id must match the customer record linked to auth.uid()
    CREATE POLICY "Customer read own links" ON customer_leads FOR SELECT TO authenticated
      USING (
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
      );
  END IF;
END $$;
