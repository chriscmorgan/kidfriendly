-- Security hardening: fix two RLS gaps
-- Run this in the Supabase SQL Editor.

-- ─── 1. Prevent privilege escalation via role self-promotion ─────────────────
-- The original update policy had no WITH CHECK, so any user could run:
--   UPDATE users SET role = 'admin' WHERE id = auth.uid()
-- This replacement locks the role column to its current value on self-updates.

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

-- ─── 2. Prevent IDOR on photo uploads ────────────────────────────────────────
-- The original policy only checked uploaded_by = auth.uid(), so any
-- authenticated user could upload photos to any location_id they chose.
-- This replacement requires the location to have been submitted by the uploader.

DROP POLICY IF EXISTS "Authenticated users can upload photos" ON public.location_photos;

CREATE POLICY "Authenticated users can upload photos" ON public.location_photos
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1 FROM public.locations
      WHERE id = location_id
        AND submitted_by = auth.uid()
    )
  );
