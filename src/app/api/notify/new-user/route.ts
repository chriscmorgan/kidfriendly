import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'chris.c.morgan.email@gmail.com'
const WEBHOOK_SECRET = process.env.NOTIFY_WEBHOOK_SECRET ?? ''

// Supabase database webhook — fires when a row is inserted into the users table.
// Secured by checking the Authorization header matches NOTIFY_WEBHOOK_SECRET.
export async function POST(request: Request) {
  // Verify the secret token set in the Supabase webhook config
  const auth = request.headers.get('authorization') ?? ''
  if (WEBHOOK_SECRET && auth !== `Bearer ${WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: { record?: { id?: string; display_name?: string; created_at?: string } }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const user = payload.record
  if (!user) return NextResponse.json({ ok: true })

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return NextResponse.json({ ok: true })

  const resend = new Resend(resendKey)
  await resend.emails.send({
    from: 'KidFriendlyEats <notifications@kidfriendlyeats.space>',
    to: ADMIN_EMAIL,
    subject: 'New sign-up',
    html: `
      <p><strong>A new user has created an account.</strong></p>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Name</td><td>${user.display_name ?? '—'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">User ID</td><td style="font-family:monospace">${user.id ?? '—'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Joined</td><td>${user.created_at ? new Date(user.created_at).toLocaleString('en-AU') : '—'}</td></tr>
      </table>
      <p><a href="https://kidfriendlyeats.space/admin">View users in admin →</a></p>
    `,
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
