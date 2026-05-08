import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LocationCard from '@/components/location/LocationCard'
import type { Location, LocationPhoto, AvgRatings } from '@/lib/types'
import { safeJsonLd } from '@/lib/utils'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'
const USE_MOCK = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ?? true

export const metadata: Metadata = {
  title: 'Cafes with Indoor Playgrounds in Australia',
  description: 'Find cafes and restaurants in Australia with indoor playgrounds inside — where you can enjoy a coffee while the kids play. Reviewed by parents.',
  alternates: { canonical: `${SITE_URL}/indoor-playground-cafes` },
  openGraph: {
    title: 'Cafes with Indoor Playgrounds in Australia | KidFriendlyEats',
    description: 'Find cafes with indoor playgrounds where you can enjoy a coffee while the kids play.',
    url: `${SITE_URL}/indoor-playground-cafes`,
  },
}

async function getIndoorPlaygroundLocations(): Promise<Location[]> {
  if (USE_MOCK) {
    const { mockLocations } = await import('@/lib/mock/locations')
    return mockLocations.filter((l) => l.tags?.includes('indoor_playground')).slice(0, 6)
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
    .contains('tags', ['indoor_playground'])
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

export default async function IndoorPlaygroundCafesPage() {
  const locations = await getIndoorPlaygroundLocations()

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Indoor Playground Cafes', item: `${SITE_URL}/indoor-playground-cafes` },
    ],
  }

  const itemListSchema = locations.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cafes with Indoor Playgrounds in Melbourne',
    description: 'Cafes and venues with indoor playgrounds where kids can play while parents eat and drink coffee.',
    url: `${SITE_URL}/indoor-playground-cafes`,
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
            <span className="font-medium text-ink">Indoor Playground Cafes</span>
          </nav>
          <p className="text-xs font-medium text-stone tracking-wide uppercase mb-4">🛝 Indoor playground inside</p>
          <h1 className="font-display italic font-700 text-[clamp(1.5rem,6vw,3rem)] text-ink leading-tight">
            Cafes with Indoor Playgrounds
          </h1>
          <p className="text-stone text-base sm:text-lg mt-4 max-w-lg mx-auto leading-relaxed">
            Enjoy your coffee while the kids play — venues with a proper indoor playground built in.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/search?tag=indoor_playground"
              className="inline-flex items-center gap-2 bg-rust text-paper font-medium text-sm px-6 py-3 rounded hover:bg-rust-dark transition-colors"
            >
              See all on map
            </Link>
          </div>
        </div>
      </section>

      {/* What to expect */}
      <section className="bg-paper px-4 py-12 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display italic font-700 text-xl text-ink mb-6">What to expect</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { emoji: '☕', title: 'Coffee you can actually finish', desc: 'The play area keeps kids busy so you can drink your coffee while it\'s still hot.' },
              { emoji: '🛝', title: 'Equipment inside the venue', desc: 'Slides, climbing frames, soft play — all indoors. Great for rainy days.' },
              { emoji: '👀', title: 'Eyes on the kids', desc: 'Most venues are set up so you can watch the play area from your table.' },
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
            {locations.length > 0 ? `${locations.length} indoor playground cafes listed` : 'Indoor playground cafes'}
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
              <p className="text-lg font-medium mb-2">No indoor playground cafes listed yet</p>
              <p className="text-sm">Know one? Add it to the map.</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/search?tag=indoor_playground"
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
