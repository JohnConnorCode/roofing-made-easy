-- Migration 013: Schema Improvements for World-Class Quality
-- Addresses: RLS policy bug, enums, indexes, share_token expiration

-- ============================================================================
-- 1. CREATE ENUMS FOR STATUS FIELDS
-- ============================================================================

-- Payment status enum
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending',
    'processing',
    'succeeded',
    'failed',
    'refunded',
    'partially_refunded',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Estimate status enum (if not exists)
DO $$ BEGIN
  CREATE TYPE estimate_status AS ENUM (
    'draft',
    'sent',
    'viewed',
    'accepted',
    'declined',
    'expired',
    'superseded'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 2. ADD SHARE_TOKEN EXPIRATION
-- ============================================================================

-- Add expiration column to leads
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS share_token_expires_at TIMESTAMPTZ;

-- Set default expiration for existing share tokens (90 days from now)
UPDATE leads
SET share_token_expires_at = NOW() + INTERVAL '90 days'
WHERE share_token IS NOT NULL AND share_token_expires_at IS NULL;

-- Add index for expiration lookups
CREATE INDEX IF NOT EXISTS idx_leads_share_token_expires
  ON leads(share_token, share_token_expires_at)
  WHERE share_token IS NOT NULL;

-- Function to check if share token is valid
CREATE OR REPLACE FUNCTION is_share_token_valid(token UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM leads
    WHERE share_token = token
    AND (share_token_expires_at IS NULL OR share_token_expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. FIX PAYMENTS RLS POLICY FOR CUSTOMERS
-- ============================================================================

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Customers can read own payments" ON payments;

-- Recreate with correct customer lookup
CREATE POLICY "Customers can read own payments" ON payments
  FOR SELECT
  USING (
    -- Customers can read payments for their leads
    EXISTS (
      SELECT 1 FROM customer_leads cl
      JOIN customers c ON c.id = cl.customer_id
      WHERE cl.lead_id = payments.lead_id
      AND c.auth_user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. ADD MISSING INDEXES
-- ============================================================================

-- Index for finding active (non-superseded) estimates
CREATE INDEX IF NOT EXISTS idx_estimates_active
  ON estimates(lead_id, is_superseded)
  WHERE is_superseded = false;

-- Index for contact submission conversions
CREATE INDEX IF NOT EXISTS idx_contact_submissions_lead
  ON contact_submissions(converted_to_lead_id)
  WHERE converted_to_lead_id IS NOT NULL;

-- Index for measurement source queries
CREATE INDEX IF NOT EXISTS idx_roof_sketches_source
  ON roof_sketches(measurement_source);

-- Index for payments by type
CREATE INDEX IF NOT EXISTS idx_payments_type
  ON payments(type);

-- ============================================================================
-- 5. ADD MISSING TRIGGERS FOR updated_at
-- ============================================================================

-- Trigger for contacts table
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for properties table
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. ADD SOFT DELETE FOR PAYMENTS (FINANCIAL RECORDS)
-- ============================================================================

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Index for active payments
CREATE INDEX IF NOT EXISTS idx_payments_active
  ON payments(lead_id, is_deleted)
  WHERE is_deleted = false;

-- ============================================================================
-- 7. ADD CONSTRAINTS FOR DATA INTEGRITY
-- ============================================================================

-- Ensure payment amounts are positive (except refunds which can be negative)
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_amount_check;
ALTER TABLE payments ADD CONSTRAINT payments_amount_check
  CHECK (
    (type = 'refund' AND amount <= 0) OR
    (type != 'refund' AND amount > 0)
  );

-- Ensure valid_until dates are in the future when set
ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_valid_until_check;
ALTER TABLE estimates ADD CONSTRAINT estimates_valid_until_check
  CHECK (valid_until IS NULL OR valid_until > created_at);

-- ============================================================================
-- 8. ADD AUDIT FIELDS TO CRITICAL TABLES
-- ============================================================================

-- Add IP tracking to payments for fraud prevention
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- ============================================================================
-- 9. CREATE VIEW FOR ACTIVE ESTIMATES (convenience)
-- ============================================================================

CREATE OR REPLACE VIEW active_estimates AS
SELECT e.*, l.share_token, l.share_token_expires_at
FROM estimates e
JOIN leads l ON l.id = e.lead_id
WHERE e.is_superseded = false
AND (e.valid_until IS NULL OR e.valid_until > NOW());

-- Grant access to the view
GRANT SELECT ON active_estimates TO authenticated;
GRANT SELECT ON active_estimates TO anon;

-- ============================================================================
-- 10. DOCUMENTATION COMMENTS
-- ============================================================================

COMMENT ON COLUMN leads.share_token IS 'UUID token for public estimate sharing without authentication';
COMMENT ON COLUMN leads.share_token_expires_at IS 'Expiration timestamp for share token (NULL = never expires)';
COMMENT ON COLUMN payments.is_deleted IS 'Soft delete flag - financial records should never be hard deleted';
COMMENT ON COLUMN payments.ip_address IS 'IP address of payment initiator for fraud prevention';
COMMENT ON FUNCTION is_share_token_valid IS 'Check if a share token is valid (exists and not expired)';
COMMENT ON VIEW active_estimates IS 'Convenience view for non-superseded, non-expired estimates with share info';
