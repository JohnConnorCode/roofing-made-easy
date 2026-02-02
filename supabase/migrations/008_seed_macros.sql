-- Seed Macros Migration
-- Pre-built line item bundles (templates) for common roofing jobs

-- =============================================================================
-- FULL REPLACEMENT MACROS
-- =============================================================================

-- Full Replacement - Laminate Shingles (DEFAULT)
INSERT INTO estimate_macros (name, description, roof_type, job_type, is_default, is_system, tags) VALUES
('Full Replacement - Laminate', 'Complete tear-off and replacement with architectural laminate shingles. Includes all standard components for a quality residential re-roof.', 'asphalt_shingle', 'full_replacement', true, true, ARRAY['laminate', 'architectural', 'standard', 'residential']);

INSERT INTO macro_line_items (macro_id, line_item_id, quantity_formula, waste_factor, is_optional, is_selected_by_default, sort_order, group_name)
SELECT
  m.id,
  li.id,
  CASE li.item_code
    WHEN 'RFG100' THEN 'SQ'
    WHEN 'RFG240' THEN 'SQ'
    WHEN 'RFG250' THEN 'EAVE*3/100'
    WHEN 'RFG420' THEN 'SQ'
    WHEN 'RFG440' THEN 'EAVE+RAKE'
    WHEN 'RFG446' THEN 'R+HIP'
    WHEN 'FLS100' THEN 'EAVE+RAKE'
    WHEN 'FLS120' THEN 'VAL'
    WHEN 'VNT100' THEN 'R'
    WHEN 'VNT110' THEN 'PIPE_COUNT'
    WHEN 'DSP800' THEN 'SQ'
    ELSE li.quantity_formula
  END,
  CASE
    WHEN li.category IN ('shingles', 'underlayment') THEN 1.10
    WHEN li.category = 'flashing' THEN 1.05
    ELSE 1.00
  END,
  CASE li.item_code
    WHEN 'PRM900' THEN true
    ELSE false
  END,
  true,
  CASE li.item_code
    WHEN 'RFG100' THEN 10
    WHEN 'RFG240' THEN 20
    WHEN 'RFG250' THEN 25
    WHEN 'RFG420' THEN 30
    WHEN 'RFG440' THEN 35
    WHEN 'RFG446' THEN 40
    WHEN 'FLS100' THEN 50
    WHEN 'FLS120' THEN 55
    WHEN 'VNT100' THEN 60
    WHEN 'VNT110' THEN 65
    WHEN 'DSP800' THEN 90
    WHEN 'PRM900' THEN 100
    ELSE 70
  END,
  CASE
    WHEN li.category = 'tear_off' THEN 'Tear-Off'
    WHEN li.category = 'underlayment' THEN 'Underlayment'
    WHEN li.category = 'shingles' THEN 'Shingles'
    WHEN li.category = 'flashing' THEN 'Flashing'
    WHEN li.category = 'ventilation' THEN 'Ventilation'
    WHEN li.category = 'disposal' THEN 'Disposal'
    WHEN li.category = 'permits' THEN 'Permits'
    ELSE 'Other'
  END
FROM estimate_macros m
CROSS JOIN line_items li
WHERE m.name = 'Full Replacement - Laminate'
  AND li.item_code IN ('RFG100', 'RFG240', 'RFG250', 'RFG420', 'RFG440', 'RFG446', 'FLS100', 'FLS120', 'VNT100', 'VNT110', 'DSP800', 'PRM900');

-- Full Replacement - 3-Tab Shingles
INSERT INTO estimate_macros (name, description, roof_type, job_type, is_default, is_system, tags) VALUES
('Full Replacement - 3-Tab', 'Complete tear-off and replacement with 3-tab shingles. Budget-friendly option for basic residential re-roof.', 'asphalt_shingle', 'full_replacement', false, true, ARRAY['3-tab', 'budget', 'basic', 'residential']);

INSERT INTO macro_line_items (macro_id, line_item_id, quantity_formula, waste_factor, is_optional, is_selected_by_default, sort_order, group_name)
SELECT
  m.id,
  li.id,
  CASE li.item_code
    WHEN 'RFG100' THEN 'SQ'
    WHEN 'RFG220' THEN 'SQ'
    WHEN 'RFG410' THEN 'SQ'
    WHEN 'RFG440' THEN 'EAVE+RAKE'
    WHEN 'RFG445' THEN 'R+HIP'
    WHEN 'FLS100' THEN 'EAVE+RAKE'
    WHEN 'FLS120' THEN 'VAL'
    WHEN 'VNT100' THEN 'R'
    WHEN 'VNT110' THEN 'PIPE_COUNT'
    WHEN 'DSP800' THEN 'SQ'
    ELSE li.quantity_formula
  END,
  CASE
    WHEN li.category IN ('shingles', 'underlayment') THEN 1.10
    WHEN li.category = 'flashing' THEN 1.05
    ELSE 1.00
  END,
  CASE li.item_code WHEN 'PRM900' THEN true ELSE false END,
  true,
  CASE li.item_code
    WHEN 'RFG100' THEN 10
    WHEN 'RFG220' THEN 20
    WHEN 'RFG410' THEN 30
    WHEN 'RFG440' THEN 35
    WHEN 'RFG445' THEN 40
    WHEN 'FLS100' THEN 50
    WHEN 'FLS120' THEN 55
    WHEN 'VNT100' THEN 60
    WHEN 'VNT110' THEN 65
    WHEN 'DSP800' THEN 90
    WHEN 'PRM900' THEN 100
    ELSE 70
  END,
  CASE
    WHEN li.category = 'tear_off' THEN 'Tear-Off'
    WHEN li.category = 'underlayment' THEN 'Underlayment'
    WHEN li.category = 'shingles' THEN 'Shingles'
    WHEN li.category = 'flashing' THEN 'Flashing'
    WHEN li.category = 'ventilation' THEN 'Ventilation'
    WHEN li.category = 'disposal' THEN 'Disposal'
    WHEN li.category = 'permits' THEN 'Permits'
    ELSE 'Other'
  END
FROM estimate_macros m
CROSS JOIN line_items li
WHERE m.name = 'Full Replacement - 3-Tab'
  AND li.item_code IN ('RFG100', 'RFG220', 'RFG410', 'RFG440', 'RFG445', 'FLS100', 'FLS120', 'VNT100', 'VNT110', 'DSP800', 'PRM900');

-- Full Replacement - Premium/Designer
INSERT INTO estimate_macros (name, description, roof_type, job_type, is_default, is_system, tags) VALUES
('Full Replacement - Premium', 'Complete tear-off and replacement with luxury designer shingles. Premium option with extended warranty and enhanced aesthetics.', 'asphalt_shingle', 'full_replacement', false, true, ARRAY['premium', 'designer', 'luxury', 'residential']);

INSERT INTO macro_line_items (macro_id, line_item_id, quantity_formula, waste_factor, is_optional, is_selected_by_default, sort_order, group_name)
SELECT
  m.id,
  li.id,
  CASE li.item_code
    WHEN 'RFG100' THEN 'SQ'
    WHEN 'RFG241' THEN 'SQ'
    WHEN 'RFG251' THEN 'EAVE*3/100'
    WHEN 'RFG430' THEN 'SQ'
    WHEN 'RFG440' THEN 'EAVE+RAKE'
    WHEN 'RFG446' THEN 'R+HIP'
    WHEN 'FLS101' THEN 'EAVE+RAKE'
    WHEN 'FLS120' THEN 'VAL'
    WHEN 'VNT102' THEN 'R'
    WHEN 'VNT110' THEN 'PIPE_COUNT'
    WHEN 'DSP800' THEN 'SQ'
    ELSE li.quantity_formula
  END,
  CASE
    WHEN li.category IN ('shingles', 'underlayment') THEN 1.10
    WHEN li.category = 'flashing' THEN 1.05
    ELSE 1.00
  END,
  CASE li.item_code WHEN 'PRM900' THEN true ELSE false END,
  true,
  CASE li.item_code
    WHEN 'RFG100' THEN 10
    WHEN 'RFG241' THEN 20
    WHEN 'RFG251' THEN 25
    WHEN 'RFG430' THEN 30
    WHEN 'RFG440' THEN 35
    WHEN 'RFG446' THEN 40
    WHEN 'FLS101' THEN 50
    WHEN 'FLS120' THEN 55
    WHEN 'VNT102' THEN 60
    WHEN 'VNT110' THEN 65
    WHEN 'DSP800' THEN 90
    WHEN 'PRM900' THEN 100
    ELSE 70
  END,
  CASE
    WHEN li.category = 'tear_off' THEN 'Tear-Off'
    WHEN li.category = 'underlayment' THEN 'Underlayment'
    WHEN li.category = 'shingles' THEN 'Shingles'
    WHEN li.category = 'flashing' THEN 'Flashing'
    WHEN li.category = 'ventilation' THEN 'Ventilation'
    WHEN li.category = 'disposal' THEN 'Disposal'
    WHEN li.category = 'permits' THEN 'Permits'
    ELSE 'Other'
  END
FROM estimate_macros m
CROSS JOIN line_items li
WHERE m.name = 'Full Replacement - Premium'
  AND li.item_code IN ('RFG100', 'RFG241', 'RFG251', 'RFG430', 'RFG440', 'RFG446', 'FLS101', 'FLS120', 'VNT102', 'VNT110', 'DSP800', 'PRM900');

-- Full Replacement - Metal Standing Seam
INSERT INTO estimate_macros (name, description, roof_type, job_type, is_default, is_system, tags) VALUES
('Full Replacement - Metal Standing Seam', 'Complete tear-off and replacement with standing seam metal roofing. Premium option with 40+ year lifespan.', 'metal_standing_seam', 'full_replacement', false, true, ARRAY['metal', 'standing seam', 'premium', 'durable']);

INSERT INTO macro_line_items (macro_id, line_item_id, quantity_formula, waste_factor, is_optional, is_selected_by_default, sort_order, group_name)
SELECT
  m.id,
  li.id,
  CASE li.item_code
    WHEN 'RFG100' THEN 'SQ'
    WHEN 'RFG241' THEN 'SQ'
    WHEN 'MTL500' THEN 'SQ'
    WHEN 'MTL550' THEN 'R'
    WHEN 'MTL551' THEN 'EAVE+RAKE'
    WHEN 'MTL552' THEN 'VAL'
    WHEN 'VNT110' THEN 'PIPE_COUNT'
    WHEN 'DSP802' THEN 'SQ'
    ELSE li.quantity_formula
  END,
  CASE
    WHEN li.category = 'metal_roofing' THEN 1.08
    WHEN li.category = 'underlayment' THEN 1.10
    ELSE 1.00
  END,
  CASE li.item_code WHEN 'PRM900' THEN true ELSE false END,
  true,
  CASE li.item_code
    WHEN 'RFG100' THEN 10
    WHEN 'RFG241' THEN 20
    WHEN 'MTL500' THEN 30
    WHEN 'MTL550' THEN 40
    WHEN 'MTL551' THEN 45
    WHEN 'MTL552' THEN 50
    WHEN 'VNT110' THEN 60
    WHEN 'DSP802' THEN 90
    WHEN 'PRM900' THEN 100
    ELSE 70
  END,
  CASE
    WHEN li.category = 'tear_off' THEN 'Tear-Off'
    WHEN li.category = 'underlayment' THEN 'Underlayment'
    WHEN li.category = 'metal_roofing' THEN 'Metal Roofing'
    WHEN li.category = 'ventilation' THEN 'Ventilation'
    WHEN li.category = 'disposal' THEN 'Disposal'
    WHEN li.category = 'permits' THEN 'Permits'
    ELSE 'Other'
  END
FROM estimate_macros m
CROSS JOIN line_items li
WHERE m.name = 'Full Replacement - Metal Standing Seam'
  AND li.item_code IN ('RFG100', 'RFG241', 'MTL500', 'MTL550', 'MTL551', 'MTL552', 'VNT110', 'DSP802', 'PRM900');

-- =============================================================================
-- REPAIR MACROS
-- =============================================================================

-- Repair - Shingle Patch
INSERT INTO estimate_macros (name, description, roof_type, job_type, is_default, is_system, tags) VALUES
('Repair - Shingle Patch', 'Patch repair for damaged or missing shingles. Includes matching shingles and necessary flashing repair.', 'asphalt_shingle', 'repair', false, true, ARRAY['repair', 'patch', 'shingles', 'minor']);

INSERT INTO macro_line_items (macro_id, line_item_id, quantity_formula, waste_factor, is_optional, is_selected_by_default, sort_order, group_name)
SELECT
  m.id,
  li.id,
  NULL,
  1.00,
  CASE li.item_code
    WHEN 'FLS143' THEN true
    WHEN 'MSC911' THEN true
    ELSE false
  END,
  true,
  CASE li.item_code
    WHEN 'RFG110' THEN 10
    WHEN 'RFG420' THEN 20
    WHEN 'FLS143' THEN 30
    WHEN 'MSC911' THEN 40
    ELSE 50
  END,
  CASE
    WHEN li.category = 'tear_off' THEN 'Tear-Off'
    WHEN li.category = 'shingles' THEN 'Shingles'
    WHEN li.category = 'flashing' THEN 'Flashing'
    WHEN li.category = 'miscellaneous' THEN 'Miscellaneous'
    ELSE 'Other'
  END
FROM estimate_macros m
CROSS JOIN line_items li
WHERE m.name = 'Repair - Shingle Patch'
  AND li.item_code IN ('RFG110', 'RFG420', 'FLS143', 'MSC911');

-- Repair - Leak Repair
INSERT INTO estimate_macros (name, description, roof_type, job_type, is_default, is_system, tags) VALUES
('Repair - Leak', 'Comprehensive leak repair including inspection, flashing repair, and sealing.', 'any', 'repair', false, true, ARRAY['repair', 'leak', 'flashing', 'urgent']);

INSERT INTO macro_line_items (macro_id, line_item_id, quantity_formula, waste_factor, is_optional, is_selected_by_default, sort_order, group_name)
SELECT
  m.id,
  li.id,
  NULL,
  1.00,
  CASE li.item_code
    WHEN 'RFG110' THEN true
    WHEN 'RFG420' THEN true
    WHEN 'DCK510' THEN true
    ELSE false
  END,
  CASE li.item_code
    WHEN 'DCK510' THEN false
    ELSE true
  END,
  CASE li.item_code
    WHEN 'RFG110' THEN 10
    WHEN 'FLS140' THEN 20
    WHEN 'FLS143' THEN 25
    WHEN 'MSC911' THEN 30
    WHEN 'MSC912' THEN 35
    WHEN 'RFG420' THEN 40
    WHEN 'DCK510' THEN 50
    ELSE 60
  END,
  CASE
    WHEN li.category = 'tear_off' THEN 'Tear-Off'
    WHEN li.category = 'flashing' THEN 'Flashing'
    WHEN li.category = 'shingles' THEN 'Shingles'
    WHEN li.category = 'decking' THEN 'Decking'
    WHEN li.category = 'miscellaneous' THEN 'Sealants'
    ELSE 'Other'
  END
FROM estimate_macros m
CROSS JOIN line_items li
WHERE m.name = 'Repair - Leak'
  AND li.item_code IN ('RFG110', 'FLS140', 'FLS143', 'MSC911', 'MSC912', 'RFG420', 'DCK510');

-- =============================================================================
-- STORM DAMAGE / INSURANCE MACROS
-- =============================================================================

-- Storm Damage - Insurance Claim
INSERT INTO estimate_macros (name, description, roof_type, job_type, is_default, is_system, tags) VALUES
('Storm Damage - Insurance', 'Complete storm damage repair with detailed line items formatted for insurance claims. Includes documentation support.', 'asphalt_shingle', 'insurance_claim', false, true, ARRAY['storm', 'insurance', 'hail', 'wind', 'claim']);

INSERT INTO macro_line_items (macro_id, line_item_id, quantity_formula, waste_factor, is_optional, is_selected_by_default, sort_order, group_name)
SELECT
  m.id,
  li.id,
  CASE li.item_code
    WHEN 'RFG100' THEN 'SQ'
    WHEN 'RFG240' THEN 'SQ'
    WHEN 'RFG250' THEN 'EAVE*3/100'
    WHEN 'RFG431' THEN 'SQ'
    WHEN 'RFG440' THEN 'EAVE+RAKE'
    WHEN 'RFG446' THEN 'R+HIP'
    WHEN 'FLS100' THEN 'EAVE+RAKE'
    WHEN 'FLS120' THEN 'VAL'
    WHEN 'VNT100' THEN 'R'
    WHEN 'VNT110' THEN 'PIPE_COUNT'
    WHEN 'DSP800' THEN 'SQ'
    ELSE li.quantity_formula
  END,
  CASE
    WHEN li.category IN ('shingles', 'underlayment') THEN 1.10
    WHEN li.category = 'flashing' THEN 1.05
    ELSE 1.00
  END,
  CASE li.item_code
    WHEN 'PRM900' THEN true
    WHEN 'GTR200' THEN true
    WHEN 'SKY300' THEN true
    WHEN 'CHM400' THEN true
    ELSE false
  END,
  CASE li.item_code
    WHEN 'GTR200' THEN false
    WHEN 'SKY300' THEN false
    WHEN 'CHM400' THEN false
    ELSE true
  END,
  CASE li.item_code
    WHEN 'RFG100' THEN 10
    WHEN 'RFG240' THEN 20
    WHEN 'RFG250' THEN 25
    WHEN 'RFG431' THEN 30
    WHEN 'RFG440' THEN 35
    WHEN 'RFG446' THEN 40
    WHEN 'FLS100' THEN 50
    WHEN 'FLS120' THEN 55
    WHEN 'VNT100' THEN 60
    WHEN 'VNT110' THEN 65
    WHEN 'GTR200' THEN 70
    WHEN 'SKY300' THEN 75
    WHEN 'CHM400' THEN 80
    WHEN 'DSP800' THEN 90
    WHEN 'PRM900' THEN 100
    ELSE 85
  END,
  CASE
    WHEN li.category = 'tear_off' THEN 'Tear-Off'
    WHEN li.category = 'underlayment' THEN 'Underlayment'
    WHEN li.category = 'shingles' THEN 'Shingles'
    WHEN li.category = 'flashing' THEN 'Flashing'
    WHEN li.category = 'ventilation' THEN 'Ventilation'
    WHEN li.category = 'gutters' THEN 'Gutters'
    WHEN li.category = 'skylights' THEN 'Skylights'
    WHEN li.category = 'chimneys' THEN 'Chimneys'
    WHEN li.category = 'disposal' THEN 'Disposal'
    WHEN li.category = 'permits' THEN 'Permits'
    ELSE 'Other'
  END
FROM estimate_macros m
CROSS JOIN line_items li
WHERE m.name = 'Storm Damage - Insurance'
  AND li.item_code IN ('RFG100', 'RFG240', 'RFG250', 'RFG431', 'RFG440', 'RFG446', 'FLS100', 'FLS120', 'VNT100', 'VNT110', 'GTR200', 'SKY300', 'CHM400', 'DSP800', 'PRM900');

-- =============================================================================
-- GUTTER MACROS
-- =============================================================================

-- Gutter Replacement
INSERT INTO estimate_macros (name, description, roof_type, job_type, is_default, is_system, tags) VALUES
('Gutter Replacement', 'Complete gutter system replacement including gutters, downspouts, and hardware.', 'any', 'gutter_only', false, true, ARRAY['gutters', 'downspouts', 'drainage']);

INSERT INTO macro_line_items (macro_id, line_item_id, quantity_formula, waste_factor, is_optional, is_selected_by_default, sort_order, group_name)
SELECT
  m.id,
  li.id,
  CASE li.item_code
    WHEN 'GTR200' THEN 'GUTTER_LF'
    WHEN 'GTR210' THEN 'DS_COUNT*10'
    WHEN 'GTR222' THEN 'GUTTER_LF/2'
    WHEN 'GTR223' THEN 'DS_COUNT*2+4'
    WHEN 'GTR224' THEN 'DS_COUNT*2'
    ELSE li.quantity_formula
  END,
  1.00,
  CASE li.item_code
    WHEN 'GTR220' THEN true
    ELSE false
  END,
  CASE li.item_code
    WHEN 'GTR220' THEN false
    ELSE true
  END,
  CASE li.item_code
    WHEN 'GTR200' THEN 10
    WHEN 'GTR210' THEN 20
    WHEN 'GTR222' THEN 30
    WHEN 'GTR223' THEN 40
    WHEN 'GTR224' THEN 50
    WHEN 'GTR220' THEN 60
    ELSE 70
  END,
  CASE
    WHEN li.item_code IN ('GTR200', 'GTR201', 'GTR202', 'GTR203') THEN 'Gutters'
    WHEN li.item_code IN ('GTR210', 'GTR211', 'GTR212') THEN 'Downspouts'
    WHEN li.item_code IN ('GTR220', 'GTR221') THEN 'Guards'
    ELSE 'Hardware'
  END
FROM estimate_macros m
CROSS JOIN line_items li
WHERE m.name = 'Gutter Replacement'
  AND li.item_code IN ('GTR200', 'GTR210', 'GTR222', 'GTR223', 'GTR224', 'GTR220');

-- =============================================================================
-- SPECIALTY MACROS
-- =============================================================================

-- Skylight Add-On
INSERT INTO estimate_macros (name, description, roof_type, job_type, is_default, is_system, tags) VALUES
('Skylight - Reflash', 'Skylight reflashing during roof replacement. Add to any replacement macro.', 'any', 'any', false, true, ARRAY['skylight', 'add-on', 'flashing']);

INSERT INTO macro_line_items (macro_id, line_item_id, quantity_formula, waste_factor, is_optional, is_selected_by_default, sort_order, group_name)
SELECT
  m.id,
  li.id,
  CASE li.item_code
    WHEN 'SKY300' THEN 'SKYLIGHT_COUNT'
    ELSE NULL
  END,
  1.00,
  false,
  true,
  CASE li.item_code
    WHEN 'SKY300' THEN 10
    WHEN 'RFG250' THEN 20
    ELSE 30
  END,
  'Skylight'
FROM estimate_macros m
CROSS JOIN line_items li
WHERE m.name = 'Skylight - Reflash'
  AND li.item_code IN ('SKY300', 'RFG250');

-- Chimney Add-On
INSERT INTO estimate_macros (name, description, roof_type, job_type, is_default, is_system, tags) VALUES
('Chimney - Reflash', 'Chimney reflashing during roof replacement. Add to any replacement macro.', 'any', 'any', false, true, ARRAY['chimney', 'add-on', 'flashing']);

INSERT INTO macro_line_items (macro_id, line_item_id, quantity_formula, waste_factor, is_optional, is_selected_by_default, sort_order, group_name)
SELECT
  m.id,
  li.id,
  CASE li.item_code
    WHEN 'CHM400' THEN 'CHIMNEY_COUNT'
    ELSE NULL
  END,
  1.00,
  CASE li.item_code WHEN 'CHM402' THEN true ELSE false END,
  CASE li.item_code WHEN 'CHM402' THEN false ELSE true END,
  CASE li.item_code
    WHEN 'CHM400' THEN 10
    WHEN 'CHM402' THEN 20
    ELSE 30
  END,
  'Chimney'
FROM estimate_macros m
CROSS JOIN line_items li
WHERE m.name = 'Chimney - Reflash'
  AND li.item_code IN ('CHM400', 'CHM402');

-- =============================================================================
-- OVERLAY MACRO (No Tear-Off)
-- =============================================================================

INSERT INTO estimate_macros (name, description, roof_type, job_type, is_default, is_system, tags) VALUES
('Overlay - Laminate', 'Install new laminate shingles over existing single layer. Cost-effective option when tear-off is not required.', 'asphalt_shingle', 'overlay', false, true, ARRAY['overlay', 'layover', 'no-tearoff', 'budget']);

INSERT INTO macro_line_items (macro_id, line_item_id, quantity_formula, waste_factor, is_optional, is_selected_by_default, sort_order, group_name)
SELECT
  m.id,
  li.id,
  CASE li.item_code
    WHEN 'RFG420' THEN 'SQ'
    WHEN 'RFG440' THEN 'EAVE+RAKE'
    WHEN 'RFG446' THEN 'R+HIP'
    WHEN 'FLS100' THEN 'EAVE+RAKE'
    WHEN 'VNT100' THEN 'R'
    WHEN 'VNT110' THEN 'PIPE_COUNT'
    ELSE li.quantity_formula
  END,
  CASE
    WHEN li.category = 'shingles' THEN 1.10
    WHEN li.category = 'flashing' THEN 1.05
    ELSE 1.00
  END,
  CASE li.item_code WHEN 'PRM900' THEN true ELSE false END,
  true,
  CASE li.item_code
    WHEN 'RFG420' THEN 10
    WHEN 'RFG440' THEN 20
    WHEN 'RFG446' THEN 30
    WHEN 'FLS100' THEN 40
    WHEN 'VNT100' THEN 50
    WHEN 'VNT110' THEN 60
    WHEN 'PRM900' THEN 100
    ELSE 70
  END,
  CASE
    WHEN li.category = 'shingles' THEN 'Shingles'
    WHEN li.category = 'flashing' THEN 'Flashing'
    WHEN li.category = 'ventilation' THEN 'Ventilation'
    WHEN li.category = 'permits' THEN 'Permits'
    ELSE 'Other'
  END
FROM estimate_macros m
CROSS JOIN line_items li
WHERE m.name = 'Overlay - Laminate'
  AND li.item_code IN ('RFG420', 'RFG440', 'RFG446', 'FLS100', 'VNT100', 'VNT110', 'PRM900');

-- =============================================================================
-- FLAT ROOF MACRO
-- =============================================================================

INSERT INTO estimate_macros (name, description, roof_type, job_type, is_default, is_system, tags) VALUES
('Full Replacement - Flat TPO', 'Complete flat roof replacement with TPO membrane. Commercial-grade waterproofing system.', 'flat_tpo', 'full_replacement', false, true, ARRAY['flat', 'tpo', 'commercial', 'membrane']);

-- Note: Flat roofing line items would need to be added to line_items table
-- This is a placeholder showing the structure

-- =============================================================================
-- UPDATE USAGE COUNT FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_macro_usage(p_macro_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE estimate_macros
  SET
    usage_count = usage_count + 1,
    last_used_at = now()
  WHERE id = p_macro_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE estimate_macros IS 'Pre-built line item templates for common roofing scenarios';
COMMENT ON TABLE macro_line_items IS 'Line items included in each macro with quantity formulas';
