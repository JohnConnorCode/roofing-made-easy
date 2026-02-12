-- ============================================
-- Migration: Add business config columns to settings table
-- Bridges the gap between hardcoded BUSINESS_CONFIG and DB-managed settings
-- ============================================

-- Founded year
ALTER TABLE settings ADD COLUMN IF NOT EXISTS company_founded_year VARCHAR(10);

-- Raw phone (E.164 format for schema.org)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS company_phone_raw VARCHAR(50);

-- Support email
ALTER TABLE settings ADD COLUMN IF NOT EXISTS company_email_support VARCHAR(255);

-- Address extensions
ALTER TABLE settings ADD COLUMN IF NOT EXISTS address_state_code VARCHAR(10);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS address_country VARCHAR(100) DEFAULT 'United States';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS address_country_code VARCHAR(10) DEFAULT 'US';

-- GPS coordinates
ALTER TABLE settings ADD COLUMN IF NOT EXISTS coordinates_lat DECIMAL(10, 7);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS coordinates_lng DECIMAL(10, 7);

-- JSONB columns for grouped, semi-structured data
ALTER TABLE settings ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::JSONB;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS verification_codes JSONB DEFAULT '{}'::JSONB;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS credentials JSONB DEFAULT '{}'::JSONB;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS reviews_config JSONB DEFAULT '{}'::JSONB;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS service_area JSONB DEFAULT '{"radiusMiles":75}'::JSONB;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS pricing_ranges JSONB DEFAULT '{}'::JSONB;

-- Seed the new columns with defaults matching BUSINESS_CONFIG
UPDATE settings SET
  company_founded_year = '2010',
  company_phone_raw = '+1-662-555-0123',
  company_email_support = 'support@farrellroofing.com',
  address_state_code = 'MS',
  address_country = 'United States',
  address_country_code = 'US',
  coordinates_lat = 34.2576,
  coordinates_lng = -88.7034,
  social_links = '{}'::JSONB,
  verification_codes = '{}'::JSONB,
  credentials = '{"gafCertified":false,"owensCorningPreferred":false,"certainteedMaster":false,"bbbAccredited":false,"stateLicensed":false,"stateContractorLicense":null}'::JSONB,
  reviews_config = '{"googleRating":null,"googleReviewCount":null,"featured":[]}'::JSONB,
  service_area = '{"radiusMiles":75,"primaryCity":"Tupelo","region":"Northeast Mississippi"}'::JSONB,
  pricing_ranges = '{"roofReplacement":{"min":8000,"max":25000},"roofRepair":{"min":300,"max":5000},"inspection":{"min":0,"max":250},"stormDamage":{"min":500,"max":15000}}'::JSONB
WHERE id = 1;

-- Add an anon SELECT policy so server-side config loader can read without auth
-- (settings are not sensitive - they're displayed on public pages)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'settings_anon_select'
  ) THEN
    CREATE POLICY settings_anon_select ON settings FOR SELECT USING (true);
  END IF;
END
$$;
