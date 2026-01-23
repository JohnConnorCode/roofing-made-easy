-- ============================================
-- Seed data for pricing rules
-- Default pricing for roofing estimates
-- ============================================

-- Base rates per square foot by job type
INSERT INTO pricing_rules (rule_key, rule_category, display_name, description, base_rate, unit, multiplier)
VALUES
  ('base_replacement', 'job_type', 'Full Replacement Base', 'Base rate for full roof replacement', 4.50, 'sqft', 1.0),
  ('base_repair', 'job_type', 'Repair Base', 'Base rate for roof repairs', 150.00, 'flat', 1.0),
  ('base_inspection', 'job_type', 'Inspection Base', 'Base rate for roof inspection', 250.00, 'flat', 1.0),
  ('base_maintenance', 'job_type', 'Maintenance Base', 'Base rate for roof maintenance', 200.00, 'flat', 1.0),
  ('base_gutter', 'job_type', 'Gutter Base', 'Base rate for gutter work', 8.00, 'linear_ft', 1.0);

-- Material multipliers
INSERT INTO pricing_rules (rule_key, rule_category, display_name, description, multiplier, conditions)
VALUES
  ('material_asphalt', 'material', 'Asphalt Shingle', 'Standard asphalt shingles', 1.0, '{"roof_material": "asphalt_shingle"}'),
  ('material_metal', 'material', 'Metal Roofing', 'Standing seam or metal panels', 2.2, '{"roof_material": "metal"}'),
  ('material_tile', 'material', 'Tile Roofing', 'Clay or concrete tile', 2.5, '{"roof_material": "tile"}'),
  ('material_slate', 'material', 'Slate Roofing', 'Natural or synthetic slate', 3.0, '{"roof_material": "slate"}'),
  ('material_wood', 'material', 'Wood Shake', 'Cedar shake or shingle', 2.0, '{"roof_material": "wood_shake"}'),
  ('material_flat', 'material', 'Flat Membrane', 'TPO, EPDM, or modified bitumen', 1.4, '{"roof_material": "flat_membrane"}'),
  ('material_unknown', 'material', 'Unknown Material', 'Default when material unknown', 1.2, '{"roof_material": "unknown"}');

-- Pitch multipliers
INSERT INTO pricing_rules (rule_key, rule_category, display_name, description, multiplier, conditions)
VALUES
  ('pitch_flat', 'pitch', 'Flat Pitch', '0-2/12 pitch', 0.9, '{"roof_pitch": "flat"}'),
  ('pitch_low', 'pitch', 'Low Pitch', '3-4/12 pitch', 1.0, '{"roof_pitch": "low"}'),
  ('pitch_medium', 'pitch', 'Medium Pitch', '5-7/12 pitch', 1.1, '{"roof_pitch": "medium"}'),
  ('pitch_steep', 'pitch', 'Steep Pitch', '8-10/12 pitch', 1.25, '{"roof_pitch": "steep"}'),
  ('pitch_very_steep', 'pitch', 'Very Steep Pitch', '11+/12 pitch', 1.5, '{"roof_pitch": "very_steep"}'),
  ('pitch_unknown', 'pitch', 'Unknown Pitch', 'Default when pitch unknown', 1.15, '{"roof_pitch": "unknown"}');

-- Story multipliers
INSERT INTO pricing_rules (rule_key, rule_category, display_name, description, multiplier, conditions)
VALUES
  ('story_1', 'stories', '1 Story', 'Single story home', 1.0, '{"stories": 1}'),
  ('story_2', 'stories', '2 Stories', 'Two story home', 1.15, '{"stories": 2}'),
  ('story_3', 'stories', '3+ Stories', 'Three or more stories', 1.35, '{"stories": 3}');

-- Feature add-ons (flat fees)
INSERT INTO pricing_rules (rule_key, rule_category, display_name, description, flat_fee, conditions)
VALUES
  ('feature_skylights', 'feature', 'Skylights', 'Additional work around skylights', 350.00, '{"has_skylights": true}'),
  ('feature_chimneys', 'feature', 'Chimneys', 'Flashing and work around chimneys', 450.00, '{"has_chimneys": true}'),
  ('feature_solar', 'feature', 'Solar Panels', 'Remove and reinstall solar panels', 1500.00, '{"has_solar_panels": true}');

-- Issue-based adjustments (flat fees)
INSERT INTO pricing_rules (rule_key, rule_category, display_name, description, flat_fee, conditions)
VALUES
  ('issue_missing_shingles', 'issue', 'Missing Shingles', 'Replace missing shingles', 150.00, '{"issue": "missing_shingles"}'),
  ('issue_damaged_shingles', 'issue', 'Damaged Shingles', 'Replace damaged/curling shingles', 200.00, '{"issue": "damaged_shingles"}'),
  ('issue_leaks', 'issue', 'Active Leaks', 'Leak repair and water damage', 500.00, '{"issue": "leaks"}'),
  ('issue_moss_algae', 'issue', 'Moss/Algae Growth', 'Cleaning and treatment', 300.00, '{"issue": "moss_algae"}'),
  ('issue_sagging', 'issue', 'Sagging Areas', 'Structural repair for sagging', 800.00, '{"issue": "sagging"}'),
  ('issue_flashing', 'issue', 'Flashing Damage', 'Replace damaged flashing', 350.00, '{"issue": "flashing"}'),
  ('issue_gutter_damage', 'issue', 'Gutter Damage', 'Repair or replace gutters', 400.00, '{"issue": "gutter_damage"}'),
  ('issue_ventilation', 'issue', 'Poor Ventilation', 'Add or repair vents', 450.00, '{"issue": "ventilation"}'),
  ('issue_ice_dams', 'issue', 'Ice Dam Damage', 'Ice dam prevention and repair', 600.00, '{"issue": "ice_dams"}'),
  ('issue_storm_damage', 'issue', 'Storm Damage', 'General storm damage repair', 750.00, '{"issue": "storm_damage"}');

-- Timeline urgency multipliers
INSERT INTO pricing_rules (rule_key, rule_category, display_name, description, multiplier, conditions)
VALUES
  ('urgency_emergency', 'urgency', 'Emergency', '24-48 hour response needed', 1.5, '{"timeline_urgency": "emergency"}'),
  ('urgency_asap', 'urgency', 'ASAP', 'Within a week', 1.2, '{"timeline_urgency": "asap"}'),
  ('urgency_month', 'urgency', 'Within Month', 'Within 30 days', 1.0, '{"timeline_urgency": "within_month"}'),
  ('urgency_3months', 'urgency', 'Within 3 Months', 'Flexible timing', 1.0, '{"timeline_urgency": "within_3_months"}'),
  ('urgency_flexible', 'urgency', 'Flexible', 'No rush', 0.95, '{"timeline_urgency": "flexible"}'),
  ('urgency_exploring', 'urgency', 'Just Exploring', 'Planning ahead', 0.95, '{"timeline_urgency": "just_exploring"}');

-- Estimate range multipliers (for low/high calculations)
INSERT INTO pricing_rules (rule_key, rule_category, display_name, description, multiplier)
VALUES
  ('range_low', 'range', 'Low Estimate', 'Multiplier for low end of range', 0.85),
  ('range_high', 'range', 'High Estimate', 'Multiplier for high end of range', 1.25);

-- Minimum charges
INSERT INTO pricing_rules (rule_key, rule_category, display_name, description, min_charge)
VALUES
  ('min_replacement', 'minimum', 'Minimum Replacement', 'Minimum charge for any replacement job', 3500.00),
  ('min_repair', 'minimum', 'Minimum Repair', 'Minimum charge for any repair job', 350.00),
  ('min_inspection', 'minimum', 'Minimum Inspection', 'Minimum charge for inspection', 150.00);
