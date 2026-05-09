export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'

export const metadata: Metadata = {
  title: 'Kid-Friendly Cafes & Play Areas in Melbourne | KidFriendlyEats',
  description: 'The Melbourne map of cafes and places where kids can actually play — indoor playgrounds, spots next to parks, and run-around spaces. Added by local parents, free to use.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Kid-Friendly Cafes & Play Areas in Melbourne',
    description: 'The Melbourne map of cafes and places where kids can actually play. Added by local parents, free to use.',
    url: SITE_URL,
    type: 'website',
  },
}
import HomeLanding from './HomeLanding'
import type { Location, LocationPhoto, AvgRatings } from '@/lib/types'

const USE_MOCK = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ?? true

async function getLocations(): Promise<Location[]> {
  if (USE_MOCK) {
    const { mockLocations } = await import('@/lib/mock/locations')
    return mockLocations.slice().reverse().slice(0, 6)
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('locations')
    .select(`
      *,
      photos:location_photos(id, url, sort_order),
      reviews(rating_food, rating_noise, rating_safety, rating_cleanliness, rating_access, rating_weather, rating_age_suitability),
      submitter:profiles!submitted_by(display_name, avatar_url)
    `)
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })
    .limit(6)

  if (!data) return []
  return data.map(enrichLocation)
}


function enrichLocation(loc: Record<string, unknown>): Location {
  const reviews = (loc.reviews as Record<string, number | null>[]) ?? []
  const photos = ((loc.photos as LocationPhoto[]) ?? []).sort((a, b) => a.sort_order - b.sort_order)
  const keys = ['food', 'noise', 'safety', 'cleanliness', 'access', 'weather', 'age_suitability'] as const
  const avg: Record<string, number | null> = {}
  for (const key of keys) {
    const vals = reviews.map((r) => r[`rating_${key}`]).filter((v): v is number => v != null)
    avg[key] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }
  return {
    ...(loc as unknown as Location),
    photos,
    avg_ratings: avg as unknown as AvgRatings,
    review_count: reviews.length,
  }
}

export default async function HomePage() {
  const locations = await getLocations()
  return <HomeLanding locations={locations} />
}
