-- ============================================================
-- File Conversion Module: Storage Bucket + RLS Policies
-- Creates `conversions` bucket with per-user RLS enforcement
-- ============================================================

-- 1. Create the conversions bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'conversions',
  'conversions',
  false,
  52428800,  -- 50 MB max per file
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. SELECT: users can only read their own files
DROP POLICY IF EXISTS conversions_select_own ON storage.objects;
CREATE POLICY conversions_select_own
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'conversions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. INSERT: users can only upload to their own folder
DROP POLICY IF EXISTS conversions_insert_own ON storage.objects;
CREATE POLICY conversions_insert_own
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'conversions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. UPDATE: users can only update their own files
DROP POLICY IF EXISTS conversions_update_own ON storage.objects;
CREATE POLICY conversions_update_own
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'conversions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. DELETE: users can only delete their own files
DROP POLICY IF EXISTS conversions_delete_own ON storage.objects;
CREATE POLICY conversions_delete_own
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'conversions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. Service role bypass (needed by edge function)
DROP POLICY IF EXISTS conversions_service_role ON storage.objects;
CREATE POLICY conversions_service_role
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'conversions')
  WITH CHECK (bucket_id = 'conversions');
