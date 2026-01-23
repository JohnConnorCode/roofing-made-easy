-- ============================================
-- Storage bucket setup for photo uploads
-- Run this after connecting to Supabase
-- ============================================

-- Create the photos bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy: Anyone can upload photos (for funnel users)
CREATE POLICY "Anyone can upload photos"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'photos');

-- Policy: Anyone can read photos (needed for displaying)
CREATE POLICY "Anyone can read photos"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'photos');

-- Policy: Authenticated users (admins) can update photos
CREATE POLICY "Authenticated can update photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'photos');

-- Policy: Authenticated users (admins) can delete photos
CREATE POLICY "Authenticated can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos');
