-- ============================================
-- Price Adjustments Migration
-- Enables discounts, markups, and price overrides
-- for estimates with full audit trail
-- ============================================

-- Adjustment type enum
CREATE TYPE price_adjustment_type AS ENUM (
  'discount_percent',   -- Percentage discount (e.g., 10% off)
  'discount_fixed',     -- Fixed dollar discount (e.g., $500 off)
  'markup_percent',     -- Percentage markup
  'markup_fixed',       -- Fixed dollar markup
  'price_override',     -- Direct price override
  'line_item_override'  -- Override specific line item
);

-- ============================================
-- Table: price_adjustments
-- Tracks all price modifications to estimates
-- ============================================
CREATE TABLE price_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to estimate (can be either type)
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
  detailed_estimate_id UUID REFERENCES detailed_estimates(id) ON DELETE CASCADE,

  -- For line-item specific adjustments
  estimate_line_item_id UUID REFERENCES estimate_line_items(id) ON DELETE CASCADE,

  -- Adjustment details
  adjustment_type price_adjustment_type NOT NULL,
  value DECIMAL(12, 2) NOT NULL, -- Percentage or fixed amount
  description TEXT, -- Customer-visible description (e.g., "Senior discount")
  reason TEXT, -- Internal reason for adjustment

  -- Calculated impact
  amount_before DECIMAL(12, 2), -- Price before this adjustment
  amount_after DECIMAL(12, 2), -- Price after this adjustment
  adjustment_amount DECIMAL(12, 2), -- The difference

  -- Validity
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,

  -- Approval tracking
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  -- Audit
  applied_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: must reference one estimate type
  CONSTRAINT price_adjustments_estimate_check CHECK (
    (estimate_id IS NOT NULL AND detailed_estimate_id IS NULL) OR
    (estimate_id IS NULL AND detailed_estimate_id IS NOT NULL)
  )
);

-- ============================================
-- Add adjusted price columns to estimates
-- ============================================
ALTER TABLE estimates
  ADD COLUMN IF NOT EXISTS adjusted_price_low DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS adjusted_price_likely DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS adjusted_price_high DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS total_discount_percent DECIMAL(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_discount_amount DECIMAL(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_adjustments BOOLEAN NOT NULL DEFAULT false;

-- ============================================
-- Add adjusted price columns to detailed_estimates
-- ============================================
ALTER TABLE detailed_estimates
  ADD COLUMN IF NOT EXISTS adjusted_price_low DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS adjusted_price_likely DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS adjusted_price_high DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS total_discount_percent DECIMAL(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_discount_amount DECIMAL(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_adjustments BOOLEAN NOT NULL DEFAULT false;

-- ============================================
-- Table: discount_codes
-- Reusable discount codes for marketing
-- ============================================
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Code identification
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Discount value
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percent', -- percent, fixed
  discount_value DECIMAL(12, 2) NOT NULL,

  -- Constraints
  min_order_amount DECIMAL(12, 2), -- Minimum order to apply
  max_discount_amount DECIMAL(12, 2), -- Cap on discount
  max_uses INTEGER, -- Total uses allowed (null = unlimited)
  max_uses_per_customer INTEGER DEFAULT 1, -- Per customer limit

  -- Validity
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,

  -- Targeting
  applicable_job_types TEXT[] DEFAULT '{}', -- Empty = all
  applicable_regions TEXT[] DEFAULT '{}', -- Empty = all (state codes)

  -- Tracking
  use_count INTEGER NOT NULL DEFAULT 0,
  total_discount_given DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: discount_code_uses
-- Track when discount codes are applied
-- ============================================
CREATE TABLE discount_code_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  estimate_id UUID REFERENCES estimates(id) ON DELETE SET NULL,
  detailed_estimate_id UUID REFERENCES detailed_estimates(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Result
  discount_amount DECIMAL(12, 2) NOT NULL,

  -- Timestamps
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate uses
  UNIQUE(discount_code_id, lead_id)
);

-- ============================================
-- Function to apply discount code
-- ============================================
CREATE OR REPLACE FUNCTION apply_discount_code(
  p_code VARCHAR(50),
  p_lead_id UUID,
  p_estimate_id UUID DEFAULT NULL,
  p_detailed_estimate_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  discount_amount DECIMAL(12, 2)
) AS $$
DECLARE
  v_discount_code discount_codes%ROWTYPE;
  v_price DECIMAL(12, 2);
  v_discount DECIMAL(12, 2);
  v_existing_use UUID;
BEGIN
  -- Find the discount code
  SELECT * INTO v_discount_code
  FROM discount_codes
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until > NOW());

  IF v_discount_code.id IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid or expired discount code'::TEXT, 0::DECIMAL(12,2);
    RETURN;
  END IF;

  -- Check max uses
  IF v_discount_code.max_uses IS NOT NULL AND v_discount_code.use_count >= v_discount_code.max_uses THEN
    RETURN QUERY SELECT false, 'Discount code has reached maximum uses'::TEXT, 0::DECIMAL(12,2);
    RETURN;
  END IF;

  -- Check if already used for this lead
  SELECT id INTO v_existing_use
  FROM discount_code_uses
  WHERE discount_code_id = v_discount_code.id AND lead_id = p_lead_id;

  IF v_existing_use IS NOT NULL THEN
    RETURN QUERY SELECT false, 'Discount code already applied to this estimate'::TEXT, 0::DECIMAL(12,2);
    RETURN;
  END IF;

  -- Get the estimate price
  IF p_detailed_estimate_id IS NOT NULL THEN
    SELECT COALESCE(adjusted_price_likely, price_likely) INTO v_price
    FROM detailed_estimates WHERE id = p_detailed_estimate_id;
  ELSIF p_estimate_id IS NOT NULL THEN
    SELECT COALESCE(adjusted_price_likely, price_likely) INTO v_price
    FROM estimates WHERE id = p_estimate_id;
  ELSE
    RETURN QUERY SELECT false, 'No estimate specified'::TEXT, 0::DECIMAL(12,2);
    RETURN;
  END IF;

  -- Check minimum order
  IF v_discount_code.min_order_amount IS NOT NULL AND v_price < v_discount_code.min_order_amount THEN
    RETURN QUERY SELECT false, format('Order must be at least $%s to use this code', v_discount_code.min_order_amount)::TEXT, 0::DECIMAL(12,2);
    RETURN;
  END IF;

  -- Calculate discount
  IF v_discount_code.discount_type = 'percent' THEN
    v_discount := v_price * (v_discount_code.discount_value / 100);
  ELSE
    v_discount := v_discount_code.discount_value;
  END IF;

  -- Apply max discount cap
  IF v_discount_code.max_discount_amount IS NOT NULL AND v_discount > v_discount_code.max_discount_amount THEN
    v_discount := v_discount_code.max_discount_amount;
  END IF;

  -- Record the use
  INSERT INTO discount_code_uses (
    discount_code_id, lead_id, estimate_id, detailed_estimate_id, discount_amount
  ) VALUES (
    v_discount_code.id, p_lead_id, p_estimate_id, p_detailed_estimate_id, v_discount
  );

  -- Update discount code stats
  UPDATE discount_codes
  SET use_count = use_count + 1,
      total_discount_given = total_discount_given + v_discount,
      updated_at = NOW()
  WHERE id = v_discount_code.id;

  -- Create price adjustment record
  INSERT INTO price_adjustments (
    estimate_id, detailed_estimate_id,
    adjustment_type, value, description,
    amount_before, amount_after, adjustment_amount
  ) VALUES (
    p_estimate_id, p_detailed_estimate_id,
    'discount_percent', v_discount_code.discount_value,
    format('Discount code: %s', v_discount_code.code),
    v_price, v_price - v_discount, v_discount
  );

  RETURN QUERY SELECT true, format('Discount of $%s applied!', v_discount)::TEXT, v_discount;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function to recalculate adjusted prices
-- ============================================
CREATE OR REPLACE FUNCTION recalculate_adjusted_prices(
  p_estimate_id UUID DEFAULT NULL,
  p_detailed_estimate_id UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_base_low DECIMAL(12, 2);
  v_base_likely DECIMAL(12, 2);
  v_base_high DECIMAL(12, 2);
  v_total_discount DECIMAL(12, 2) := 0;
  v_total_markup DECIMAL(12, 2) := 0;
  v_override_price DECIMAL(12, 2);
  v_adj RECORD;
BEGIN
  -- Get base prices
  IF p_detailed_estimate_id IS NOT NULL THEN
    SELECT price_low, price_likely, price_high
    INTO v_base_low, v_base_likely, v_base_high
    FROM detailed_estimates WHERE id = p_detailed_estimate_id;
  ELSE
    SELECT price_low, price_likely, price_high
    INTO v_base_low, v_base_likely, v_base_high
    FROM estimates WHERE id = p_estimate_id;
  END IF;

  -- Process each active adjustment
  FOR v_adj IN
    SELECT * FROM price_adjustments
    WHERE (estimate_id = p_estimate_id OR detailed_estimate_id = p_detailed_estimate_id)
      AND is_active = true
      AND estimate_line_item_id IS NULL
    ORDER BY created_at
  LOOP
    CASE v_adj.adjustment_type
      WHEN 'discount_percent' THEN
        v_total_discount := v_total_discount + (v_base_likely * v_adj.value / 100);
      WHEN 'discount_fixed' THEN
        v_total_discount := v_total_discount + v_adj.value;
      WHEN 'markup_percent' THEN
        v_total_markup := v_total_markup + (v_base_likely * v_adj.value / 100);
      WHEN 'markup_fixed' THEN
        v_total_markup := v_total_markup + v_adj.value;
      WHEN 'price_override' THEN
        v_override_price := v_adj.value;
    END CASE;
  END LOOP;

  -- Calculate final adjusted prices
  IF v_override_price IS NOT NULL THEN
    -- Override takes precedence
    IF p_detailed_estimate_id IS NOT NULL THEN
      UPDATE detailed_estimates SET
        adjusted_price_low = v_override_price * 0.90,
        adjusted_price_likely = v_override_price,
        adjusted_price_high = v_override_price * 1.15,
        total_discount_amount = v_base_likely - v_override_price,
        total_discount_percent = ((v_base_likely - v_override_price) / NULLIF(v_base_likely, 0)) * 100,
        has_adjustments = true,
        updated_at = NOW()
      WHERE id = p_detailed_estimate_id;
    ELSE
      UPDATE estimates SET
        adjusted_price_low = v_override_price * 0.90,
        adjusted_price_likely = v_override_price,
        adjusted_price_high = v_override_price * 1.15,
        total_discount_amount = v_base_likely - v_override_price,
        total_discount_percent = ((v_base_likely - v_override_price) / NULLIF(v_base_likely, 0)) * 100,
        has_adjustments = true,
        updated_at = NOW()
      WHERE id = p_estimate_id;
    END IF;
  ELSE
    -- Apply discounts and markups
    IF p_detailed_estimate_id IS NOT NULL THEN
      UPDATE detailed_estimates SET
        adjusted_price_low = GREATEST(0, v_base_low - v_total_discount + v_total_markup),
        adjusted_price_likely = GREATEST(0, v_base_likely - v_total_discount + v_total_markup),
        adjusted_price_high = GREATEST(0, v_base_high - v_total_discount + v_total_markup),
        total_discount_amount = v_total_discount - v_total_markup,
        total_discount_percent = ((v_total_discount - v_total_markup) / NULLIF(v_base_likely, 0)) * 100,
        has_adjustments = (v_total_discount > 0 OR v_total_markup > 0),
        updated_at = NOW()
      WHERE id = p_detailed_estimate_id;
    ELSE
      UPDATE estimates SET
        adjusted_price_low = GREATEST(0, v_base_low - v_total_discount + v_total_markup),
        adjusted_price_likely = GREATEST(0, v_base_likely - v_total_discount + v_total_markup),
        adjusted_price_high = GREATEST(0, v_base_high - v_total_discount + v_total_markup),
        total_discount_amount = v_total_discount - v_total_markup,
        total_discount_percent = ((v_total_discount - v_total_markup) / NULLIF(v_base_likely, 0)) * 100,
        has_adjustments = (v_total_discount > 0 OR v_total_markup > 0),
        updated_at = NOW()
      WHERE id = p_estimate_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger to recalculate prices on adjustment changes
-- ============================================
CREATE OR REPLACE FUNCTION trigger_recalculate_on_adjustment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_adjusted_prices(OLD.estimate_id, OLD.detailed_estimate_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_adjusted_prices(NEW.estimate_id, NEW.detailed_estimate_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_on_adjustment_change
  AFTER INSERT OR UPDATE OR DELETE ON price_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_on_adjustment();

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_price_adjustments_estimate ON price_adjustments(estimate_id);
CREATE INDEX idx_price_adjustments_detailed_estimate ON price_adjustments(detailed_estimate_id);
CREATE INDEX idx_price_adjustments_line_item ON price_adjustments(estimate_line_item_id);
CREATE INDEX idx_price_adjustments_active ON price_adjustments(is_active) WHERE is_active = true;
CREATE INDEX idx_price_adjustments_created_at ON price_adjustments(created_at DESC);

CREATE INDEX idx_discount_codes_code ON discount_codes(UPPER(code));
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active) WHERE is_active = true;

CREATE INDEX idx_discount_code_uses_code ON discount_code_uses(discount_code_id);
CREATE INDEX idx_discount_code_uses_lead ON discount_code_uses(lead_id);

-- ============================================
-- Updated_at triggers
-- ============================================
CREATE TRIGGER update_price_adjustments_updated_at
  BEFORE UPDATE ON price_adjustments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_codes_updated_at
  BEFORE UPDATE ON discount_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE price_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_code_uses ENABLE ROW LEVEL SECURITY;

-- Only admins can manage price adjustments
CREATE POLICY "price_adjustments_admin" ON price_adjustments FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Only admins can manage discount codes
CREATE POLICY "discount_codes_admin" ON discount_codes FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Discount code uses: admins have full access
CREATE POLICY "discount_code_uses_admin" ON discount_code_uses FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Customers can apply discount codes (insert only)
CREATE POLICY "discount_code_uses_customer_insert" ON discount_code_uses FOR INSERT WITH CHECK (
  lead_id IN (
    SELECT lead_id FROM customer_leads cl
    JOIN customers c ON c.id = cl.customer_id
    WHERE c.auth_user_id = auth.uid()
  )
);

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE price_adjustments IS 'Tracks all price modifications (discounts, markups, overrides) to estimates';
COMMENT ON TABLE discount_codes IS 'Reusable discount codes for marketing campaigns';
COMMENT ON TABLE discount_code_uses IS 'Tracks when discount codes are applied to leads';
COMMENT ON FUNCTION apply_discount_code IS 'Validates and applies a discount code to an estimate';
COMMENT ON FUNCTION recalculate_adjusted_prices IS 'Recalculates all adjusted prices based on active adjustments';
