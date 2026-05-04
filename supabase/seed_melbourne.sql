-- Melbourne test locations
-- Run in Supabase SQL Editor after schema.sql has been applied.
-- Locations are inserted as 'approved' so they appear immediately.

do $$
declare
  v_user_id uuid;
  v_loc_id uuid;
begin
  -- Get your user ID (update email if needed)
  select id into v_user_id
  from auth.users
  where email = 'chris.c.morgan.email@gmail.com';

  if v_user_id is null then
    raise exception 'User not found — check the email address above';
  end if;

  -- ── 1. Royal Botanic Gardens ──────────────────────────────────────────────
  v_loc_id := uuid_generate_v4();
  insert into public.locations (id, slug, name, description, address, lat, lng, suburb, tags, open_times, age_ranges, tips, status, submitted_by, approved_at)
  values (v_loc_id, 'royal-botanic-gardens-melbourne', 'Royal Botanic Gardens Melbourne',
    'A stunning 38-hectare garden in the heart of Melbourne with a dedicated children''s garden featuring a water play area, tunnels, and sensory plants. The main gardens have wide pram-friendly paths winding past ornamental lakes. The Ian Potter Foundation Children''s Garden (open Wed–Sun) is a highlight for under-10s with its vegetable patch, bamboo forest, and splash zone.',
    'Birdwood Ave, South Yarra VIC 3141', -37.8304, 144.9798, 'South Yarra',
    array['adjacent_playground','outdoor_run_area'], array[]::text[], array['toddler','preschool','primary','all_ages'],
    'The Children''s Garden closes Mon–Tue. Arrive early on weekends — it fills up fast. Free entry. Pram hire available near Gate F.',
    'approved', v_user_id, now());
  insert into public.location_photos (id, location_id, url, sort_order, uploaded_by) values
    (uuid_generate_v4(), v_loc_id, 'https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=800&q=80', 0, v_user_id),
    (uuid_generate_v4(), v_loc_id, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 1, v_user_id);

  -- ── 2. Melbourne Zoo ──────────────────────────────────────────────────────
  v_loc_id := uuid_generate_v4();
  insert into public.locations (id, slug, name, description, address, lat, lng, suburb, tags, open_times, age_ranges, tips, status, submitted_by, approved_at)
  values (v_loc_id, 'melbourne-zoo-parkville', 'Melbourne Zoo',
    'One of Australia''s oldest and most loved zoos, home to over 320 species. Kids love the Trail of the Elephants, the Gorilla Rainforest, and the dedicated Butterfly House. The zoo runs excellent school holiday programs and keeper talks throughout the day. Pram-friendly paths throughout and a great outdoor play area near the main entrance.',
    'Elliott Ave, Parkville VIC 3052', -37.7849, 144.9514, 'Parkville',
    array['outdoor_run_area','kids_play_area'], array[]::text[], array['toddler','preschool','primary','all_ages'],
    'Take the tram (Route 58) from the CBD — much easier than driving. Buy tickets online for a small discount. Free for members.',
    'approved', v_user_id, now());
  insert into public.location_photos (id, location_id, url, sort_order, uploaded_by) values
    (uuid_generate_v4(), v_loc_id, 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&q=80', 0, v_user_id);

  -- ── 3. Scienceworks ───────────────────────────────────────────────────────
  v_loc_id := uuid_generate_v4();
  insert into public.locations (id, slug, name, description, address, lat, lng, suburb, tags, open_times, age_ranges, tips, status, submitted_by, approved_at)
  values (v_loc_id, 'scienceworks-spotswood', 'Scienceworks',
    'Melbourne''s hands-on science museum is a guaranteed hit for curious kids. Spread across three buildings, highlights include Nitty Gritty Super City (a child-sized town for under-8s), the planetarium, and the rotating blockbuster exhibitions. Interactive exhibits let kids touch, build, and experiment with everything from weather to electricity.',
    '2 Booker St, Spotswood VIC 3015', -37.8277, 144.8860, 'Spotswood',
    array['indoor_playground','play_centre'], array[]::text[], array['toddler','preschool','primary'],
    'Planetarium shows cost extra — book ahead. School holidays are very busy; arrive at opening time. Free parking on site.',
    'approved', v_user_id, now());
  insert into public.location_photos (id, location_id, url, sort_order, uploaded_by) values
    (uuid_generate_v4(), v_loc_id, 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80', 0, v_user_id);

  -- ── 4. St Kilda Beach & Foreshore ─────────────────────────────────────────
  v_loc_id := uuid_generate_v4();
  insert into public.locations (id, slug, name, description, address, lat, lng, suburb, tags, open_times, age_ranges, tips, status, submitted_by, approved_at)
  values (v_loc_id, 'st-kilda-beach-foreshore', 'St Kilda Beach & Foreshore',
    'Melbourne''s most iconic beach strip with calm Port Phillip Bay waters perfect for young children. The foreshore has an excellent adventure playground, a skate park, and the famous Luna Park right next door. Walking paths stretch along the water for easy pram pushing. The Sunday market and nearby Acland Street bakeries make for a great family outing.',
    'Jacka Blvd, St Kilda VIC 3182', -37.8676, 144.9795, 'St Kilda',
    array['adjacent_playground','outdoor_run_area'], array[]::text[], array['toddler','preschool','primary','all_ages'],
    'The water is calm and shallow — great for toddlers. Paid parking on Jacka Blvd fills fast on weekends; try the side streets. The Adventure Playground is free.',
    'approved', v_user_id, now());
  insert into public.location_photos (id, location_id, url, sort_order, uploaded_by) values
    (uuid_generate_v4(), v_loc_id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 0, v_user_id),
    (uuid_generate_v4(), v_loc_id, 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80', 1, v_user_id);

  -- ── 5. Collingwood Children's Farm ────────────────────────────────────────
  v_loc_id := uuid_generate_v4();
  insert into public.locations (id, slug, name, description, address, lat, lng, suburb, tags, open_times, age_ranges, tips, status, submitted_by, approved_at)
  values (v_loc_id, 'collingwood-childrens-farm-abbotsford', 'Collingwood Children''s Farm',
    'A working community farm right beside the Yarra River where kids can feed sheep, goats, and chickens, collect eggs, and watch cows being milked. The setting feels genuinely rural despite being 3km from the CBD. The onsite cafe does great weekend breakfasts. The grounds are lovely for a picnic by the river after farm time.',
    '18 St Heliers St, Abbotsford VIC 3067', -37.7969, 144.9875, 'Abbotsford',
    array['outdoor_run_area','adjacent_playground'], array['breakfast','lunch'], array['toddler','preschool','primary'],
    'Cow milking is at 9:30am on weekends — arrive early. Small entry fee. Cash and card accepted. Dogs allowed on leash in the grounds (not inside the farm).',
    'approved', v_user_id, now());
  insert into public.location_photos (id, location_id, url, sort_order, uploaded_by) values
    (uuid_generate_v4(), v_loc_id, 'https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80?w=800&q=80', 0, v_user_id);

  -- ── 6. Bundoora Park Farm ─────────────────────────────────────────────────
  v_loc_id := uuid_generate_v4();
  insert into public.locations (id, slug, name, description, address, lat, lng, suburb, tags, open_times, age_ranges, tips, status, submitted_by, approved_at)
  values (v_loc_id, 'bundoora-park-farm-bundoora', 'Bundoora Park Farm',
    'A free community farm and park in Melbourne''s north with animals, playgrounds, and wide open lawns. Kids can see deer, alpacas, sheep, and native birds up close. The park also has a miniature railway that runs on weekends, a flying fox, and BBQ facilities. One of Melbourne''s best free family days out.',
    'Plenty Rd, Bundoora VIC 3083', -37.7046, 145.0561, 'Bundoora',
    array['kids_play_area','adjacent_playground','outdoor_run_area'], array[]::text[], array['toddler','preschool','primary','all_ages'],
    'The miniature railway runs weekend afternoons only — check the council website for times. Free entry and parking. Busy on Sunday afternoons.',
    'approved', v_user_id, now());
  insert into public.location_photos (id, location_id, url, sort_order, uploaded_by) values
    (uuid_generate_v4(), v_loc_id, 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80', 0, v_user_id);

  -- ── 7. LEGOLAND Discovery Centre Melbourne ────────────────────────────────
  v_loc_id := uuid_generate_v4();
  insert into public.locations (id, slug, name, description, address, lat, lng, suburb, tags, open_times, age_ranges, tips, status, submitted_by, approved_at)
  values (v_loc_id, 'legoland-discovery-centre-chadstone', 'LEGOLAND Discovery Centre',
    'An indoor LEGO paradise in Chadstone Shopping Centre with a 4D cinema, LEGO-themed rides, build-and-test zones, and a MINILAND of Melbourne landmarks built from millions of bricks. Best suited for ages 3–10. Timed entry sessions mean it never feels too crowded. The Master Model Builder studio is a favourite for older kids.',
    'Chadstone Shopping Centre, 1341 Dandenong Rd, Chadstone VIC 3148', -37.8877, 145.0813, 'Chadstone',
    array['indoor_playground','play_centre'], array[]::text[], array['toddler','preschool','primary'],
    'Book online in advance — walk-in availability is limited. Budget around 2 hours. The gift shop is unavoidable on the way out (you''ve been warned).',
    'approved', v_user_id, now());
  insert into public.location_photos (id, location_id, url, sort_order, uploaded_by) values
    (uuid_generate_v4(), v_loc_id, 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&q=80', 0, v_user_id);

  -- ── 8. Emerald Lake Park ──────────────────────────────────────────────────
  v_loc_id := uuid_generate_v4();
  insert into public.locations (id, slug, name, description, address, lat, lng, suburb, tags, open_times, age_ranges, tips, status, submitted_by, approved_at)
  values (v_loc_id, 'emerald-lake-park-emerald', 'Emerald Lake Park',
    'A beautiful Dandenong Ranges park with a large lake, paddle boats for hire, a miniature steam railway, native bushland walks, and an outdoor swimming pool (open summer). The park feels like a proper day trip destination — pack a picnic and spend the whole day. The bushland setting and wildlife sightings (parrots, echidnas) make it feel genuinely magical for kids.',
    'nobelius drive, Emerald VIC 3782', -37.9301, 145.4412, 'Emerald',
    array['adjacent_playground','outdoor_run_area'], array[]::text[], array['toddler','preschool','primary','all_ages'],
    'About 50 minutes from Melbourne CBD — worth the drive. The steam railway runs weekends and school holidays only. Bring cash for the railway and paddle boats.',
    'approved', v_user_id, now());
  insert into public.location_photos (id, location_id, url, sort_order, uploaded_by) values
    (uuid_generate_v4(), v_loc_id, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', 0, v_user_id);

  -- ── 9. Pontoon Melbourne ──────────────────────────────────────────────────
  v_loc_id := uuid_generate_v4();
  insert into public.locations (id, slug, name, description, address, lat, lng, suburb, tags, open_times, age_ranges, tips, status, submitted_by, approved_at)
  values (v_loc_id, 'pontoon-cafe-south-melbourne', 'Pontoon Cafe',
    'A relaxed waterfront cafe on the South Melbourne beach strip with a large grassed area and playground right out front. The menu has solid kid options (eggs, pancakes, toasted sandwiches) and great coffee. Tables spill outside onto the promenade with views of Port Phillip Bay. One of the more stress-free cafe options with little kids in Melbourne.',
    '1 Beaconsfield Pde, South Melbourne VIC 3205', -37.8508, 144.9536, 'South Melbourne',
    array['kids_play_area','adjacent_playground'], array['breakfast','lunch'], array['toddler','preschool','primary'],
    'Weekend wait times can be 20–30 min. Put your name down then let the kids play at the foreshore park while you wait. Free parking on Beach St before 9am.',
    'approved', v_user_id, now());
  insert into public.location_photos (id, location_id, url, sort_order, uploaded_by) values
    (uuid_generate_v4(), v_loc_id, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80', 0, v_user_id);

  -- ── 10. Fitzroy Swimming Pool ─────────────────────────────────────────────
  v_loc_id := uuid_generate_v4();
  insert into public.locations (id, slug, name, description, address, lat, lng, suburb, tags, open_times, age_ranges, tips, status, submitted_by, approved_at)
  values (v_loc_id, 'fitzroy-swimming-pool-fitzroy-north', 'Fitzroy Swimming Pool',
    'A beloved inner-north outdoor pool open during summer with a 50m lap pool and a separate toddler and learner pool with shade sails. The toddler area is shallow and fenced, making it excellent for very young children. Surrounded by a grassed sunbathing area. A kiosk sells snacks and ice creams. One of Melbourne''s most popular summer spots for young families.',
    '160 Alexandra Pde, Fitzroy North VIC 3068', -37.7892, 144.9807, 'Fitzroy North',
    array['outdoor_run_area','adjacent_playground'], array[]::text[], array['toddler','preschool','primary'],
    'Open November to March only. Arrives early in summer — capacity limits apply on hot days. The toddler pool area has excellent shade. Bring your own towels.',
    'approved', v_user_id, now());
  insert into public.location_photos (id, location_id, url, sort_order, uploaded_by) values
    (uuid_generate_v4(), v_loc_id, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80', 0, v_user_id);

  raise notice 'Done — 10 Melbourne locations inserted for user %', v_user_id;
end;
$$;
