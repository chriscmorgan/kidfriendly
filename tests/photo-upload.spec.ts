import { test, expect } from '@playwright/test'
import { AUTH_FILE } from './global-setup'

// Run all tests in this file as an authenticated user
test.use({ storageState: AUTH_FILE })

// Minimal 1×1 white PNG (67 bytes) — valid enough for a storage upload test
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

test('POST /api/photos: authenticated upload returns URL', async ({ request }) => {
  // Create a pending location so we have a valid location_id
  const locRes = await request.post('/api/submit/location', {
    data: {
      name: 'Playwright Upload Test Venue',
      description: 'A test venue created by the Playwright photo upload spec — ignore this entry.',
      address: '1 Test St, Melbourne VIC 3000',
      lat: -37.8136,
      lng: 144.9631,
      suburb: 'Melbourne',
      tags: ['kids_play_area'],
      open_times: ['lunch'],
      age_ranges: ['toddler'],
    },
  })
  expect(locRes.status(), `submit/location failed: ${await locRes.text()}`).toBe(200)
  const { id: locationId } = await locRes.json()
  expect(typeof locationId).toBe('string')

  // Upload a tiny PNG via the server-side route
  const uploadRes = await request.post('/api/photos', {
    multipart: {
      file: {
        name: 'test.png',
        mimeType: 'image/png',
        buffer: PNG_1X1,
      },
      location_id: locationId,
      sort_order: '0',
    },
  })
  expect(uploadRes.status(), `photo upload failed: ${await uploadRes.text()}`).toBe(200)

  const body = await uploadRes.json()
  expect(typeof body.url).toBe('string')
  expect(body.url).toContain('/storage/v1/object/public/Photos/')
})
