-- ============================================
-- Customer Qualification Hub Schema
-- Migration: 005_customer_hub.sql
-- ============================================

-- Add new enum types for customer hub
CREATE TYPE customer_role AS ENUM ('customer', 'admin');

CREATE TYPE financing_status AS ENUM (
  'interested',
  'contacted',
  'pre_qualified',
  'applied',
  'approved',
  'denied',
  'withdrawn'
);

CREATE TYPE credit_range AS ENUM (
  'excellent',    -- 750+
  'good',         -- 700-749
  'fair',         -- 650-699
  'poor',         -- 600-649
  'very_poor'     -- Below 600
);

CREATE TYPE income_range AS ENUM (
  'under_30k',
  '30k_50k',
  '50k_75k',
  '75k_100k',
  '100k_150k',
  'over_150k'
);

CREATE TYPE employment_status AS ENUM (
  'employed_full_time',
  'employed_part_time',
  'self_employed',
  'retired',
  'unemployed',
  'other'
);

CREATE TYPE insurance_claim_status AS ENUM (
  'not_started',
  'filed',
  'adjuster_scheduled',
  'adjuster_visited',
  'under_review',
  'approved',
  'denied',
  'appealing',
  'settled'
);

CREATE TYPE program_type AS ENUM (
  'federal',
  'state',
  'local',
  'utility',
  'nonprofit'
);

CREATE TYPE application_status AS ENUM (
  'researching',
  'eligible',
  'not_eligible',
  'applied',
  'approved',
  'denied'
);

-- ============================================
-- Table: customers
-- Customer accounts linked to Supabase Auth
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE NOT NULL,  -- References auth.users(id)
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role customer_role DEFAULT 'customer',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: customer_leads
-- Links customers to their assessment leads
-- One customer can have multiple properties
-- ============================================
CREATE TABLE customer_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,  -- Primary property for the customer
  nickname VARCHAR(100),  -- e.g., "Main House", "Rental Property"
  linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, lead_id)
);

-- ============================================
-- Table: financing_applications
-- Track pre-qualification and application status
-- ============================================
CREATE TABLE financing_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  -- Pre-qualification data
  amount_requested DECIMAL(12, 2) NOT NULL,
  credit_range credit_range NOT NULL,
  income_range income_range NOT NULL,
  employment_status employment_status NOT NULL,
  monthly_housing_payment DECIMAL(10, 2),
  co_applicant BOOLEAN DEFAULT FALSE,

  -- Status tracking
  status financing_status DEFAULT 'interested',
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Internal notes (admin only)
  admin_notes TEXT,
  assigned_to VARCHAR(255),  -- Team member handling this application

  -- Lender info (filled after team processes)
  lender_name VARCHAR(255),
  lender_contact VARCHAR(255),
  lender_notes TEXT,

  -- Results
  pre_approved_amount DECIMAL(12, 2),
  approved_rate DECIMAL(5, 3),  -- e.g., 5.99% = 5.990
  approved_term_months INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: insurance_claims
-- Track insurance claim progress with timeline
-- ============================================
CREATE TABLE insurance_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  -- Claim info (pre-filled from intake)
  insurance_company VARCHAR(255),
  policy_number VARCHAR(100),
  claim_number VARCHAR(100),
  date_of_loss DATE,
  cause_of_loss VARCHAR(255),  -- e.g., "Hail damage", "Wind damage", "Storm"

  -- Status tracking
  status insurance_claim_status DEFAULT 'not_started',
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timeline events stored as JSON array
  -- Each event: { date, status, notes, updated_by }
  timeline JSONB DEFAULT '[]'::JSONB,

  -- Adjuster info
  adjuster_name VARCHAR(255),
  adjuster_phone VARCHAR(20),
  adjuster_email VARCHAR(255),
  adjuster_visit_date TIMESTAMPTZ,

  -- Claim results
  claim_amount_approved DECIMAL(12, 2),
  deductible DECIMAL(10, 2),

  -- Documents (references to uploads)
  documents JSONB DEFAULT '[]'::JSONB,  -- Array of upload IDs

  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: assistance_programs
-- Catalog of federal/state/local/utility programs
-- ============================================
CREATE TABLE assistance_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Program identity
  name VARCHAR(255) NOT NULL,
  program_code VARCHAR(50),  -- e.g., "FEMA-IHP", "WAP", "FHA-TITLE-I"
  program_type program_type NOT NULL,

  -- Geographic scope
  state VARCHAR(2),  -- NULL = federal/nationwide
  counties JSONB DEFAULT '[]'::JSONB,  -- Empty = entire state
  zip_codes JSONB DEFAULT '[]'::JSONB,  -- Specific zip codes if applicable

  -- Program details
  description TEXT,
  benefits TEXT,
  max_benefit_amount DECIMAL(12, 2),

  -- Eligibility criteria (stored as JSON for flexibility)
  -- Example: { "income_max": 50000, "home_ownership": true, "property_types": ["single_family"] }
  eligibility_criteria JSONB DEFAULT '{}'::JSONB,

  -- Application info
  application_url TEXT,
  application_deadline DATE,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),

  -- Documents required
  required_documents JSONB DEFAULT '[]'::JSONB,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_verified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: customer_program_applications
-- Track customer applications to assistance programs
-- ============================================
CREATE TABLE customer_program_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES assistance_programs(id) ON DELETE CASCADE,

  -- Status
  status application_status DEFAULT 'researching',
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Application details
  application_date DATE,
  application_reference VARCHAR(100),

  -- Results
  approved_amount DECIMAL(12, 2),
  denial_reason TEXT,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, lead_id, program_id)
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_customers_auth_user_id ON customers(auth_user_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customer_leads_customer_id ON customer_leads(customer_id);
CREATE INDEX idx_customer_leads_lead_id ON customer_leads(lead_id);
CREATE INDEX idx_financing_applications_customer_id ON financing_applications(customer_id);
CREATE INDEX idx_financing_applications_lead_id ON financing_applications(lead_id);
CREATE INDEX idx_financing_applications_status ON financing_applications(status);
CREATE INDEX idx_insurance_claims_customer_id ON insurance_claims(customer_id);
CREATE INDEX idx_insurance_claims_lead_id ON insurance_claims(lead_id);
CREATE INDEX idx_insurance_claims_status ON insurance_claims(status);
CREATE INDEX idx_assistance_programs_type ON assistance_programs(program_type);
CREATE INDEX idx_assistance_programs_state ON assistance_programs(state);
CREATE INDEX idx_assistance_programs_active ON assistance_programs(is_active);
CREATE INDEX idx_customer_program_applications_customer_id ON customer_program_applications(customer_id);
CREATE INDEX idx_customer_program_applications_program_id ON customer_program_applications(program_id);

-- ============================================
-- Apply updated_at triggers
-- ============================================
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_leads_updated_at BEFORE UPDATE ON customer_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financing_applications_updated_at BEFORE UPDATE ON financing_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON insurance_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assistance_programs_updated_at BEFORE UPDATE ON assistance_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_program_applications_updated_at BEFORE UPDATE ON customer_program_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE financing_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_program_applications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Customer policies - customers can only access their own data
-- ============================================

-- Customers: Users can read and update their own customer record
CREATE POLICY "Customers can read own record"
  ON customers FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Customers can update own record"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Customer leads: Users can manage their own lead links
CREATE POLICY "Customers can read own lead links"
  ON customer_leads FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create own lead links"
  ON customer_leads FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own lead links"
  ON customer_leads FOR UPDATE
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

-- Financing applications: Users can manage their own applications
CREATE POLICY "Customers can read own financing applications"
  ON financing_applications FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create own financing applications"
  ON financing_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own financing applications"
  ON financing_applications FOR UPDATE
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

-- Insurance claims: Users can manage their own claims
CREATE POLICY "Customers can read own insurance claims"
  ON insurance_claims FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create own insurance claims"
  ON insurance_claims FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own insurance claims"
  ON insurance_claims FOR UPDATE
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

-- Assistance programs: Anyone authenticated can read active programs
CREATE POLICY "Anyone can read active assistance programs"
  ON assistance_programs FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Customer program applications: Users can manage their own applications
CREATE POLICY "Customers can read own program applications"
  ON customer_program_applications FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create own program applications"
  ON customer_program_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own program applications"
  ON customer_program_applications FOR UPDATE
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================
-- Admin policies - admins have full access
-- Note: In production, you'd check for admin role
-- For now, service role key provides admin access
-- ============================================

-- Service role has full access through Supabase's built-in bypass
-- These policies allow admin users (checked via customers.role = 'admin')

CREATE POLICY "Admins can read all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.auth_user_id = auth.uid()
      AND c.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all customer_leads"
  ON customer_leads FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.auth_user_id = auth.uid()
      AND c.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all financing_applications"
  ON financing_applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.auth_user_id = auth.uid()
      AND c.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all insurance_claims"
  ON insurance_claims FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.auth_user_id = auth.uid()
      AND c.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all assistance_programs"
  ON assistance_programs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.auth_user_id = auth.uid()
      AND c.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all customer_program_applications"
  ON customer_program_applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.auth_user_id = auth.uid()
      AND c.role = 'admin'
    )
  );

-- ============================================
-- Seed some initial assistance programs
-- ============================================
INSERT INTO assistance_programs (name, program_code, program_type, state, description, benefits, eligibility_criteria, application_url) VALUES

-- Federal Programs
('FEMA Individual Assistance', 'FEMA-IHP', 'federal', NULL,
 'Federal disaster assistance for homeowners and renters affected by declared disasters.',
 'Grants for home repair, replacement, and other disaster-related expenses. Maximum grant amount varies by disaster.',
 '{"disaster_declared": true, "primary_residence": true, "citizenship": ["us_citizen", "qualified_alien"]}'::JSONB,
 'https://www.disasterassistance.gov'),

('FHA Title I Home Improvement Loan', 'FHA-TITLE-I', 'federal', NULL,
 'Federally insured loans for home improvements including roofing.',
 'Loans up to $25,000 for single-family homes. Fixed interest rates. Terms up to 20 years.',
 '{"home_ownership": true, "property_types": ["single_family", "manufactured"]}'::JSONB,
 'https://www.hud.gov/program_offices/housing/sfh/title'),

('Weatherization Assistance Program', 'WAP', 'federal', NULL,
 'Reduces energy costs for low-income households by improving home energy efficiency.',
 'Free home energy improvements including roof repairs if related to energy efficiency. Average benefit ~$7,500.',
 '{"income_max_percent_poverty": 200, "priority": ["elderly", "disabled", "families_with_children"]}'::JSONB,
 'https://www.energy.gov/eere/wap/weatherization-assistance-program'),

-- Example State Programs (Texas)
('Texas Department of Housing - HOME Program', 'TX-HOME', 'state', 'TX',
 'State-funded assistance for low-income homeowners needing critical repairs.',
 'Grants up to $30,000 for critical home repairs including roofing.',
 '{"income_max_percent_ami": 80, "home_ownership": true, "primary_residence": true}'::JSONB,
 'https://www.tdhca.state.tx.us/home'),

-- Example Utility Programs
('Energy Efficiency Rebate Program', 'UTIL-EER', 'utility', NULL,
 'Utility rebates for energy-efficient roof installations and improvements.',
 'Rebates for cool roofs, reflective materials, and insulation. Amount varies by utility.',
 '{"roof_type": ["cool_roof", "reflective"], "utility_customer": true}'::JSONB,
 NULL);
