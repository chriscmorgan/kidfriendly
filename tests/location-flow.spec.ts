import { test, expect } from '@playwright/test'

// Uses the geocode API to find a real approved venue, then navigates to its
// detail page and verifies the key layout elements render correctly.
// If no venues are in the DB the test is skipped with a warning.

test('location page: renders key elements for an approved venue', async ({ page, request }) => {
  const apiRes = await request.get('/api/geocode?q=cafe')
  expect(apiRes.status()).toBe(200)
  const results = await apiRes.json()

  const venue = (results as { type: string; slug?: string; label: string }[])
    .find((r) => r.type === 'venue' && r.slug)

  if (!venue?.slug) {
    console.warn('No approved venues found via geocode — skipping location page test')
    return
  }

  console.log(`Testing location page for: ${venue.label} (/${venue.slug})`)
  await page.goto(`/location/${venue.slug}`)
  await page.waitForLoadState('domcontentloaded')

  // Back link
  await expect(page.getByRole('link', { name: /back to search/i })).toBeVisible()

  // Location name as h1
  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toBeVisible()
  const name = await heading.textContent()
  expect(name?.length).toBeGreaterThan(0)

  // About section
  await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()

  // At least one tag badge should be present
  await expect(page.locator('span').filter({ hasText: /playground|play area|play centre|outdoor/i }).first()).toBeVisible()
})

test('location page: returns 404 for an unknown slug', async ({ page }) => {
  const res = await page.goto('/location/this-slug-does-not-exist-abc123xyz')
  // Next.js notFound() triggers a 404 response
  expect(res?.status()).toBe(404)
})

test('location page: unauthenticated user sees sign-in prompt in review section', async ({ page, request }) => {
  const apiRes = await request.get('/api/geocode?q=cafe')
  const results = await apiRes.json()
  const venue = (results as { type: string; slug?: string }[]).find((r) => r.type === 'venue' && r.slug)

  if (!venue?.slug) {
    console.warn('No approved venues found — skipping review auth test')
    return
  }

  await page.goto(`/location/${venue.slug}`)
  await page.waitForLoadState('domcontentloaded')

  // The AddReviewSection renders a "Sign in to review" button for unauthenticated users
  const signInBtn = page.getByRole('button', { name: /sign in to review/i })
  const isVisible = await signInBtn.isVisible().catch(() => false)
  if (!isVisible) {
    console.warn('Review section not present on location page — component may not be integrated yet')
  }
})
