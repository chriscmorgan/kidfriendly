import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rateLimit'
import { createClient } from '@/lib/supabase/server'
import { RATING_DIMENSIONS } from '@/lib/constants'

export async function POST(request: Request) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(ip, 5, 5 * 60 * 1000)) {
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

  const { locationId, comment, ratings } = body as Record<string, unknown>

  if (!locationId || typeof locationId !== 'string') {
    return NextResponse.json({ error: 'Invalid locationId' }, { status: 400 })
  }
  if (comment !== null && comment !== undefined && (typeof comment !== 'string' || comment.length > 280)) {
    return NextResponse.json({ error: 'Comment too long' }, { status: 400 })
  }

  const payload: Record<string, unknown> = {
    location_id: locationId,
    user_id: user.id,
    comment: typeof comment === 'string' ? comment.trim() || null : null,
  }

  const ratingsMap = (ratings ?? {}) as Record<string, unknown>
  for (const d of RATING_DIMENSIONS) {
    const val = ratingsMap[d.key]
    if (val !== undefined && val !== null) {
      if (typeof val !== 'number' || !Number.isInteger(val) || val < 1 || val > 5) {
        return NextResponse.json({ error: `Invalid rating for ${d.key}` }, { status: 400 })
      }
      payload[`rating_${d.key}`] = val
    } else {
      payload[`rating_${d.key}`] = null
    }
  }

  if (!payload.comment && RATING_DIMENSIONS.every((d) => payload[`rating_${d.key}`] === null)) {
    return NextResponse.json({ error: 'Review must include a comment or at least one rating' }, { status: 400 })
  }

  const { error } = await supabase
    .from('reviews')
    .upsert(payload, { onConflict: 'location_id,user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
