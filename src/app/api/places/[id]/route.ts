import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rateLimit'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(ip, 200)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing place id' }, { status: 400 })

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  // First attempt: full field mask including opening hours
  // Second attempt: reduced mask (some place types reject regularOpeningHours)
  const fieldMasks = [
    'id,displayName,formattedAddress,location,websiteUri,regularOpeningHours,addressComponents',
    'id,displayName,formattedAddress,location,websiteUri,addressComponents',
  ]

  for (const fieldMask of fieldMasks) {
    try {
      const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
      })

      const bodyText = await res.text()

      if (!res.ok) {
        console.error('[places/detail] Google error', res.status, fieldMask, bodyText.slice(0, 500))
        continue
      }

      let place: Record<string, unknown>
      try {
        place = JSON.parse(bodyText)
      } catch {
        console.error('[places/detail] JSON parse error', fieldMask, bodyText.slice(0, 200))
        continue
      }

      const displayName = place.displayName as { text?: string } | undefined
      const location = place.location as { latitude?: number; longitude?: number } | undefined
      const addressComponents = (place.addressComponents as { longText: string; types: string[] }[] | undefined) ?? []
      const openingHours = place.regularOpeningHours as { weekdayDescriptions?: string[] } | undefined

      const suburb =
        addressComponents.find((c) => c.types.includes('sublocality_level_1'))?.longText ??
        addressComponents.find((c) => c.types.includes('sublocality'))?.longText ??
        addressComponents.find((c) => c.types.includes('locality'))?.longText ??
        ''

      return NextResponse.json({
        id: String(place.id ?? id),
        name: displayName?.text ?? '',
        address: String(place.formattedAddress ?? '').replace(/, Australia$/, ''),
        lat: location?.latitude ?? 0,
        lng: location?.longitude ?? 0,
        suburb,
        website: typeof place.websiteUri === 'string' ? place.websiteUri : null,
        opening_hours: openingHours?.weekdayDescriptions?.join('\n') ?? null,
      })
    } catch (err) {
      console.error('[places/detail] unexpected error', fieldMask, err)
      continue
    }
  }

  return NextResponse.json({ error: 'Place not found' }, { status: 404 })
}
