'use client'
import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'
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
  const stripRef = useRef<HTMLDivElement>(null)

  const filtered = filter.trim()
    ? locations.filter(
        (loc) =>
          loc.name.toLowerCase().includes(filter.toLowerCase()) ||
          loc.suburb.toLowerCase().includes(filter.toLowerCase())
      )
    : locations

  // Pin clicked → select + scroll card into view
  const handleMarkerClick = useCallback((loc: Location) => {
    setSelectedId(loc.id)
    const card = cardRefs.current[loc.id]
    const strip = stripRef.current
    if (card && strip) {
      const targetScroll = card.offsetLeft - (strip.offsetWidth - card.offsetWidth) / 2
      strip.scrollTo({ left: targetScroll, behavior: 'smooth' })
    }
  }, [])

  // Card clicked → select (MapView handles fly + popup)
  const handleCardClick = useCallback((loc: Location) => {
    setSelectedId(loc.id)
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">

      {/* ── Map ── */}
      <div className="flex-1 relative min-h-0">

        {/* Floating search / filter */}
        <div className="absolute top-3 left-3 z-10 w-72 sm:w-80">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-lg focus-within:border-[#7da87b] transition-colors">
            <Search className="w-4 h-4 text-[#6b7280] shrink-0" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by name or suburb…"
              className="flex-1 bg-transparent outline-none text-sm text-[#2c2c2c] placeholder:text-[#6b7280]"
            />
            {filter ? (
              <button
                onClick={() => setFilter('')}
                className="text-[#6b7280] hover:text-[#2c2c2c] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <MapView
          locations={filtered}
          center={MELBOURNE_CENTER}
          zoom={11}
          selectedId={selectedId}
          onLocationClick={handleMarkerClick}
        />
      </div>

      {/* ── Bottom card strip ── */}
      <div className="shrink-0 bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">

        {/* Strip header */}
        <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
          <span className="text-xs font-medium text-[#6b7280]">
            {filtered.length} {filtered.length === 1 ? 'place' : 'places'}
          </span>
          <Link
            href="/submit"
            className="text-xs font-semibold text-[#5e8e5c] hover:text-[#426340] transition-colors"
          >
            + Add a place
          </Link>
        </div>

        {/* Horizontal scroll */}
        <div
          ref={stripRef}
          className="flex gap-3 overflow-x-auto overscroll-x-contain px-4 pb-4 pt-1 scrollbar-hide"
        >
          {filtered.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-[#6b7280] py-6 w-full justify-center">
              No places match — <button onClick={() => setFilter('')} className="text-[#5e8e5c] underline cursor-pointer">clear filter</button>
            </div>
          )}

          {filtered.map((loc) => {
            const photo = loc.photos?.[0]
            const meta = getCategoryMeta(loc.primary_category)
            const isSelected = loc.id === selectedId

            return (
              <div
                key={loc.id}
                ref={(el) => { cardRefs.current[loc.id] = el as HTMLElement | null }}
                className="shrink-0"
              >
                <button
                  onClick={() => handleCardClick(loc)}
                  className={cn(
                    'flex flex-col w-36 rounded-xl overflow-hidden border transition-all cursor-pointer text-left bg-white',
                    isSelected
                      ? 'border-[#7da87b] shadow-lg ring-2 ring-[#7da87b]/20'
                      : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                  )}
                >
                  {/* Photo */}
                  <div className="relative h-20 w-full bg-gray-100">
                    {photo ? (
                      <Image
                        src={photo.url}
                        alt={loc.name}
                        fill
                        className="object-cover"
                        sizes="144px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-30">
                        {meta.emoji}
                      </div>
                    )}
                    {/* Category dot */}
                    <span className="absolute top-1.5 left-1.5 text-base leading-none">{meta.emoji}</span>
                  </div>

                  {/* Text */}
                  <div className="px-2.5 py-2">
                    <p className="text-xs font-semibold text-[#2c2c2c] truncate leading-tight">{loc.name}</p>
                    <p className="text-[11px] text-[#6b7280] mt-0.5 flex items-center gap-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      {loc.suburb}
                    </p>
                  </div>
                </button>
              </div>
            )
          })}

          {/* Spacer so last card isn't flush against the edge */}
          <div className="shrink-0 w-1" aria-hidden />
        </div>
      </div>
    </div>
  )
}
