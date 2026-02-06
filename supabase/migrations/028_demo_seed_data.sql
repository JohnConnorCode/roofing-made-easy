-- =============================================================================
-- Migration: 028_demo_seed_data.sql
-- Purpose: Clean up sparse test data and seed 12 realistic demo leads with
--          full pipeline data for live testing and demos
-- =============================================================================

-- =============================================================================
-- STEP 0: Clean up existing sparse test leads
-- ON DELETE CASCADE handles contacts, properties, intakes, estimates, activities
-- =============================================================================
DELETE FROM leads WHERE id IN (
  '11a3d38d-4786-4a37-ba1d-8486f94d5af5',
  'cf52529f-02f1-451a-80fb-3e9ebd1f4ef6',
  '8d04ecbe-7257-44d8-a07b-646b41c293e3',
  '48070028-cc2a-4067-8279-01e19e87a836',
  '0604f81d-cc8e-4238-a2f7-4b0658e2854a',
  'ffb309d2-62f8-4330-8994-a4a8d1a45888',
  '15f66a6e-dd19-478d-a56c-1da647ca93b6'
);

-- =============================================================================
-- FIXED UUIDs for cross-referencing
-- =============================================================================
-- Lead UUIDs
-- Lead 1:  d0000001-0000-0000-0000-000000000001
-- Lead 2:  d0000002-0000-0000-0000-000000000002
-- Lead 3:  d0000003-0000-0000-0000-000000000003
-- Lead 4:  d0000004-0000-0000-0000-000000000004
-- Lead 5:  d0000005-0000-0000-0000-000000000005
-- Lead 6:  d0000006-0000-0000-0000-000000000006
-- Lead 7:  d0000007-0000-0000-0000-000000000007
-- Lead 8:  d0000008-0000-0000-0000-000000000008
-- Lead 9:  d0000009-0000-0000-0000-000000000009
-- Lead 10: d000000a-0000-0000-0000-00000000000a
-- Lead 11: d000000b-0000-0000-0000-00000000000b
-- Lead 12: d000000c-0000-0000-0000-00000000000c

-- Estimate UUIDs (basic estimates table)
-- Est 1:  e0000001-0000-0000-0000-000000000001
-- Est 2:  e0000002-0000-0000-0000-000000000002
-- Est 4:  e0000004-0000-0000-0000-000000000004
-- Est 6:  e0000006-0000-0000-0000-000000000006
-- Est 7:  e0000007-0000-0000-0000-000000000007
-- Est 9:  e0000009-0000-0000-0000-000000000009
-- Est 11: e000000b-0000-0000-0000-00000000000b
-- Est 12: e000000c-0000-0000-0000-00000000000c

-- Detailed Estimate UUIDs
-- DE 1:   de000001-0000-0000-0000-000000000001
-- DE 2:   de000002-0000-0000-0000-000000000002
-- DE 4:   de000004-0000-0000-0000-000000000004

-- =============================================================================
-- STEP 1: INSERT LEADS
-- =============================================================================

INSERT INTO leads (id, status, source, created_at) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'won',                    'web_funnel', NOW() - INTERVAL '45 days'),
  ('d0000002-0000-0000-0000-000000000002', 'estimate_sent',          'web_funnel', NOW() - INTERVAL '12 days'),
  ('d0000003-0000-0000-0000-000000000003', 'intake_complete',        'web_funnel', NOW() - INTERVAL '3 days'),
  ('d0000004-0000-0000-0000-000000000004', 'consultation_scheduled', 'web_funnel', NOW() - INTERVAL '8 days'),
  ('d0000005-0000-0000-0000-000000000005', 'new',                    'web_funnel', NOW() - INTERVAL '1 day'),
  ('d0000006-0000-0000-0000-000000000006', 'won',                    'referral',   NOW() - INTERVAL '30 days'),
  ('d0000007-0000-0000-0000-000000000007', 'estimate_sent',          'web_funnel', NOW() - INTERVAL '5 days'),
  ('d0000008-0000-0000-0000-000000000008', 'intake_started',         'web_funnel', NOW() - INTERVAL '2 days'),
  ('d0000009-0000-0000-0000-000000000009', 'lost',                   'web_funnel', NOW() - INTERVAL '20 days'),
  ('d000000a-0000-0000-0000-00000000000a', 'new',                    'web_funnel', NOW() - INTERVAL '6 hours'),
  ('d000000b-0000-0000-0000-00000000000b', 'estimate_generated',     'web_funnel', NOW() - INTERVAL '4 days'),
  ('d000000c-0000-0000-0000-00000000000c', 'archived',               'web_funnel', NOW() - INTERVAL '60 days');

-- =============================================================================
-- STEP 2: INSERT CONTACTS
-- =============================================================================

INSERT INTO contacts (lead_id, first_name, last_name, email, phone, preferred_contact_method, consent_marketing, consent_sms, consent_terms) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'Sarah',    'Johnson',   'sarah.johnson@email.com',     '(662) 555-0187', 'email', true,  true,  true),
  ('d0000002-0000-0000-0000-000000000002', 'Marcus',   'Williams',  'marcus.w@email.com',          '(662) 555-0234', 'phone', true,  true,  true),
  ('d0000003-0000-0000-0000-000000000003', 'Jennifer', 'Chen',      'jen.chen@email.com',          '(662) 555-0312', 'email', false, false, true),
  ('d0000004-0000-0000-0000-000000000004', 'Robert',   'Davis',     'rdavis@email.com',            '(662) 555-0456', 'phone', true,  true,  true),
  ('d0000005-0000-0000-0000-000000000005', 'Tommy',    'Patterson', 'tpatterson@email.com',        '(662) 555-0589', 'phone', false, false, true),
  ('d0000006-0000-0000-0000-000000000006', 'Angela',   'Martinez',  'angela.martinez@email.com',   '(662) 555-0623', 'email', true,  true,  true),
  ('d0000007-0000-0000-0000-000000000007', 'David',    'Thompson',  'dthompson@email.com',         '(662) 555-0701', 'phone', false, false, true),
  ('d0000008-0000-0000-0000-000000000008', 'Karen',    'Mitchell',  'karen.m@email.com',           '(662) 555-0845', 'email', false, false, true),
  ('d0000009-0000-0000-0000-000000000009', 'James',    'Walker',    'jwalker@email.com',           '(662) 555-0912', 'phone', false, false, true),
  ('d000000a-0000-0000-0000-00000000000a', 'Maria',    'Gonzalez',  'maria.g@email.com',           '(662) 555-1034', 'phone', false, false, true),
  ('d000000b-0000-0000-0000-00000000000b', 'Chris',    'Bennett',   'cbennett@email.com',          '(662) 555-1108', 'email', false, false, true),
  ('d000000c-0000-0000-0000-00000000000c', 'Patricia', 'Young',     'pyoung@email.com',            '(662) 555-1245', 'phone', false, false, true);

-- =============================================================================
-- STEP 3: INSERT PROPERTIES
-- =============================================================================

INSERT INTO properties (lead_id, street_address, city, state, zip_code, county, formatted_address, in_service_area) VALUES
  ('d0000001-0000-0000-0000-000000000001', '245 Oak Ridge Dr',     'Tupelo',    'MS', '38801', 'Lee',      '245 Oak Ridge Dr, Tupelo, MS 38801',     true),
  ('d0000002-0000-0000-0000-000000000002', '1820 Main St',         'Saltillo',  'MS', '38866', 'Lee',      '1820 Main St, Saltillo, MS 38866',       true),
  ('d0000003-0000-0000-0000-000000000003', '407 Magnolia Ln',      'Pontotoc',  'MS', '38863', 'Pontotoc', '407 Magnolia Ln, Pontotoc, MS 38863',    true),
  ('d0000004-0000-0000-0000-000000000004', '932 Church St',        'Tupelo',    'MS', '38804', 'Lee',      '932 Church St, Tupelo, MS 38804',        true),
  ('d0000005-0000-0000-0000-000000000005', '118 County Rd 1450',   'Mooreville','MS', '38857', 'Lee',      '118 County Rd 1450, Mooreville, MS 38857', true),
  ('d0000006-0000-0000-0000-000000000006', '512 Jefferson Ave',    'Tupelo',    'MS', '38801', 'Lee',      '512 Jefferson Ave, Tupelo, MS 38801',    true),
  ('d0000007-0000-0000-0000-000000000007', '88 Hickory Hill Rd',   'Verona',    'MS', '38879', 'Lee',      '88 Hickory Hill Rd, Verona, MS 38879',   true),
  ('d0000008-0000-0000-0000-000000000008', '1205 Veterans Blvd',   'Saltillo',  'MS', '38866', 'Lee',      '1205 Veterans Blvd, Saltillo, MS 38866', true),
  ('d0000009-0000-0000-0000-000000000009', '340 Cedar Creek Dr',   'Pontotoc',  'MS', '38863', 'Pontotoc', '340 Cedar Creek Dr, Pontotoc, MS 38863', true),
  ('d000000a-0000-0000-0000-00000000000a', '77 Lawndale Dr',       'Tupelo',    'MS', '38801', 'Lee',      '77 Lawndale Dr, Tupelo, MS 38801',       true),
  ('d000000b-0000-0000-0000-00000000000b', '2210 Hwy 45 N',       'Belden',    'MS', '38826', 'Lee',      '2210 Hwy 45 N, Belden, MS 38826',       true),
  ('d000000c-0000-0000-0000-00000000000c', '603 S Green St',       'Tupelo',    'MS', '38801', 'Lee',      '603 S Green St, Tupelo, MS 38801',       true);

-- =============================================================================
-- STEP 4: INSERT INTAKES
-- =============================================================================

INSERT INTO intakes (lead_id, job_type, roof_material, roof_age_years, roof_size_sqft, stories, roof_pitch, has_skylights, has_chimneys, has_solar_panels, issues, timeline_urgency, has_insurance_claim, insurance_company, additional_notes) VALUES
  -- Lead 1: Sarah Johnson - Full replacement, complete intake
  ('d0000001-0000-0000-0000-000000000001', 'full_replacement', 'asphalt_shingle', 22, 2200, 2, 'medium', true,  false, false, '["curling_shingles","granule_loss"]'::jsonb, 'within_month',    true,  'State Farm', 'Hail damage from April storm. Multiple missing shingles on south face.'),
  -- Lead 2: Marcus Williams - Full replacement, large home
  ('d0000002-0000-0000-0000-000000000002', 'full_replacement', 'asphalt_shingle', 18, 2800, 1, 'low',    false, true,  false, '["aging","moss_growth"]'::jsonb,              'within_3_months', false, NULL,         'Ranch style home, easy access. Interested in upgrading to premium shingles.'),
  -- Lead 3: Jennifer Chen - Repair with insurance
  ('d0000003-0000-0000-0000-000000000003', 'repair',           'asphalt_shingle', 12, 1600, 1, 'medium', false, false, false, '["leak","missing_shingles"]'::jsonb,          'asap',            true,  'Allstate',   'Active leak in master bedroom. Visible water stains on ceiling.'),
  -- Lead 4: Robert Davis - Full replacement, large/complex
  ('d0000004-0000-0000-0000-000000000004', 'full_replacement', 'asphalt_shingle', 25, 3200, 2, 'steep',  true,  true,  false, '["storm_damage","missing_shingles","leak"]'::jsonb, 'asap',    true,  'Nationwide', 'Significant wind damage from recent storms. Insurance adjuster has visited.'),
  -- Lead 5: Tommy Patterson - Inspection only, minimal data
  ('d0000005-0000-0000-0000-000000000005', 'inspection',       'unknown',         NULL, NULL, 1, 'unknown', false, false, false, '[]'::jsonb,                                  'flexible',        false, NULL,         NULL),
  -- Lead 6: Angela Martinez - Full replacement, metal
  ('d0000006-0000-0000-0000-000000000006', 'full_replacement', 'metal',           15, 1800, 1, 'low',    false, false, true,  '["rust","fading"]'::jsonb,                    'within_month',    false, NULL,         'Interested in upgrading from asphalt to standing seam metal. Has existing solar panels that need to be removed and reinstalled.'),
  -- Lead 7: David Thompson - Repair
  ('d0000007-0000-0000-0000-000000000007', 'repair',           'asphalt_shingle', 10, 2400, 1, 'medium', false, false, false, '["leak","missing_shingles"]'::jsonb,          'asap',            false, NULL,         'Leak around chimney area. Several missing shingles on the north side.'),
  -- Lead 8: Karen Mitchell - Abandoned intake (minimal)
  ('d0000008-0000-0000-0000-000000000008', 'full_replacement', NULL,              NULL, NULL, NULL, NULL, false, false, false, '[]'::jsonb,                                   NULL,              false, NULL,         NULL),
  -- Lead 9: James Walker - Full replacement, rejected
  ('d0000009-0000-0000-0000-000000000009', 'full_replacement', 'asphalt_shingle', 20, 2600, 2, 'steep',  false, false, false, '["curling_shingles","aging"]'::jsonb,          'within_3_months', false, NULL,         'Looking for quotes from multiple contractors.'),
  -- Lead 10: Maria Gonzalez - Gutter job
  ('d000000a-0000-0000-0000-00000000000a', 'gutter',           NULL,              NULL, NULL, 1, NULL,    false, false, false, '[]'::jsonb,                                   'flexible',        false, NULL,         'Need new gutters and downspouts all around the house.'),
  -- Lead 11: Chris Bennett - Maintenance
  ('d000000b-0000-0000-0000-00000000000b', 'maintenance',      'asphalt_shingle', 8,  1400, 1, 'low',    false, false, false, '["minor_wear"]'::jsonb,                       'within_3_months', false, NULL,         'Annual maintenance check. A few loose shingles noticed after last storm.'),
  -- Lead 12: Patricia Young - Repair, archived
  ('d000000c-0000-0000-0000-00000000000c', 'repair',           'asphalt_shingle', 14, 2000, 1, 'medium', false, false, false, '["leak","flashing_damage"]'::jsonb,            'just_exploring',  false, NULL,         'Small leak near vent pipe. Just getting prices for now.');

-- =============================================================================
-- STEP 5: INSERT BASIC ESTIMATES (estimates table)
-- Note: Triggers will auto-create lead_activities for estimate_generated
-- =============================================================================

INSERT INTO estimates (id, lead_id, price_low, price_likely, price_high, base_cost, material_cost, labor_cost, input_snapshot, pricing_rules_snapshot, ai_explanation, ai_explanation_status, valid_until, status, estimate_status, sent_at, view_count, viewed_at, accepted_at, created_at) VALUES
  -- Lead 1: Sarah Johnson - Accepted estimate
  ('e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
   11800.00, 14200.00, 17100.00, 8500.00, 5200.00, 6800.00,
   '{"sqft": 2200, "stories": 2, "pitch": "medium", "material": "asphalt_shingle", "job_type": "full_replacement"}'::jsonb,
   '{"base_rate": 3.85, "material_multiplier": 1.0, "labor_multiplier": 1.0}'::jsonb,
   'Your 2,200 sq ft asphalt shingle roof replacement estimate includes premium laminate shingles, synthetic underlayment, and new flashing. The price accounts for 2-story height charges and skylight reflashing. This is competitive pricing for the Tupelo area.',
   'success', NOW() + INTERVAL '30 days', 'accepted', 'accepted', NOW() - INTERVAL '40 days', 3, NOW() - INTERVAL '38 days', NOW() - INTERVAL '35 days', NOW() - INTERVAL '42 days'),

  -- Lead 2: Marcus Williams - Sent estimate
  ('e0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002',
   15500.00, 18750.00, 22300.00, 11200.00, 6800.00, 8500.00,
   '{"sqft": 2800, "stories": 1, "pitch": "low", "material": "asphalt_shingle", "job_type": "full_replacement"}'::jsonb,
   '{"base_rate": 4.20, "material_multiplier": 1.0, "labor_multiplier": 1.0}'::jsonb,
   'Your 2,800 sq ft roof is larger than average, which helps with per-square-foot pricing efficiency. The low pitch makes for straightforward installation. We recommend premium laminate shingles for the best value and longevity. Chimney reflashing is included.',
   'success', NOW() + INTERVAL '30 days', 'sent', 'sent', NOW() - INTERVAL '10 days', 1, NOW() - INTERVAL '9 days', NULL, NOW() - INTERVAL '11 days'),

  -- Lead 4: Robert Davis - Sent estimate
  ('e0000004-0000-0000-0000-000000000004', 'd0000004-0000-0000-0000-000000000004',
   18500.00, 22400.00, 26800.00, 13500.00, 8200.00, 10500.00,
   '{"sqft": 3200, "stories": 2, "pitch": "steep", "material": "asphalt_shingle", "job_type": "full_replacement"}'::jsonb,
   '{"base_rate": 4.50, "material_multiplier": 1.0, "labor_multiplier": 1.15}'::jsonb,
   'Your 3,200 sq ft roof replacement includes steep pitch and 2-story height surcharges. The estimate accounts for skylight and chimney reflashing. With active insurance, your out-of-pocket cost may be significantly lower after the claim is processed.',
   'success', NOW() + INTERVAL '30 days', 'sent', 'sent', NOW() - INTERVAL '6 days', 2, NOW() - INTERVAL '5 days', NULL, NOW() - INTERVAL '7 days'),

  -- Lead 6: Angela Martinez - Accepted metal estimate
  ('e0000006-0000-0000-0000-000000000006', 'd0000006-0000-0000-0000-000000000006',
   13900.00, 16800.00, 20100.00, 10100.00, 7200.00, 6500.00,
   '{"sqft": 1800, "stories": 1, "pitch": "low", "material": "metal", "job_type": "full_replacement"}'::jsonb,
   '{"base_rate": 5.80, "material_multiplier": 1.0, "labor_multiplier": 1.0}'::jsonb,
   'Your standing seam metal roof estimate for 1,800 sq ft includes solar panel removal and reinstallation coordination. Metal roofing offers 40-50 year lifespan and energy savings. The low pitch and single-story access keep labor costs reasonable.',
   'success', NOW() + INTERVAL '30 days', 'accepted', 'accepted', NOW() - INTERVAL '25 days', 2, NOW() - INTERVAL '26 days', NOW() - INTERVAL '24 days', NOW() - INTERVAL '28 days'),

  -- Lead 7: David Thompson - Sent repair estimate
  ('e0000007-0000-0000-0000-000000000007', 'd0000007-0000-0000-0000-000000000007',
   3400.00, 4200.00, 5100.00, 2500.00, 1200.00, 2100.00,
   '{"sqft": 2400, "stories": 1, "pitch": "medium", "material": "asphalt_shingle", "job_type": "repair"}'::jsonb,
   '{"base_rate": 1.75, "material_multiplier": 1.0, "labor_multiplier": 1.0}'::jsonb,
   'This repair estimate covers leak remediation around the chimney area and replacement of missing shingles on the north face. Includes new step flashing, chimney reflashing, and 1 square of matching shingles.',
   'success', NOW() + INTERVAL '30 days', 'sent', 'sent', NOW() - INTERVAL '4 days', 0, NULL, NULL, NOW() - INTERVAL '4 days'),

  -- Lead 9: James Walker - Rejected estimate
  ('e0000009-0000-0000-0000-000000000009', 'd0000009-0000-0000-0000-000000000009',
   16200.00, 19500.00, 23400.00, 11700.00, 7100.00, 9200.00,
   '{"sqft": 2600, "stories": 2, "pitch": "steep", "material": "asphalt_shingle", "job_type": "full_replacement"}'::jsonb,
   '{"base_rate": 4.70, "material_multiplier": 1.0, "labor_multiplier": 1.15}'::jsonb,
   'Your 2,600 sq ft steep-pitch roof replacement includes height and pitch surcharges typical for 2-story homes. Premium laminate shingles are recommended for the steep pitch to maximize wind resistance.',
   'success', NOW() - INTERVAL '5 days', 'rejected', 'rejected', NOW() - INTERVAL '18 days', 2, NOW() - INTERVAL '17 days', NULL, NOW() - INTERVAL '19 days'),

  -- Lead 11: Chris Bennett - Draft estimate (generated, not sent)
  ('e000000b-0000-0000-0000-00000000000b', 'd000000b-0000-0000-0000-00000000000b',
   700.00, 850.00, 1050.00, 500.00, 250.00, 400.00,
   '{"sqft": 1400, "stories": 1, "pitch": "low", "material": "asphalt_shingle", "job_type": "maintenance"}'::jsonb,
   '{"base_rate": 0.60, "material_multiplier": 1.0, "labor_multiplier": 1.0}'::jsonb,
   'Annual maintenance package for your 1,400 sq ft roof includes inspection, minor repairs, gutter cleaning, and sealant touch-ups. Early maintenance extends roof life by 5-10 years.',
   'success', NOW() + INTERVAL '60 days', 'draft', 'draft', NULL, 0, NULL, NULL, NOW() - INTERVAL '3 days'),

  -- Lead 12: Patricia Young - Expired estimate
  ('e000000c-0000-0000-0000-00000000000c', 'd000000c-0000-0000-0000-00000000000c',
   2600.00, 3200.00, 3900.00, 1900.00, 950.00, 1500.00,
   '{"sqft": 2000, "stories": 1, "pitch": "medium", "material": "asphalt_shingle", "job_type": "repair"}'::jsonb,
   '{"base_rate": 1.60, "material_multiplier": 1.0, "labor_multiplier": 1.0}'::jsonb,
   'Repair estimate covering vent pipe flashing replacement and leak remediation. Includes new pipe boot, sealant, and surrounding shingle repair.',
   'success', NOW() - INTERVAL '30 days', 'expired', 'expired', NOW() - INTERVAL '55 days', 1, NOW() - INTERVAL '54 days', NULL, NOW() - INTERVAL '58 days');

-- Add rejection details to Lead 9
UPDATE estimates SET
  rejection_reason = 'Going with another contractor - they offered a lower price.',
  rejected_at = NOW() - INTERVAL '15 days',
  rejected_by_name = 'James Walker',
  rejected_by_email = 'jwalker@email.com'
WHERE id = 'e0000009-0000-0000-0000-000000000009';

-- =============================================================================
-- STEP 6: INSERT DETAILED ESTIMATES (for leads 1, 2, 4)
-- =============================================================================

INSERT INTO detailed_estimates (id, lead_id, name, version, variables, total_material, total_labor, total_equipment, subtotal, overhead_percent, overhead_amount, profit_percent, profit_amount, tax_percent, tax_amount, taxable_amount, price_low, price_likely, price_high, status, sent_at, accepted_at, valid_until, ai_explanation, source_macro_id, created_at) VALUES
  -- Lead 1: Sarah Johnson - Accepted detailed estimate (Laminate macro)
  ('de000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
   'Full Replacement - Laminate Shingles', 1,
   '{"SQ": 22, "SQFT": 2200, "EAVE_LF": 140, "RIDGE_LF": 55, "VALLEY_LF": 30, "HIP_LF": 20, "RAKE_LF": 60, "STORIES": 2, "PITCH": "6/12", "SKYLIGHTS": 1, "CHIMNEYS": 0}'::jsonb,
   5100.00, 5800.00, 450.00, 11350.00,
   10.00, 1135.00, 15.00, 1872.75, 7.00, 595.00, 8500.00,
   12800.00, 14200.00, 17100.00,
   'accepted', NOW() - INTERVAL '40 days', NOW() - INTERVAL '35 days', NOW() + INTERVAL '30 days',
   'Detailed line-item estimate using laminate shingle package with synthetic underlayment.',
   'f681c91e-4c1c-41d0-b85a-2cba763edc34', -- Laminate macro
   NOW() - INTERVAL '42 days'),

  -- Lead 2: Marcus Williams - Sent detailed estimate (Premium macro)
  ('de000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002',
   'Full Replacement - Premium Shingles', 1,
   '{"SQ": 28, "SQFT": 2800, "EAVE_LF": 180, "RIDGE_LF": 70, "VALLEY_LF": 25, "HIP_LF": 15, "RAKE_LF": 50, "STORIES": 1, "PITCH": "4/12", "SKYLIGHTS": 0, "CHIMNEYS": 1}'::jsonb,
   7200.00, 7500.00, 580.00, 15280.00,
   10.00, 1528.00, 15.00, 2521.20, 7.00, 820.00, 11700.00,
   16900.00, 18750.00, 22300.00,
   'sent', NOW() - INTERVAL '10 days', NULL, NOW() + INTERVAL '30 days',
   'Detailed line-item estimate using premium architectural shingle package.',
   'c5a40a84-eb20-4b09-baf2-e2d603034a77', -- Premium macro
   NOW() - INTERVAL '11 days'),

  -- Lead 4: Robert Davis - Sent detailed estimate (Laminate macro)
  ('de000004-0000-0000-0000-000000000004', 'd0000004-0000-0000-0000-000000000004',
   'Full Replacement - Storm Damage', 1,
   '{"SQ": 32, "SQFT": 3200, "EAVE_LF": 190, "RIDGE_LF": 80, "VALLEY_LF": 45, "HIP_LF": 30, "RAKE_LF": 75, "STORIES": 2, "PITCH": "8/12", "SKYLIGHTS": 1, "CHIMNEYS": 1}'::jsonb,
   8800.00, 9200.00, 720.00, 18720.00,
   10.00, 1872.00, 15.00, 3088.80, 7.00, 1050.00, 15000.00,
   20300.00, 22400.00, 26800.00,
   'sent', NOW() - INTERVAL '6 days', NULL, NOW() + INTERVAL '30 days',
   'Insurance-grade detailed estimate for storm damage replacement. Includes steep pitch and height surcharges.',
   'f681c91e-4c1c-41d0-b85a-2cba763edc34', -- Laminate macro
   NOW() - INTERVAL '7 days');

-- Add view tracking to detailed estimates
UPDATE detailed_estimates SET view_count = 3, viewed_at = NOW() - INTERVAL '33 days' WHERE id = 'de000001-0000-0000-0000-000000000001';
UPDATE detailed_estimates SET view_count = 1, viewed_at = NOW() - INTERVAL '9 days' WHERE id = 'de000002-0000-0000-0000-000000000002';
UPDATE detailed_estimates SET view_count = 2, viewed_at = NOW() - INTERVAL '5 days' WHERE id = 'de000004-0000-0000-0000-000000000004';

-- =============================================================================
-- STEP 7: INSERT ESTIMATE LINE ITEMS (for detailed estimates)
-- Uses real line_item IDs from the catalog
-- =============================================================================

-- DE1 (Sarah Johnson - Laminate shingle replacement, 22 SQ)
INSERT INTO estimate_line_items (detailed_estimate_id, line_item_id, item_code, name, category, unit_type, quantity, waste_factor, quantity_with_waste, material_unit_cost, labor_unit_cost, equipment_unit_cost, material_total, labor_total, equipment_total, line_total, sort_order, group_name) VALUES
  ('de000001-0000-0000-0000-000000000001', '3cedf8f3-598d-4638-9d18-952cf5b01743', 'RFG100', 'Tear-off - 1 layer shingles',      'tear_off',      'SQ', 22, 1.00, 22.00, 0.00, 35.00, 0.00, 0.00, 770.00, 0.00, 770.00, 1, 'Tear Off'),
  ('de000001-0000-0000-0000-000000000001', 'c56e1750-d84e-4cb2-a1b9-56293e87deb6', 'RFG240', 'Underlayment - Synthetic',          'underlayment',  'SQ', 22, 1.10, 24.20, 15.00, 12.00, 0.00, 363.00, 290.40, 0.00, 653.40, 2, 'Underlayment'),
  ('de000001-0000-0000-0000-000000000001', 'af0759a2-e9ab-43b8-ac30-494c012ab088', 'RFG250', 'Ice & water shield - Standard',     'underlayment',  'SQ', 6,  1.00, 6.00, 65.00, 18.00, 0.00, 390.00, 108.00, 0.00, 498.00, 3, 'Underlayment'),
  ('de000001-0000-0000-0000-000000000001', '2c6d62c4-c4bb-4ec9-98dc-abdbad0555da', 'RFG420', 'Shingles - Laminate standard',      'shingles',      'SQ', 22, 1.10, 24.20, 125.00, 85.00, 0.00, 3025.00, 2057.00, 0.00, 5082.00, 4, 'Shingles'),
  ('de000001-0000-0000-0000-000000000001', '00b464c8-a143-4659-ad49-d2ea10cff3fa', 'RFG440', 'Starter strip',                     'shingles',      'LF', 200, 1.05, 210.00, 1.25, 0.75, 0.00, 262.50, 157.50, 0.00, 420.00, 5, 'Shingles'),
  ('de000001-0000-0000-0000-000000000001', 'd4548633-8203-44a2-8c14-f2cf3ea74bf3', 'RFG446', 'Ridge cap - Hip & ridge',            'shingles',      'LF', 75,  1.00, 75.00, 2.50, 1.25, 0.00, 187.50, 93.75, 0.00, 281.25, 6, 'Shingles'),
  ('de000001-0000-0000-0000-000000000001', '854615e8-2170-4332-a727-fc7969132319', 'FLS100', 'Drip edge - Aluminum std',           'flashing',      'LF', 200, 1.00, 200.00, 1.50, 1.00, 0.00, 300.00, 200.00, 0.00, 500.00, 7, 'Flashing'),
  ('de000001-0000-0000-0000-000000000001', '7dae722b-fae2-4d6f-ab83-5c6fe1312a52', 'FLS110', 'Step flashing - Aluminum',           'flashing',      'EA', 30,  1.00, 30.00, 1.25, 1.50, 0.00, 37.50, 45.00, 0.00, 82.50, 8, 'Flashing'),
  ('de000001-0000-0000-0000-000000000001', 'ffab28a0-71f9-404c-9658-0e670db79918', 'FLS120', 'Valley metal - Aluminum',            'flashing',      'LF', 30,  1.00, 30.00, 4.50, 3.00, 0.00, 135.00, 90.00, 0.00, 225.00, 9, 'Flashing'),
  ('de000001-0000-0000-0000-000000000001', '4319ab3f-5f55-48fc-9876-4dd32f5fa01d', 'FLS140', 'Pipe boot - Neoprene std',           'flashing',      'EA', 4,   1.00, 4.00, 8.50, 15.00, 0.00, 34.00, 60.00, 0.00, 94.00, 10, 'Flashing'),
  ('de000001-0000-0000-0000-000000000001', '1d9688db-283d-4408-87e9-a6c5fe46a76e', 'VNT100', 'Ridge vent - Shingle over',          'ventilation',   'LF', 55,  1.00, 55.00, 3.50, 2.50, 0.00, 192.50, 137.50, 0.00, 330.00, 11, 'Ventilation'),
  ('de000001-0000-0000-0000-000000000001', 'e6385a0e-47ac-4bcc-b3bb-923ae5ac7868', 'SKY300', 'Skylight reflash - Standard',        'skylights',     'EA', 1,   1.00, 1.00, 45.00, 175.00, 0.00, 45.00, 175.00, 0.00, 220.00, 12, 'Skylights'),
  ('de000001-0000-0000-0000-000000000001', '29deffa3-0bdc-4c21-99dd-483163ee1d85', 'LBR610', 'Height charge - 2 story',            'labor',         'SQ', 22,  1.00, 22.00, 0.00, 8.00, 0.00, 0.00, 176.00, 0.00, 176.00, 13, 'Labor'),
  ('de000001-0000-0000-0000-000000000001', '176e410c-5c76-4e5e-8936-bb84e4e17c2f', 'DSP800', 'Debris removal - Shingles',          'disposal',      'SQ', 22,  1.00, 22.00, 0.00, 0.00, 18.00, 0.00, 0.00, 396.00, 396.00, 14, 'Disposal'),
  ('de000001-0000-0000-0000-000000000001', '25613c02-eac3-4f3f-be9d-ddd3fe2d122e', 'PRM900', 'Building permit - Residential',      'permits',       'EA', 1,   1.00, 1.00, 350.00, 0.00, 0.00, 350.00, 0.00, 0.00, 350.00, 15, 'Permits');

-- DE2 (Marcus Williams - Premium shingle replacement, 28 SQ)
INSERT INTO estimate_line_items (detailed_estimate_id, line_item_id, item_code, name, category, unit_type, quantity, waste_factor, quantity_with_waste, material_unit_cost, labor_unit_cost, equipment_unit_cost, material_total, labor_total, equipment_total, line_total, sort_order, group_name) VALUES
  ('de000002-0000-0000-0000-000000000002', '3cedf8f3-598d-4638-9d18-952cf5b01743', 'RFG100', 'Tear-off - 1 layer shingles',      'tear_off',      'SQ', 28, 1.00, 28.00, 0.00, 35.00, 0.00, 0.00, 980.00, 0.00, 980.00, 1, 'Tear Off'),
  ('de000002-0000-0000-0000-000000000002', 'c56e1750-d84e-4cb2-a1b9-56293e87deb6', 'RFG240', 'Underlayment - Synthetic',          'underlayment',  'SQ', 28, 1.10, 30.80, 15.00, 12.00, 0.00, 462.00, 369.60, 0.00, 831.60, 2, 'Underlayment'),
  ('de000002-0000-0000-0000-000000000002', 'af0759a2-e9ab-43b8-ac30-494c012ab088', 'RFG250', 'Ice & water shield - Standard',     'underlayment',  'SQ', 8,  1.00, 8.00, 65.00, 18.00, 0.00, 520.00, 144.00, 0.00, 664.00, 3, 'Underlayment'),
  ('de000002-0000-0000-0000-000000000002', '2187632b-1607-4963-a656-39a378dc8ea9', 'RFG421', 'Shingles - Laminate premium',       'shingles',      'SQ', 28, 1.10, 30.80, 155.00, 90.00, 0.00, 4774.00, 2772.00, 0.00, 7546.00, 4, 'Shingles'),
  ('de000002-0000-0000-0000-000000000002', '00b464c8-a143-4659-ad49-d2ea10cff3fa', 'RFG440', 'Starter strip',                     'shingles',      'LF', 230, 1.05, 241.50, 1.25, 0.75, 0.00, 301.88, 181.13, 0.00, 483.00, 5, 'Shingles'),
  ('de000002-0000-0000-0000-000000000002', 'd4548633-8203-44a2-8c14-f2cf3ea74bf3', 'RFG446', 'Ridge cap - Hip & ridge',            'shingles',      'LF', 85,  1.00, 85.00, 2.50, 1.25, 0.00, 212.50, 106.25, 0.00, 318.75, 6, 'Shingles'),
  ('de000002-0000-0000-0000-000000000002', '854615e8-2170-4332-a727-fc7969132319', 'FLS100', 'Drip edge - Aluminum std',           'flashing',      'LF', 230, 1.00, 230.00, 1.50, 1.00, 0.00, 345.00, 230.00, 0.00, 575.00, 7, 'Flashing'),
  ('de000002-0000-0000-0000-000000000002', '7dae722b-fae2-4d6f-ab83-5c6fe1312a52', 'FLS110', 'Step flashing - Aluminum',           'flashing',      'EA', 24,  1.00, 24.00, 1.25, 1.50, 0.00, 30.00, 36.00, 0.00, 66.00, 8, 'Flashing'),
  ('de000002-0000-0000-0000-000000000002', 'ffab28a0-71f9-404c-9658-0e670db79918', 'FLS120', 'Valley metal - Aluminum',            'flashing',      'LF', 25,  1.00, 25.00, 4.50, 3.00, 0.00, 112.50, 75.00, 0.00, 187.50, 9, 'Flashing'),
  ('de000002-0000-0000-0000-000000000002', '4319ab3f-5f55-48fc-9876-4dd32f5fa01d', 'FLS140', 'Pipe boot - Neoprene std',           'flashing',      'EA', 5,   1.00, 5.00, 8.50, 15.00, 0.00, 42.50, 75.00, 0.00, 117.50, 10, 'Flashing'),
  ('de000002-0000-0000-0000-000000000002', 'bde2b27a-af7b-403e-a3c5-9de664fb3c84', 'CHM400', 'Chimney flash - Standard',           'chimneys',      'EA', 1,   1.00, 1.00, 85.00, 225.00, 0.00, 85.00, 225.00, 0.00, 310.00, 11, 'Chimney'),
  ('de000002-0000-0000-0000-000000000002', '1d9688db-283d-4408-87e9-a6c5fe46a76e', 'VNT100', 'Ridge vent - Shingle over',          'ventilation',   'LF', 70,  1.00, 70.00, 3.50, 2.50, 0.00, 245.00, 175.00, 0.00, 420.00, 12, 'Ventilation'),
  ('de000002-0000-0000-0000-000000000002', '176e410c-5c76-4e5e-8936-bb84e4e17c2f', 'DSP800', 'Debris removal - Shingles',          'disposal',      'SQ', 28,  1.00, 28.00, 0.00, 0.00, 18.00, 0.00, 0.00, 504.00, 504.00, 13, 'Disposal'),
  ('de000002-0000-0000-0000-000000000002', '4c7529f7-4e91-4fb1-913e-c3cca6178bfd', 'DSP811', 'Dumpster - 20 yard',                 'disposal',      'EA', 1,   1.00, 1.00, 0.00, 0.00, 425.00, 0.00, 0.00, 425.00, 425.00, 14, 'Disposal'),
  ('de000002-0000-0000-0000-000000000002', '25613c02-eac3-4f3f-be9d-ddd3fe2d122e', 'PRM900', 'Building permit - Residential',      'permits',       'EA', 1,   1.00, 1.00, 350.00, 0.00, 0.00, 350.00, 0.00, 0.00, 350.00, 15, 'Permits');

-- DE4 (Robert Davis - Storm damage replacement, 32 SQ, steep pitch)
INSERT INTO estimate_line_items (detailed_estimate_id, line_item_id, item_code, name, category, unit_type, quantity, waste_factor, quantity_with_waste, material_unit_cost, labor_unit_cost, equipment_unit_cost, material_total, labor_total, equipment_total, line_total, sort_order, group_name) VALUES
  ('de000004-0000-0000-0000-000000000004', '3cedf8f3-598d-4638-9d18-952cf5b01743', 'RFG100', 'Tear-off - 1 layer shingles',      'tear_off',      'SQ', 32, 1.00, 32.00, 0.00, 35.00, 0.00, 0.00, 1120.00, 0.00, 1120.00, 1, 'Tear Off'),
  ('de000004-0000-0000-0000-000000000004', 'c56e1750-d84e-4cb2-a1b9-56293e87deb6', 'RFG240', 'Underlayment - Synthetic',          'underlayment',  'SQ', 32, 1.10, 35.20, 15.00, 12.00, 0.00, 528.00, 422.40, 0.00, 950.40, 2, 'Underlayment'),
  ('de000004-0000-0000-0000-000000000004', 'af0759a2-e9ab-43b8-ac30-494c012ab088', 'RFG250', 'Ice & water shield - Standard',     'underlayment',  'SQ', 10, 1.00, 10.00, 65.00, 18.00, 0.00, 650.00, 180.00, 0.00, 830.00, 3, 'Underlayment'),
  ('de000004-0000-0000-0000-000000000004', '2c6d62c4-c4bb-4ec9-98dc-abdbad0555da', 'RFG420', 'Shingles - Laminate standard',      'shingles',      'SQ', 32, 1.10, 35.20, 125.00, 85.00, 0.00, 4400.00, 2992.00, 0.00, 7392.00, 4, 'Shingles'),
  ('de000004-0000-0000-0000-000000000004', '00b464c8-a143-4659-ad49-d2ea10cff3fa', 'RFG440', 'Starter strip',                     'shingles',      'LF', 265, 1.05, 278.25, 1.25, 0.75, 0.00, 347.81, 208.69, 0.00, 556.50, 5, 'Shingles'),
  ('de000004-0000-0000-0000-000000000004', 'd4548633-8203-44a2-8c14-f2cf3ea74bf3', 'RFG446', 'Ridge cap - Hip & ridge',            'shingles',      'LF', 110, 1.00, 110.00, 2.50, 1.25, 0.00, 275.00, 137.50, 0.00, 412.50, 6, 'Shingles'),
  ('de000004-0000-0000-0000-000000000004', '854615e8-2170-4332-a727-fc7969132319', 'FLS100', 'Drip edge - Aluminum std',           'flashing',      'LF', 265, 1.00, 265.00, 1.50, 1.00, 0.00, 397.50, 265.00, 0.00, 662.50, 7, 'Flashing'),
  ('de000004-0000-0000-0000-000000000004', '7dae722b-fae2-4d6f-ab83-5c6fe1312a52', 'FLS110', 'Step flashing - Aluminum',           'flashing',      'EA', 40,  1.00, 40.00, 1.25, 1.50, 0.00, 50.00, 60.00, 0.00, 110.00, 8, 'Flashing'),
  ('de000004-0000-0000-0000-000000000004', 'ffab28a0-71f9-404c-9658-0e670db79918', 'FLS120', 'Valley metal - Aluminum',            'flashing',      'LF', 45,  1.00, 45.00, 4.50, 3.00, 0.00, 202.50, 135.00, 0.00, 337.50, 9, 'Flashing'),
  ('de000004-0000-0000-0000-000000000004', '4319ab3f-5f55-48fc-9876-4dd32f5fa01d', 'FLS140', 'Pipe boot - Neoprene std',           'flashing',      'EA', 5,   1.00, 5.00, 8.50, 15.00, 0.00, 42.50, 75.00, 0.00, 117.50, 10, 'Flashing'),
  ('de000004-0000-0000-0000-000000000004', 'bde2b27a-af7b-403e-a3c5-9de664fb3c84', 'CHM400', 'Chimney flash - Standard',           'chimneys',      'EA', 1,   1.00, 1.00, 85.00, 225.00, 0.00, 85.00, 225.00, 0.00, 310.00, 11, 'Chimney'),
  ('de000004-0000-0000-0000-000000000004', 'e6385a0e-47ac-4bcc-b3bb-923ae5ac7868', 'SKY300', 'Skylight reflash - Standard',        'skylights',     'EA', 1,   1.00, 1.00, 45.00, 175.00, 0.00, 45.00, 175.00, 0.00, 220.00, 12, 'Skylights'),
  ('de000004-0000-0000-0000-000000000004', '1d9688db-283d-4408-87e9-a6c5fe46a76e', 'VNT100', 'Ridge vent - Shingle over',          'ventilation',   'LF', 80,  1.00, 80.00, 3.50, 2.50, 0.00, 280.00, 200.00, 0.00, 480.00, 13, 'Ventilation'),
  ('de000004-0000-0000-0000-000000000004', 'eb54e7fa-2814-4209-9124-2b20dc4931ba', 'LBR600', 'Steep pitch charge 7/12-9/12',       'labor',         'SQ', 32,  1.00, 32.00, 0.00, 15.00, 0.00, 0.00, 480.00, 0.00, 480.00, 14, 'Labor Surcharges'),
  ('de000004-0000-0000-0000-000000000004', '29deffa3-0bdc-4c21-99dd-483163ee1d85', 'LBR610', 'Height charge - 2 story',            'labor',         'SQ', 32,  1.00, 32.00, 0.00, 8.00, 0.00, 0.00, 256.00, 0.00, 256.00, 15, 'Labor Surcharges'),
  ('de000004-0000-0000-0000-000000000004', '176e410c-5c76-4e5e-8936-bb84e4e17c2f', 'DSP800', 'Debris removal - Shingles',          'disposal',      'SQ', 32,  1.00, 32.00, 0.00, 0.00, 18.00, 0.00, 0.00, 576.00, 576.00, 16, 'Disposal'),
  ('de000004-0000-0000-0000-000000000004', '25613c02-eac3-4f3f-be9d-ddd3fe2d122e', 'PRM900', 'Building permit - Residential',      'permits',       'EA', 1,   1.00, 1.00, 350.00, 0.00, 0.00, 350.00, 0.00, 0.00, 350.00, 17, 'Permits');

-- =============================================================================
-- STEP 8: INSERT ESTIMATE EVENTS (estimate_events / quote_events view)
-- =============================================================================

INSERT INTO estimate_events (estimate_id, event_type, event_data, actor_type, actor_name, actor_email, created_at) VALUES
  -- Lead 1: Sarah Johnson - Full lifecycle
  ('e0000001-0000-0000-0000-000000000001', 'created',  '{"price_likely": 14200}'::jsonb, 'system',   NULL,            NULL, NOW() - INTERVAL '42 days'),
  ('e0000001-0000-0000-0000-000000000001', 'sent',     '{}'::jsonb,                      'admin',    'Admin User',    'admin@roofingmadeeasy.com', NOW() - INTERVAL '40 days'),
  ('e0000001-0000-0000-0000-000000000001', 'viewed',   '{"view_count": 1}'::jsonb,       'customer', 'Sarah Johnson', 'sarah.johnson@email.com', NOW() - INTERVAL '39 days'),
  ('e0000001-0000-0000-0000-000000000001', 'viewed',   '{"view_count": 2}'::jsonb,       'customer', 'Sarah Johnson', 'sarah.johnson@email.com', NOW() - INTERVAL '37 days'),
  ('e0000001-0000-0000-0000-000000000001', 'viewed',   '{"view_count": 3}'::jsonb,       'customer', 'Sarah Johnson', 'sarah.johnson@email.com', NOW() - INTERVAL '36 days'),
  ('e0000001-0000-0000-0000-000000000001', 'accepted', '{"accepted_by": "Sarah Johnson"}'::jsonb, 'customer', 'Sarah Johnson', 'sarah.johnson@email.com', NOW() - INTERVAL '35 days'),

  -- Lead 2: Marcus Williams
  ('e0000002-0000-0000-0000-000000000002', 'created',  '{"price_likely": 18750}'::jsonb, 'system',   NULL,              NULL, NOW() - INTERVAL '11 days'),
  ('e0000002-0000-0000-0000-000000000002', 'sent',     '{}'::jsonb,                      'admin',    'Admin User',      'admin@roofingmadeeasy.com', NOW() - INTERVAL '10 days'),
  ('e0000002-0000-0000-0000-000000000002', 'viewed',   '{"view_count": 1}'::jsonb,       'customer', 'Marcus Williams', 'marcus.w@email.com', NOW() - INTERVAL '9 days'),

  -- Lead 4: Robert Davis
  ('e0000004-0000-0000-0000-000000000004', 'created',  '{"price_likely": 22400}'::jsonb, 'system',   NULL,           NULL, NOW() - INTERVAL '7 days'),
  ('e0000004-0000-0000-0000-000000000004', 'sent',     '{}'::jsonb,                      'admin',    'Admin User',   'admin@roofingmadeeasy.com', NOW() - INTERVAL '6 days'),
  ('e0000004-0000-0000-0000-000000000004', 'viewed',   '{"view_count": 1}'::jsonb,       'customer', 'Robert Davis', 'rdavis@email.com', NOW() - INTERVAL '5 days'),
  ('e0000004-0000-0000-0000-000000000004', 'viewed',   '{"view_count": 2}'::jsonb,       'customer', 'Robert Davis', 'rdavis@email.com', NOW() - INTERVAL '4 days'),

  -- Lead 6: Angela Martinez
  ('e0000006-0000-0000-0000-000000000006', 'created',  '{"price_likely": 16800}'::jsonb, 'system',   NULL,              NULL, NOW() - INTERVAL '28 days'),
  ('e0000006-0000-0000-0000-000000000006', 'sent',     '{}'::jsonb,                      'admin',    'Admin User',      'admin@roofingmadeeasy.com', NOW() - INTERVAL '25 days'),
  ('e0000006-0000-0000-0000-000000000006', 'viewed',   '{"view_count": 1}'::jsonb,       'customer', 'Angela Martinez', 'angela.martinez@email.com', NOW() - INTERVAL '26 days'),
  ('e0000006-0000-0000-0000-000000000006', 'viewed',   '{"view_count": 2}'::jsonb,       'customer', 'Angela Martinez', 'angela.martinez@email.com', NOW() - INTERVAL '25 days'),
  ('e0000006-0000-0000-0000-000000000006', 'accepted', '{"accepted_by": "Angela Martinez"}'::jsonb, 'customer', 'Angela Martinez', 'angela.martinez@email.com', NOW() - INTERVAL '24 days'),

  -- Lead 9: James Walker - Rejected
  ('e0000009-0000-0000-0000-000000000009', 'created',  '{"price_likely": 19500}'::jsonb, 'system',   NULL,           NULL, NOW() - INTERVAL '19 days'),
  ('e0000009-0000-0000-0000-000000000009', 'sent',     '{}'::jsonb,                      'admin',    'Admin User',   'admin@roofingmadeeasy.com', NOW() - INTERVAL '18 days'),
  ('e0000009-0000-0000-0000-000000000009', 'viewed',   '{"view_count": 1}'::jsonb,       'customer', 'James Walker', 'jwalker@email.com', NOW() - INTERVAL '17 days'),
  ('e0000009-0000-0000-0000-000000000009', 'viewed',   '{"view_count": 2}'::jsonb,       'customer', 'James Walker', 'jwalker@email.com', NOW() - INTERVAL '16 days'),
  ('e0000009-0000-0000-0000-000000000009', 'rejected', '{"reason": "Going with another contractor"}'::jsonb, 'customer', 'James Walker', 'jwalker@email.com', NOW() - INTERVAL '15 days'),

  -- Lead 12: Patricia Young - Expired
  ('e000000c-0000-0000-0000-00000000000c', 'created',  '{"price_likely": 3200}'::jsonb,  'system',   NULL,            NULL, NOW() - INTERVAL '58 days'),
  ('e000000c-0000-0000-0000-00000000000c', 'sent',     '{}'::jsonb,                      'admin',    'Admin User',    'admin@roofingmadeeasy.com', NOW() - INTERVAL '55 days'),
  ('e000000c-0000-0000-0000-00000000000c', 'viewed',   '{"view_count": 1}'::jsonb,       'customer', 'Patricia Young','pyoung@email.com', NOW() - INTERVAL '54 days'),
  ('e000000c-0000-0000-0000-00000000000c', 'expired',  '{}'::jsonb,                      'system',   NULL,            NULL, NOW() - INTERVAL '30 days');

-- =============================================================================
-- STEP 9: INSERT LEAD ACTIVITIES (manual entries, triggers also create some)
-- Note: estimate_generated activities are created by trigger on estimates INSERT
-- Note: status_change activities are created by trigger on leads UPDATE
-- =============================================================================

INSERT INTO lead_activities (lead_id, type, content, metadata, author_name, is_system_generated, created_at) VALUES
  -- Lead 1: Sarah Johnson (full lifecycle)
  ('d0000001-0000-0000-0000-000000000001', 'system',     'Lead created from web funnel',                '{"source": "web_funnel"}'::jsonb, NULL, true, NOW() - INTERVAL '45 days'),
  ('d0000001-0000-0000-0000-000000000001', 'note',       'Customer reports hail damage from April storm. Roof is 22 years old, needs full replacement.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '44 days'),
  ('d0000001-0000-0000-0000-000000000001', 'call',       'Spoke with Sarah about timeline. She wants to get started within the month.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '43 days'),
  ('d0000001-0000-0000-0000-000000000001', 'quote_sent', 'Estimate emailed to sarah.johnson@email.com', '{"estimate_id": "e0000001-0000-0000-0000-000000000001", "price": 14200}'::jsonb, 'Admin User', false, NOW() - INTERVAL '40 days'),
  ('d0000001-0000-0000-0000-000000000001', 'email',      'Customer accepted estimate. Scheduling installation for next week.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '35 days'),
  ('d0000001-0000-0000-0000-000000000001', 'note',       'Deposit invoice sent. Customer paid promptly.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '33 days'),
  ('d0000001-0000-0000-0000-000000000001', 'note',       'Installation scheduled for Monday. Crew of 5 assigned.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '28 days'),
  ('d0000001-0000-0000-0000-000000000001', 'note',       'Installation complete. Final inspection passed. Sent final invoice.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '20 days'),

  -- Lead 2: Marcus Williams
  ('d0000002-0000-0000-0000-000000000002', 'system',     'Lead created from web funnel',                '{"source": "web_funnel"}'::jsonb, NULL, true, NOW() - INTERVAL '12 days'),
  ('d0000002-0000-0000-0000-000000000002', 'note',       'Large ranch-style home. Customer interested in premium shingles. Has chimney that needs reflashing.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '11 days'),
  ('d0000002-0000-0000-0000-000000000002', 'quote_sent', 'Estimate emailed to marcus.w@email.com',      '{"estimate_id": "e0000002-0000-0000-0000-000000000002", "price": 18750}'::jsonb, 'Admin User', false, NOW() - INTERVAL '10 days'),
  ('d0000002-0000-0000-0000-000000000002', 'note',       'Customer viewed estimate. Following up in a few days.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '8 days'),

  -- Lead 3: Jennifer Chen
  ('d0000003-0000-0000-0000-000000000003', 'system',     'Lead created from web funnel',                '{"source": "web_funnel"}'::jsonb, NULL, true, NOW() - INTERVAL '3 days'),
  ('d0000003-0000-0000-0000-000000000003', 'note',       'Active roof leak. Customer has Allstate insurance claim. Needs urgent repair.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '2 days'),

  -- Lead 4: Robert Davis
  ('d0000004-0000-0000-0000-000000000004', 'system',     'Lead created from web funnel',                '{"source": "web_funnel"}'::jsonb, NULL, true, NOW() - INTERVAL '8 days'),
  ('d0000004-0000-0000-0000-000000000004', 'note',       'Significant storm damage. Insurance adjuster has visited. Nationwide claim in process.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '7 days'),
  ('d0000004-0000-0000-0000-000000000004', 'quote_sent', 'Estimate emailed to rdavis@email.com',        '{"estimate_id": "e0000004-0000-0000-0000-000000000004", "price": 22400}'::jsonb, 'Admin User', false, NOW() - INTERVAL '6 days'),
  ('d0000004-0000-0000-0000-000000000004', 'appointment_scheduled', 'Consultation scheduled for Friday at 2pm at the property.', '{"date": "2026-02-07", "time": "14:00"}'::jsonb, 'Admin User', false, NOW() - INTERVAL '4 days'),

  -- Lead 5: Tommy Patterson
  ('d0000005-0000-0000-0000-000000000005', 'system',     'Lead created from web funnel',                '{"source": "web_funnel"}'::jsonb, NULL, true, NOW() - INTERVAL '1 day'),

  -- Lead 6: Angela Martinez
  ('d0000006-0000-0000-0000-000000000006', 'system',     'Lead created via referral',                   '{"source": "referral"}'::jsonb, NULL, true, NOW() - INTERVAL '30 days'),
  ('d0000006-0000-0000-0000-000000000006', 'note',       'Referred by neighbor. Wants to upgrade from asphalt to standing seam metal. Has solar panels.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '29 days'),
  ('d0000006-0000-0000-0000-000000000006', 'quote_sent', 'Estimate emailed to angela.martinez@email.com', '{"estimate_id": "e0000006-0000-0000-0000-000000000006", "price": 16800}'::jsonb, 'Admin User', false, NOW() - INTERVAL '25 days'),
  ('d0000006-0000-0000-0000-000000000006', 'email',      'Customer accepted. Scheduling solar panel removal coordination.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '24 days'),
  ('d0000006-0000-0000-0000-000000000006', 'note',       'Installation complete. Metal roof looks great. Solar reinstall scheduled.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '15 days'),
  ('d0000006-0000-0000-0000-000000000006', 'note',       'Final invoice paid. Job complete.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '12 days'),

  -- Lead 7: David Thompson
  ('d0000007-0000-0000-0000-000000000007', 'system',     'Lead created from web funnel',                '{"source": "web_funnel"}'::jsonb, NULL, true, NOW() - INTERVAL '5 days'),
  ('d0000007-0000-0000-0000-000000000007', 'note',       'Leak around chimney area. Several missing shingles on north side.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '4 days'),
  ('d0000007-0000-0000-0000-000000000007', 'quote_sent', 'Repair estimate emailed to dthompson@email.com', '{"estimate_id": "e0000007-0000-0000-0000-000000000007", "price": 4200}'::jsonb, 'Admin User', false, NOW() - INTERVAL '4 days'),

  -- Lead 8: Karen Mitchell
  ('d0000008-0000-0000-0000-000000000008', 'system',     'Lead created from web funnel',                '{"source": "web_funnel"}'::jsonb, NULL, true, NOW() - INTERVAL '2 days'),

  -- Lead 9: James Walker
  ('d0000009-0000-0000-0000-000000000009', 'system',     'Lead created from web funnel',                '{"source": "web_funnel"}'::jsonb, NULL, true, NOW() - INTERVAL '20 days'),
  ('d0000009-0000-0000-0000-000000000009', 'note',       'Customer getting multiple quotes. Steep pitch 2-story home.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '19 days'),
  ('d0000009-0000-0000-0000-000000000009', 'quote_sent', 'Estimate emailed to jwalker@email.com',       '{"estimate_id": "e0000009-0000-0000-0000-000000000009", "price": 19500}'::jsonb, 'Admin User', false, NOW() - INTERVAL '18 days'),
  ('d0000009-0000-0000-0000-000000000009', 'note',       'Customer rejected estimate - going with another contractor at lower price.', '{"reason": "price"}'::jsonb, 'Admin User', false, NOW() - INTERVAL '15 days'),

  -- Lead 10: Maria Gonzalez
  ('d000000a-0000-0000-0000-00000000000a', 'system',     'Lead created from web funnel',                '{"source": "web_funnel"}'::jsonb, NULL, true, NOW() - INTERVAL '6 hours'),

  -- Lead 11: Chris Bennett
  ('d000000b-0000-0000-0000-00000000000b', 'system',     'Lead created from web funnel',                '{"source": "web_funnel"}'::jsonb, NULL, true, NOW() - INTERVAL '4 days'),
  ('d000000b-0000-0000-0000-00000000000b', 'note',       'Annual maintenance request. Some loose shingles after storm.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '3 days'),

  -- Lead 12: Patricia Young
  ('d000000c-0000-0000-0000-00000000000c', 'system',     'Lead created from web funnel',                '{"source": "web_funnel"}'::jsonb, NULL, true, NOW() - INTERVAL '60 days'),
  ('d000000c-0000-0000-0000-00000000000c', 'note',       'Small leak near vent pipe. Just exploring options.', '{}'::jsonb, 'Admin User', false, NOW() - INTERVAL '58 days'),
  ('d000000c-0000-0000-0000-00000000000c', 'quote_sent', 'Estimate emailed to pyoung@email.com',        '{"estimate_id": "e000000c-0000-0000-0000-00000000000c", "price": 3200}'::jsonb, 'Admin User', false, NOW() - INTERVAL '55 days');
