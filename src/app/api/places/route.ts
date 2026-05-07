import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rateLimit'

// Uses Geoapify Geocoding Autocomplete with type=amenity to search businesses/POIs by name.
// To switch to Google Places API, replace this handler body — response shape stays identical.
export async function GET(request: Request) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || q.length < 2) return NextResponse.json([])

  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) {
    console.warn('[places] GEOAPIFY_API_KEY is not set')
    return NextResponse.json([])
  }

  const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete')
  url.searchParams.set('text', q)
  url.searchParams.set('filter', 'countrycode:au')
  url.searchParams.set('type', 'amenity')
  url.searchParams.set('limit', '5')
  url.searchParams.set('apiKey', apiKey)

  try {
    const res = await fetch(url.toString())
    if (!res.ok) {
      console.error('[places] Geoapify error', res.status)
      return NextResponse.json([])
    }

    const data = await res.json()
    const features: Record<string, unknown>[] = data?.features ?? []

    const results = features
      .map((f, i) => {
        const p = f.properties as Record<string, unknown>
        const name = String(p.name ?? '')
        if (!name) return null
        return {
          id: String(p.place_id ?? i),
          name,
          address: String(p.formatted ?? ''),
          lat: Number(p.lat),
          lng: Number(p.lon),
          suburb: String(p.suburb ?? p.city ?? p.town ?? p.village ?? ''),
          website: typeof p.website === 'string' ? p.website : null,
          opening_hours: typeof p.opening_hours === 'string' ? p.opening_hours : null,
        }
      })
      .filter(Boolean)

    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
