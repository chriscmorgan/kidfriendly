-- Migration: Replace primary_category/additional_categories with tags/open_times
-- Run this in the Supabase SQL Editor.

-- Step 1: Add new columns (nullable so existing rows don't violate constraints)
alter table public.locations
  add column if not exists tags       text[] not null default '{}',
  add column if not exists open_times text[] not null default '{}';

-- Step 2: Backfill the 10 Melbourne seed locations
update public.locations set tags = array['adjacent_playground','outdoor_run_area'], open_times = array[]::text[]
  where slug = 'royal-botanic-gardens-melbourne';

update public.locations set tags = array['outdoor_run_area','kids_play_area'], open_times = array[]::text[]
  where slug = 'melbourne-zoo-parkville';

update public.locations set tags = array['indoor_playground','play_centre'], open_times = array[]::text[]
  where slug = 'scienceworks-spotswood';

update public.locations set tags = array['adjacent_playground','outdoor_run_area'], open_times = array[]::text[]
  where slug = 'st-kilda-beach-foreshore';

update public.locations set tags = array['outdoor_run_area','adjacent_playground'], open_times = array['breakfast','lunch']
  where slug = 'collingwood-childrens-farm-abbotsford';

update public.locations set tags = array['kids_play_area','adjacent_playground','outdoor_run_area'], open_times = array[]::text[]
  where slug = 'bundoora-park-farm-bundoora';

update public.locations set tags = array['indoor_playground','play_centre'], open_times = array[]::text[]
  where slug = 'legoland-discovery-centre-chadstone';

update public.locations set tags = array['adjacent_playground','outdoor_run_area'], open_times = array[]::text[]
  where slug = 'emerald-lake-park-emerald';

update public.locations set tags = array['kids_play_area','adjacent_playground'], open_times = array['breakfast','lunch']
  where slug = 'pontoon-cafe-south-melbourne';

update public.locations set tags = array['outdoor_run_area','adjacent_playground'], open_times = array[]::text[]
  where slug = 'fitzroy-swimming-pool-fitzroy-north';

-- Step 3: Drop old columns
alter table public.locations
  drop column if exists primary_category,
  drop column if exists additional_categories;
