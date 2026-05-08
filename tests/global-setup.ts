import { chromium } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { loadEnvConfig } from '@next/env'
import * as fs from 'fs'
import * as path from 'path'

loadEnvConfig(process.cwd())

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const TEST_EMAIL = 'playwright-test@kidfriendlyeats.com.au'
export const TEST_PASSWORD = 'Pw-Test-9374!'
export const AUTH_FILE = path.join(__dirname, '.auth', 'user.json')

export default async function globalSetup() {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Find or create the test user
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 })
  let userId = list?.users.find((u) => u.email === TEST_EMAIL)?.id

  if (!userId) {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    })
    if (error || !created.user) throw new Error(`Could not create test user: ${error?.message}`)
    userId = created.user.id
  }

  // Ensure a public.users row exists (submitted_by / uploaded_by FK)
  await admin
    .from('users')
    .upsert({ id: userId, display_name: 'Playwright Test' }, { onConflict: 'id' })

  // Generate a magic link (no captcha required for admin-generated links)
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: TEST_EMAIL,
    options: { redirectTo: 'http://localhost:3000/' },
  })
  if (linkError || !linkData.properties?.hashed_token) {
    throw new Error(`Could not generate magic link: ${linkError?.message}`)
  }
  const { hashed_token: hashedToken } = linkData.properties

  // Navigate through /auth/callback so @supabase/ssr sets the session cookie correctly
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(
    `http://localhost:3000/auth/callback?token_hash=${hashedToken}&type=magiclink`,
    { waitUntil: 'networkidle' }
  )

  await context.storageState({ path: AUTH_FILE })
  await browser.close()
}
