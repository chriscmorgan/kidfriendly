import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { TagBadge } from '@/components/ui/Badge'
import type { Location } from '@/lib/types'
import { cn, formatDistance, truncate } from '@/lib/utils'
import { AGE_RANGES } from '@/lib/constants'

interface LocationCardProps {
  location: Location
  className?: string
  compact?: boolean
}

export default function LocationCard({ location, className, compact = false }: LocationCardProps) {
  const heroPhoto = location.photos?.[0]
  const ageLabels = AGE_RANGES
    .filter((a) => location.age_ranges.includes(a.value))
    .map((a) => a.label)

  return (
    <Link
      href={`/location/${location.slug}`}
      className={cn(
        'group block bg-paper rounded border border-border hover:border-ink transition-colors overflow-hidden',
        className
      )}
    >
      {/* Photo */}
      {heroPhoto && (
        <div className={cn('relative overflow-hidden', compact ? 'h-36' : 'h-44')}>
          <Image
            src={heroPhoto.url}
            alt={location.name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {location.tags.length > 0 && (
            <div className="absolute top-2.5 left-2.5">
              <TagBadge tag={location.tags[0]} />
            </div>
          )}
        </div>
      )}
      {!heroPhoto && location.tags.length > 0 && (
        <div className="px-4 pt-4">
          <TagBadge tag={location.tags[0]} />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-ink group-hover:text-rust transition-colors truncate text-sm leading-snug">
          {location.name}
        </h3>

        <div className="flex items-center gap-1 mt-1 text-xs text-stone">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{location.suburb}</span>
          {location.distance_km != null && (
            <span className="ml-auto shrink-0 font-medium text-rust">
              {formatDistance(location.distance_km)}
            </span>
          )}
        </div>

        {!compact && (
          <p className="text-xs text-stone mt-2 line-clamp-2 leading-relaxed">
            {truncate(location.description, 100)}
          </p>
        )}

        {ageLabels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {ageLabels.slice(0, 2).map((label) => (
              <span key={label} className="text-[11px] border border-border text-stone px-1.5 py-0.5 rounded-sm">
                {label}
              </span>
            ))}
          </div>
        )}

      </div>
    </Link>
  )
}
