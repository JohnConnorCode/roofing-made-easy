-- ============================================
-- Phase: Communications Content Management
-- Estimate/quote content (warranties, scope, terms) + SMS templates
-- ============================================

-- ============================================
-- Table: estimate_content
-- Estimate/Quote Content (warranties, scope, terms)
-- ============================================
CREATE TABLE estimate_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  default_content TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('warranty', 'scope', 'terms', 'payment_terms')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_estimate_content_updated_at
  BEFORE UPDATE ON estimate_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_estimate_content_type ON estimate_content(content_type);
CREATE INDEX idx_estimate_content_active ON estimate_content(is_active) WHERE is_active = true;
CREATE INDEX idx_estimate_content_order ON estimate_content(content_type, display_order);

-- ============================================
-- RLS Policies for estimate_content
-- ============================================
ALTER TABLE estimate_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage estimate_content"
  ON estimate_content FOR ALL
  TO authenticated
  USING ((SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'));

CREATE POLICY "Public can read active estimate_content"
  ON estimate_content FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can read active estimate_content"
  ON estimate_content FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Service role full access
CREATE POLICY "Service role full access to estimate_content"
  ON estimate_content FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- Seed estimate content
-- ============================================
INSERT INTO estimate_content (slug, title, content, default_content, content_type, display_order) VALUES
  ('warranty-workmanship', 'Workmanship Warranty',
   'We stand behind our work with a 10-year workmanship warranty covering all labor and installation.',
   'We stand behind our work with a 10-year workmanship warranty covering all labor and installation.',
   'warranty', 1),
  ('warranty-materials', 'Materials Warranty',
   'All materials come with manufacturer warranties. Shingles typically carry 25-50 year coverage.',
   'All materials come with manufacturer warranties. Shingles typically carry 25-50 year coverage.',
   'warranty', 2),
  ('scope-removal', 'Removal & Disposal',
   'Complete removal of existing roofing materials down to the deck. All debris hauled away and disposed of properly.',
   'Complete removal of existing roofing materials down to the deck. All debris hauled away and disposed of properly.',
   'scope', 1),
  ('scope-installation', 'Installation',
   'Installation of new roofing system including underlayment, flashing, drip edge, and ridge vents per manufacturer specifications.',
   'Installation of new roofing system including underlayment, flashing, drip edge, and ridge vents per manufacturer specifications.',
   'scope', 2),
  ('scope-cleanup', 'Cleanup',
   'Daily cleanup during project. Final magnetic sweep of property to collect any stray nails or debris.',
   'Daily cleanup during project. Final magnetic sweep of property to collect any stray nails or debris.',
   'scope', 3),
  ('terms-general', 'General Terms',
   'Estimate valid for 30 days. Prices subject to change based on material costs and unforeseen conditions.',
   'Estimate valid for 30 days. Prices subject to change based on material costs and unforeseen conditions.',
   'terms', 1),
  ('terms-payment', 'Payment Terms',
   '50% deposit required to schedule work. Balance due upon completion. We accept all major credit cards.',
   '50% deposit required to schedule work. Balance due upon completion. We accept all major credit cards.',
   'payment_terms', 1);

-- ============================================
-- Add SMS templates to message_templates
-- ============================================
INSERT INTO message_templates (name, slug, type, category, subject, body, default_subject, default_body, is_system, is_active, variables)
VALUES
  ('Quote Ready SMS', 'sms-quote-ready', 'sms', 'quote', NULL,
   'Hi {{customer_name}}! Your roofing estimate is ready. View it here: {{quote_url}} - {{company_name}}',
   NULL,
   'Hi {{customer_name}}! Your roofing estimate is ready. View it here: {{quote_url}} - {{company_name}}',
   true, true, ARRAY['customer_name', 'quote_url', 'company_name']),
  ('Appointment Reminder SMS', 'sms-appointment-reminder', 'sms', 'appointment', NULL,
   'Reminder: Your appointment with {{company_name}} is tomorrow at {{appointment_time}}. Reply STOP to unsubscribe.',
   NULL,
   'Reminder: Your appointment with {{company_name}} is tomorrow at {{appointment_time}}. Reply STOP to unsubscribe.',
   true, true, ARRAY['company_name', 'appointment_time']),
  ('Invoice Sent SMS', 'sms-invoice-sent', 'sms', 'invoice', NULL,
   'Hi {{customer_name}}, your invoice for ${{amount}} is ready. Pay online: {{invoice_url}} - {{company_name}}',
   NULL,
   'Hi {{customer_name}}, your invoice for ${{amount}} is ready. Pay online: {{invoice_url}} - {{company_name}}',
   true, true, ARRAY['customer_name', 'amount', 'invoice_url', 'company_name']),
  ('Payment Received SMS', 'sms-payment-received', 'sms', 'payment', NULL,
   'Thanks {{customer_name}}! We received your payment of ${{amount}}. Questions? Call {{company_phone}} - {{company_name}}',
   NULL,
   'Thanks {{customer_name}}! We received your payment of ${{amount}}. Questions? Call {{company_phone}} - {{company_name}}',
   true, true, ARRAY['customer_name', 'amount', 'company_phone', 'company_name']),
  ('Job Started SMS', 'sms-job-started', 'sms', 'notification', NULL,
   'Hi {{customer_name}}! Our crew is on-site and starting your roofing project today. Call {{company_phone}} with questions. - {{company_name}}',
   NULL,
   'Hi {{customer_name}}! Our crew is on-site and starting your roofing project today. Call {{company_phone}} with questions. - {{company_name}}',
   true, true, ARRAY['customer_name', 'company_phone', 'company_name']),
  ('Job Complete SMS', 'sms-job-complete', 'sms', 'notification', NULL,
   'Great news {{customer_name}}! Your roofing project is complete. Please inspect and let us know if you have questions. - {{company_name}}',
   NULL,
   'Great news {{customer_name}}! Your roofing project is complete. Please inspect and let us know if you have questions. - {{company_name}}',
   true, true, ARRAY['customer_name', 'company_name'])
ON CONFLICT (slug) DO UPDATE SET
  body = EXCLUDED.body,
  default_body = EXCLUDED.default_body,
  variables = EXCLUDED.variables,
  is_active = true,
  updated_at = NOW();

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE estimate_content IS 'Admin-editable content for estimates/quotes including warranties, scope of work, and payment terms.';
COMMENT ON COLUMN estimate_content.slug IS 'Unique identifier for programmatic access';
COMMENT ON COLUMN estimate_content.content_type IS 'Content category: warranty, scope, terms, or payment_terms';
COMMENT ON COLUMN estimate_content.default_content IS 'Original content for reset functionality';
COMMENT ON COLUMN estimate_content.display_order IS 'Sort order within content type';
