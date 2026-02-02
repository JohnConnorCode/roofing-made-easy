-- ============================================
-- Table: settings
-- Business configuration stored in database
-- Uses a single-row pattern with id=1
-- ============================================
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- Single row enforcement

  -- Company info
  company_name VARCHAR(255) NOT NULL DEFAULT 'Farrell Roofing',
  company_legal_name VARCHAR(255),
  company_tagline VARCHAR(500),
  company_phone VARCHAR(50),
  company_email VARCHAR(255),
  company_website VARCHAR(500),

  -- Address
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(50),
  address_zip VARCHAR(20),

  -- Business hours (stored as HH:MM format)
  hours_weekdays_open VARCHAR(10),
  hours_weekdays_close VARCHAR(10),
  hours_saturday_open VARCHAR(10),
  hours_saturday_close VARCHAR(10),
  hours_sunday_open VARCHAR(10),
  hours_sunday_close VARCHAR(10),
  hours_emergency_available BOOLEAN DEFAULT TRUE,

  -- Pricing defaults
  pricing_overhead_percent DECIMAL(5, 2) DEFAULT 15.00,
  pricing_profit_margin_percent DECIMAL(5, 2) DEFAULT 20.00,
  pricing_tax_rate DECIMAL(5, 2) DEFAULT 7.00,

  -- Notification settings
  notifications_new_lead_email BOOLEAN DEFAULT TRUE,
  notifications_estimate_email BOOLEAN DEFAULT TRUE,
  notifications_daily_digest BOOLEAN DEFAULT FALSE,
  notifications_email_recipients JSONB DEFAULT '[]'::JSONB,

  -- Lead sources config
  lead_sources JSONB DEFAULT '[
    {"id": "web_funnel", "name": "Web Funnel", "enabled": true},
    {"id": "google", "name": "Google Ads", "enabled": true},
    {"id": "facebook", "name": "Facebook", "enabled": true},
    {"id": "referral", "name": "Referral", "enabled": true},
    {"id": "phone", "name": "Phone Call", "enabled": true},
    {"id": "walk_in", "name": "Walk In", "enabled": false}
  ]'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Apply updated_at trigger
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default row
INSERT INTO settings (
  id,
  company_name,
  company_legal_name,
  company_tagline,
  company_phone,
  company_email,
  address_street,
  address_city,
  address_state,
  address_zip,
  hours_weekdays_open,
  hours_weekdays_close,
  hours_saturday_open,
  hours_saturday_close,
  hours_emergency_available
) VALUES (
  1,
  'Farrell Roofing',
  'Farrell Roofing LLC',
  'Northeast Mississippi''s Trusted Roofing Experts',
  '(662) 555-0123',
  'info@farrellroofing.com',
  '123 Main Street',
  'Tupelo',
  'MS',
  '38801',
  '07:00',
  '18:00',
  '08:00',
  '14:00',
  TRUE
);

-- RLS policy for settings (admin only)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY settings_admin_select ON settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = auth.uid()
      AND customers.role = 'admin'
    )
  );

CREATE POLICY settings_admin_update ON settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = auth.uid()
      AND customers.role = 'admin'
    )
  );
