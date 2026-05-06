import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const DIR = path.join(__dirname, '../test-screenshots')
fs.mkdirSync(DIR, { recursive: true })

async function settle(page: Page, ms = 1500) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(ms)
}

test('Hero search bar — button is visible and inside the box', async ({ page }) => {
  await page.goto('/')
  await settle(page)

  // Screenshot the hero section only
  const hero = page.locator('section').first()
  await hero.screenshot({ path: `${DIR}/hero-searchbar.png` })

  // The Search button should be visible
  const searchBtn = hero.locator('button[type="submit"]')
  await expect(searchBtn).toBeVisible()
  const btnBox = await searchBtn.boundingBox()
  console.log('Search button bounds:', btnBox)

  // The button should not be clipped (right edge inside viewport)
  const viewport = page.viewportSize()!
  console.log('Viewport width:', viewport.width)
  if (btnBox) {
    const rightEdge = btnBox.x + btnBox.width
    console.log('Button right edge:', rightEdge, '— clipped?', rightEdge > viewport.width)
  }
})

test('Map page — drag handle changes sheet height', async ({ page }) => {
  await page.goto('/search')
  await settle(page)

  const handle = page.locator('[aria-label="Resize panel"]')
  const sheet = page.locator('.rounded-t-3xl').first()

  const heightBefore = await sheet.evaluate((el) => el.getBoundingClientRect().height)
  console.log('Sheet height BEFORE drag:', heightBefore)

  // Screenshot before drag
  await page.screenshot({ path: `${DIR}/drag-before.png` })

  // Drag upward to expand
  const box = await handle.boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    for (let i = 0; i < 20; i++) {
      await page.mouse.move(
        box.x + box.width / 2,
        box.y + box.height / 2 - i * 15,
        { steps: 1 }
      )
      await page.waitForTimeout(20)
    }
    await page.mouse.up()
    await page.waitForTimeout(500)
  }

  const heightAfter = await sheet.evaluate((el) => el.getBoundingClientRect().height)
  console.log('Sheet height AFTER drag:', heightAfter)
  await page.screenshot({ path: `${DIR}/drag-after.png` })

  expect(heightAfter).toBeGreaterThan(heightBefore)
})

test('Map page — search input accepts text and shows state change', async ({ page }) => {
  await page.goto('/search')
  await settle(page)

  const input = page.locator('input[type="text"]').first()
  await expect(input).toBeVisible()

  await input.click()
  await input.fill('Chatswood')
  await page.waitForTimeout(800)

  await page.screenshot({ path: `${DIR}/search-typed.png` })

  const val = await input.inputValue()
  console.log('Input value after typing:', val)
  expect(val).toBe('Chatswood')

  // Check if autocomplete list appeared
  const dropdown = page.locator('ul').first()
  const dropdownVisible = await dropdown.isVisible().catch(() => false)
  console.log('Autocomplete dropdown visible:', dropdownVisible)
})

test('Map page — Near me button triggers geolocation', async ({ page }) => {
  // Grant geolocation permission with a mock location (Sydney CBD)
  await page.context().grantPermissions(['geolocation'])
  await page.context().setGeolocation({ latitude: -33.8688, longitude: 151.2093 })

  await page.goto('/search')
  await settle(page)

  const nearMeBtn = page.locator('button:has-text("Near me")')
  await nearMeBtn.click()
  await page.waitForTimeout(2000)

  const url = page.url()
  console.log('URL after Near me:', url)
  await page.screenshot({ path: `${DIR}/near-me-result.png` })

  // URL should now contain lat/lng
  expect(url).toContain('lat=')
  expect(url).toContain('lng=')
})
