-- Fix: re-add a SELECT policy for the Photos bucket.
-- When we dropped "Public can read Photos" (which was FOR ALL) and replaced
-- it with scoped INSERT + UPDATE policies, we forgot the SELECT.
-- Without SELECT, upsert (INSERT ... ON CONFLICT DO UPDATE) fails because
-- PostgreSQL requires the upserting role to be able to SELECT the conflicting
-- row before it can update it.  Photos are public, so this is correct.

CREATE POLICY "Public can read Photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'Photos');
