import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q) return NextResponse.json([])

  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) return NextResponse.json([])

  const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete')
  url.searchParams.set('text', q)
  url.searchParams.set('filter', 'countrycode:au')
  url.searchParams.set('limit', '5')
  url.searchParams.set('apiKey', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) return NextResponse.json([])

  const data = await res.json()
  const features = data?.features ?? []

  const results = features.map((f: Record<string, unknown>, i: number) => {
    const p = f.properties as Record<string, unknown>
    return {
      id: String(p.place_id ?? i),
      label: String(p.formatted ?? ''),
      lat: Number(p.lat),
      lng: Number(p.lon),
      suburb: String(p.suburb ?? p.city ?? p.town ?? p.village ?? ''),
    }
  })

  return NextResponse.json(results)
}
