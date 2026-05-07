import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Camera } from 'lucide-react'
import { TagBadge } from '@/components/ui/Badge'
import type { Location } from '@/lib/types'
import { cn, formatDistance, truncate } from '@/lib/utils'
import { AGE_RANGES } from '@/lib/constants'

interface LocationCardProps {
  location: Location
  className?: string
  compact?: boolean
}

function overallRating(location: Location): number | null {
  const r = location.avg_ratings
  if (!r) return null
  const vals = Object.values(r).filter((v): v is number => v != null)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

export default function LocationCard({ location, className, compact = false }: LocationCardProps) {
  const heroPhoto = location.photos?.[0]
  const rating = overallRating(location)
  const ageLabels = AGE_RANGES
    .filter((a) => location.age_ranges.includes(a.value))
    .map((a) => a.label)

  return (
    <Link
      href={`/location/${location.slug}`}
      className={cn(
        'group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      {/* Photo */}
      <div className={cn('relative bg-sand-100 overflow-hidden', compact ? 'h-36' : 'h-48')}>
        {heroPhoto ? (
          <Image
            src={heroPhoto.url}
            alt={location.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#edf8f8] to-[#d4f0f0]">
            <span className="text-3xl opacity-60">🛝</span>
            <span className="text-[10px] text-[#6b9b9b] font-medium opacity-70">No photo yet</span>
          </div>
        )}
        {location.tags.length > 0 && (
          <div className="absolute top-2 left-2">
            <TagBadge tag={location.tags[0]} />
          </div>
        )}
        {(location.photos?.length ?? 0) > 1 && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            <Camera className="w-2.5 h-2.5" />
            {location.photos!.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-charcoal group-hover:text-sage-600 transition-colors truncate text-base">
          {location.name}
        </h3>

        <div className="flex items-center gap-1 mt-1 text-sm text-muted">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{location.suburb}</span>
          {location.distance_km != null && (
            <span className="ml-auto shrink-0 text-xs font-semibold text-[#38a5a0]">
              {formatDistance(location.distance_km)}
            </span>
          )}
        </div>

        {!compact && (
          <p className="text-sm text-muted mt-2 line-clamp-2 leading-relaxed">
            {truncate(location.description, 110)}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          {/* Age tags */}
          <div className="flex flex-wrap gap-1">
            {ageLabels.slice(0, 2).map((label) => (
              <span key={label} className="text-xs bg-[#edf8f8] text-[#38a5a0] px-2 py-1 rounded-full font-medium">
                {label}
              </span>
            ))}
          </div>

          {/* Rating or "Be first to review" prompt */}
          {rating != null ? (
            <div className="flex items-center gap-1 text-sm font-medium text-charcoal">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
              {location.review_count != null && location.review_count > 0 && (
                <span className="text-xs text-muted font-normal">({location.review_count})</span>
              )}
            </div>
          ) : (
            <span className="text-xs text-[#9ca3af]">No reviews yet</span>
          )}
        </div>
      </div>
    </Link>
  )
}
