import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rateLimit'
import { createClient } from '@/lib/supabase/server'
import { TAGS, OPEN_TIMES, AGE_RANGES } from '@/lib/constants'
import { slugify } from '@/lib/utils'

const VALID_TAGS = new Set(TAGS.map((t) => t.value))
const VALID_OPEN_TIMES = new Set(OPEN_TIMES.map((t) => t.value))
const VALID_AGE_RANGES = new Set(AGE_RANGES.map((a) => a.value))

export async function POST(request: Request) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(ip, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
  } = body as Record<string, unknown>

  if (!name || typeof name !== 'string' || !name.trim() || name.length > 120) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  }
  if (!description || typeof description !== 'string' || description.trim().length < 50 || description.length > 1000) {
    return NextResponse.json({ error: 'Description must be 50–1000 characters' }, { status: 400 })
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

  const slug = slugify((name as string).trim()) + '-' + Math.random().toString(36).slice(2, 7)

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
      submitted_by: user.id,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !loc) {
    console.error('[submit/location]', error?.message, error?.details)
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  return NextResponse.json({ id: loc.id })
}
