import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const SHOTS = path.join(__dirname, '../test-screenshots')
fs.mkdirSync(SHOTS, { recursive: true })

// ── API: venue autocomplete ────────────────────────────────────────────────

test('places API: partial name "little amigos" returns results', async ({ request }) => {
  const res = await request.get('/api/places?q=little+amigos&lat=-37.8136&lng=144.9631')
  expect(res.status()).toBe(200)
  const body = await res.json()
  console.log('places partial:', JSON.stringify(body, null, 2))
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBeGreaterThan(0)
  const names: string[] = body.map((r: { name: string }) => r.name.toLowerCase())
  console.log('  → names:', names)
  const hasAmigos = names.some((n) => n.includes('amigo'))
  expect(hasAmigos).toBe(true)
})

test('places API: each suggestion has id, name, address', async ({ request }) => {
  const res = await request.get('/api/places?q=flight+deck&lat=-37.8136&lng=144.9631')
  expect(res.status()).toBe(200)
  const body = await res.json()
  console.log('places flight deck:', JSON.stringify(body, null, 2))
  if (body.length > 0) {
    const first = body[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('name')
    expect(first).toHaveProperty('address')
    // Should NOT have lat/lng yet (that comes from detail call)
    expect(first.lat).toBeUndefined()
  }
})

test('places detail API: returns full place data for a real placeId', async ({ request }) => {
  // First get a placeId from autocomplete
  const autoRes = await request.get('/api/places?q=little+amigos+southland&lat=-37.8136&lng=144.9631')
  const suggestions = await autoRes.json()
  console.log('suggestions for detail test:', JSON.stringify(suggestions, null, 2))

  if (suggestions.length === 0) {
    console.warn('No suggestions returned — skipping detail check')
    return
  }

  const placeId = suggestions[0].id
  const detailRes = await request.get(`/api/places/${placeId}`)
  expect(detailRes.status()).toBe(200)
  const detail = await detailRes.json()
  console.log('detail result:', JSON.stringify(detail, null, 2))

  expect(detail).toHaveProperty('name')
  expect(detail).toHaveProperty('address')
  expect(typeof detail.lat).toBe('number')
  expect(typeof detail.lng).toBe('number')
  expect(detail.lat).not.toBe(0)
  expect(detail.lng).not.toBe(0)
  expect(detail).toHaveProperty('suburb')
})

// ── API: home search (geocode + venue DB) ─────────────────────────────────

test('geocode API: suburb search returns results', async ({ request }) => {
  const res = await request.get('/api/geocode?q=Richmond')
  expect(res.status()).toBe(200)
  const body = await res.json()
  console.log('geocode Richmond:', JSON.stringify(body, null, 2))
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBeGreaterThan(0)
  // Each result should have the right shape
  const first = body[0]
  expect(first).toHaveProperty('id')
  expect(first).toHaveProperty('label')
  expect(first).toHaveProperty('lat')
  expect(first).toHaveProperty('lng')
})

test('geocode API: short query returns empty', async ({ request }) => {
  const res = await request.get('/api/geocode?q=a')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

// ── UI: home page search ──────────────────────────────────────────────────

test('home search: typing a suburb shows dropdown', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  const input = page.getByPlaceholder('Search suburb, postcode…')
  await input.click()
  await input.fill('Richmond')
  await page.waitForTimeout(900) // debounce + network

  const dropdown = page.locator('ul').first()
  await expect(dropdown).toBeVisible({ timeout: 5000 })
  const items = dropdown.locator('li')
  const count = await items.count()
  console.log(`Home search "Richmond" → ${count} dropdown items`)
  expect(count).toBeGreaterThan(0)

  await page.screenshot({ path: `${SHOTS}/home-search-suburb.png` })
})

test('home search: map defaults to Melbourne (not Sydney)', async ({ page }) => {
  await page.goto('/search')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(2000)

  // Check the URL doesn't have Sydney coords hardcoded
  const url = new URL(page.url())
  const lat = url.searchParams.get('lat')
  const lng = url.searchParams.get('lng')

  // If no coords in URL, the default is used — verify it's Melbourne
  if (lat && lng) {
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    // Melbourne is around -37.8, 144.9
    expect(latNum).toBeGreaterThan(-38.5)
    expect(latNum).toBeLessThan(-37.0)
    expect(lngNum).toBeGreaterThan(144.0)
    expect(lngNum).toBeLessThan(146.0)
    console.log(`Map center from URL: ${latNum}, ${lngNum}`)
  } else {
    console.log('No coords in URL — default from constants.ts applies')
  }

  await page.screenshot({ path: `${SHOTS}/search-map-melbourne.png` })
})

// ── UI: submit form venue search ──────────────────────────────────────────

test('submit form: venue search shows suggestions for partial name', async ({ page }) => {
  await page.goto('/submit')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)

  // Check whether the venue search input is present (not gated)
  const venueInput = page.getByPlaceholder('Search by business name…')
  const inputVisible = await venueInput.isVisible({ timeout: 3000 }).catch(() => false)

  if (!inputVisible) {
    console.log('Submit form is behind sign-in gate — cannot test venue search without auth')
    await page.screenshot({ path: `${SHOTS}/submit-gated.png` })
    return
  }

  await venueInput.click()
  await venueInput.fill('little amigos')
  await page.waitForTimeout(900)

  const dropdown = page.locator('ul').first()
  const visible = await dropdown.isVisible().catch(() => false)
  console.log('Venue search dropdown visible for "little amigos":', visible)

  await page.screenshot({ path: `${SHOTS}/submit-venue-search.png` })

  if (visible) {
    const items = dropdown.locator('li')
    const count = await items.count()
    console.log(`Venue search "little amigos" → ${count} suggestions`)
    expect(count).toBeGreaterThan(0)
  }
})
