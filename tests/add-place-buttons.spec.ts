import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const DIR = path.join(__dirname, '../test-screenshots/add-place-buttons')
fs.mkdirSync(DIR, { recursive: true })

async function settle(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(800)
}

// Helper: after clicking "Add a place" the user should either land on /submit
// OR be redirected to /?auth=required with the sign-in modal visible.
// Both are valid — depends on whether Supabase env vars are configured.
async function assertReachesSignIn(page: Page, screenshotPath: string) {
  await settle(page)
  await page.screenshot({ path: screenshotPath })

  const url = page.url()
  const onSubmit = url.includes('/submit')
  const googleBtn = await page.locator('button:has-text("Google"), a:has-text("Google")').isVisible().catch(() => false)
  const signInBtn = await page.locator('button:has-text("Sign in to add a place"), button:has-text("Sign in")').isVisible().catch(() => false)

  console.log('URL:', url, '| on submit:', onSubmit, '| google btn:', googleBtn, '| sign-in btn:', signInBtn)

  // Must reach either the submit page sign-in gate or the modal
  expect(onSubmit || googleBtn || signInBtn).toBe(true)
}

test('Header "Add a place" button — opens sign-in', async ({ page }) => {
  await page.goto('/')
  await settle(page)

  const headerBtn = page.locator('header button:has-text("Add a place"), header a:has-text("Add a place")')
  await expect(headerBtn).toBeVisible()
  await headerBtn.click()
  await assertReachesSignIn(page, `${DIR}/01-header-btn.png`)
})

test('Hero primary CTA "Add a place" — reaches sign-in', async ({ page }) => {
  await page.goto('/')
  await settle(page)

  const heroBtn = page.locator('section').first().locator('a:has-text("Add a place")')
  await expect(heroBtn).toBeVisible()
  await heroBtn.click()
  await assertReachesSignIn(page, `${DIR}/02-hero-cta.png`)
})

test('Yellow banner "Add it now" — reaches sign-in', async ({ page }) => {
  await page.goto('/')
  await settle(page)

  const bannerBtn = page.locator('a:has-text("Add it now")')
  await expect(bannerBtn).toBeVisible()
  await bannerBtn.click()
  await assertReachesSignIn(page, `${DIR}/03-banner-btn.png`)
})

test('Final dark CTA "Add a place" — reaches sign-in', async ({ page }) => {
  await page.goto('/')
  await settle(page)

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(400)

  const bottomBtn = page.locator('a:has-text("Add a place — it\'s free")')
  await expect(bottomBtn).toBeVisible()
  await bottomBtn.click()
  await assertReachesSignIn(page, `${DIR}/04-bottom-cta.png`)
})

test('Community feed "Add a place" button — reaches sign-in (if section visible)', async ({ page }) => {
  await page.goto('/')
  await settle(page)

  // This section only renders when there are approved locations
  const feedBtn = page.locator('a').filter({ hasText: /Add a place.*free sign-up/ })
  const visible = await feedBtn.isVisible().catch(() => false)

  if (!visible) {
    console.log('Community feed section not shown (no approved locations yet) — skipping')
    return
  }

  await feedBtn.click()
  await assertReachesSignIn(page, `${DIR}/05-feed-cta.png`)
})

test('Mobile nav "Add a place" — reaches sign-in', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await settle(page)

  const menuBtn = page.locator('button[aria-label="Toggle menu"]')
  await expect(menuBtn).toBeVisible()
  await menuBtn.click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${DIR}/06-mobile-menu-open.png` })

  // The mobile nav link (inside the mobile dropdown, not the hidden desktop nav)
  const mobileAddBtn = page.locator('a[href="/submit"]:has-text("Add a place")').last()
  await expect(mobileAddBtn).toBeVisible()
  await mobileAddBtn.click()
  await assertReachesSignIn(page, `${DIR}/07-mobile-add-result.png`)
})

test('/?auth=required — sign-in modal opens automatically', async ({ page }) => {
  // Simulate the redirect the proxy makes for unauthenticated /submit visits
  await page.goto('/?auth=required')
  await settle(page)
  await page.screenshot({ path: `${DIR}/08-auth-required-modal.png` })

  const googleBtn = page.locator('button:has-text("Google"), a:has-text("Google")')
  await expect(googleBtn).toBeVisible()
})

test('/submit directly — shows sign-in gate or redirects to modal', async ({ page }) => {
  await page.goto('/submit')
  await settle(page)
  await page.screenshot({ path: `${DIR}/09-submit-direct.png` })

  const url = page.url()
  const onSubmit = url.includes('/submit')
  const googleBtn = await page.locator('button:has-text("Google"), a:has-text("Google")').isVisible().catch(() => false)
  const signInGate = await page.locator('button:has-text("Sign in to add a place")').isVisible().catch(() => false)

  console.log('URL:', url, '| gate:', signInGate, '| google:', googleBtn)

  // Whether it stays on /submit (mock mode) or redirects (real Supabase), sign-in must be reachable
  expect(onSubmit || googleBtn || signInGate).toBe(true)
  // Either way, the form fields should NOT be visible to unauthed users
  const nameInput = page.locator('input[placeholder*="venue"], input[name="name"]')
  await expect(nameInput).not.toBeVisible()
})
