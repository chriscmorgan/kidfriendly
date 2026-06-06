import { test, expect } from '@playwright/test'
import { AUTH_FILE } from './global-setup'
import * as fs from 'fs'
import * as path from 'path'

test.use({ storageState: AUTH_FILE })

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

test('admin can upload a photo via the edit page UI', async ({ page }) => {
  // Capture all network responses for /api/photos
  const photoResponses: { status: number; body: string }[] = []
  page.on('response', async (resp) => {
    if (resp.url().includes('/api/photos')) {
      const body = await resp.text().catch(() => '')
      photoResponses.push({ status: resp.status(), body })
    }
  })

  await page.goto('/location/playwright-foreign-location/edit', { waitUntil: 'networkidle' })

  // Verify we landed on the edit page (not redirected)
  await expect(page).toHaveURL(/\/edit/)
  await expect(page.locator('h1')).toContainText('Edit location')

  // Ensure description is long enough to pass validation
  const descBox = page.locator('textarea').first()
  await descBox.fill('Test location created by Playwright for admin photo upload tests. Do not remove this entry.')

  // Check the upload zone is visible
  const uploadZone = page.locator('label').filter({ hasText: 'Click to upload photos' })
  await expect(uploadZone).toBeVisible()

  // Set files on the hidden input
  const fileInput = uploadZone.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: 'ui-test.png',
    mimeType: 'image/png',
    buffer: PNG_1X1,
  })

  // Preview should appear
  await expect(page.locator('img[src^="blob:"]')).toBeVisible({ timeout: 5000 })

  // Submit the form
  await page.locator('button[type="submit"]').click()

  // Wait for navigation (success) or error message
  await page.waitForURL(/\/(admin|profile)/, { timeout: 15000 }).catch(() => {})

  // Check for any error banner still on page
  const errorBanner = page.locator('text=Photo upload failed')
  const hasError = await errorBanner.isVisible().catch(() => false)

  // Capture a screenshot
  const screenshotDir = path.join('test-screenshots', 'admin-photo-ui')
  fs.mkdirSync(screenshotDir, { recursive: true })
  await page.screenshot({ path: path.join(screenshotDir, 'result.png'), fullPage: true })

  // Assert no photo upload error
  expect(hasError, `Photo upload error shown. API responses: ${JSON.stringify(photoResponses)}`).toBe(false)

  // Assert we navigated away (save succeeded)
  expect(page.url()).toMatch(/\/(admin|profile)/)

  // Report API responses
  console.log('Photo API responses:', JSON.stringify(photoResponses))
})
