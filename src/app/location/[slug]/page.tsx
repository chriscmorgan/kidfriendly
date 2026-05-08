import { cache } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PhotoCarousel from '@/components/location/PhotoCarousel'
import ReportButton from '@/components/location/ReportButton'
import { TagBadge, OpenTimeBadge, Badge } from '@/components/ui/Badge'
import type { Location, Review, AvgRatings, Tag, OpenTime } from '@/lib/types'
import { AGE_RANGES, TAGS } from '@/lib/constants'
import { safeJsonLd } from '@/lib/utils'
import { MapPin, Navigation, User, Calendar, ExternalLink } from 'lucide-react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'

interface Props {
  params: Promise<{ slug: string }>
}

const getLocation = cache(async (slug: string) => {
  const supabase = await createClient()
  const { data: loc } = await supabase
    .from('locations')
    .select(`
      *,
      photos:location_photos(id, url, sort_order, uploaded_by),
      reviews(
        *,
        user:users(id, display_name, avatar_url)
      ),
      submitter:users!submitted_by(id, display_name)
    `)
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()
  return loc
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const loc = await getLocation(slug)
  if (!loc) return {}

  const photos = (loc.photos ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
  const heroPhoto = photos[0]
  const tagLabels = (loc.tags ?? []).map((t: Tag) => TAGS.find(x => x.value === t)?.label).filter(Boolean).join(', ')
  const title = `${loc.name} — Kid-Friendly Cafe in ${loc.suburb}`
  const description = `${loc.description.slice(0, 150).trimEnd()}…`

  return {
    title: `${loc.name} — Kid-Friendly Venue in ${loc.suburb}`,
    description,
    alternates: { canonical: `${SITE_URL}/location/${loc.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/location/${loc.slug}`,
      images: heroPhoto ? [{ url: heroPhoto.url, width: 1200, height: 630, alt: `${loc.name} — ${loc.suburb}` }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: heroPhoto ? [heroPhoto.url] : [],
    },
    keywords: [`${loc.name}`, `${loc.suburb} cafe kids`, `kid friendly ${loc.suburb}`, tagLabels, 'cafe with play area Australia'],
  }
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params
  const loc = await getLocation(slug)
  if (!loc) notFound()

  const photos = (loc.photos ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
  const reviews: Review[] = loc.reviews ?? []

  const keys = ['food', 'noise', 'safety', 'cleanliness', 'access', 'weather', 'age_suitability'] as const
  const avg_ratings: AvgRatings = {} as AvgRatings
  for (const key of keys) {
    const vals = reviews.map((r) => r[`rating_${key}` as keyof Review] as number | null).filter((v): v is number => v != null)
    avg_ratings[key] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }

  const overallAvg = (() => {
    const vals = Object.values(avg_ratings).filter((v): v is number => v != null)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  })()

  const ageLabels = AGE_RANGES.filter((a) => loc.age_ranges?.includes(a.value)).map((a) => a.label)

  // LocalBusiness JSON-LD
  const schemaType = (loc.tags ?? []).includes('play_centre') || (loc.tags ?? []).includes('indoor_playground')
    ? 'EntertainmentBusiness'
    : 'CafeOrCoffeeShop'

  const TAG_AMENITY: Record<string, string> = {
    indoor_playground: 'Indoor playground',
    kids_play_area: 'Kids play area',
    adjacent_playground: 'Adjacent playground',
    outdoor_run_area: 'Outdoor space for kids',
    play_centre: 'Play centre',
  }

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': `${SITE_URL}/location/${loc.slug}`,
    name: loc.name,
    description: loc.description,
    url: `${SITE_URL}/location/${loc.slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: loc.address,
      addressLocality: loc.suburb,
      addressCountry: 'AU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: loc.lat,
      longitude: loc.lng,
    },
    amenityFeature: (loc.tags ?? []).map((tag: Tag) => ({
      '@type': 'LocationFeatureSpecification',
      name: TAG_AMENITY[tag] ?? tag,
      value: true,
    })),
    ...(photos.length > 0 && { image: photos.map((p: { url: string }) => p.url) }),
    ...(loc.website && { sameAs: [loc.website] }),
    ...(loc.opening_hours && { openingHours: loc.opening_hours }),
    ...(overallAvg != null && reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: overallAvg.toFixed(1),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(reviews.length > 0 && {
      review: reviews.slice(0, 5).map((r) => {
        const ratingFields = ['rating_food', 'rating_noise', 'rating_safety', 'rating_cleanliness', 'rating_access', 'rating_weather', 'rating_age_suitability'] as const
        const rVals = ratingFields.map((k) => r[k as keyof Review] as number | null).filter((v): v is number => v != null)
        const rAvg = rVals.length ? rVals.reduce((a, b) => a + b, 0) / rVals.length : null
        return {
          '@type': 'Review',
          author: { '@type': 'Person', name: (r.user as { display_name?: string } | undefined)?.display_name ?? 'Community member' },
          datePublished: r.created_at.split('T')[0],
          ...(r.comment && { reviewBody: r.comment }),
          ...(rAvg != null && {
            reviewRating: { '@type': 'Rating', ratingValue: rAvg.toFixed(1), bestRating: 5, worstRating: 1 },
          }),
        }
      }),
    }),
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32 md:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      {/* Back — 44px tap target */}
      <Link href="/search" className="inline-flex items-center gap-1 text-sm text-stone hover:text-ink mb-6 transition-colors min-h-[44px]">
        ← Back to search
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Photos */}
          <PhotoCarousel photos={photos} locationName={loc.name} />

          {/* Title & meta */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {(loc.tags ?? []).map((tag: Tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
              {(loc.open_times ?? []).map((t: OpenTime) => (
                <OpenTimeBadge key={t} time={t} />
              ))}
            </div>
            <h1 className="font-display italic font-700 text-3xl text-ink leading-tight">{loc.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-stone">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="text-sm">{loc.address}</span>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-rust hover:text-rust-dark mt-2 font-medium transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              Get directions
            </a>
            <a
              href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-rust hover:text-rust-dark mt-1.5 font-medium transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              View on Google Maps
            </a>
            {loc.website && (
              <a
                href={loc.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-rust hover:text-rust-dark mt-1.5 font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Visit website
              </a>
            )}
          </div>

          {/* Description */}
          <section>
            <h2 className="text-lg font-semibold text-ink mb-2">About</h2>
            <p className="text-ink leading-relaxed text-[15px]">{loc.description}</p>
          </section>

          {/* Tips */}
          {loc.tips && (
            <section className="bg-parchment border border-border rounded p-4">
              <h2 className="text-sm font-semibold text-stone mb-1">Visitor tips</h2>
              <p className="text-sm text-ink">{loc.tips}</p>
            </section>
          )}

        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {ageLabels.length > 0 && (
            <div className="bg-paper border border-border rounded p-4">
              <h3 className="text-sm font-semibold text-ink mb-3">👶 Best for</h3>
              <div className="flex flex-wrap gap-2">
                {ageLabels.map((label) => (
                  <Badge key={label} bgColor="bg-[#f7eed9]" color="text-[#9e7c48]">{label}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="bg-paper border border-border rounded p-4">
            <h3 className="text-sm font-semibold text-ink mb-3">Submitted by</h3>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-parchment flex items-center justify-center">
                <User className="w-4 h-4 text-stone" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{loc.submitter?.display_name ?? 'Community member'}</p>
                <p className="text-xs text-stone flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(loc.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="px-1">
            <ReportButton locationId={loc.id} />
          </div>
        </aside>
      </div>

      {/* Sticky mobile CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-paper border-t border-border px-4 py-3 safe-area-inset-bottom">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-rust hover:bg-rust-dark text-paper font-semibold text-sm py-3.5 rounded transition-colors min-h-[52px] w-full"
        >
          <Navigation className="w-4 h-4" /> Get Directions
        </a>
      </div>
    </div>
  )
}
