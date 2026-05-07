import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LocationCard from '@/components/location/LocationCard'
import type { Location, LocationPhoto, AvgRatings } from '@/lib/types'
import { safeJsonLd } from '@/lib/utils'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'
const USE_MOCK = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ?? true

export const metadata: Metadata = {
  title: 'Kid-Friendly Cafes in Sydney with Play Areas',
  description: 'Discover the best cafes in Sydney with kids play areas — indoor playgrounds, spots next to parks, and family-friendly restaurants reviewed by local parents.',
  alternates: { canonical: `${SITE_URL}/sydney` },
  openGraph: {
    title: 'Kid-Friendly Cafes in Sydney with Play Areas | KidFriendlyEats',
    description: 'Find cafes, restaurants and venues in Sydney where kids can play — reviewed by local parents.',
    url: `${SITE_URL}/sydney`,
  },
}

async function getSydneyLocations(): Promise<Location[]> {
  if (USE_MOCK) {
    const { mockLocations } = await import('@/lib/mock/locations')
    return mockLocations.slice(0, 6)
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('locations')
    .select(`
      *,
      photos:location_photos(id, url, sort_order),
      reviews(rating_food, rating_noise, rating_safety, rating_cleanliness, rating_access, rating_weather, rating_age_suitability)
    `)
    .eq('status', 'approved')
    .ilike('address', '%NSW%')
    .order('approved_at', { ascending: false })
    .limit(9)

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

export default async function SydneyPage() {
  const locations = await getSydneyLocations()

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Sydney', item: `${SITE_URL}/sydney` },
    ],
  }

  const itemListSchema = locations.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Kid-Friendly Cafes in Sydney',
        description: 'Cafes and venues in Sydney with play areas for kids',
        numberOfItems: locations.length,
        itemListElement: locations.map((loc, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: loc.name,
          url: `${SITE_URL}/location/${loc.slug}`,
        })),
      }
    : null

  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }} />
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }} />
      )}

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#b8e4e4] via-[#cceece] to-[#e8f5f0] py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <nav className="flex items-center justify-center gap-2 text-xs text-[#4a7a7a] mb-6">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="font-medium text-[#2c2c2c]">Sydney</span>
          </nav>
          <h1 className="text-[clamp(1.5rem,6vw,3rem)] font-extrabold text-[#2c2c2c] leading-tight tracking-tight">
            Kid-Friendly Cafes in Sydney
          </h1>
          <p className="text-[#4a7a7a] text-base sm:text-lg mt-4 max-w-lg mx-auto leading-relaxed">
            Cafes, restaurants and play venues across Sydney with real play areas — reviewed by local parents.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/search?lat=-33.8688&lng=151.2093&q=Sydney"
              className="inline-flex items-center gap-2 bg-[#4abfc0] text-white font-bold text-sm px-6 py-3 rounded-2xl hover:bg-[#38a5a0] transition-colors shadow-md"
            >
              🗺️ Open map
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-white/80 border border-[#5ecece]/40 text-[#38a5a0] font-semibold text-sm px-6 py-3 rounded-2xl hover:bg-white transition-colors"
            >
              📍 Add a place
            </Link>
          </div>
        </div>
      </section>

      {/* Venue grid */}
      <section className="bg-white px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#2c2c2c] mb-2">
            {locations.length > 0 ? `${locations.length} places listed in Sydney` : 'Places in Sydney'}
          </h2>
          <p className="text-sm text-[#6b7280] mb-8">
            Browse suburbs, search the map, or filter by play area type to find your next family outing.
          </p>

          {locations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <LocationCard key={loc.id} location={loc} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#6b7280]">
              <p className="text-lg font-medium mb-2">No Sydney listings yet</p>
              <p className="text-sm">Be the first to add a kid-friendly spot in Sydney.</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/search?lat=-33.8688&lng=151.2093&q=Sydney"
              className="inline-flex items-center gap-2 bg-[#4abfc0] text-white font-semibold text-sm px-7 py-3 rounded-2xl hover:bg-[#38a5a0] transition-colors"
            >
              See all on map →
            </Link>
          </div>
        </div>
      </section>

      {/* Popular suburbs */}
      <section className="bg-[#faf8f4] px-4 py-12 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#2c2c2c] mb-6">Browse Sydney by suburb</h2>
          <div className="flex flex-wrap gap-2">
            {[
              'Newtown', 'Surry Hills', 'Glebe', 'Balmain', 'Leichhardt',
              'Manly', 'Bondi', 'Coogee', 'Marrickville', 'Rozelle',
              'Paddington', 'Erskineville', 'Annandale', 'Dulwich Hill', 'Redfern',
            ].map((suburb) => (
              <Link
                key={suburb}
                href={`/search?q=${encodeURIComponent(suburb)}`}
                className="inline-flex items-center bg-white border border-gray-200 text-[#4b5563] text-xs font-medium px-3 py-1.5 rounded-full hover:border-[#4abfc0] hover:text-[#38a5a0] transition-colors"
              >
                {suburb}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
