import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../test-screenshots')
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

async function settle(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1500)
}

test.describe('Visual snapshots', () => {
  test('Home page', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await page.screenshot({ path: `${SCREENSHOT_DIR}/home.png`, fullPage: true })
    await expect(page.locator('h1')).toBeVisible()
  })

  test('Search page – initial load', async ({ page }) => {
    await page.goto('/search')
    await settle(page)
    await page.screenshot({ path: `${SCREENSHOT_DIR}/search-initial.png` })
    await expect(page.locator('[aria-label="Resize panel"]')).toBeVisible()
  })

  test('Search page – sheet dragged up', async ({ page }) => {
    await page.goto('/search')
    await settle(page)
    const handle = page.locator('[aria-label="Resize panel"]')
    const box = await handle.boundingBox()
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 300, { steps: 20 })
      await page.mouse.up()
      await page.waitForTimeout(500)
    }
    await page.screenshot({ path: `${SCREENSHOT_DIR}/search-sheet-expanded.png` })
  })

  test('Search page – autocomplete dropdown', async ({ page }) => {
    await page.goto('/search')
    await settle(page)
    const input = page.locator('input[type="text"]').first()
    await input.fill('Sydney')
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${SCREENSHOT_DIR}/search-autocomplete.png` })
  })
})
