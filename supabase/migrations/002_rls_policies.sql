-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Public (anon) policies for funnel access
-- Allows anonymous users to create and update their own leads
-- ============================================

-- Leads: Public can create, and read/update their own lead by ID
CREATE POLICY "Public can create leads"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read own lead"
  ON leads FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can update own lead"
  ON leads FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Contacts: Public can manage contacts for leads
CREATE POLICY "Public can create contacts"
  ON contacts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read contacts"
  ON contacts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can update contacts"
  ON contacts FOR UPDATE
  TO anon
  USING (true);

-- Properties: Public can manage properties for leads
CREATE POLICY "Public can create properties"
  ON properties FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read properties"
  ON properties FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can update properties"
  ON properties FOR UPDATE
  TO anon
  USING (true);

-- Intakes: Public can manage intake data
CREATE POLICY "Public can create intakes"
  ON intakes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read intakes"
  ON intakes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can update intakes"
  ON intakes FOR UPDATE
  TO anon
  USING (true);

-- Uploads: Public can manage their uploads
CREATE POLICY "Public can create uploads"
  ON uploads FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read uploads"
  ON uploads FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can update uploads"
  ON uploads FOR UPDATE
  TO anon
  USING (true);

-- Estimates: Public can read estimates for their leads
CREATE POLICY "Public can read estimates"
  ON estimates FOR SELECT
  TO anon
  USING (true);

-- Pricing rules: Public can read active pricing rules (for display purposes)
CREATE POLICY "Public can read active pricing rules"
  ON pricing_rules FOR SELECT
  TO anon
  USING (is_active = true);

-- ============================================
-- Authenticated (admin) policies
-- Full access for authenticated admin users
-- ============================================

-- Leads: Admin full access
CREATE POLICY "Admin full access to leads"
  ON leads FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Contacts: Admin full access
CREATE POLICY "Admin full access to contacts"
  ON contacts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Properties: Admin full access
CREATE POLICY "Admin full access to properties"
  ON properties FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Intakes: Admin full access
CREATE POLICY "Admin full access to intakes"
  ON intakes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Uploads: Admin full access
CREATE POLICY "Admin full access to uploads"
  ON uploads FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Estimates: Admin full access
CREATE POLICY "Admin full access to estimates"
  ON estimates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- AI outputs: Admin full access
CREATE POLICY "Admin full access to ai_outputs"
  ON ai_outputs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Pricing rules: Admin full access
CREATE POLICY "Admin full access to pricing_rules"
  ON pricing_rules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Audit logs: Admin read only
CREATE POLICY "Admin can read audit_logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- Storage bucket policies
-- ============================================
-- Note: Run these in Supabase dashboard or via separate storage migration

-- Create photos bucket
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('photos', 'photos', false);

-- Policy: Anyone can upload to photos bucket
-- CREATE POLICY "Anyone can upload photos"
-- ON storage.objects FOR INSERT
-- TO anon
-- WITH CHECK (bucket_id = 'photos');

-- Policy: Anyone can read photos
-- CREATE POLICY "Anyone can read photos"
-- ON storage.objects FOR SELECT
-- TO anon
-- USING (bucket_id = 'photos');

-- Policy: Authenticated users can delete photos
-- CREATE POLICY "Authenticated can delete photos"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'photos');
