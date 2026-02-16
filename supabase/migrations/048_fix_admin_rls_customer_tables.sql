-- ============================================
-- Fix: Add auth.users-based admin RLS policies
-- ============================================
-- Tables from migration 005 only check customers.role = 'admin',
-- which fails when admin users don't have a row in the customers table.
-- Add parallel policies using raw_user_meta_data->>'role' = 'admin'
-- (matching the pattern from migration 034 for jobs/invoices).
-- PostgreSQL RLS is permissive by default: if ANY policy grants access, access is granted.
-- So both the old customers-based and new auth.users-based policies will work.

-- financing_applications: admin access via auth.users metadata
CREATE POLICY "financing_applications_admin_meta"
  ON financing_applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- insurance_claims: admin access via auth.users metadata
CREATE POLICY "insurance_claims_admin_meta"
  ON insurance_claims FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- customers: admin read access via auth.users metadata
CREATE POLICY "customers_admin_meta_read"
  ON customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- customer_leads: admin access via auth.users metadata
CREATE POLICY "customer_leads_admin_meta"
  ON customer_leads FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- assistance_programs: admin access via auth.users metadata
CREATE POLICY "assistance_programs_admin_meta"
  ON assistance_programs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- customer_program_applications: admin access via auth.users metadata
CREATE POLICY "customer_program_applications_admin_meta"
  ON customer_program_applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- Fix: settings table admin policies (migration 010)
-- ============================================
-- Original policies check customers.id = auth.uid() which is wrong
-- (customers.id is a UUID PK, not the auth user ID).
-- Add correct policies using auth.users metadata.

CREATE POLICY "settings_admin_meta_select"
  ON settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "settings_admin_meta_update"
  ON settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "settings_admin_meta_insert"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
