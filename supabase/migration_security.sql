-- Migration: Security hardening — run in Supabase SQL Editor
-- Safe to run on existing databases (uses IF NOT EXISTS / IF EXISTS guards).

-- ── Ensure website and opening_hours columns exist ──────────────────────────
alter table public.locations
  add column if not exists website text,
  add column if not exists opening_hours text;

-- ── Website URL validation ───────────────────────────────────────────────────
-- Drop first in case of re-run, then re-add.
alter table public.locations
  drop constraint if exists website_must_be_url;

alter table public.locations
  add constraint website_must_be_url
  check (website is null or website ~* '^https?://');

-- ── DELETE policies for admins ───────────────────────────────────────────────
drop policy if exists "Admins can delete locations" on public.locations;
create policy "Admins can delete locations" on public.locations
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admins can delete photos" on public.location_photos;
create policy "Admins can delete photos" on public.location_photos
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ── Also allow uploader to delete their own photos ───────────────────────────
drop policy if exists "Uploaders can delete their own photos" on public.location_photos;
create policy "Uploaders can delete their own photos" on public.location_photos
  for delete using (auth.uid() = uploaded_by);
