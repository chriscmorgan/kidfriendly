/**
 * Visual audit — screenshots every public page so we can check UX.
 * Run with: npx playwright test tests/page-audit.spec.ts --project=desktop
 */
import { test, expect } from '@playwright/test'
import { AUTH_FILE } from './global-setup'
import * as fs from 'fs'
import * as path from 'path'

const DIR = path.join('test-screenshots', 'audit')
fs.mkdirSync(DIR, { recursive: true })

async function shot(page: import('@playwright/test').Page, name: string) {
  await page.screenshot({ path: path.join(DIR, `${name}.png`), fullPage: true })
}

// Public pages (no auth)
test('home page', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await shot(page, '01-home')
  await expect(page.locator('h1')).toBeVisible()
})

test('about page', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'networkidle' })
  await shot(page, '02-about')
  await expect(page.locator('h1')).toContainText('About')
})

test('search page', async ({ page }) => {
  await page.goto('/search', { waitUntil: 'networkidle' })
  await shot(page, '03-search')
})

test('melbourne page', async ({ page }) => {
  await page.goto('/melbourne', { waitUntil: 'networkidle' })
  await shot(page, '04-melbourne')
})

test('cafes next to playgrounds page', async ({ page }) => {
  await page.goto('/cafes-next-to-playgrounds', { waitUntil: 'networkidle' })
  await shot(page, '05-cafes-playgrounds')
})

test('indoor playground cafes page', async ({ page }) => {
  await page.goto('/indoor-playground-cafes', { waitUntil: 'networkidle' })
  await shot(page, '06-indoor-playgrounds')
})

test('privacy page', async ({ page }) => {
  await page.goto('/privacy', { waitUntil: 'networkidle' })
  await shot(page, '07-privacy')
  await expect(page.locator('h1')).toBeVisible()
})

test('terms page', async ({ page }) => {
  await page.goto('/terms', { waitUntil: 'networkidle' })
  await shot(page, '08-terms')
  await expect(page.locator('h1')).toBeVisible()
})

// First approved location
test('location detail page', async ({ page }) => {
  await page.goto('/search', { waitUntil: 'networkidle' })
  const firstCard = page.locator('a[href^="/location/"]').first()
  const href = await firstCard.getAttribute('href')
  if (href) {
    await page.goto(href, { waitUntil: 'networkidle' })
    await shot(page, '09-location-detail')
    await expect(page.locator('h1')).toBeVisible()
  }
})

// Auth-required pages
test('submit page (unauthenticated)', async ({ page }) => {
  await page.goto('/submit', { waitUntil: 'networkidle' })
  await shot(page, '10-submit-unauthed')
})

test('profile page (unauthenticated)', async ({ page }) => {
  await page.goto('/profile', { waitUntil: 'networkidle' })
  await shot(page, '11-profile-unauthed')
})

// Authenticated pages
test.describe('authenticated', () => {
  test.use({ storageState: AUTH_FILE })

  test('submit page (authenticated)', async ({ page }) => {
    await page.goto('/submit', { waitUntil: 'networkidle' })
    await shot(page, '12-submit-authed')
  })

  test('profile page (authenticated)', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })
    await shot(page, '13-profile-authed')
  })

  test('admin dashboard', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })
    await shot(page, '14-admin')
  })

  test('edit page (foreign location)', async ({ page }) => {
    await page.goto('/location/playwright-foreign-location/edit', { waitUntil: 'networkidle' })
    await shot(page, '15-edit-form')
  })
})
