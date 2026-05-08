import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rateLimit'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'chris.c.morgan.email@gmail.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: Request) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(ip, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { locationId: string; reason: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { locationId, reason } = body
  if (!locationId || !reason?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { error: insertError } = await supabase.from('reports').insert({
    target_type: 'location',
    target_id: locationId,
    reported_by: user.id,
    reason,
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Fetch venue name for the email
  const { data: loc } = await supabase
    .from('locations')
    .select('name, slug')
    .eq('id', locationId)
    .single()

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const resend = new Resend(resendKey)
    await resend.emails.send({
      from: 'KidFriendlyEats <notifications@kidfriendlyeats.space>',
      to: ADMIN_EMAIL,
      subject: `Report: ${loc?.name ?? locationId}`,
      html: `
        <p><strong>A listing has been reported.</strong></p>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Venue</td><td><strong>${loc?.name ?? locationId}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Reason</td><td>${escapeHtml(reason)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Reporter</td><td>${escapeHtml(user.email ?? user.id)}</td></tr>
        </table>
        ${loc?.slug ? `<p><a href="${SITE_URL}/location/${loc.slug}">View listing →</a></p>` : ''}
      `,
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
