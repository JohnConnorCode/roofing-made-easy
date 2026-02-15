-- Create storage bucket for job documents and photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-documents',
  'job-documents',
  false,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for job-documents bucket
CREATE POLICY "job_docs_admin_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'job-documents' AND EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "job_docs_admin_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'job-documents' AND EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "job_docs_admin_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'job-documents' AND EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  ));
