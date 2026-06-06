import { test, expect } from '@playwright/test'
import { AUTH_FILE } from './global-setup'
import { createClient } from '@supabase/supabase-js'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

test.use({ storageState: AUTH_FILE })

test('user can delete their own location via the edit page', async ({ page, request }) => {
  // Create a location as the test user (admin) via the API
  const locRes = await request.post('/api/submit/location', {
    data: {
      name: 'Playwright Delete Test Venue',
      description: 'A test venue created by the Playwright delete spec — this will be deleted.',
      address: '2 Test St, Melbourne VIC 3000',
      lat: -37.814,
      lng: 144.964,
      suburb: 'Melbourne',
      tags: ['kids_play_area'],
      open_times: [],
      age_ranges: [],
    },
  })
  expect(locRes.status(), `submit failed: ${await locRes.text()}`).toBe(200)
  const { id: locationId } = await locRes.json()

  // Fetch the slug (submit API only returns id)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data: loc } = await admin.from('locations').select('slug').eq('id', locationId).single()
  const slug = loc!.slug

  // Navigate to the edit page
  await page.goto(`/location/${slug}/edit`, { waitUntil: 'networkidle' })
  await expect(page.locator('h1')).toContainText('Edit location')

  // Click delete — handle the confirm dialog
  page.once('dialog', (dialog) => dialog.accept())
  await page.locator('text=Delete this place').click()

  // Should redirect to admin (test user is admin)
  await page.waitForURL(/\/(admin|profile)/, { timeout: 10000 })

  // Verify the location is gone from the DB
  const { data } = await admin.from('locations').select('id').eq('id', locationId).single()
  expect(data).toBeNull()
})
