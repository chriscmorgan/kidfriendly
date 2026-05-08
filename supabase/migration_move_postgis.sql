-- Move PostGIS out of public schema to fix Supabase advisor warnings:
--   - rls_disabled_in_public (spatial_ref_sys)
--   - extension_in_public (postgis)
--
-- Safe to run: schema uses double precision lat/lng, no PostGIS geometry types.

DROP EXTENSION IF EXISTS postgis CASCADE;
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;
