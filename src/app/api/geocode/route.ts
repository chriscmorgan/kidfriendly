import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rateLimit'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || q.length < 2) return NextResponse.json([])

  // Search our own venue database first
  const supabase = await createClient()
  const { data: venues } = await supabase
    .from('locations')
    .select('id, name, suburb, lat, lng, slug')
    .eq('status', 'approved')
    .ilike('name', `%${q}%`)
    .limit(3)

  const venueResults = (venues ?? []).map((v) => ({
    id: `venue-${v.id}`,
    label: `${v.name}, ${v.suburb}`,
    lat: v.lat,
    lng: v.lng,
    suburb: v.suburb,
    type: 'venue' as const,
    slug: v.slug,
  }))

  // Also search Geoapify for suburb/address results
  const apiKey = process.env.GEOAPIFY_API_KEY
  let placeResults: {
    id: string; label: string; lat: number; lng: number; suburb: string;
    type: 'place'; slug?: undefined
  }[] = []

  if (apiKey) {
    try {
      const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete')
      url.searchParams.set('text', q)
      url.searchParams.set('filter', 'countrycode:au')
      url.searchParams.set('limit', '4')
      url.searchParams.set('apiKey', apiKey)

      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        placeResults = (data?.features ?? []).map((f: Record<string, unknown>, i: number) => {
          const p = f.properties as Record<string, unknown>
          return {
            id: String(p.place_id ?? i),
            label: String(p.formatted ?? ''),
            lat: Number(p.lat),
            lng: Number(p.lon),
            suburb: String(p.suburb ?? p.city ?? p.town ?? p.village ?? ''),
            type: 'place' as const,
          }
        })
      }
    } catch {
      // Geoapify failure is non-fatal — venue results still returned
    }
  }

  // Venues first, then address/suburb results, capped at 5 total
  return NextResponse.json([...venueResults, ...placeResults].slice(0, 5))
}
