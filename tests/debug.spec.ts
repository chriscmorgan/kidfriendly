import { test } from '@playwright/test'

test('capture console errors on search page', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(`PageError: ${err.message}`))

  await page.goto('/search')
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(2000)

  console.log('=== Console errors ===')
  errors.forEach((e) => console.log(e))
  if (errors.length === 0) console.log('(none)')
})
