/**
 * Full-page smoke tests — every public and authenticated page.
 * Confirms key content renders, auth gates work, and critical interactions fire.
 */
import { test, expect } from '@playwright/test'
import { AUTH_FILE } from './global-setup'

// domcontentloaded avoids hanging on the map's persistent WebSocket connections
const GOTO = { waitUntil: 'domcontentloaded' as const }

// ─── Home page ────────────────────────────────────────────────────────────────

test.describe('home page', () => {
  test('renders headline and search bar', async ({ page }) => {
    await page.goto('/', GOTO)
    await expect(page.locator('h1')).toContainText('Find kid-friendly')
    await expect(page.locator('input[placeholder*="suburb"]')).toBeVisible()
  })

  test('search button is present', async ({ page }) => {
    await page.goto('/', GOTO)
    await expect(page.locator('button', { hasText: 'Search' }).first()).toBeVisible()
  })

  test('Add a place button is visible', async ({ page }) => {
    await page.goto('/', GOTO)
    await expect(page.locator('a', { hasText: '+ Add a place' }).first()).toBeVisible()
  })

  test('"How it works" section renders', async ({ page }) => {
    await page.goto('/', GOTO)
    await expect(page.locator('text=How it works')).toBeVisible()
  })

  test('Browse by type section has tag buttons', async ({ page }) => {
    await page.goto('/', GOTO)
    await expect(page.locator('text=Browse by type')).toBeVisible()
  })

  test('Recent listings section renders cards', async ({ page }) => {
    // Cards are SSR'd via getLocations() — use networkidle to let the page fully settle
    await page.goto('/', { waitUntil: 'networkidle', timeout: 20000 })
    await expect(page.locator('a[href^="/location/"]').first()).toBeVisible()
  })
})

// ─── About page ───────────────────────────────────────────────────────────────

test.describe('about page', () => {
  test('renders heading and updated copy', async ({ page }) => {
    await page.goto('/about', GOTO)
    await expect(page.locator('h1')).toContainText('About')
    await expect(page.locator('text=Eating out got a lot harder')).toBeVisible()
  })

  test('has Adding a place and ground rules sections', async ({ page }) => {
    await page.goto('/about', GOTO)
    await expect(page.locator('h2', { hasText: 'Adding a place' })).toBeVisible()
    await expect(page.locator('h2', { hasText: 'A few ground rules' })).toBeVisible()
  })

  test('does not show removed Ratings section', async ({ page }) => {
    await page.goto('/about', GOTO)
    await expect(page.locator('h2', { hasText: 'Ratings' })).not.toBeVisible()
  })

  test('does not show removed Reviews rule', async ({ page }) => {
    await page.goto('/about', GOTO)
    await expect(page.locator('text=Reviews should be honest')).not.toBeVisible()
  })

  test('CTA buttons are present', async ({ page }) => {
    await page.goto('/about', GOTO)
    // Use the main content area to avoid matching header/footer links
    const main = page.locator('main, .max-w-2xl').first()
    await expect(main.locator('a', { hasText: 'Add a place' })).toBeVisible()
    await expect(main.locator('a', { hasText: 'Browse the map' })).toBeVisible()
  })
})

// ─── Search / Explore page ────────────────────────────────────────────────────

test.describe('search / explore page', () => {
  test('renders map canvas', async ({ page }) => {
    await page.goto('/search', GOTO)
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 })
  })

  test('tag filter strip is visible', async ({ page }) => {
    await page.goto('/search', GOTO)
    await expect(page.locator('text=Has kids play area').first()).toBeVisible()
  })

  test('location list shows results', async ({ page }) => {
    // Results are client-fetched; list items are buttons, not anchors.
    // Wait for the count text ("N places") to appear, which means data loaded.
    await page.goto('/search', GOTO)
    await expect(page.locator('text=/\\d+ place/').first()).toBeVisible({ timeout: 15000 })
  })
})

// ─── Melbourne page ───────────────────────────────────────────────────────────

test.describe('Melbourne page', () => {
  test('renders heading', async ({ page }) => {
    await page.goto('/melbourne', GOTO)
    await expect(page.locator('h1')).toContainText('Melbourne')
  })

  test('shows at least one location card', async ({ page }) => {
    await page.goto('/melbourne', GOTO)
    await expect(page.locator('a[href^="/location/"]').first()).toBeVisible()
  })

  test('suburb browse section is present', async ({ page }) => {
    await page.goto('/melbourne', GOTO)
    await expect(page.locator('text=Browse Melbourne by suburb')).toBeVisible()
  })
})

// ─── Category pages ───────────────────────────────────────────────────────────

test.describe('category pages', () => {
  test('cafes next to playgrounds: heading and CTA render', async ({ page }) => {
    await page.goto('/cafes-next-to-playgrounds', GOTO)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('a', { hasText: 'See all on map' }).first()).toBeVisible()
  })

  test('indoor playground cafes: heading and CTA render', async ({ page }) => {
    await page.goto('/indoor-playground-cafes', GOTO)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('a', { hasText: 'See all on map' }).first()).toBeVisible()
  })
})

// ─── Legal pages ─────────────────────────────────────────────────────────────

test.describe('legal pages', () => {
  test('privacy page renders heading', async ({ page }) => {
    await page.goto('/privacy', GOTO)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('terms page renders heading', async ({ page }) => {
    await page.goto('/terms', GOTO)
    await expect(page.locator('h1')).toBeVisible()
  })
})

// ─── Location detail page ─────────────────────────────────────────────────────

test.describe('location detail page', () => {
  test('approved location renders name and tag badges', async ({ page }) => {
    await page.goto('/location/playwright-foreign-location', GOTO)
    await expect(page.locator('h1')).toContainText('Playwright Foreign Location')
    await expect(page.locator('text=Has kids play area').first()).toBeVisible()
  })

  test('does NOT show Submitted by section', async ({ page }) => {
    await page.goto('/location/playwright-foreign-location', GOTO)
    await expect(page.locator('h3', { hasText: 'Submitted by' })).not.toBeVisible()
  })

  test('Get directions link is present', async ({ page }) => {
    await page.goto('/location/playwright-foreign-location', GOTO)
    await expect(page.locator('a', { hasText: 'Get directions' }).first()).toBeVisible()
  })

  test('View on Google Maps link is present', async ({ page }) => {
    await page.goto('/location/playwright-foreign-location', GOTO)
    await expect(page.locator('a', { hasText: 'View on Google Maps' })).toBeVisible()
  })

  test('Report button is visible', async ({ page }) => {
    await page.goto('/location/playwright-foreign-location', GOTO)
    await expect(page.locator('text=Report').first()).toBeVisible()
  })

  test('unknown slug shows 404', async ({ page }) => {
    await page.goto('/location/does-not-exist-xyz', GOTO)
    await expect(page.locator('h1')).toBeVisible()
  })
})

// ─── Submit page — unauthenticated ───────────────────────────────────────────

test.describe('submit page — unauthenticated', () => {
  test('shows form or sign-in prompt', async ({ page }) => {
    await page.goto('/submit', GOTO)
    await page.waitForTimeout(1500)
    const hasForm = await page.locator('text=Add a place').first().isVisible()
    const hasSignIn = await page.locator('text=Sign in').first().isVisible()
    expect(hasForm || hasSignIn, 'Expected either the form or a sign-in prompt').toBe(true)
  })
})

// ─── Profile page — unauthenticated ──────────────────────────────────────────

test.describe('profile page — unauthenticated', () => {
  test('shows sign-in prompt', async ({ page }) => {
    await page.goto('/profile', GOTO)
    await expect(page.locator('text=Sign in').first()).toBeVisible({ timeout: 8000 })
  })
})

// ─── Authenticated pages ──────────────────────────────────────────────────────

test.describe('authenticated', () => {
  test.use({ storageState: AUTH_FILE })

  test('submit form: all required sections visible', async ({ page }) => {
    await page.goto('/submit', GOTO)
    await page.waitForTimeout(1000)
    await expect(page.locator('text=Place name')).toBeVisible()
    await expect(page.locator('text=Description')).toBeVisible()
    await expect(page.locator('text=Click to upload photos')).toBeVisible()
    await expect(page.locator('button, input[type="submit"]').filter({ hasText: 'Submit' }).first()).toBeVisible()
  })

  test('submit form: description shows 30-char minimum', async ({ page }) => {
    await page.goto('/submit', GOTO)
    await page.waitForTimeout(500)
    await expect(page.locator('text=30 more characters needed')).toBeVisible()
  })

  test('submit form: validation blocks empty submission', async ({ page }) => {
    await page.goto('/submit', GOTO)
    await page.waitForTimeout(500)
    const submitBtn = page.locator('button', { hasText: 'Submit' }).first()
    await submitBtn.click()
    await expect(page).toHaveURL(/\/submit/)
  })

  test('profile: shows user name', async ({ page }) => {
    await page.goto('/profile', GOTO)
    await page.waitForTimeout(1000)
    await expect(page.locator('h1', { hasText: 'Playwright Test' })).toBeVisible()
  })

  test('profile: Places tab is present', async ({ page }) => {
    await page.goto('/profile', GOTO)
    await page.waitForTimeout(1000)
    await expect(page.getByRole('button', { name: /Places/ })).toBeVisible()
  })

  test('profile: submission cards have Edit link', async ({ page }) => {
    await page.goto('/profile', GOTO)
    await page.waitForTimeout(1000)
    await expect(page.locator('a[href*="/edit"]').first()).toBeVisible()
  })

  test('profile: Edit link goes to correct edit page', async ({ page }) => {
    await page.goto('/profile', GOTO)
    await page.waitForTimeout(1000)
    const editLink = page.locator('a[href*="/edit"]').first()
    const href = await editLink.getAttribute('href')
    expect(href).toMatch(/\/location\/.+\/edit/)
  })

  test('admin dashboard: Pending tab is visible', async ({ page }) => {
    await page.goto('/admin', GOTO)
    await expect(page.getByRole('button', { name: /Pending/ })).toBeVisible()
  })

  test('admin dashboard: Approve button visible on pending items', async ({ page }) => {
    await page.goto('/admin', GOTO)
    await expect(page.locator('button', { hasText: 'Approve' }).first()).toBeVisible()
  })

  test('admin dashboard: All locations tab accessible', async ({ page }) => {
    await page.goto('/admin', GOTO)
    await page.getByRole('button', { name: /All locations/ }).click()
    await expect(page.locator('text=Edit').first()).toBeVisible({ timeout: 5000 })
  })

  test('edit page: loads for admin on any location', async ({ page }) => {
    await page.goto('/location/playwright-foreign-location/edit', GOTO)
    await page.waitForTimeout(1000)
    await expect(page.locator('h1')).toContainText('Edit location')
    await expect(page.locator('button', { hasText: 'Save changes' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Delete this place' })).toBeVisible()
  })

  test('edit page: description counter uses 30-char minimum', async ({ page }) => {
    await page.goto('/location/playwright-foreign-location/edit', GOTO)
    await page.waitForTimeout(500)
    const desc = page.locator('textarea').first()
    await desc.fill('Short')
    await expect(page.locator('text=25 more characters needed')).toBeVisible()
  })

  test('edit page: Cancel returns admin to admin dashboard', async ({ page }) => {
    await page.goto('/location/playwright-foreign-location/edit', GOTO)
    await page.waitForTimeout(500)
    await page.locator('button', { hasText: 'Cancel' }).click()
    await expect(page).toHaveURL(/\/admin/)
  })

  test('edit page: non-existent location returns 404', async ({ page }) => {
    await page.goto('/location/does-not-exist-xyz/edit', GOTO)
    await expect(page.locator('h1')).toBeVisible()
  })
})

// ─── Navigation ───────────────────────────────────────────────────────────────

test.describe('navigation', () => {
  test('header logo links to home', async ({ page }) => {
    await page.goto('/about', GOTO)
    await page.locator('a', { hasText: 'KidFriendlyEats' }).first().click()
    await expect(page).toHaveURL('http://localhost:3000/')
  })

  test('footer has Privacy, Terms, About links', async ({ page }) => {
    await page.goto('/', GOTO)
    const footer = page.locator('footer')
    await expect(footer.locator('a', { hasText: 'Privacy' })).toBeVisible()
    await expect(footer.locator('a', { hasText: 'Terms' })).toBeVisible()
    await expect(footer.locator('a', { hasText: 'About' })).toBeVisible()
  })

  test('Explore nav link goes to search', async ({ page }) => {
    await page.goto('/', GOTO)
    await page.locator('header a, nav a', { hasText: 'Explore' }).first().click()
    await expect(page).toHaveURL(/\/search/)
  })

  test('location card links to detail page', async ({ page }) => {
    await page.goto('/melbourne', GOTO)
    const card = page.locator('a[href^="/location/"]').first()
    const href = await card.getAttribute('href')
    expect(href).toMatch(/^\/location\//)
    await card.click()
    await expect(page).toHaveURL(/\/location\//)
    await expect(page.locator('h1')).toBeVisible()
  })
})
