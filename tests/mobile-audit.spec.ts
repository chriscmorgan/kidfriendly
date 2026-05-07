/**
 * Mobile UX Audit — KidFriendlyEats
 * Captures screenshots on iPhone 14 and Pixel 7 viewports for full audit.
 * Runs against the local dev server (or production via baseURL override).
 */
import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const DIR = path.join(__dirname, '../test-screenshots/audit')
fs.mkdirSync(DIR, { recursive: true })

const IPHONE = { width: 390, height: 844 }   // iPhone 14
const PIXEL  = { width: 412, height: 915 }   // Pixel 7

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${DIR}/${name}.png`, fullPage: false })
}
async function shotFull(page: Page, name: string) {
  await page.screenshot({ path: `${DIR}/${name}-full.png`, fullPage: true })
}
async function settle(page: Page, ms = 1200) {
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(ms)
}

// ── iPhone 14 tests ──────────────────────────────────────────────────────────

test.describe('iPhone 14 — above-the-fold', () => {
  test.use({ viewport: IPHONE })

  test('01 homepage — hero ATF', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await shot(page, 'iphone-01-home-atf')
    await shotFull(page, 'iphone-01-home')
  })

  test('02 homepage — search interaction', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    const input = page.getByPlaceholder('Search suburb or postcode…')
    await input.tap()
    await input.fill('Richmond')
    await page.waitForTimeout(1000)
    await shot(page, 'iphone-02-home-search-open')
  })

  test('03 homepage — browse by type section', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await page.evaluate(() => window.scrollTo(0, 600))
    await page.waitForTimeout(300)
    await shot(page, 'iphone-03-home-browse-type')
  })

  test('04 homepage — recently added cards', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    // scroll to recently added section
    await page.evaluate(() => window.scrollTo(0, 1100))
    await page.waitForTimeout(300)
    await shot(page, 'iphone-04-home-recent-cards')
  })

  test('05 homepage — FAQ and CTA sections', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1200))
    await page.waitForTimeout(300)
    await shot(page, 'iphone-05-home-faq')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(300)
    await shot(page, 'iphone-05b-home-cta')
  })

  test('06 search page — initial load', async ({ page }) => {
    await page.goto('/search')
    await settle(page, 2000)
    await shot(page, 'iphone-06-search-initial')
  })

  test('07 search page — map view with sheet', async ({ page }) => {
    await page.goto('/search?q=Melbourne')
    await settle(page, 2500)
    await shot(page, 'iphone-07-search-map-sheet')
  })

  test('08 search page — tag filter interaction', async ({ page }) => {
    await page.goto('/search')
    await settle(page, 2000)
    // try to tap a tag filter
    const tagBtn = page.locator('button').filter({ hasText: 'Indoor playground' }).first()
    const visible = await tagBtn.isVisible().catch(() => false)
    if (visible) {
      await tagBtn.tap()
      await page.waitForTimeout(600)
    }
    await shot(page, 'iphone-08-search-tag-filter')
  })

  test('09 search page — search input filled', async ({ page }) => {
    await page.goto('/search')
    await settle(page, 2000)
    const input = page.locator('input[type="text"]').first()
    const visible = await input.isVisible().catch(() => false)
    if (visible) {
      await input.tap()
      await input.fill('Fitzroy')
      await page.waitForTimeout(900)
      await shot(page, 'iphone-09-search-typed')
    } else {
      await shot(page, 'iphone-09-search-typed')
    }
  })

  test('10 Melbourne city page', async ({ page }) => {
    await page.goto('/melbourne')
    await settle(page)
    await shot(page, 'iphone-10-melbourne-atf')
    await shotFull(page, 'iphone-10-melbourne')
  })

  test('11 indoor playground cafes page', async ({ page }) => {
    await page.goto('/indoor-playground-cafes')
    await settle(page)
    await shot(page, 'iphone-11-indoor-pg-atf')
  })

  test('12 submit / add a place — signed out', async ({ page }) => {
    await page.goto('/submit')
    await settle(page)
    await shot(page, 'iphone-12-submit-atf')
    await shotFull(page, 'iphone-12-submit')
  })

  test('13 about page', async ({ page }) => {
    await page.goto('/about')
    await settle(page)
    await shot(page, 'iphone-13-about-atf')
  })

  test('14 navigation header', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await shot(page, 'iphone-14-header')
    // check hamburger or nav items
    const burger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], button[aria-label*="nav"]').first()
    const burgerVisible = await burger.isVisible().catch(() => false)
    if (burgerVisible) {
      await burger.tap()
      await page.waitForTimeout(400)
      await shot(page, 'iphone-14b-header-open')
    }
  })

  test('15 sign-in modal — triggered from submit', async ({ page }) => {
    await page.goto('/submit')
    await settle(page)
    // look for sign-in button or modal
    const signInBtn = page.locator('button').filter({ hasText: /sign in/i }).first()
    const visible = await signInBtn.isVisible().catch(() => false)
    if (visible) {
      await signInBtn.tap()
      await page.waitForTimeout(500)
      await shot(page, 'iphone-15-signin-modal')
    } else {
      await shot(page, 'iphone-15-submit-state')
    }
  })

  test('16 venue detail page — first available slug', async ({ page }) => {
    // Try to find a venue from the homepage and navigate to it
    await page.goto('/')
    await settle(page)
    const venueLink = page.locator('a[href^="/location/"]').first()
    const href = await venueLink.getAttribute('href').catch(() => null)
    if (href) {
      await page.goto(href)
      await settle(page)
      await shot(page, 'iphone-16-venue-detail-atf')
      await shotFull(page, 'iphone-16-venue-detail')
    } else {
      await shot(page, 'iphone-16-no-venue')
    }
  })
})

// ── Pixel 7 tests ────────────────────────────────────────────────────────────

test.describe('Pixel 7 — key flows', () => {
  test.use({ viewport: PIXEL })

  test('P01 homepage ATF', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await shot(page, 'pixel-01-home-atf')
  })

  test('P02 search page', async ({ page }) => {
    await page.goto('/search')
    await settle(page, 2000)
    await shot(page, 'pixel-02-search-initial')
  })

  test('P03 submit page signed-out', async ({ page }) => {
    await page.goto('/submit')
    await settle(page)
    await shot(page, 'pixel-03-submit-atf')
  })

  test('P04 Melbourne page', async ({ page }) => {
    await page.goto('/melbourne')
    await settle(page)
    await shot(page, 'pixel-04-melbourne-atf')
  })
})

// ── Tap target audit ─────────────────────────────────────────────────────────

test.describe('Tap target sizes — iPhone 14', () => {
  test.use({ viewport: IPHONE })

  test('measure tap targets on homepage', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    const results = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, input, [role="button"]'))
      return buttons.slice(0, 30).map(el => {
        const r = el.getBoundingClientRect()
        return {
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 40) ?? '',
          width: Math.round(r.width),
          height: Math.round(r.height),
          tooSmall: r.height < 44 || r.width < 44,
        }
      }).filter(t => t.width > 0 && t.height > 0)
    })

    const tooSmall = results.filter(r => r.tooSmall)
    console.log('=== TAP TARGETS TOO SMALL (<44px) ===')
    tooSmall.forEach(t => console.log(`  ${t.tag} "${t.text}" — ${t.width}×${t.height}px`))
    console.log(`Total checked: ${results.length}, too small: ${tooSmall.length}`)
  })

  test('measure tap targets on search page', async ({ page }) => {
    await page.goto('/search')
    await settle(page, 2000)

    const results = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'))
      return buttons.slice(0, 40).map(el => {
        const r = el.getBoundingClientRect()
        return {
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 40) ?? '',
          width: Math.round(r.width),
          height: Math.round(r.height),
          tooSmall: r.height < 44 || r.width < 44,
        }
      }).filter(t => t.width > 0 && t.height > 0)
    })

    const tooSmall = results.filter(r => r.tooSmall)
    console.log('=== SEARCH PAGE TAP TARGETS TOO SMALL (<44px) ===')
    tooSmall.forEach(t => console.log(`  ${t.tag} "${t.text}" — ${t.width}×${t.height}px`))
    console.log(`Total checked: ${results.length}, too small: ${tooSmall.length}`)
  })
})

// ── Typography audit ─────────────────────────────────────────────────────────

test.describe('Typography audit — iPhone 14', () => {
  test.use({ viewport: IPHONE })

  test('font sizes on homepage', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    const sizes = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('h1, h2, h3, p, button, a, label, span'))
      return els.slice(0, 40).map(el => {
        const style = window.getComputedStyle(el)
        const r = el.getBoundingClientRect()
        return {
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 50) ?? '',
          fontSize: parseFloat(style.fontSize),
          lineHeight: style.lineHeight,
          visible: r.width > 0 && r.height > 0,
        }
      }).filter(t => t.visible)
    })

    const tooSmall = sizes.filter(s => s.fontSize < 14)
    console.log('=== FONT SIZES BELOW 14px ===')
    tooSmall.forEach(s => console.log(`  ${s.tag} "${s.text}" — ${s.fontSize}px`))
    console.log(`Checked ${sizes.length} elements, ${tooSmall.length} below 14px`)
  })
})

// ── Contrast quick check ─────────────────────────────────────────────────────

test.describe('Contrast check — iPhone 14', () => {
  test.use({ viewport: IPHONE })

  test('check muted text colours on homepage', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    const colours = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('p, span, a, button, h1, h2, h3'))
      return els.slice(0, 60).map(el => {
        const style = window.getComputedStyle(el)
        const r = el.getBoundingClientRect()
        return {
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 40) ?? '',
          color: style.color,
          bg: style.backgroundColor,
          fontSize: parseFloat(style.fontSize),
          visible: r.width > 0 && r.height > 0 && r.top < window.innerHeight * 2,
        }
      }).filter(t => t.visible && t.text.length > 2)
    })

    console.log('=== COLOUR SAMPLES (check for low contrast) ===')
    const uniqueColours = [...new Map(colours.map(c => [c.color, c])).values()].slice(0, 12)
    uniqueColours.forEach(c => console.log(`  ${c.tag} "${c.text.slice(0,30)}" — color:${c.color} bg:${c.bg} size:${c.fontSize}px`))
  })
})
