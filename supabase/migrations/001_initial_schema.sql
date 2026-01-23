-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE lead_status AS ENUM (
  'new',
  'intake_started',
  'intake_complete',
  'estimate_generated',
  'consultation_scheduled',
  'quote_sent',
  'won',
  'lost',
  'archived'
);

CREATE TYPE job_type AS ENUM (
  'full_replacement',
  'repair',
  'inspection',
  'maintenance',
  'gutter',
  'other'
);

CREATE TYPE roof_material AS ENUM (
  'asphalt_shingle',
  'metal',
  'tile',
  'slate',
  'wood_shake',
  'flat_membrane',
  'unknown'
);

CREATE TYPE roof_pitch AS ENUM (
  'flat',
  'low',
  'medium',
  'steep',
  'very_steep',
  'unknown'
);

CREATE TYPE timeline_urgency AS ENUM (
  'emergency',
  'asap',
  'within_month',
  'within_3_months',
  'flexible',
  'just_exploring'
);

CREATE TYPE upload_status AS ENUM (
  'pending',
  'uploaded',
  'analyzed',
  'failed'
);

CREATE TYPE ai_provider AS ENUM (
  'openai',
  'anthropic',
  'fallback'
);

-- ============================================
-- Table: leads
-- Central lead record with status tracking
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status lead_status NOT NULL DEFAULT 'new',
  source VARCHAR(100) DEFAULT 'web_funnel',
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  referrer_url TEXT,
  current_step INTEGER DEFAULT 1,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- Table: contacts
-- Contact information for leads
-- ============================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  preferred_contact_method VARCHAR(20) DEFAULT 'phone',
  consent_marketing BOOLEAN DEFAULT FALSE,
  consent_sms BOOLEAN DEFAULT FALSE,
  consent_terms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lead_id)
);

-- ============================================
-- Table: properties
-- Property address and location data
-- ============================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  street_address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  county VARCHAR(100),
  country VARCHAR(50) DEFAULT 'US',
  formatted_address TEXT,
  place_id VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  in_service_area BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lead_id)
);

-- ============================================
-- Table: intakes
-- Funnel responses and roof details
-- ============================================
CREATE TABLE intakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  -- Job info (Step 2)
  job_type job_type,
  job_description TEXT,

  -- Roof details (Step 3)
  roof_material roof_material,
  roof_age_years INTEGER,
  roof_size_sqft INTEGER,
  stories INTEGER DEFAULT 1,
  roof_pitch roof_pitch,
  has_skylights BOOLEAN DEFAULT FALSE,
  has_chimneys BOOLEAN DEFAULT FALSE,
  has_solar_panels BOOLEAN DEFAULT FALSE,

  -- Visible issues (Step 4)
  issues JSONB DEFAULT '[]'::JSONB,
  issues_description TEXT,

  -- Timeline & insurance (Step 6)
  timeline_urgency timeline_urgency,
  has_insurance_claim BOOLEAN DEFAULT FALSE,
  insurance_company VARCHAR(100),
  claim_number VARCHAR(100),

  -- Additional notes
  additional_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lead_id)
);

-- ============================================
-- Table: uploads
-- Photo uploads with AI analysis results
-- ============================================
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  storage_path VARCHAR(500) NOT NULL,
  original_filename VARCHAR(255),
  content_type VARCHAR(100),
  file_size INTEGER,
  status upload_status DEFAULT 'pending',

  -- AI analysis results
  ai_analyzed BOOLEAN DEFAULT FALSE,
  ai_analysis_result JSONB,
  ai_detected_issues JSONB DEFAULT '[]'::JSONB,
  ai_confidence_score DECIMAL(5, 4),
  ai_provider ai_provider,
  ai_analyzed_at TIMESTAMPTZ,

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: pricing_rules
-- Configurable pricing for estimates
-- ============================================
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_key VARCHAR(100) NOT NULL,
  rule_category VARCHAR(50) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Pricing values
  base_rate DECIMAL(10, 2),
  unit VARCHAR(20) DEFAULT 'sqft',
  multiplier DECIMAL(6, 4) DEFAULT 1.0,
  flat_fee DECIMAL(10, 2) DEFAULT 0,
  min_charge DECIMAL(10, 2),
  max_charge DECIMAL(10, 2),

  -- Applicability conditions
  conditions JSONB DEFAULT '{}'::JSONB,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  effective_until TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  UNIQUE(rule_key, effective_from)
);

-- ============================================
-- Table: estimates
-- Generated estimates with pricing snapshot
-- ============================================
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  -- Price range
  price_low DECIMAL(12, 2) NOT NULL,
  price_likely DECIMAL(12, 2) NOT NULL,
  price_high DECIMAL(12, 2) NOT NULL,

  -- Breakdown
  base_cost DECIMAL(12, 2),
  material_cost DECIMAL(12, 2),
  labor_cost DECIMAL(12, 2),
  adjustments JSONB DEFAULT '[]'::JSONB,

  -- Snapshot of inputs at calculation time
  input_snapshot JSONB NOT NULL,
  pricing_rules_snapshot JSONB NOT NULL,

  -- AI explanation
  ai_explanation TEXT,
  ai_explanation_provider ai_provider,

  -- Validity
  valid_until TIMESTAMPTZ,
  is_superseded BOOLEAN DEFAULT FALSE,
  superseded_by UUID REFERENCES estimates(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: ai_outputs
-- Audit trail for all AI operations
-- ============================================
CREATE TABLE ai_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  upload_id UUID REFERENCES uploads(id) ON DELETE SET NULL,
  estimate_id UUID REFERENCES estimates(id) ON DELETE SET NULL,

  provider ai_provider NOT NULL,
  operation VARCHAR(50) NOT NULL,
  model VARCHAR(100),

  -- Request/Response
  input_data JSONB NOT NULL,
  output_data JSONB,
  error_message TEXT,

  -- Performance
  latency_ms INTEGER,
  token_count_input INTEGER,
  token_count_output INTEGER,

  -- Status
  success BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: audit_logs
-- Compliance trail for all changes
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_properties_lead_id ON properties(lead_id);
CREATE INDEX idx_properties_zip_code ON properties(zip_code);
CREATE INDEX idx_intakes_lead_id ON intakes(lead_id);
CREATE INDEX idx_uploads_lead_id ON uploads(lead_id);
CREATE INDEX idx_uploads_status ON uploads(status);
CREATE INDEX idx_estimates_lead_id ON estimates(lead_id);
CREATE INDEX idx_pricing_rules_key ON pricing_rules(rule_key);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active, effective_from);
CREATE INDEX idx_ai_outputs_lead_id ON ai_outputs(lead_id);
CREATE INDEX idx_ai_outputs_created_at ON ai_outputs(created_at DESC);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intakes_updated_at BEFORE UPDATE ON intakes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uploads_updated_at BEFORE UPDATE ON uploads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at BEFORE UPDATE ON estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
