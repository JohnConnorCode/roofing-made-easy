-- Seed Line Items Migration
-- Industry-standard roofing line items with RFG-style codes

-- =============================================================================
-- TEAR-OFF ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('RFG100', 'Tear-off - 1 layer shingles', 'Remove and dispose of single layer of existing shingles', 'tear_off', 'SQ', 0.00, 35.00, 5.00, 'SQ', 1.00, 100),
('RFG101', 'Tear-off - 2 layers shingles', 'Remove and dispose of two layers of existing shingles', 'tear_off', 'SQ', 0.00, 55.00, 8.00, 'SQ', 1.00, 101),
('RFG102', 'Tear-off - 3 layers shingles', 'Remove and dispose of three layers of existing shingles', 'tear_off', 'SQ', 0.00, 75.00, 10.00, 'SQ', 1.00, 102),
('RFG105', 'Tear-off - Wood shake', 'Remove and dispose of wood shake roofing', 'tear_off', 'SQ', 0.00, 65.00, 8.00, 'SQ', 1.00, 105),
('RFG106', 'Tear-off - Tile', 'Remove and dispose of tile roofing', 'tear_off', 'SQ', 0.00, 85.00, 12.00, 'SQ', 1.00, 106),
('RFG107', 'Tear-off - Metal', 'Remove and dispose of metal roofing', 'tear_off', 'SQ', 0.00, 45.00, 6.00, 'SQ', 1.00, 107),
('RFG108', 'Tear-off - Flat/BUR', 'Remove and dispose of built-up flat roofing', 'tear_off', 'SQ', 0.00, 95.00, 15.00, 'SQ', 1.00, 108),
('RFG110', 'Partial tear-off - Shingles', 'Remove shingles from repair area only', 'tear_off', 'SF', 0.00, 0.50, 0.05, NULL, 1.00, 110);

-- =============================================================================
-- UNDERLAYMENT ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('RFG220', 'Underlayment - 15# felt', 'Install 15-pound asphalt felt underlayment', 'underlayment', 'SQ', 8.50, 12.00, 0.00, 'SQ', 1.10, 220),
('RFG221', 'Underlayment - 30# felt', 'Install 30-pound asphalt felt underlayment', 'underlayment', 'SQ', 12.00, 12.00, 0.00, 'SQ', 1.10, 221),
('RFG240', 'Underlayment - Synthetic', 'Install synthetic underlayment (standard grade)', 'underlayment', 'SQ', 15.00, 12.00, 0.00, 'SQ', 1.10, 240),
('RFG241', 'Underlayment - Synthetic premium', 'Install premium synthetic underlayment with enhanced UV protection', 'underlayment', 'SQ', 22.00, 12.00, 0.00, 'SQ', 1.10, 241),
('RFG250', 'Ice & water shield - Standard', 'Install self-adhering ice and water shield', 'underlayment', 'SQ', 65.00, 18.00, 0.00, 'EAVE*3/100', 1.05, 250),
('RFG251', 'Ice & water shield - Premium', 'Install premium self-adhering ice and water shield', 'underlayment', 'SQ', 85.00, 18.00, 0.00, 'EAVE*3/100', 1.05, 251),
('RFG252', 'Ice & water shield - Valley', 'Install ice and water shield in valleys', 'underlayment', 'LF', 2.50, 1.50, 0.00, 'VAL', 1.05, 252);

-- =============================================================================
-- SHINGLE ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('RFG410', 'Shingles - 3-tab 25yr', '3-tab asphalt shingles, 25-year warranty', 'shingles', 'SQ', 85.00, 75.00, 0.00, 'SQ', 1.10, 410),
('RFG411', 'Shingles - 3-tab 30yr', '3-tab asphalt shingles, 30-year warranty', 'shingles', 'SQ', 95.00, 75.00, 0.00, 'SQ', 1.10, 411),
('RFG420', 'Shingles - Laminate standard', 'Architectural laminate shingles, standard grade', 'shingles', 'SQ', 125.00, 85.00, 0.00, 'SQ', 1.10, 420),
('RFG421', 'Shingles - Laminate premium', 'Architectural laminate shingles, premium grade', 'shingles', 'SQ', 155.00, 90.00, 0.00, 'SQ', 1.10, 421),
('RFG422', 'Shingles - Laminate luxury', 'Architectural laminate shingles, luxury grade (50yr)', 'shingles', 'SQ', 195.00, 95.00, 0.00, 'SQ', 1.10, 422),
('RFG430', 'Shingles - Designer', 'Designer architectural shingles with enhanced aesthetics', 'shingles', 'SQ', 175.00, 95.00, 0.00, 'SQ', 1.10, 430),
('RFG431', 'Shingles - Impact resistant', 'Class 4 impact resistant shingles', 'shingles', 'SQ', 225.00, 100.00, 0.00, 'SQ', 1.10, 431),
('RFG432', 'Shingles - Cool roof', 'Energy Star rated cool roof shingles', 'shingles', 'SQ', 185.00, 90.00, 0.00, 'SQ', 1.10, 432),
('RFG440', 'Starter strip', 'Pre-cut starter strip shingles for eaves and rakes', 'shingles', 'LF', 1.25, 0.75, 0.00, 'EAVE+RAKE', 1.05, 440),
('RFG445', 'Ridge cap - 3-tab', '3-tab ridge cap shingles', 'shingles', 'LF', 1.50, 1.00, 0.00, 'R+HIP', 1.05, 445),
('RFG446', 'Ridge cap - Hip & ridge', 'High-profile hip and ridge cap shingles', 'shingles', 'LF', 2.50, 1.25, 0.00, 'R+HIP', 1.05, 446);

-- =============================================================================
-- METAL ROOFING ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('MTL500', 'Metal - Standing seam 24ga', '24-gauge standing seam metal panels', 'metal_roofing', 'SQ', 350.00, 175.00, 25.00, 'SQ', 1.08, 500),
('MTL501', 'Metal - Standing seam 26ga', '26-gauge standing seam metal panels', 'metal_roofing', 'SQ', 275.00, 165.00, 25.00, 'SQ', 1.08, 501),
('MTL502', 'Metal - Standing seam copper', 'Copper standing seam panels', 'metal_roofing', 'SQ', 1200.00, 250.00, 35.00, 'SQ', 1.08, 502),
('MTL510', 'Metal - Corrugated 29ga', '29-gauge corrugated metal panels', 'metal_roofing', 'SQ', 125.00, 95.00, 15.00, 'SQ', 1.10, 510),
('MTL511', 'Metal - R-panel 26ga', '26-gauge R-panel metal roofing', 'metal_roofing', 'SQ', 165.00, 110.00, 18.00, 'SQ', 1.10, 511),
('MTL520', 'Metal - Shingle style steel', 'Steel metal shingles mimicking traditional look', 'metal_roofing', 'SQ', 450.00, 185.00, 20.00, 'SQ', 1.05, 520),
('MTL521', 'Metal - Shingle style aluminum', 'Aluminum metal shingles', 'metal_roofing', 'SQ', 550.00, 195.00, 20.00, 'SQ', 1.05, 521),
('MTL550', 'Metal ridge cap', 'Metal ridge cap for standing seam', 'metal_roofing', 'LF', 8.00, 4.00, 0.00, 'R', 1.05, 550),
('MTL551', 'Metal drip edge', 'Metal drip edge trim', 'metal_roofing', 'LF', 3.50, 2.00, 0.00, 'EAVE+RAKE', 1.05, 551),
('MTL552', 'Metal valley', 'Metal valley flashing', 'metal_roofing', 'LF', 6.00, 3.50, 0.00, 'VAL', 1.05, 552);

-- =============================================================================
-- FLASHING ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('FLS100', 'Drip edge - Aluminum std', 'Standard aluminum drip edge', 'flashing', 'LF', 1.25, 1.50, 0.00, 'EAVE+RAKE', 1.05, 600),
('FLS101', 'Drip edge - Aluminum HD', 'Heavy-duty aluminum drip edge', 'flashing', 'LF', 1.75, 1.50, 0.00, 'EAVE+RAKE', 1.05, 601),
('FLS102', 'Drip edge - Galvanized', 'Galvanized steel drip edge', 'flashing', 'LF', 1.50, 1.50, 0.00, 'EAVE+RAKE', 1.05, 602),
('FLS110', 'Step flashing - Aluminum', 'Aluminum step flashing (per piece)', 'flashing', 'EA', 0.85, 2.00, 0.00, NULL, 1.00, 610),
('FLS111', 'Step flashing - Galvanized', 'Galvanized step flashing (per piece)', 'flashing', 'EA', 0.65, 2.00, 0.00, NULL, 1.00, 611),
('FLS112', 'Step flashing - Copper', 'Copper step flashing (per piece)', 'flashing', 'EA', 3.50, 3.00, 0.00, NULL, 1.00, 612),
('FLS120', 'Valley metal - Aluminum', 'Pre-formed aluminum valley metal', 'flashing', 'LF', 3.50, 4.00, 0.00, 'VAL', 1.05, 620),
('FLS121', 'Valley metal - Galvanized', 'Pre-formed galvanized valley metal', 'flashing', 'LF', 2.75, 4.00, 0.00, 'VAL', 1.05, 621),
('FLS122', 'Valley metal - Copper', 'Pre-formed copper valley metal', 'flashing', 'LF', 15.00, 6.00, 0.00, 'VAL', 1.05, 622),
('FLS130', 'Wall flashing - Aluminum', 'Aluminum wall flashing/counter flashing', 'flashing', 'LF', 2.50, 3.50, 0.00, NULL, 1.05, 630),
('FLS131', 'Headwall flashing', 'Headwall flashing at wall/roof intersection', 'flashing', 'LF', 3.00, 4.50, 0.00, NULL, 1.05, 631),
('FLS140', 'Pipe boot - Neoprene std', 'Standard neoprene pipe boot (1.5-3")', 'flashing', 'EA', 8.00, 18.00, 0.00, 'PIPE_COUNT', 1.00, 640),
('FLS141', 'Pipe boot - Neoprene large', 'Large neoprene pipe boot (3-4")', 'flashing', 'EA', 12.00, 22.00, 0.00, NULL, 1.00, 641),
('FLS142', 'Pipe boot - Lead', 'Lead pipe boot flashing', 'flashing', 'EA', 25.00, 25.00, 0.00, NULL, 1.00, 642),
('FLS143', 'Pipe boot - Retrofit', 'Retrofit pipe boot (over existing)', 'flashing', 'EA', 35.00, 15.00, 0.00, NULL, 1.00, 643);

-- =============================================================================
-- VENTILATION ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('VNT100', 'Ridge vent - Shingle over', 'Shingle-over ridge vent', 'ventilation', 'LF', 4.00, 3.50, 0.00, 'R', 1.00, 700),
('VNT101', 'Ridge vent - Aluminum', 'Aluminum ridge vent', 'ventilation', 'LF', 5.50, 4.00, 0.00, 'R', 1.00, 701),
('VNT102', 'Ridge vent - Filter', 'Ridge vent with external baffle/filter', 'ventilation', 'LF', 6.50, 4.50, 0.00, 'R', 1.00, 702),
('VNT110', 'Pipe boot - Standard', 'Standard pipe boot for plumbing vents', 'ventilation', 'EA', 15.00, 25.00, 0.00, 'PIPE_COUNT', 1.00, 710),
('VNT120', 'Roof vent - 50 sq in', 'Static roof vent, 50 sq in NFA', 'ventilation', 'EA', 18.00, 35.00, 0.00, 'VENT_COUNT', 1.00, 720),
('VNT121', 'Roof vent - 65 sq in', 'Static roof vent, 65 sq in NFA', 'ventilation', 'EA', 25.00, 38.00, 0.00, NULL, 1.00, 721),
('VNT122', 'Turbine vent - 12"', '12-inch turbine vent', 'ventilation', 'EA', 45.00, 55.00, 0.00, NULL, 1.00, 722),
('VNT123', 'Turbine vent - 14"', '14-inch turbine vent', 'ventilation', 'EA', 55.00, 60.00, 0.00, NULL, 1.00, 723),
('VNT130', 'Power vent - Standard', 'Electric powered attic vent', 'ventilation', 'EA', 125.00, 95.00, 0.00, NULL, 1.00, 730),
('VNT131', 'Power vent - Solar', 'Solar powered attic vent', 'ventilation', 'EA', 225.00, 85.00, 0.00, NULL, 1.00, 731),
('VNT140', 'Soffit vent - Strip', 'Continuous soffit vent strip', 'ventilation', 'LF', 2.50, 2.00, 0.00, 'EAVE', 1.00, 740),
('VNT141', 'Soffit vent - Individual', 'Individual soffit vent', 'ventilation', 'EA', 5.00, 8.00, 0.00, NULL, 1.00, 741);

-- =============================================================================
-- GUTTER ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('GTR200', 'Gutter - 5" K-style aluminum', '5-inch K-style seamless aluminum gutter', 'gutters', 'LF', 5.50, 5.00, 0.00, 'GUTTER_LF', 1.00, 800),
('GTR201', 'Gutter - 6" K-style aluminum', '6-inch K-style seamless aluminum gutter', 'gutters', 'LF', 7.00, 5.50, 0.00, 'GUTTER_LF', 1.00, 801),
('GTR202', 'Gutter - 5" half-round aluminum', '5-inch half-round seamless aluminum gutter', 'gutters', 'LF', 8.50, 6.00, 0.00, 'GUTTER_LF', 1.00, 802),
('GTR203', 'Gutter - 6" half-round copper', '6-inch half-round copper gutter', 'gutters', 'LF', 35.00, 12.00, 0.00, 'GUTTER_LF', 1.00, 803),
('GTR210', 'Downspout - 2x3 aluminum', '2x3 inch aluminum downspout', 'gutters', 'LF', 3.50, 4.00, 0.00, 'DS_COUNT*10', 1.00, 810),
('GTR211', 'Downspout - 3x4 aluminum', '3x4 inch aluminum downspout', 'gutters', 'LF', 4.50, 4.50, 0.00, 'DS_COUNT*10', 1.00, 811),
('GTR212', 'Downspout - Round 3" copper', '3-inch round copper downspout', 'gutters', 'LF', 18.00, 8.00, 0.00, NULL, 1.00, 812),
('GTR220', 'Gutter guard - Mesh', 'Mesh gutter guard', 'gutters', 'LF', 4.00, 3.00, 0.00, 'GUTTER_LF', 1.00, 820),
('GTR221', 'Gutter guard - Solid cover', 'Solid cover gutter guard', 'gutters', 'LF', 8.00, 4.00, 0.00, 'GUTTER_LF', 1.00, 821),
('GTR222', 'Gutter hanger - Hidden', 'Hidden gutter hanger', 'gutters', 'EA', 1.50, 1.00, 0.00, 'GUTTER_LF/2', 1.00, 822),
('GTR223', 'Gutter end cap', 'Gutter end cap', 'gutters', 'EA', 3.00, 2.00, 0.00, NULL, 1.00, 823),
('GTR224', 'Downspout elbow', 'Downspout elbow', 'gutters', 'EA', 4.00, 3.00, 0.00, 'DS_COUNT*2', 1.00, 824);

-- =============================================================================
-- SKYLIGHT ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('SKY300', 'Skylight reflash - Standard', 'Reflash existing skylight with new flashing kit', 'skylights', 'EA', 85.00, 150.00, 0.00, 'SKYLIGHT_COUNT', 1.00, 900),
('SKY301', 'Skylight reflash - Curb mount', 'Reflash curb-mounted skylight', 'skylights', 'EA', 125.00, 175.00, 0.00, NULL, 1.00, 901),
('SKY310', 'Skylight replace - Fixed 2x2', 'Replace 2x2 fixed skylight complete', 'skylights', 'EA', 350.00, 275.00, 25.00, NULL, 1.00, 910),
('SKY311', 'Skylight replace - Fixed 2x4', 'Replace 2x4 fixed skylight complete', 'skylights', 'EA', 450.00, 325.00, 35.00, NULL, 1.00, 911),
('SKY312', 'Skylight replace - Venting 2x4', 'Replace 2x4 venting skylight complete', 'skylights', 'EA', 650.00, 375.00, 45.00, NULL, 1.00, 912),
('SKY320', 'Sun tunnel - 10" rigid', '10-inch rigid sun tunnel/tubular skylight', 'skylights', 'EA', 275.00, 225.00, 0.00, NULL, 1.00, 920),
('SKY321', 'Sun tunnel - 14" rigid', '14-inch rigid sun tunnel/tubular skylight', 'skylights', 'EA', 325.00, 250.00, 0.00, NULL, 1.00, 921);

-- =============================================================================
-- CHIMNEY ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('CHM400', 'Chimney flash - Standard', 'Standard chimney reflash with step and counter flashing', 'chimneys', 'EA', 125.00, 275.00, 0.00, 'CHIMNEY_COUNT', 1.00, 1000),
('CHM401', 'Chimney flash - Large', 'Large chimney reflash (over 32")', 'chimneys', 'EA', 185.00, 375.00, 0.00, NULL, 1.00, 1001),
('CHM402', 'Chimney flash - Cricket', 'Install chimney cricket/saddle', 'chimneys', 'EA', 175.00, 225.00, 0.00, NULL, 1.00, 1002),
('CHM410', 'Chimney cap - Standard', 'Standard stainless steel chimney cap', 'chimneys', 'EA', 125.00, 95.00, 0.00, NULL, 1.00, 1010),
('CHM411', 'Chimney cap - Multi-flue', 'Multi-flue chimney cap', 'chimneys', 'EA', 225.00, 125.00, 0.00, NULL, 1.00, 1011);

-- =============================================================================
-- DECKING ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('DCK500', 'Decking - 7/16" OSB', '7/16" OSB roof sheathing', 'decking', 'SF', 0.85, 0.75, 0.00, NULL, 1.10, 1100),
('DCK501', 'Decking - 1/2" CDX plywood', '1/2" CDX plywood roof sheathing', 'decking', 'SF', 1.10, 0.80, 0.00, NULL, 1.10, 1101),
('DCK502', 'Decking - 5/8" CDX plywood', '5/8" CDX plywood roof sheathing', 'decking', 'SF', 1.35, 0.85, 0.00, NULL, 1.10, 1102),
('DCK503', 'Decking - 3/4" CDX plywood', '3/4" CDX plywood roof sheathing', 'decking', 'SF', 1.65, 0.90, 0.00, NULL, 1.10, 1103),
('DCK510', 'Decking repair - Minor', 'Minor decking repair, boards/patches up to 10 SF', 'decking', 'EA', 25.00, 45.00, 0.00, NULL, 1.00, 1110),
('DCK511', 'Decking repair - Section', 'Section decking replacement 10-32 SF', 'decking', 'SF', 1.50, 1.25, 0.00, NULL, 1.00, 1111);

-- =============================================================================
-- LABOR ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('LBR600', 'Steep pitch charge 7/12-9/12', 'Additional labor for steep pitch (7/12 to 9/12)', 'labor', 'SQ', 0.00, 15.00, 0.00, 'SQ', 1.00, 1200),
('LBR601', 'Steep pitch charge 10/12-12/12', 'Additional labor for very steep pitch (10/12 to 12/12)', 'labor', 'SQ', 0.00, 30.00, 0.00, 'SQ', 1.00, 1201),
('LBR602', 'Steep pitch charge 13/12+', 'Additional labor for extreme pitch (13/12+)', 'labor', 'SQ', 0.00, 50.00, 0.00, 'SQ', 1.00, 1202),
('LBR610', 'Height charge - 2 story', 'Additional labor for 2-story height', 'labor', 'SQ', 0.00, 10.00, 0.00, 'SQ', 1.00, 1210),
('LBR611', 'Height charge - 3+ story', 'Additional labor for 3+ story height', 'labor', 'SQ', 0.00, 20.00, 0.00, 'SQ', 1.00, 1211),
('LBR620', 'Limited access charge', 'Additional labor for difficult access', 'labor', 'SQ', 0.00, 15.00, 0.00, 'SQ', 1.00, 1220),
('LBR621', 'Hand carry charge', 'Additional labor for hand carrying materials', 'labor', 'SQ', 0.00, 25.00, 0.00, 'SQ', 1.00, 1221),
('LBR630', 'Complex roof charge', 'Additional labor for complex roof design', 'labor', 'SQ', 0.00, 20.00, 0.00, 'SQ', 1.00, 1230);

-- =============================================================================
-- EQUIPMENT ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('EQP700', 'Dump trailer rental', 'Dump trailer rental per day', 'equipment', 'DAY', 0.00, 0.00, 125.00, NULL, 1.00, 1300),
('EQP701', 'Roofing conveyor rental', 'Material conveyor rental per day', 'equipment', 'DAY', 0.00, 0.00, 185.00, NULL, 1.00, 1301),
('EQP702', 'Crane/lift rental', 'Crane or lift rental per day', 'equipment', 'DAY', 0.00, 0.00, 450.00, NULL, 1.00, 1302),
('EQP710', 'Scaffolding setup', 'Scaffolding setup and removal', 'equipment', 'LF', 0.00, 5.00, 8.00, 'EAVE', 1.00, 1310),
('EQP720', 'Fall protection setup', 'Fall protection/safety equipment setup', 'equipment', 'EA', 0.00, 50.00, 75.00, NULL, 1.00, 1320);

-- =============================================================================
-- DISPOSAL ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('DSP800', 'Debris removal - Shingles', 'Debris removal and disposal, shingles', 'disposal', 'SQ', 15.00, 0.00, 0.00, 'SQ', 1.00, 1400),
('DSP801', 'Debris removal - Tile', 'Debris removal and disposal, tile', 'disposal', 'SQ', 25.00, 0.00, 0.00, 'SQ', 1.00, 1401),
('DSP802', 'Debris removal - Metal', 'Debris removal and disposal, metal', 'disposal', 'SQ', 12.00, 0.00, 0.00, 'SQ', 1.00, 1402),
('DSP810', 'Dumpster - 10 yard', '10 yard dumpster rental and haul', 'disposal', 'EA', 0.00, 0.00, 350.00, NULL, 1.00, 1410),
('DSP811', 'Dumpster - 20 yard', '20 yard dumpster rental and haul', 'disposal', 'EA', 0.00, 0.00, 450.00, NULL, 1.00, 1411),
('DSP812', 'Dumpster - 30 yard', '30 yard dumpster rental and haul', 'disposal', 'EA', 0.00, 0.00, 550.00, NULL, 1.00, 1412);

-- =============================================================================
-- PERMIT AND MISC ITEMS
-- =============================================================================

INSERT INTO line_items (item_code, name, description, category, unit_type, base_material_cost, base_labor_cost, base_equipment_cost, quantity_formula, default_waste_factor, sort_order) VALUES
('PRM900', 'Building permit - Residential', 'Residential roofing permit', 'permits', 'EA', 150.00, 0.00, 0.00, NULL, 1.00, 1500),
('PRM901', 'Building permit - Commercial', 'Commercial roofing permit', 'permits', 'EA', 350.00, 0.00, 0.00, NULL, 1.00, 1501),
('MSC910', 'Roof coating - Elastomeric', 'Elastomeric roof coating', 'miscellaneous', 'SQ', 45.00, 35.00, 0.00, 'SQ', 1.05, 1510),
('MSC911', 'Sealant/caulk', 'Roofing sealant and caulk', 'miscellaneous', 'EA', 8.00, 5.00, 0.00, NULL, 1.00, 1511),
('MSC912', 'Roofing cement', 'Roofing cement/plastic cement', 'miscellaneous', 'GAL', 12.00, 0.00, 0.00, NULL, 1.00, 1512),
('MSC913', 'Nails - Coil', 'Coil roofing nails', 'miscellaneous', 'BDL', 45.00, 0.00, 0.00, 'SQ*0.25', 1.00, 1513),
('MSC914', 'Cap nails', 'Plastic cap nails for underlayment', 'miscellaneous', 'BDL', 35.00, 0.00, 0.00, 'SQ*0.15', 1.00, 1514);

-- =============================================================================
-- GEOGRAPHIC PRICING
-- =============================================================================

INSERT INTO geographic_pricing (name, description, state, material_multiplier, labor_multiplier, equipment_multiplier) VALUES
('National Average', 'Default national average pricing', NULL, 1.00, 1.00, 1.00),
('California', 'California state pricing', 'CA', 1.25, 1.35, 1.20),
('Texas', 'Texas state pricing', 'TX', 0.95, 0.90, 0.95),
('Florida', 'Florida state pricing', 'FL', 1.10, 1.05, 1.05),
('New York', 'New York state pricing', 'NY', 1.30, 1.40, 1.25),
('Illinois', 'Illinois state pricing', 'IL', 1.15, 1.20, 1.10),
('Pennsylvania', 'Pennsylvania state pricing', 'PA', 1.05, 1.10, 1.05),
('Ohio', 'Ohio state pricing', 'OH', 0.95, 0.95, 0.95),
('Georgia', 'Georgia state pricing', 'GA', 1.00, 0.95, 1.00),
('North Carolina', 'North Carolina state pricing', 'NC', 0.98, 0.95, 0.98),
('Michigan', 'Michigan state pricing', 'MI', 1.05, 1.05, 1.00),
('Arizona', 'Arizona state pricing', 'AZ', 1.08, 1.00, 1.05),
('Washington', 'Washington state pricing', 'WA', 1.20, 1.25, 1.15),
('Colorado', 'Colorado state pricing', 'CO', 1.12, 1.15, 1.10),
('Massachusetts', 'Massachusetts state pricing', 'MA', 1.25, 1.35, 1.20);
