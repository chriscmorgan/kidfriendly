import { test, expect } from '@playwright/test'

// ── Auth gates ──────────────────────────────────────────────────────────────
// All three mutation routes check auth before doing anything else.
// Without a session cookie the response must be 401.

test('POST /api/review: returns 401 without authentication', async ({ request }) => {
  const res = await request.post('/api/review', {
    data: { locationId: 'test-location', ratings: { food: 4 } },
  })
  expect(res.status()).toBe(401)
  const body = await res.json()
  expect(body.error).toBe('Unauthorized')
})

test('POST /api/report: returns 401 without authentication', async ({ request }) => {
  const res = await request.post('/api/report', {
    data: { locationId: 'test-location', reason: 'Incorrect information' },
  })
  expect(res.status()).toBe(401)
  const body = await res.json()
  expect(body.error).toBe('Unauthorized')
})

test('POST /api/submit/location: returns 401 without authentication', async ({ request }) => {
  const res = await request.post('/api/submit/location', {
    data: {
      name: 'Test Venue',
      description: 'A really great place for kids and families to visit',
      address: '1 Test St, Melbourne VIC 3000',
      lat: -37.8136,
      lng: 144.9631,
      tags: ['kids_play_area'],
      open_times: ['lunch'],
      age_ranges: ['toddler'],
    },
  })
  expect(res.status()).toBe(401)
})

test('POST /api/photos: returns 401 without authentication', async ({ request }) => {
  const res = await request.post('/api/photos', {
    multipart: { location_id: 'test-id', sort_order: '0' },
  })
  expect(res.status()).toBe(401)
  const body = await res.json()
  expect(body.error).toBe('Unauthorized')
})

// ── Method not allowed ──────────────────────────────────────────────────────
// Next.js App Router returns 405 when the HTTP method has no handler defined.

test('GET /api/review: returns 405 method not allowed', async ({ request }) => {
  const res = await request.get('/api/review')
  expect(res.status()).toBe(405)
})

test('GET /api/report: returns 405 method not allowed', async ({ request }) => {
  const res = await request.get('/api/report')
  expect(res.status()).toBe(405)
})

test('GET /api/submit/location: returns 405 method not allowed', async ({ request }) => {
  const res = await request.get('/api/submit/location')
  expect(res.status()).toBe(405)
})

test('GET /api/photos: returns 405 method not allowed', async ({ request }) => {
  const res = await request.get('/api/photos')
  expect(res.status()).toBe(405)
})

// ── Places detail fallback chain ────────────────────────────────────────────
// A garbage place ID should fail all three API attempts (New API ×2, Legacy)
// and ultimately return 404.

test('GET /api/places/[id]: returns 404 for a nonexistent place ID', async ({ request }) => {
  const res = await request.get('/api/places/INVALID_PLACE_ID_DOES_NOT_EXIST_XYZ123')
  expect(res.status()).toBe(404)
  const body = await res.json()
  expect(body.error).toBe('Place not found')
})
