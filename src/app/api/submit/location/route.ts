import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rateLimit'
import { createClient } from '@/lib/supabase/server'
import { TAGS, OPEN_TIMES, AGE_RANGES } from '@/lib/constants'
import { slugify } from '@/lib/utils'
import { Resend } from 'resend'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'chris.c.morgan.email@gmail.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY

const VALID_TAGS = new Set(TAGS.map((t) => t.value))
const VALID_OPEN_TIMES = new Set(OPEN_TIMES.map((t) => t.value))
const VALID_AGE_RANGES = new Set(AGE_RANGES.map((a) => a.value))

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true // dev/test mode — skip verification
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token, remoteip: ip }),
  })
  const data = await res.json().catch(() => ({ success: false })) as { success: boolean }
  return data.success === true
}

export async function POST(request: Request) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(ip, 500, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    name, address, lat, lng, suburb,
    tags, open_times, age_ranges,
    description, tips, website, opening_hours,
    turnstile_token, submitter_name, submitter_email,
  } = body as Record<string, unknown>

  // Turnstile check — required for all submissions (authenticated or not)
  const tokenStr = typeof turnstile_token === 'string' ? turnstile_token : ''
  if (TURNSTILE_SECRET && !tokenStr) {
    return NextResponse.json({ error: 'Bot check token missing' }, { status: 400 })
  }
  if (tokenStr && !(await verifyTurnstile(tokenStr, ip))) {
    return NextResponse.json({ error: 'Bot check failed — please refresh and try again' }, { status: 400 })
  }

  if (!name || typeof name !== 'string' || !name.trim() || name.length > 120) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  }
  if (!description || typeof description !== 'string' || description.trim().length < 30 || description.length > 1000) {
    return NextResponse.json({ error: 'Description must be 30–1000 characters' }, { status: 400 })
  }
  if (!address || typeof address !== 'string') {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }
  if (typeof lat !== 'number' || typeof lng !== 'number' || !isFinite(lat) || !isFinite(lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }
  if (!Array.isArray(tags) || tags.length === 0 || !tags.every((t) => VALID_TAGS.has(t))) {
    return NextResponse.json({ error: 'Invalid tags' }, { status: 400 })
  }
  if (!Array.isArray(open_times) || !open_times.every((t) => VALID_OPEN_TIMES.has(t))) {
    return NextResponse.json({ error: 'Invalid open_times' }, { status: 400 })
  }
  if (!Array.isArray(age_ranges) || !age_ranges.every((r) => VALID_AGE_RANGES.has(r))) {
    return NextResponse.json({ error: 'Invalid age_ranges' }, { status: 400 })
  }
  if (tips !== null && tips !== undefined && (typeof tips !== 'string' || tips.length > 280)) {
    return NextResponse.json({ error: 'Tips too long' }, { status: 400 })
  }
  if (website !== null && website !== undefined) {
    if (typeof website !== 'string' || !/^https?:\/\//i.test(website)) {
      return NextResponse.json({ error: 'Website must start with http:// or https://' }, { status: 400 })
    }
  }
  if (opening_hours !== null && opening_hours !== undefined && (typeof opening_hours !== 'string' || opening_hours.length > 500)) {
    return NextResponse.json({ error: 'Opening hours too long' }, { status: 400 })
  }

  const cleanName = typeof submitter_name === 'string' ? submitter_name.trim().slice(0, 120) || null : null
  const cleanEmail = typeof submitter_email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitter_email.trim())
    ? submitter_email.trim()
    : null

  const slug = slugify((name as string).trim()) + '-' + Math.random().toString(36).slice(2, 7)

  // supabase client is anon when user is null — RLS policy allows submitted_by IS NULL
  const { data: loc, error } = await supabase
    .from('locations')
    .insert({
      slug,
      name: (name as string).trim(),
      description: (description as string).trim(),
      address,
      lat,
      lng,
      suburb: typeof suburb === 'string' ? suburb : '',
      tags,
      open_times,
      age_ranges,
      tips: typeof tips === 'string' ? tips.trim() || null : null,
      website: typeof website === 'string' ? website.trim() || null : null,
      opening_hours: typeof opening_hours === 'string' ? opening_hours.trim() || null : null,
      submitted_by: user ? user.id : null,
      submitter_name: user ? null : cleanName,
      submitter_email: user ? null : cleanEmail,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !loc) {
    console.error('[submit/location]', error?.message, error?.details)
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  // Notify admin
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const resend = new Resend(resendKey)
    const submitterDisplay = user
      ? (user.email ?? user.id)
      : cleanName
        ? `${cleanName}${cleanEmail ? ` <${cleanEmail}>` : ''} (anonymous)`
        : cleanEmail
          ? `${cleanEmail} (anonymous)`
          : 'Anonymous'
    await resend.emails.send({
      from: 'KidFriendlyEats <notifications@kidfriendlyeats.space>',
      to: ADMIN_EMAIL,
      subject: `New submission: ${(name as string).trim()}`,
      html: `
        <p><strong>A new place has been submitted for review.</strong></p>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Venue</td><td><strong>${(name as string).trim()}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Suburb</td><td>${typeof suburb === 'string' ? suburb : ''}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Address</td><td>${address as string}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Submitted by</td><td>${submitterDisplay}</td></tr>
        </table>
        <p><a href="${SITE_URL}/admin">Review in admin →</a></p>
      `,
    }).catch(() => {})
  }

  return NextResponse.json({ id: loc.id })
}
