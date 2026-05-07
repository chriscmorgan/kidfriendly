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

  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#b8e4e4] via-[#cceece] to-[#e8f5f0] py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <nav className="flex items-center justify-center gap-2 text-xs text-[#4a7a7a] mb-6">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="font-medium text-[#2c2c2c]">Indoor Playground Cafes</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-white/80 border border-[#5ecece]/30 text-[#38a5a0] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            🛝 Indoor playground inside
          </div>
          <h1 className="text-[clamp(1.5rem,6vw,3rem)] font-extrabold text-[#2c2c2c] leading-tight tracking-tight">
            Cafes with Indoor Playgrounds
          </h1>
          <p className="text-[#4a7a7a] text-base sm:text-lg mt-4 max-w-lg mx-auto leading-relaxed">
            Enjoy your coffee while the kids play — venues with a proper indoor playground built in. No compromise.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/search?tag=indoor_playground"
              className="inline-flex items-center gap-2 bg-[#4abfc0] text-white font-bold text-sm px-6 py-3 rounded-2xl hover:bg-[#38a5a0] transition-colors shadow-md"
            >
              🗺️ See all on map
            </Link>
          </div>
        </div>
      </section>

      {/* What to expect */}
      <section className="bg-white px-4 py-12 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-[#2c2c2c] mb-4">What to expect</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { emoji: '☕', title: 'Coffee you can actually finish', desc: 'The play area keeps kids busy so you can drink your coffee while it\'s still hot.' },
              { emoji: '🛝', title: 'Equipment inside the venue', desc: 'Slides, climbing frames, soft play — all indoors. Great for rainy days.' },
              { emoji: '👀', title: 'Eyes on the kids', desc: 'Most venues are set up so you can watch the play area from your table.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-[#edf8f8] flex items-center justify-center text-2xl mb-3">
                  {item.emoji}
                </div>
                <h3 className="font-semibold text-[#2c2c2c] text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-[#6b7280] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue grid */}
      <section className="bg-[#faf8f4] px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#2c2c2c] mb-2">
            {locations.length > 0 ? `${locations.length} indoor playground cafes listed` : 'Indoor playground cafes'}
          </h2>
          <p className="text-sm text-[#6b7280] mb-8">All reviewed by parents who have visited.</p>

          {locations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <LocationCard key={loc.id} location={loc} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#6b7280]">
              <p className="text-lg font-medium mb-2">No indoor playground cafes listed yet</p>
              <p className="text-sm">Know one? Add it to the map.</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/search?tag=indoor_playground"
              className="inline-flex items-center gap-2 bg-[#4abfc0] text-white font-semibold text-sm px-7 py-3 rounded-2xl hover:bg-[#38a5a0] transition-colors"
            >
              See all on map →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
