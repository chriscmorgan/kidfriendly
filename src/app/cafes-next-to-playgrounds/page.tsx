import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LocationCard from '@/components/location/LocationCard'
import type { Location, LocationPhoto, AvgRatings } from '@/lib/types'
import { safeJsonLd } from '@/lib/utils'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'
const USE_MOCK = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ?? true

export const metadata: Metadata = {
  title: 'Cafes Next to Playgrounds in Melbourne',
  description: 'Find Melbourne cafes right next to a playground — grab a coffee while the kids play outside. Added and reviewed by local parents.',
  alternates: { canonical: `${SITE_URL}/cafes-next-to-playgrounds` },
  openGraph: {
    title: 'Cafes Next to Playgrounds in Melbourne | KidFriendlyEats',
    description: 'Melbourne cafes right next to a playground — grab a coffee while the kids play outside.',
    url: `${SITE_URL}/cafes-next-to-playgrounds`,
  },
}

async function getAdjacentPlaygroundLocations(): Promise<Location[]> {
  if (USE_MOCK) {
    const { mockLocations } = await import('@/lib/mock/locations')
    return mockLocations.filter((l) => l.tags?.includes('adjacent_playground')).slice(0, 6)
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
    .contains('tags', ['adjacent_playground'])
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

export default async function CafesNextToPlaygroundsPage() {
  const locations = await getAdjacentPlaygroundLocations()

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Cafes Next to Playgrounds', item: `${SITE_URL}/cafes-next-to-playgrounds` },
    ],
  }

  const itemListSchema = locations.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cafes Next to Playgrounds in Melbourne',
    description: 'Cafes and venues right next to public playgrounds where parents can relax while kids play outside.',
    url: `${SITE_URL}/cafes-next-to-playgrounds`,
    numberOfItems: locations.length,
    itemListElement: locations.map((loc, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/location/${loc.slug}`,
      name: loc.name,
    })),
  } : null

  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }} />
      {itemListSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }} />}

      {/* Hero */}
      <section className="bg-parchment py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <nav className="flex items-center justify-center gap-2 text-xs text-stone mb-6">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="font-medium text-ink">Cafes Next to Playgrounds</span>
          </nav>
          <p className="text-xs font-medium text-stone tracking-wide uppercase mb-4">🏞️ Playground right next door</p>
          <h1 className="font-display italic font-700 text-[clamp(1.5rem,6vw,3rem)] text-ink leading-tight">
            Cafes Next to Playgrounds
          </h1>
          <p className="text-stone text-base sm:text-lg mt-4 max-w-lg mx-auto leading-relaxed">
            Sit outside, drink your coffee, and watch the kids wear themselves out — cafes with a playground right next door.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/search?tag=adjacent_playground"
              className="inline-flex items-center gap-2 bg-rust text-paper font-medium text-sm px-6 py-3 rounded hover:bg-rust-dark transition-colors"
            >
              See all on map
            </Link>
          </div>
        </div>
      </section>

      {/* What makes it great */}
      <section className="bg-paper px-4 py-12 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display italic font-700 text-xl text-ink mb-6">Why it works so well</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { emoji: '🌤️', title: 'Perfect for good weather', desc: 'Open air, sunscreen, and a flat white — the ideal Melbourne morning.' },
              { emoji: '🏃', title: 'Energy burn guaranteed', desc: 'Public playgrounds have more space to run. Expect tired, happy kids at nap time.' },
              { emoji: '🐕', title: 'Usually dog-friendly too', desc: 'Many park-adjacent cafes welcome dogs. Double win for the whole family.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col px-2">
                <span className="text-2xl mb-3">{item.emoji}</span>
                <h3 className="font-semibold text-ink text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-stone leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue grid */}
      <section className="bg-parchment px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display italic font-700 text-xl text-ink mb-2">
            {locations.length > 0 ? `${locations.length} cafes next to playgrounds` : 'Cafes next to playgrounds'}
          </h2>
          <p className="text-sm text-stone mb-8">All added by parents who have been there.</p>

          {locations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <LocationCard key={loc.id} location={loc} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-stone">
              <p className="text-lg font-medium mb-2">No listings yet</p>
              <p className="text-sm">Know a cafe next to a playground? Add it to the map.</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/search?tag=adjacent_playground"
              className="inline-flex items-center gap-2 bg-rust text-paper font-medium text-sm px-7 py-3 rounded hover:bg-rust-dark transition-colors"
            >
              See all on map →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
