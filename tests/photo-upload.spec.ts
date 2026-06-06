import { test, expect } from '@playwright/test'
import { AUTH_FILE } from './global-setup'
import * as fs from 'fs'
import * as path from 'path'

function getTestData(): { foreignLocationId: string } {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '.auth', 'test-data.json'), 'utf-8'))
}

// Run all tests in this file as an authenticated admin user
test.use({ storageState: AUTH_FILE })

// Minimal 1×1 white PNG (67 bytes) — valid enough for a storage upload test
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

// Location submitted by the test user themselves
test('POST /api/photos: user can upload photo to their own location', async ({ request }) => {
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

  const uploadRes = await request.post('/api/photos', {
    multipart: {
      file: { name: 'test.png', mimeType: 'image/png', buffer: PNG_1X1 },
      location_id: locationId,
      sort_order: '0',
    },
  })
  expect(uploadRes.status(), `photo upload failed: ${await uploadRes.text()}`).toBe(200)
  const body = await uploadRes.json()
  expect(body.url).toContain('/storage/v1/object/public/Photos/')
})

// Location submitted by a different user — requires admin insert RLS policy
test('POST /api/photos: admin can upload photo to a location they did not submit', async ({ request }) => {
  const { foreignLocationId: FOREIGN_LOCATION_ID } = getTestData()

  const uploadRes = await request.post('/api/photos', {
    multipart: {
      file: { name: 'admin-test.png', mimeType: 'image/png', buffer: PNG_1X1 },
      location_id: FOREIGN_LOCATION_ID,
      sort_order: '99',
    },
  })
  expect(uploadRes.status(), `admin photo upload failed: ${await uploadRes.text()}`).toBe(200)
  const body = await uploadRes.json()
  expect(body.url).toContain('/storage/v1/object/public/Photos/')
})
