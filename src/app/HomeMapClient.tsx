'use client'
import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { CategoryBadge } from '@/components/ui/Badge'
import type { Location } from '@/lib/types'
import { cn, getCategoryMeta } from '@/lib/utils'

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })

const MELBOURNE_CENTER = { lat: -37.8136, lng: 144.9631 }

interface Props {
  locations: Location[]
}

export default function HomeMapClient({ locations }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const cardRefs = useRef<Record<string, HTMLElement | null>>({})

  const filtered = filter.trim()
    ? locations.filter((loc) =>
        loc.name.toLowerCase().includes(filter.toLowerCase()) ||
        loc.suburb.toLowerCase().includes(filter.toLowerCase())
      )
    : locations

  const handleMarkerClick = useCallback((loc: Location) => {
    setSelectedId(loc.id)
    cardRefs.current[loc.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="md:w-80 lg:w-96 flex flex-col border-r border-gray-100 bg-white shrink-0 md:overflow-hidden h-64 md:h-auto">
        {/* Filter input */}
        <div className="p-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-[#faf8f4] focus-within:border-[#7da87b] transition-colors">
            <Search className="w-4 h-4 text-[#6b7280] shrink-0" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by name or suburb…"
              className="flex-1 bg-transparent outline-none text-sm text-[#2c2c2c] placeholder:text-[#6b7280]"
            />
            {filter && (
              <button onClick={() => setFilter('')} className="text-[#6b7280] hover:text-[#2c2c2c] cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Count */}
        <div className="px-4 py-2 text-xs text-[#6b7280] border-b border-gray-50 shrink-0">
          {filtered.length} {filtered.length === 1 ? 'place' : 'places'}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-sm text-[#6b7280] gap-2">
              <span>No places match your filter</span>
              <button onClick={() => setFilter('')} className="text-[#5e8e5c] underline text-xs cursor-pointer">
                Clear filter
              </button>
            </div>
          )}
          {filtered.map((loc) => {
            const photo = loc.photos?.[0]
            const meta = getCategoryMeta(loc.primary_category)
            const isSelected = loc.id === selectedId
            return (
              <div
                key={loc.id}
                ref={(el) => { cardRefs.current[loc.id] = el }}
              >
                <Link
                  href={`/location/${loc.slug}`}
                  onClick={() => setSelectedId(loc.id)}
                  className={cn(
                    'flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-[#f7eed9] transition-colors',
                    isSelected && 'bg-[#f2f7f2] border-l-[3px] border-l-[#7da87b]'
                  )}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative">
                    {photo ? (
                      <Image
                        src={photo.url}
                        alt={loc.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-40">
                        {meta.emoji}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2c2c2c] truncate leading-tight">{loc.name}</p>
                    <p className="text-xs text-[#6b7280] mt-0.5">{loc.suburb}</p>
                    <div className="mt-1.5">
                      <CategoryBadge category={loc.primary_category} />
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}

          {/* Add a place CTA at bottom */}
          <div className="p-4 border-t border-gray-100 mt-auto">
            <Link
              href="/submit"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#7da87b] text-white text-sm font-medium hover:bg-[#5e8e5c] transition-colors"
            >
              + Add a place
            </Link>
          </div>
        </div>
      </aside>

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        <MapView
          locations={filtered}
          center={MELBOURNE_CENTER}
          zoom={11}
          selectedId={selectedId}
          onLocationClick={handleMarkerClick}
        />
      </div>
    </div>
  )
}
