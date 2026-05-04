import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PhotoCarousel from '@/components/location/PhotoCarousel'
import RatingsChart from '@/components/location/RatingsChart'
import ReviewCard from '@/components/location/ReviewCard'
import ReportButton from '@/components/location/ReportButton'
import { TagBadge, OpenTimeBadge, Badge } from '@/components/ui/Badge'
import type { Location, Review, AvgRatings, Tag, OpenTime } from '@/lib/types'
import { AGE_RANGES } from '@/lib/constants'
import { MapPin, Navigation, User, Calendar } from 'lucide-react'
import AddReviewSection from './AddReviewSection'

interface Props {
  params: Promise<{ slug: string }>
}

async function getLocation(slug: string) {
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
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const loc = await getLocation(slug)
  if (!loc) return {}
  return {
    title: loc.name,
    description: loc.description,
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

  const ageLabels = AGE_RANGES.filter((a) => loc.age_ranges?.includes(a.value)).map((a) => a.label)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link href="/search" className="inline-flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#2c2c2c] mb-6 transition-colors">
        ← Back to search
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Photos */}
          <PhotoCarousel photos={photos} />

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
            <h1 className="text-3xl font-bold text-[#2c2c2c] leading-tight">{loc.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-[#6b7280]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="text-sm">{loc.address}</span>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#5e8e5c] hover:text-[#426340] mt-2 font-medium transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              Get directions
            </a>
          </div>

          {/* Description */}
          <section>
            <h2 className="text-lg font-semibold text-[#2c2c2c] mb-2">About</h2>
            <p className="text-[#2c2c2c] leading-relaxed text-[15px]">{loc.description}</p>
          </section>

          {/* Tips */}
          {loc.tips && (
            <section className="bg-[#f7eed9] rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-[#9e7c48] mb-1">💡 Visitor tips</h2>
              <p className="text-sm text-[#2c2c2c]">{loc.tips}</p>
            </section>
          )}

          {/* Ratings */}
          <section>
            <h2 className="text-lg font-semibold text-[#2c2c2c] mb-4">Community ratings</h2>
            <RatingsChart ratings={avg_ratings} reviewCount={reviews.length} />
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-lg font-semibold text-[#2c2c2c] mb-4">
              Reviews {reviews.length > 0 && <span className="text-[#6b7280] font-normal text-base">({reviews.length})</span>}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-[#6b7280]">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </section>

          {/* Add review */}
          <AddReviewSection locationId={loc.id} existingReview={reviews.find((r) => false) ?? null} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Age ranges */}
          {ageLabels.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-[#2c2c2c] mb-3">👶 Best for</h3>
              <div className="flex flex-wrap gap-2">
                {ageLabels.map((label) => (
                  <Badge key={label} bgColor="bg-[#f7eed9]" color="text-[#9e7c48]">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Submitted by */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-[#2c2c2c] mb-3">Submitted by</h3>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#e0ecdf] flex items-center justify-center">
                <User className="w-4 h-4 text-[#5e8e5c]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#2c2c2c]">{loc.submitter?.display_name ?? 'Community member'}</p>
                <p className="text-xs text-[#6b7280] flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(loc.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Report */}
          <div className="px-1">
            <ReportButton locationId={loc.id} />
          </div>
        </aside>
      </div>
    </div>
  )
}
