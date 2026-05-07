import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rateLimit'

// Returns lightweight autocomplete suggestions (name + address preview only, no lat/lng).
// Client fetches /api/places/[id] on selection to get full details.
export async function GET(request: Request) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const lat = parseFloat(searchParams.get('lat') ?? '') || -37.8136
  const lng = parseFloat(searchParams.get('lng') ?? '') || 144.9631

  if (!q || q.length < 2) return NextResponse.json([])

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.warn('[places] GOOGLE_PLACES_API_KEY is not set')
    return NextResponse.json([])
  }

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat',
      },
      body: JSON.stringify({
        input: q,
        languageCode: 'en',
        regionCode: 'AU',
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 50000,
          },
        },
      }),
    })

    if (!res.ok) {
      console.error('[places] autocomplete error', res.status, await res.text())
      return NextResponse.json([])
    }

    const data = await res.json()
    const suggestions: Record<string, unknown>[] = data?.suggestions ?? []

    const results = suggestions
      .map((s) => {
        const pred = s.placePrediction as Record<string, unknown> | undefined
        if (!pred) return null
        const fmt = pred.structuredFormat as {
          mainText?: { text?: string }
          secondaryText?: { text?: string }
        } | undefined
        const name = fmt?.mainText?.text ?? ''
        if (!name) return null
        return {
          id: String(pred.placeId ?? ''),
          name,
          address: fmt?.secondaryText?.text ?? '',
        }
      })
      .filter(Boolean)

    return NextResponse.json(results)
  } catch (err) {
    console.error('[places] fetch error', err)
    return NextResponse.json([])
  }
}
