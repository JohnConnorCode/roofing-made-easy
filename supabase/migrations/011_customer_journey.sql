-- Customer Journey Enhancement Migration
-- Adds persistent estimate links, contact form submissions, and quote acceptance

-- =============================================================================
-- PERSISTENT ESTIMATE LINKS
-- =============================================================================

-- Add share_token to leads for persistent estimate links (no auth required)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS share_token UUID UNIQUE DEFAULT gen_random_uuid();

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_leads_share_token ON leads(share_token);

-- Backfill existing leads with tokens
UPDATE leads SET share_token = gen_random_uuid() WHERE share_token IS NULL;

-- =============================================================================
-- CONTACT FORM SUBMISSIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact info
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  -- Message details
  subject VARCHAR(500),
  message TEXT NOT NULL,

  -- Tracking
  source VARCHAR(100) DEFAULT 'contact_page',
  ip_address INET,
  user_agent TEXT,

  -- Processing
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES auth.users(id),

  -- Follow-up
  is_responded BOOLEAN NOT NULL DEFAULT false,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),
  response_notes TEXT,

  -- Link to lead if converted
  converted_to_lead_id UUID REFERENCES leads(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for contact submissions
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_contact_submissions_unread ON contact_submissions(is_read) WHERE is_read = false;

-- RLS for contact submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write contact submissions
CREATE POLICY "contact_submissions_admin" ON contact_submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Allow anonymous insert (for the public contact form)
CREATE POLICY "contact_submissions_insert" ON contact_submissions FOR INSERT WITH CHECK (true);

-- =============================================================================
-- QUOTE ACCEPTANCE
-- =============================================================================

-- Add signature and acceptance fields to detailed_estimates
ALTER TABLE detailed_estimates
  ADD COLUMN IF NOT EXISTS acceptance_signature TEXT,
  ADD COLUMN IF NOT EXISTS accepted_by_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS accepted_by_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS accepted_by_ip INET,
  ADD COLUMN IF NOT EXISTS accepted_terms_version VARCHAR(50);

-- =============================================================================
-- PAYMENTS TABLE (for future Stripe integration)
-- =============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  estimate_id UUID REFERENCES detailed_estimates(id) ON DELETE SET NULL,

  -- Stripe integration
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),

  -- Payment details
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  type VARCHAR(50) NOT NULL DEFAULT 'deposit',  -- deposit, progress, final, refund

  -- Metadata
  description TEXT,
  receipt_url TEXT,
  failure_reason TEXT,

  -- Payer info
  payer_email VARCHAR(255),
  payer_name VARCHAR(255),

  -- Timestamps
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for payments
CREATE INDEX idx_payments_lead ON payments(lead_id);
CREATE INDEX idx_payments_estimate ON payments(estimate_id);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Admins can read/write all payments
CREATE POLICY "payments_admin" ON payments FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Customers can read their own payments (via customer_leads)
CREATE POLICY "payments_customer_read" ON payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM customer_leads cl
    WHERE cl.lead_id = payments.lead_id AND cl.customer_id = auth.uid()
  )
);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Updated_at trigger for contact_submissions
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Updated_at trigger for payments
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON COLUMN leads.share_token IS 'UUID token for persistent, shareable estimate links (no auth required)';
COMMENT ON TABLE contact_submissions IS 'Public contact form submissions from the website';
COMMENT ON TABLE payments IS 'Payment records linked to leads and estimates, integrated with Stripe';
