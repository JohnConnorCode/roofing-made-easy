-- Advanced Estimation System Migration
-- Provides Xactimate-competitive line items, macros, sketches, and detailed estimates

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Unit types for line items (matches Xactimate)
CREATE TYPE unit_type AS ENUM (
  'SQ',    -- Square (100 sq ft)
  'SF',    -- Square Feet
  'LF',    -- Linear Feet
  'EA',    -- Each
  'HR',    -- Hour (labor)
  'DAY',   -- Day (equipment rental)
  'TON',   -- Ton (materials)
  'GAL',   -- Gallon
  'BDL',   -- Bundle
  'RL'     -- Roll
);

-- Line item categories
CREATE TYPE line_item_category AS ENUM (
  'tear_off',
  'underlayment',
  'shingles',
  'metal_roofing',
  'tile_roofing',
  'flat_roofing',
  'flashing',
  'ventilation',
  'gutters',
  'skylights',
  'chimneys',
  'decking',
  'insulation',
  'labor',
  'equipment',
  'disposal',
  'permits',
  'miscellaneous'
);

-- Macro types for estimate templates
CREATE TYPE macro_roof_type AS ENUM (
  'asphalt_shingle',
  'metal_standing_seam',
  'metal_corrugated',
  'tile_concrete',
  'tile_clay',
  'slate',
  'wood_shake',
  'flat_tpo',
  'flat_epdm',
  'flat_modified_bitumen',
  'any'
);

CREATE TYPE macro_job_type AS ENUM (
  'full_replacement',
  'repair',
  'overlay',
  'partial_replacement',
  'storm_damage',
  'insurance_claim',
  'maintenance',
  'gutter_only',
  'any'
);

-- =============================================================================
-- LINE ITEMS TABLE
-- =============================================================================
-- Industry-standard catalog of roofing line items with RFG-style codes

CREATE TABLE IF NOT EXISTS line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  item_code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category line_item_category NOT NULL,

  -- Measurement
  unit_type unit_type NOT NULL DEFAULT 'SQ',

  -- Pricing (base costs before geographic adjustments)
  base_material_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  base_labor_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  base_equipment_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Formula for calculating quantity from variables
  -- e.g., "SQ*1.10" for 10% waste, "EAVE+RAKE" for drip edge
  quantity_formula VARCHAR(255),

  -- Default waste factor (1.10 = 10% waste)
  default_waste_factor DECIMAL(4, 2) NOT NULL DEFAULT 1.00,

  -- Constraints
  min_quantity DECIMAL(10, 2),
  max_quantity DECIMAL(10, 2),

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_taxable BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- GEOGRAPHIC PRICING TABLE
-- =============================================================================
-- Regional price modifiers by state, county, or zip code

CREATE TABLE IF NOT EXISTS geographic_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Geographic scope (most specific wins)
  state VARCHAR(2),
  county VARCHAR(100),
  zip_codes TEXT[] DEFAULT '{}',

  -- Display
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Multipliers applied to line item costs
  material_multiplier DECIMAL(4, 2) NOT NULL DEFAULT 1.00,
  labor_multiplier DECIMAL(4, 2) NOT NULL DEFAULT 1.00,
  equipment_multiplier DECIMAL(4, 2) NOT NULL DEFAULT 1.00,

  -- Validity
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_until DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- ROOF SKETCHES TABLE
-- =============================================================================
-- Roof measurements with calculated variables (one per lead)

CREATE TABLE IF NOT EXISTS roof_sketches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  -- Calculated totals from all slopes
  total_squares DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_sqft DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_perimeter_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Linear measurements (total across all slopes)
  total_eave_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_ridge_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_valley_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_hip_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_rake_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Features count
  skylight_count INTEGER NOT NULL DEFAULT 0,
  chimney_count INTEGER NOT NULL DEFAULT 0,
  pipe_boot_count INTEGER NOT NULL DEFAULT 0,
  vent_count INTEGER NOT NULL DEFAULT 0,

  -- Drip edge / fascia
  total_drip_edge_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_fascia_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Additional measurements
  gutter_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,
  downspout_count INTEGER NOT NULL DEFAULT 0,

  -- Existing roof layers (affects tear-off)
  existing_layers INTEGER NOT NULL DEFAULT 1,

  -- Sketch visualization data (for interactive editor)
  sketch_data JSONB DEFAULT '{}',

  -- AI analysis results (if photo-based)
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  ai_confidence DECIMAL(3, 2),
  ai_analysis_notes TEXT,

  -- Source of measurements
  measurement_source VARCHAR(50) DEFAULT 'manual',  -- manual, ai_photo, eagleview, gaf
  measurement_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(lead_id)
);

-- =============================================================================
-- ROOF SLOPES TABLE
-- =============================================================================
-- Individual roof faces/slopes (subgroups/overbuilds)
-- Allows different pitches and measurements per section

CREATE TABLE IF NOT EXISTS roof_slopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sketch_id UUID NOT NULL REFERENCES roof_sketches(id) ON DELETE CASCADE,

  -- Identification
  name VARCHAR(100) NOT NULL DEFAULT 'Main',
  slope_number INTEGER NOT NULL DEFAULT 1,

  -- Area measurements
  squares DECIMAL(10, 2) NOT NULL DEFAULT 0,
  sqft DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Pitch (rise/run, e.g., 6 for 6/12)
  pitch INTEGER NOT NULL DEFAULT 4,
  pitch_multiplier DECIMAL(4, 2) NOT NULL DEFAULT 1.00,

  -- Linear measurements for this slope
  eave_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ridge_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,
  valley_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,
  hip_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,
  rake_lf DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Dimensions (for rectangular approximation)
  length_ft DECIMAL(10, 2),
  width_ft DECIMAL(10, 2),

  -- Special conditions
  is_walkable BOOLEAN NOT NULL DEFAULT true,
  has_steep_charge BOOLEAN NOT NULL DEFAULT false,
  has_limited_access BOOLEAN NOT NULL DEFAULT false,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(sketch_id, slope_number)
);

-- =============================================================================
-- ESTIMATE MACROS TABLE
-- =============================================================================
-- Pre-built line item bundles (templates)

CREATE TABLE IF NOT EXISTS estimate_macros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Categorization
  roof_type macro_roof_type NOT NULL DEFAULT 'any',
  job_type macro_job_type NOT NULL DEFAULT 'any',

  -- Defaults
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_system BOOLEAN NOT NULL DEFAULT false,  -- System macros can't be deleted

  -- Usage tracking
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- MACRO LINE ITEMS TABLE
-- =============================================================================
-- Line items within each macro

CREATE TABLE IF NOT EXISTS macro_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  macro_id UUID NOT NULL REFERENCES estimate_macros(id) ON DELETE CASCADE,
  line_item_id UUID NOT NULL REFERENCES line_items(id) ON DELETE CASCADE,

  -- Override quantity formula from line item
  quantity_formula VARCHAR(255),

  -- Override waste factor from line item
  waste_factor DECIMAL(4, 2),

  -- Selection defaults
  is_optional BOOLEAN NOT NULL DEFAULT false,
  is_selected_by_default BOOLEAN NOT NULL DEFAULT true,

  -- Override pricing (null = use line item defaults)
  material_cost_override DECIMAL(10, 2),
  labor_cost_override DECIMAL(10, 2),
  equipment_cost_override DECIMAL(10, 2),

  -- Display
  sort_order INTEGER NOT NULL DEFAULT 0,
  group_name VARCHAR(100),  -- For grouping items in UI
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(macro_id, line_item_id)
);

-- =============================================================================
-- DETAILED ESTIMATES TABLE
-- =============================================================================
-- Full line-item estimates (can have multiple per lead)

CREATE TABLE IF NOT EXISTS detailed_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sketch_id UUID REFERENCES roof_sketches(id) ON DELETE SET NULL,

  -- Identification
  name VARCHAR(255) NOT NULL DEFAULT 'Estimate',
  version INTEGER NOT NULL DEFAULT 1,

  -- Calculated variables snapshot
  variables JSONB NOT NULL DEFAULT '{}',

  -- Cost totals
  total_material DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_labor DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_equipment DECIMAL(12, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Markup
  overhead_percent DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
  overhead_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  profit_percent DECIMAL(5, 2) NOT NULL DEFAULT 15.00,
  profit_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Tax
  tax_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  taxable_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Final pricing (range for presentation)
  price_low DECIMAL(12, 2) NOT NULL DEFAULT 0,
  price_likely DECIMAL(12, 2) NOT NULL DEFAULT 0,
  price_high DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Geographic pricing applied
  geographic_pricing_id UUID REFERENCES geographic_pricing(id),
  geographic_adjustment DECIMAL(4, 2) NOT NULL DEFAULT 1.00,

  -- Source macro (if created from macro)
  source_macro_id UUID REFERENCES estimate_macros(id),

  -- Validity
  valid_until DATE,
  is_superseded BOOLEAN NOT NULL DEFAULT false,
  superseded_by UUID REFERENCES detailed_estimates(id),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft',  -- draft, sent, accepted, declined, expired
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,

  -- AI enhancements
  ai_optimized BOOLEAN NOT NULL DEFAULT false,
  ai_suggestions JSONB DEFAULT '[]',
  ai_explanation TEXT,

  -- Notes
  internal_notes TEXT,
  customer_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- ESTIMATE LINE ITEMS TABLE
-- =============================================================================
-- Individual line items within a detailed estimate

CREATE TABLE IF NOT EXISTS estimate_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detailed_estimate_id UUID NOT NULL REFERENCES detailed_estimates(id) ON DELETE CASCADE,
  line_item_id UUID NOT NULL REFERENCES line_items(id) ON DELETE RESTRICT,

  -- From line item (denormalized for snapshot)
  item_code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category line_item_category NOT NULL,
  unit_type unit_type NOT NULL,

  -- Quantity calculation
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity_formula VARCHAR(255),
  waste_factor DECIMAL(4, 2) NOT NULL DEFAULT 1.00,
  quantity_with_waste DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Unit costs (after geographic adjustment)
  material_unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  labor_unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  equipment_unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Line totals
  material_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  labor_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  equipment_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  line_total DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Inclusion
  is_included BOOLEAN NOT NULL DEFAULT true,
  is_optional BOOLEAN NOT NULL DEFAULT false,

  -- Taxable
  is_taxable BOOLEAN NOT NULL DEFAULT true,

  -- Display
  sort_order INTEGER NOT NULL DEFAULT 0,
  group_name VARCHAR(100),
  notes TEXT,

  -- Override flags (for manual adjustments)
  quantity_override BOOLEAN NOT NULL DEFAULT false,
  cost_override BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Line items
CREATE INDEX idx_line_items_category ON line_items(category);
CREATE INDEX idx_line_items_code ON line_items(item_code);
CREATE INDEX idx_line_items_active ON line_items(is_active) WHERE is_active = true;

-- Geographic pricing
CREATE INDEX idx_geographic_pricing_state ON geographic_pricing(state);
CREATE INDEX idx_geographic_pricing_active ON geographic_pricing(is_active) WHERE is_active = true;

-- Roof sketches
CREATE INDEX idx_roof_sketches_lead ON roof_sketches(lead_id);

-- Roof slopes
CREATE INDEX idx_roof_slopes_sketch ON roof_slopes(sketch_id);

-- Macros
CREATE INDEX idx_estimate_macros_roof_type ON estimate_macros(roof_type);
CREATE INDEX idx_estimate_macros_job_type ON estimate_macros(job_type);
CREATE INDEX idx_estimate_macros_active ON estimate_macros(is_active) WHERE is_active = true;
CREATE INDEX idx_estimate_macros_default ON estimate_macros(is_default) WHERE is_default = true;

-- Macro line items
CREATE INDEX idx_macro_line_items_macro ON macro_line_items(macro_id);
CREATE INDEX idx_macro_line_items_line_item ON macro_line_items(line_item_id);

-- Detailed estimates
CREATE INDEX idx_detailed_estimates_lead ON detailed_estimates(lead_id);
CREATE INDEX idx_detailed_estimates_status ON detailed_estimates(status);
CREATE INDEX idx_detailed_estimates_sketch ON detailed_estimates(sketch_id);

-- Estimate line items
CREATE INDEX idx_estimate_line_items_estimate ON estimate_line_items(detailed_estimate_id);
CREATE INDEX idx_estimate_line_items_line_item ON estimate_line_items(line_item_id);
CREATE INDEX idx_estimate_line_items_included ON estimate_line_items(detailed_estimate_id, is_included) WHERE is_included = true;

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

CREATE TRIGGER update_line_items_updated_at
  BEFORE UPDATE ON line_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geographic_pricing_updated_at
  BEFORE UPDATE ON geographic_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roof_sketches_updated_at
  BEFORE UPDATE ON roof_sketches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roof_slopes_updated_at
  BEFORE UPDATE ON roof_slopes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimate_macros_updated_at
  BEFORE UPDATE ON estimate_macros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_macro_line_items_updated_at
  BEFORE UPDATE ON macro_line_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_detailed_estimates_updated_at
  BEFORE UPDATE ON detailed_estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimate_line_items_updated_at
  BEFORE UPDATE ON estimate_line_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to recalculate roof sketch totals from slopes
CREATE OR REPLACE FUNCTION recalculate_sketch_totals(p_sketch_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE roof_sketches
  SET
    total_squares = (SELECT COALESCE(SUM(squares), 0) FROM roof_slopes WHERE sketch_id = p_sketch_id),
    total_sqft = (SELECT COALESCE(SUM(sqft), 0) FROM roof_slopes WHERE sketch_id = p_sketch_id),
    total_eave_lf = (SELECT COALESCE(SUM(eave_lf), 0) FROM roof_slopes WHERE sketch_id = p_sketch_id),
    total_ridge_lf = (SELECT COALESCE(SUM(ridge_lf), 0) FROM roof_slopes WHERE sketch_id = p_sketch_id),
    total_valley_lf = (SELECT COALESCE(SUM(valley_lf), 0) FROM roof_slopes WHERE sketch_id = p_sketch_id),
    total_hip_lf = (SELECT COALESCE(SUM(hip_lf), 0) FROM roof_slopes WHERE sketch_id = p_sketch_id),
    total_rake_lf = (SELECT COALESCE(SUM(rake_lf), 0) FROM roof_slopes WHERE sketch_id = p_sketch_id),
    total_perimeter_lf = (
      SELECT COALESCE(SUM(eave_lf + rake_lf), 0) FROM roof_slopes WHERE sketch_id = p_sketch_id
    ),
    total_drip_edge_lf = (
      SELECT COALESCE(SUM(eave_lf + rake_lf), 0) FROM roof_slopes WHERE sketch_id = p_sketch_id
    ),
    updated_at = now()
  WHERE id = p_sketch_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-recalculate sketch totals when slopes change
CREATE OR REPLACE FUNCTION trigger_recalculate_sketch_totals()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_sketch_totals(OLD.sketch_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_sketch_totals(NEW.sketch_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_recalculate_sketch_totals
  AFTER INSERT OR UPDATE OR DELETE ON roof_slopes
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_sketch_totals();

-- Function to calculate estimate line item totals
CREATE OR REPLACE FUNCTION calculate_estimate_line_totals(p_line_item_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE estimate_line_items
  SET
    quantity_with_waste = quantity * waste_factor,
    material_total = (quantity * waste_factor) * material_unit_cost,
    labor_total = (quantity * waste_factor) * labor_unit_cost,
    equipment_total = (quantity * waste_factor) * equipment_unit_cost,
    line_total = (quantity * waste_factor) * (material_unit_cost + labor_unit_cost + equipment_unit_cost),
    updated_at = now()
  WHERE id = p_line_item_id;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate detailed estimate totals
CREATE OR REPLACE FUNCTION recalculate_estimate_totals(p_estimate_id UUID)
RETURNS void AS $$
DECLARE
  v_material DECIMAL(12, 2);
  v_labor DECIMAL(12, 2);
  v_equipment DECIMAL(12, 2);
  v_subtotal DECIMAL(12, 2);
  v_overhead DECIMAL(12, 2);
  v_profit DECIMAL(12, 2);
  v_taxable DECIMAL(12, 2);
  v_tax DECIMAL(12, 2);
  v_total DECIMAL(12, 2);
  v_overhead_pct DECIMAL(5, 2);
  v_profit_pct DECIMAL(5, 2);
  v_tax_pct DECIMAL(5, 2);
BEGIN
  -- Get current percentages
  SELECT overhead_percent, profit_percent, tax_percent
  INTO v_overhead_pct, v_profit_pct, v_tax_pct
  FROM detailed_estimates
  WHERE id = p_estimate_id;

  -- Sum line items (only included ones)
  SELECT
    COALESCE(SUM(material_total), 0),
    COALESCE(SUM(labor_total), 0),
    COALESCE(SUM(equipment_total), 0),
    COALESCE(SUM(CASE WHEN is_taxable THEN line_total ELSE 0 END), 0)
  INTO v_material, v_labor, v_equipment, v_taxable
  FROM estimate_line_items
  WHERE detailed_estimate_id = p_estimate_id AND is_included = true;

  v_subtotal := v_material + v_labor + v_equipment;
  v_overhead := v_subtotal * (v_overhead_pct / 100);
  v_profit := (v_subtotal + v_overhead) * (v_profit_pct / 100);
  v_tax := v_taxable * (v_tax_pct / 100);
  v_total := v_subtotal + v_overhead + v_profit + v_tax;

  UPDATE detailed_estimates
  SET
    total_material = v_material,
    total_labor = v_labor,
    total_equipment = v_equipment,
    subtotal = v_subtotal,
    overhead_amount = v_overhead,
    profit_amount = v_profit,
    taxable_amount = v_taxable,
    tax_amount = v_tax,
    price_likely = v_total,
    price_low = v_total * 0.90,
    price_high = v_total * 1.15,
    updated_at = now()
  WHERE id = p_estimate_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographic_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE roof_sketches ENABLE ROW LEVEL SECURITY;
ALTER TABLE roof_slopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_macros ENABLE ROW LEVEL SECURITY;
ALTER TABLE macro_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE detailed_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;

-- Line items: Read for all, write for admins
CREATE POLICY "line_items_read" ON line_items FOR SELECT USING (true);
CREATE POLICY "line_items_write" ON line_items FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Geographic pricing: Read for all, write for admins
CREATE POLICY "geographic_pricing_read" ON geographic_pricing FOR SELECT USING (true);
CREATE POLICY "geographic_pricing_write" ON geographic_pricing FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Roof sketches: Read/write for associated lead owners and admins
CREATE POLICY "roof_sketches_all" ON roof_sketches FOR ALL USING (
  EXISTS (
    SELECT 1 FROM leads l
    WHERE l.id = roof_sketches.lead_id
  )
);

-- Roof slopes: Same as sketches
CREATE POLICY "roof_slopes_all" ON roof_slopes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM roof_sketches rs
    WHERE rs.id = roof_slopes.sketch_id
  )
);

-- Macros: Read for all, write for admins
CREATE POLICY "estimate_macros_read" ON estimate_macros FOR SELECT USING (true);
CREATE POLICY "estimate_macros_write" ON estimate_macros FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Macro line items: Same as macros
CREATE POLICY "macro_line_items_read" ON macro_line_items FOR SELECT USING (true);
CREATE POLICY "macro_line_items_write" ON macro_line_items FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Detailed estimates: Read/write for associated lead owners and admins
CREATE POLICY "detailed_estimates_all" ON detailed_estimates FOR ALL USING (
  EXISTS (
    SELECT 1 FROM leads l
    WHERE l.id = detailed_estimates.lead_id
  )
);

-- Estimate line items: Same as estimates
CREATE POLICY "estimate_line_items_all" ON estimate_line_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM detailed_estimates de
    WHERE de.id = estimate_line_items.detailed_estimate_id
  )
);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE line_items IS 'Industry-standard catalog of roofing line items with RFG-style codes';
COMMENT ON TABLE geographic_pricing IS 'Regional price modifiers by state, county, or zip code';
COMMENT ON TABLE roof_sketches IS 'Roof measurements with calculated variables (SQ, P, EAVE, etc.)';
COMMENT ON TABLE roof_slopes IS 'Individual roof faces/slopes with pitch and measurements';
COMMENT ON TABLE estimate_macros IS 'Pre-built line item bundles (templates) for common job types';
COMMENT ON TABLE macro_line_items IS 'Line items within each macro with optional overrides';
COMMENT ON TABLE detailed_estimates IS 'Full line-item estimates with material/labor/equipment breakdowns';
COMMENT ON TABLE estimate_line_items IS 'Individual line items within a detailed estimate';
