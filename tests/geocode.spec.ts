import { test } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const DIR = path.join(__dirname, '../test-screenshots')
fs.mkdirSync(DIR, { recursive: true })

test('geocode API returns results', async ({ request }) => {
  const res = await request.get('/api/geocode?q=Chatswood')
  const body = await res.json()
  console.log('Geocode status:', res.status())
  console.log('Geocode results:', JSON.stringify(body, null, 2))
})

test('search bar shows autocomplete dropdown', async ({ page }) => {
  // Intercept and log the geocode request
  page.on('request', req => {
    if (req.url().includes('/api/geocode')) console.log('Geocode request:', req.url())
  })
  page.on('response', async res => {
    if (res.url().includes('/api/geocode')) {
      const body = await res.text()
      console.log('Geocode response:', body)
    }
  })

  await page.goto('/search')
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1500)

  const input = page.locator('input[type="text"]').first()
  await input.click()
  await input.fill('Chatswood')
  await page.waitForTimeout(1200) // debounce is 400ms + network

  const dropdown = page.locator('ul')
  const visible = await dropdown.isVisible().catch(() => false)
  console.log('Dropdown visible:', visible)

  await page.screenshot({ path: `${DIR}/autocomplete-live.png` })
})
