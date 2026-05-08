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
  showContributor?: boolean
}

const AVATAR_PALETTES = [
  'bg-[#f4d4c8] text-[#7a2a14]',
  'bg-[#c8e4d4] text-[#1a4a2e]',
  'bg-[#d4d0c8] text-[#3a3428]',
  'bg-[#f0e4c8] text-[#6a4a10]',
  'bg-[#c8d4e4] text-[#1a2e4a]',
]

function avatarPalette(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length]
}

export default function LocationCard({ location, className, compact = false, showContributor = false }: LocationCardProps) {
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

        {showContributor && location.submitter && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${avatarPalette(location.submitted_by)}`}>
              {location.submitter.display_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <span className="text-[11px] text-stone">
              {location.submitter.display_name}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
