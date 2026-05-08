-- KidFriendlyEats — Supabase schema
-- Run this in the Supabase SQL editor to initialise the database.

-- ─── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists postgis schema extensions;

-- ─── Enums ───────────────────────────────────────────────────────────────────
create type user_role as enum ('contributor', 'admin');
create type location_status as enum ('pending', 'approved', 'rejected');
create type report_target as enum ('location', 'review');

-- ─── Users ───────────────────────────────────────────────────────────────────
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  role user_role not null default 'contributor',
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read all profiles" on public.users
  for select using (true);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.users where id = auth.uid())
  );

-- Auto-create user row on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Locations ───────────────────────────────────────────────────────────────
create table public.locations (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text not null check (char_length(description) between 1 and 1000),
  address text not null,
  lat double precision not null,
  lng double precision not null,
  suburb text not null,
  tags text[] not null default '{}',
  open_times text[] not null default '{}',
  age_ranges text[] not null default '{}',
  tips text check (char_length(tips) <= 280),
  website text check (website is null or website ~* '^https?://'),
  opening_hours text,
  status location_status not null default 'pending',
  submitted_by uuid not null references public.users(id),
  rejection_note text,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

alter table public.locations enable row level security;

create policy "Anyone can view approved locations" on public.locations
  for select using (status = 'approved');

create policy "Contributors can view their own submissions" on public.locations
  for select using (auth.uid() = submitted_by);

create policy "Admins can view all locations" on public.locations
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can submit locations" on public.locations
  for insert with check (auth.uid() = submitted_by);

create policy "Admins can update any location" on public.locations
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Contributors can update their pending submissions" on public.locations
  for update using (auth.uid() = submitted_by and status = 'pending');

create policy "Admins can delete locations" on public.locations
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ─── Location Photos ─────────────────────────────────────────────────────────
create table public.location_photos (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references public.locations(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  uploaded_by uuid not null references public.users(id)
);

alter table public.location_photos enable row level security;

create policy "Anyone can view photos for approved locations" on public.location_photos
  for select using (
    exists (select 1 from public.locations where id = location_id and status = 'approved')
  );

create policy "Admins can view all photos" on public.location_photos
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can upload photos" on public.location_photos
  for insert with check (
    auth.uid() = uploaded_by
    and exists (
      select 1 from public.locations
      where id = location_id
        and submitted_by = auth.uid()
    )
  );

create policy "Admins can delete photos" on public.location_photos
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Uploaders can delete their own photos" on public.location_photos
  for delete using (auth.uid() = uploaded_by);

-- ─── Reviews ─────────────────────────────────────────────────────────────────
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references public.locations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  comment text check (char_length(comment) <= 280),
  rating_food int check (rating_food between 1 and 5),
  rating_noise int check (rating_noise between 1 and 5),
  rating_safety int check (rating_safety between 1 and 5),
  rating_cleanliness int check (rating_cleanliness between 1 and 5),
  rating_access int check (rating_access between 1 and 5),
  rating_weather int check (rating_weather between 1 and 5),
  rating_age_suitability int check (rating_age_suitability between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_id, user_id)
);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews" on public.reviews
  for select using (true);

create policy "Authenticated users can submit reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own reviews" on public.reviews
  for update using (auth.uid() = user_id);

create policy "Admins can delete reviews" on public.reviews
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ─── Reports ─────────────────────────────────────────────────────────────────
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  target_type report_target not null,
  target_id uuid not null,
  reported_by uuid not null references public.users(id),
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "Authenticated users can submit reports" on public.reports
  for insert with check (auth.uid() = reported_by);

create policy "Admins can view all reports" on public.reports
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete reports" on public.reports
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ─── Storage buckets ─────────────────────────────────────────────────────────
-- Run in Supabase dashboard > Storage, or via CLI:
-- supabase storage create location-photos --public
