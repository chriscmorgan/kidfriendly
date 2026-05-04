'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, MapPin, ArrowLeft, ChevronRight, Star } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { Location } from '@/lib/types'
import { cn, getPrimaryTagMeta, getTagMeta, getOpenTimeMeta } from '@/lib/utils'
import { TagBadge, OpenTimeBadge } from '@/components/ui/Badge'

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })

const SYDNEY_CENTER = { lat: -33.8688, lng: 151.2093 }

interface Props {
  locations: Location[]
}

function overallRating(loc: Location): number | null {
  const r = loc.avg_ratings
  if (!r) return null
  const vals = Object.values(r).filter((v): v is number => v != null)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

export default function HomeMapClient({ locations }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const cardRefs = useRef<Record<string, HTMLElement | null>>({})
  const stripRef = useRef<HTMLDivElement>(null)

  const selectedLoc = locations.find((l) => l.id === selectedId) ?? null

  const filtered = filter.trim()
    ? locations.filter(
        (loc) =>
          loc.name.toLowerCase().includes(filter.toLowerCase()) ||
          loc.suburb.toLowerCase().includes(filter.toLowerCase())
      )
    : locations

  const handleMarkerClick = useCallback((loc: Location) => {
    setSelectedId(loc.id)
    setSheetOpen(true)
    // scroll card into view in strip (for when sheet collapses back)
    const card = cardRefs.current[loc.id]
    const strip = stripRef.current
    if (card && strip) {
      const targetScroll = card.offsetLeft - (strip.offsetWidth - card.offsetWidth) / 2
      strip.scrollTo({ left: targetScroll, behavior: 'smooth' })
    }
  }, [])

  const handleCardClick = useCallback((loc: Location) => {
    setSelectedId(loc.id)
    setSheetOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setSheetOpen(false)
    setSelectedId(null)
  }, [])

  const handleBack = useCallback(() => {
    setSheetOpen(false)
    // keep selectedId so pin stays highlighted
  }, [])

  // Close detail panel on outside tap
  useEffect(() => {
    if (!sheetOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sheetOpen, handleClose])

  const stripHeight = 172
  const detailHeight = '65vh'

  return (
    <div className="relative overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Map (full height behind sheet) ── */}
      <div className="absolute inset-0">
        <MapView
          locations={filtered}
          center={SYDNEY_CENTER}
          zoom={11}
          selectedId={selectedId}
          onLocationClick={handleMarkerClick}
        />
      </div>

      {/* ── Floating filter bar (strip mode only) ── */}
      <div className={cn(
        'absolute top-3 left-3 right-3 sm:right-auto z-10 sm:w-80 transition-opacity duration-200',
        sheetOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2.5 shadow-lg focus-within:border-[#7da87b] transition-colors">
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

      {/* ── Bottom sheet ── */}
      <div
        className="absolute left-0 right-0 bottom-0 z-20 bg-white rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] transition-all duration-350 ease-out flex flex-col"
        style={{ height: sheetOpen ? detailHeight : `${stripHeight}px` }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* ── Detail panel (open) ── */}
        {sheetOpen && selectedLoc ? (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header row */}
            <div className="flex items-center gap-2 px-4 pb-2 shrink-0">
              <button
                onClick={handleBack}
                className="p-1.5 -ml-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-[#2c2c2c]" />
              </button>
              <span className="text-xs text-[#6b7280] font-medium flex-1 truncate">{selectedLoc.suburb}</span>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-[#6b7280]" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">

              {/* Hero photo */}
              {selectedLoc.photos?.[0] && (
                <div className="relative w-full h-44 bg-gray-100 mx-0">
                  <Image
                    src={selectedLoc.photos[0].url}
                    alt={selectedLoc.name}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
              )}

              <div className="px-5 pt-4 pb-6">
                {/* Name */}
                <h2 className="text-xl font-bold text-[#2c2c2c] leading-tight">{selectedLoc.name}</h2>

                {/* Suburb + distance + rating */}
                <div className="flex items-center gap-3 mt-1 text-sm text-[#6b7280]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedLoc.suburb}
                  </span>
                  {selectedLoc.distance_km != null && (
                    <span className="text-[#5e8e5c] font-medium">{selectedLoc.distance_km.toFixed(1)}km away</span>
                  )}
                  {(() => {
                    const r = overallRating(selectedLoc)
                    return r != null ? (
                      <span className="flex items-center gap-1 ml-auto font-medium text-[#2c2c2c]">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {r.toFixed(1)}
                        {selectedLoc.review_count != null && (
                          <span className="text-[#6b7280] font-normal">({selectedLoc.review_count})</span>
                        )}
                      </span>
                    ) : null
                  })()}
                </div>

                {/* Tags */}
                {selectedLoc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedLoc.tags.map((tag) => (
                      <TagBadge key={tag} tag={tag} />
                    ))}
                    {selectedLoc.open_times.map((t) => (
                      <OpenTimeBadge key={t} time={t} />
                    ))}
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-[#4b5563] leading-relaxed mt-4">
                  {selectedLoc.description}
                </p>

                {/* Tips */}
                {selectedLoc.tips && (
                  <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-amber-700 mb-1">💡 Tip</p>
                    <p className="text-sm text-amber-900 leading-relaxed">{selectedLoc.tips}</p>
                  </div>
                )}

                {/* CTA */}
                <Link
                  href={`/location/${selectedLoc.slug}`}
                  className="flex items-center justify-center gap-2 mt-5 w-full bg-[#7da87b] hover:bg-[#5e8e5c] text-white font-semibold text-sm py-3 rounded-2xl transition-colors"
                >
                  View full details
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ── Strip (closed / no selection) ── */
          <div className="flex flex-col flex-1 min-h-0">
            {/* Strip header */}
            <div className="flex items-center justify-between px-4 pb-1 shrink-0">
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
              className="flex gap-3 overflow-x-auto overscroll-x-contain px-4 pb-4 pt-1 scrollbar-hide flex-1"
            >
              {filtered.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-[#6b7280] py-4 w-full justify-center">
                  No places match —{' '}
                  <button onClick={() => setFilter('')} className="text-[#5e8e5c] underline cursor-pointer">
                    clear filter
                  </button>
                </div>
              ) : (
                filtered.map((loc) => {
                  const photo = loc.photos?.[0]
                  const meta = getPrimaryTagMeta(loc.tags)
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
                          'flex flex-col w-36 rounded-2xl overflow-hidden border transition-all cursor-pointer text-left bg-white',
                          isSelected
                            ? 'border-[#7da87b] shadow-lg ring-2 ring-[#7da87b]/20'
                            : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                        )}
                      >
                        <div className="relative h-20 w-full bg-gray-100">
                          {photo ? (
                            <Image src={photo.url} alt={loc.name} fill className="object-cover" sizes="144px" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-30">
                              {meta.emoji}
                            </div>
                          )}
                          <span className="absolute top-1.5 left-1.5 text-base leading-none">{meta.emoji}</span>
                        </div>
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
                })
              )}
              <div className="shrink-0 w-1" aria-hidden />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
