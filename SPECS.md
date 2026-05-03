# KidSpot — Product Specification
> Community-powered map of kid-friendly locations

**Version:** 1.0 (MVP)
**Prepared for:** AI-assisted build
**Last updated:** May 2026

---

## 1. Product Overview

KidSpot is a community-driven web platform that helps parents and caregivers discover kid-friendly locations near them. Signed-in users contribute locations with photos, descriptions, and category-based ratings. Visitors can search by suburb or use their current location to browse results on a map and in a list view.

### Design Principles
- Super modern, clean, and minimal — nothing cluttered
- Feels warm and trustworthy, not corporate
- Mobile and desktop equally prioritised
- Fast to browse, fast to contribute

---

## 2. User Roles

| Role | Description |
|---|---|
| **Visitor** | Browse and search locations without signing in |
| **Contributor** | Signed-in user who submits and reviews locations |
| **Admin** | Reviews and approves/rejects submissions before they go live |

---

## 3. Authentication

- Social login only: **Google** and **Apple**
- No email/password signup
- Auth gate: browsing is public; submitting a location or writing a review requires sign-in
- User profile stores: display name, avatar (from OAuth provider), submission history

---

## 4. Core Features

### 4.1 Location Search

- **Suburb search bar** — autocomplete against known suburb/postcode data (AU focus initially)
- **"Use my location" button** — requests browser geolocation, centres map on user
- Default radius: **10km** from search centre
- Radius filter: 2km / 5km / 10km / 20km toggle

### 4.2 Dual View: Map + List

Both views are visible simultaneously on desktop (side-by-side). On mobile, tabs toggle between them.

**Map View**
- Interactive map (Mapbox GL JS or Google Maps JS API)
- Custom kid-friendly pin icons, coloured by primary category
- Clicking a pin opens a compact card preview with name, thumbnail, top-rated category badges
- Card links to full location detail page

**List View**
- Card grid (2-col desktop, 1-col mobile)
- Each card shows: hero photo, name, suburb, primary category badge, overall rating summary, age range tag
- Sort options: Nearest / Highest rated / Most reviewed / Newest

### 4.3 Location Detail Page

URL pattern: `/location/[slug]`

Sections:
1. **Hero photo carousel** (up to 10 images)
2. **Name, suburb, address** with "Get Directions" link (opens Google Maps)
3. **Description** — free text from contributor, up to 1000 chars
4. **Category badges** (see Section 5)
5. **Category ratings** — visual breakdown (see Section 6)
6. **Age range tags** — the recommended age groups this location suits
7. **Community reviews** — list of user-submitted ratings and optional short comment (280 chars)
8. **Submitted by** — contributor name + date
9. **Report this listing** button

### 4.4 Location Submission

Accessible via a prominent "Add a Place" CTA (requires sign-in).

**Submission form fields:**

| Field | Type | Notes |
|---|---|---|
| Name | Text | Required |
| Address / Location | Address picker | Required — geocoded to lat/lng |
| Primary category | Single select | See Section 5 |
| Additional categories | Multi-select | Optional, up to 3 more |
| Description | Textarea | Required, 50–1000 chars |
| Photos | Image upload | Required min 1, max 10, each ≤5MB, JPEG/PNG/WEBP |
| Age range | Multi-select | Toddler (0–2), Preschool (3–5), Primary (6–12), All ages |
| Tips | Textarea | Optional, e.g. "bring your own food", "parking tricky on weekends" — max 280 chars |

On submission:
- Status set to **Pending**
- Contributor sees "Thanks! Your submission is under review."
- Admin notified (email or dashboard badge)

### 4.5 Admin Moderation

Simple admin dashboard at `/admin` (role-gated):

- List of pending submissions with preview
- Approve / Reject actions
- On rejection: optional note sent to contributor (email)
- Approved listings go live immediately
- Admin can edit listings before approving (fix typos, crop photos etc.)
- Admin can remove live listings (with reason)

### 4.6 Community Reviews & Ratings

Any signed-in user can submit **one review per location** (editable).

Review consists of:
- Category ratings (see Section 6) — required at least one
- Optional short comment (280 chars)

Reviews are **not moderated** before publishing but can be reported and removed by admin.

---

## 5. Location Categories

These are the primary tags used to classify locations:

| Category | Icon suggestion | Description |
|---|---|---|
| 🛝 Playground | Slide icon | Parks, playgrounds, adventure play |
| 🍔 Food & Cafe | Fork icon | Kid-friendly cafes, restaurants, soft serve etc |
| 🎨 Activities | Star icon | Classes, workshops, indoor play, arts & crafts |
| 🌿 Nature | Leaf icon | Beaches, bushwalks, gardens, wildlife |
| 🛍️ Stuff | Bag icon | Kid-focused shops, toy stores, markets |
| 🎠 Entertainment | Ticket icon | Shows, cinemas, zoos, theme parks |
| 🏊 Sport & Swim | Wave icon | Pools, gyms, sports facilities |

Each location must have **one primary category** and can have up to 3 additional categories.

---

## 6. Category-Based Ratings

Ratings are **not an overall star score**. Instead, reviewers rate specific dimensions that matter to parents:

| Dimension | Description |
|---|---|
| 🍽️ Food quality | Quality and kid-friendliness of food/menu |
| 📢 Noise level | How loud/chaotic the environment is (Low / Med / High) |
| 🔒 Safety | How safe/enclosed/supervised the space feels |
| 🧹 Cleanliness | Toilets, changing facilities, general cleanliness |
| 🅿️ Parking & Access | Ease of getting there with young kids and prams |
| 🌦️ Weather dependency | Fully indoor / partly covered / fully outdoor |
| 👶 Age suitability | How well-suited for specific age groups |

Each dimension rated **1–5** (where applicable). Reviewers only need to fill in dimensions relevant to the location type.

Displayed as a visual radar or bar chart on the detail page, showing community averages.

---

## 7. Pages & Routes

| Route | Description |
|---|---|
| `/` | Homepage — search bar, featured/recent locations, hero |
| `/search?q=suburb&lat=&lng=&radius=` | Search results — map + list |
| `/location/[slug]` | Location detail page |
| `/submit` | Add a place form (auth required) |
| `/profile` | Contributor's own submissions and reviews |
| `/admin` | Admin moderation dashboard (admin role only) |
| `/about` | Brief about/community guidelines page |

---

## 8. Tech Stack Recommendation

Optimised for AI-assisted build with Lovable, v0, or Bolt.

| Layer | Recommendation | Notes |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router) | SSR for SEO on location pages |
| **Styling** | Tailwind CSS | Fast iteration |
| **Map** | Mapbox GL JS | Better free tier than Google Maps |
| **Auth** | Supabase Auth | Google + Apple OAuth built-in |
| **Database** | Supabase (Postgres) | Row-level security for roles |
| **File storage** | Supabase Storage | Photo uploads |
| **Geocoding** | Mapbox Geocoding API | Suburb autocomplete + address → lat/lng |
| **Hosting** | Vercel | Free tier, zero-config Next.js |

All services above have generous free tiers suitable for MVP launch.

---

## 9. Data Model (Simplified)

```
users
  id, email, display_name, avatar_url, role (contributor | admin), created_at

locations
  id, slug, name, description, address, lat, lng, suburb
  primary_category, additional_categories[]
  age_ranges[], tips
  status (pending | approved | rejected)
  submitted_by (user_id), created_at, approved_at

location_photos
  id, location_id, url, sort_order, uploaded_by

reviews
  id, location_id, user_id, comment
  ratings: { food, noise, safety, cleanliness, access, weather, age_suitability }
  created_at, updated_at

reports
  id, target_type (location | review), target_id, reported_by, reason, created_at
```

---

## 10. Design Direction

- **Aesthetic:** Warm, modern minimal. Think editorial parenting magazine meets clean app UI. Lots of white space, bold typography, organic accent colours (sage green, warm sand, sky blue).
- **Typography:** Strong display font for headings, clean humanist sans for body.
- **Map pins:** Custom illustrated icons per category, not default Google teardrops.
- **Cards:** Photo-led with soft rounded corners, subtle shadow, clear hierarchy.
- **Mobile:** Bottom sheet map/list toggle, sticky search bar, large tap targets throughout.

---

## 11. MVP Scope (What to Defer)

The following are **out of scope for v1** but noted for v2:

- Saved/favourited locations (bookmarks)
- Notifications (email digest of new locations near you)
- Multilingual support
- Paid/promoted listings
- Events (one-off vs. permanent locations)
- Opening hours
- Accessibility ratings (pram-friendly, wheelchair etc.) — could be v1.5

---

## 12. Open Questions for Founder

Before build begins, decide:

1. **Geography:** Australia-only at launch, or global from day one? (Affects geocoding config and suburb data)
2. **App name:** "KidSpot" is taken — final name needed before domain registration
3. **Photo moderation:** Admin reviews photos on approval — is that sufficient, or auto-scan with a vision API for inappropriate content?
4. **Contributor incentives:** Any gamification planned (badges, top contributor lists)?