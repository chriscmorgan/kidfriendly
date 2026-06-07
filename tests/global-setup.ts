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

  // Ensure a public.users row exists (submitted_by / uploaded_by FK), with admin role
  await admin
    .from('users')
    .upsert({ id: userId, display_name: 'Playwright Test', role: 'admin' }, { onConflict: 'id' })

  // Ensure a foreign submitter auth user exists (for admin photo upload test)
  const FOREIGN_EMAIL = 'playwright-foreign@kidfriendlyeats.com.au'
  let foreignUserId = list?.users.find((u) => u.email === FOREIGN_EMAIL)?.id
  if (!foreignUserId) {
    const { data: created } = await admin.auth.admin.createUser({
      email: FOREIGN_EMAIL,
      email_confirm: true,
    })
    foreignUserId = created?.user?.id
  }
  if (!foreignUserId) throw new Error('Could not create foreign submitter user')

  // Upsert the foreign location (submitted_by = foreignUserId, not the test user)
  const { data: existingLoc } = await admin
    .from('locations')
    .select('id')
    .eq('slug', 'playwright-foreign-location')
    .single()

  let foreignLocationId = existingLoc?.id as string | undefined
  if (!foreignLocationId) {
    const { data: newLoc, error: locErr } = await admin.from('locations').insert({
      name: 'Playwright Foreign Location',
      slug: 'playwright-foreign-location',
      description: 'Test location created by Playwright for admin photo upload tests. Do not remove.',
      address: '1 Test St, Melbourne VIC 3000',
      lat: -37.8136,
      lng: 144.9631,
      suburb: 'Melbourne',
      tags: ['kids_play_area'],
      open_times: [],
      age_ranges: [],
      status: 'approved',
      submitted_by: foreignUserId,
    }).select('id').single()
    if (locErr) throw new Error(`Could not create foreign location: ${locErr.message}`)
    foreignLocationId = newLoc!.id
  }

  // Ensure a test location submitted by the test user exists (for profile edit link test)
  const OWN_SLUG = 'playwright-own-location'
  const { data: existingOwn } = await admin.from('locations').select('id').eq('slug', OWN_SLUG).single()
  if (!existingOwn) {
    await admin.from('locations').insert({
      name: 'Playwright Own Location',
      slug: OWN_SLUG,
      description: 'A test venue created by the automated setup. Used for profile edit link tests — do not remove.',
      address: '3 Own St, Melbourne VIC 3000',
      lat: -37.815,
      lng: 144.965,
      suburb: 'Melbourne',
      tags: ['kids_play_area'],
      open_times: [],
      age_ranges: [],
      status: 'approved',
      submitted_by: userId,
    })
  }

  // Ensure a pending location exists so the admin Approve button test has something to show
  const PENDING_SLUG = 'playwright-pending-location'
  const { data: existingPending } = await admin.from('locations').select('id, status').eq('slug', PENDING_SLUG).single()
  if (!existingPending) {
    await admin.from('locations').insert({
      name: 'Playwright Pending Location',
      slug: PENDING_SLUG,
      description: 'A test venue kept in pending state for admin dashboard tests. Do not approve or reject.',
      address: '4 Pending St, Melbourne VIC 3000',
      lat: -37.816,
      lng: 144.966,
      suburb: 'Melbourne',
      tags: ['kids_play_area'],
      open_times: [],
      age_ranges: [],
      status: 'pending',
      submitted_by: foreignUserId,
    })
  } else if (existingPending.status !== 'pending') {
    // Reset to pending if it was approved or rejected by a previous test run
    await admin.from('locations').update({ status: 'pending', approved_at: null, rejection_note: null }).eq('slug', PENDING_SLUG)
  }

  // Write test data for use in specs
  const TEST_DATA_FILE = path.join(__dirname, '.auth', 'test-data.json')
  fs.writeFileSync(TEST_DATA_FILE, JSON.stringify({ foreignLocationId }))

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
