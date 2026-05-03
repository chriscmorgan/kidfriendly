import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const types = searchParams.get('types') ?? 'place,district,locality,neighbourhood,postcode'

  if (!q) return NextResponse.json([])

  // Strip Australian unit/apartment prefixes: "2/2 Laburnum St" → "2 Laburnum St"
  const normalised = q.replace(/^\d+\//, '')

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', normalised)
  url.searchParams.set('format', 'json')
  url.searchParams.set('countrycodes', 'au')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '5')

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'KidFriendlyEats/1.0 (https://kidfriendlyeats.com.au)',
      'Accept-Language': 'en-AU',
    },
  })

  if (!res.ok) return NextResponse.json([])

  const data = await res.json()
  return NextResponse.json(data)
}
