-- Security hardening: address Supabase advisor warnings
-- Run this in the Supabase SQL Editor.

-- ─── 1. handle_new_user: fix mutable search_path ────────────────────────────
-- Without SET search_path, a malicious search_path could redirect table lookups.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- ─── 3. handle_new_user: revoke REST-callable EXECUTE ────────────────────────
-- This is a trigger function; it should never be called directly via the API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- ─── 4. Photos bucket: replace broad policy with scoped policies ─────────────
-- Replace the original "Public can read Photos" (which was FOR ALL, enabling both
-- listing and uploading) with two targeted policies:
--   - Authenticated users can upload to the Photos bucket
--   - Public URL access works without a SELECT policy on a public bucket
DROP POLICY IF EXISTS "Public can read Photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'Photos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'Photos'
    AND auth.role() = 'authenticated'
  ) WITH CHECK (
    bucket_id = 'Photos'
    AND auth.role() = 'authenticated'
  );
