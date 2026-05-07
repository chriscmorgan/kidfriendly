import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rateLimit'

export async function GET(request: Request) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || q.length < 2) return NextResponse.json([])

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.warn('[places] GOOGLE_PLACES_API_KEY is not set')
    return NextResponse.json([])
  }

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.websiteUri,places.regularOpeningHours,places.addressComponents',
      },
      body: JSON.stringify({
        textQuery: q,
        languageCode: 'en',
        regionCode: 'AU',
        maxResultCount: 5,
      }),
    })

    if (!res.ok) {
      console.error('[places] Google Places error', res.status, await res.text())
      return NextResponse.json([])
    }

    const data = await res.json()
    const places: Record<string, unknown>[] = data?.places ?? []

    const results = places
      .map((place, i) => {
        const displayName = place.displayName as { text?: string } | undefined
        const location = place.location as { latitude?: number; longitude?: number } | undefined
        const addressComponents = (place.addressComponents as { longText: string; types: string[] }[] | undefined) ?? []
        const openingHours = place.regularOpeningHours as { weekdayDescriptions?: string[] } | undefined

        const name = displayName?.text ?? ''
        if (!name) return null

        // Prefer sublocality (suburb) over locality (city/LGA) for Australian addresses
        const suburb =
          addressComponents.find((c) => c.types.includes('sublocality_level_1'))?.longText ??
          addressComponents.find((c) => c.types.includes('sublocality'))?.longText ??
          addressComponents.find((c) => c.types.includes('locality'))?.longText ??
          ''

        return {
          id: String(place.id ?? i),
          name,
          address: String(place.formattedAddress ?? '').replace(/, Australia$/, ''),
          lat: location?.latitude ?? 0,
          lng: location?.longitude ?? 0,
          suburb,
          website: typeof place.websiteUri === 'string' ? place.websiteUri : null,
          opening_hours: openingHours?.weekdayDescriptions?.join('\n') ?? null,
        }
      })
      .filter(Boolean)

    return NextResponse.json(results)
  } catch (err) {
    console.error('[places] fetch error', err)
    return NextResponse.json([])
  }
}
