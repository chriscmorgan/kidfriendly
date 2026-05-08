export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import HomeLanding from './HomeLanding'
import type { Location, LocationPhoto, AvgRatings, SiteStats } from '@/lib/types'

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

async function getSiteStats(): Promise<SiteStats> {
  if (USE_MOCK) {
    const { mockStats } = await import('@/lib/mock/locations')
    return mockStats
  }

  const supabase = await createClient()
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [venuesRes, weekRes, contributorsRes] = await Promise.all([
    supabase.from('locations').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('locations').select('id', { count: 'exact', head: true }).eq('status', 'approved').gte('approved_at', oneWeekAgo),
    supabase.from('locations').select('submitted_by').eq('status', 'approved'),
  ])

  const uniqueContributors = new Set((contributorsRes.data ?? []).map((r) => r.submitted_by)).size

  return {
    total_venues: venuesRes.count ?? 0,
    total_contributors: uniqueContributors,
    added_this_week: weekRes.count ?? 0,
  }
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
  const [locations, stats] = await Promise.all([getLocations(), getSiteStats()])
  return <HomeLanding locations={locations} stats={stats} />
}
