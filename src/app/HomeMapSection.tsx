'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { TagBadge, OpenTimeBadge, Badge } from '@/components/ui/Badge'
import PhotoCarousel from '@/components/location/PhotoCarousel'
import ReportButton from '@/components/location/ReportButton'
import { TAGS, AGE_RANGES } from '@/lib/constants'
import type { Location, Tag } from '@/lib/types'
import { cn, getPrimaryTagMeta } from '@/lib/utils'
import { Star, MapPin, ArrowLeft, X, Navigation, ExternalLink } from 'lucide-react'

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })

const MELBOURNE = { lat: -37.9764, lng: 145.0951 }
const SNAP_PEEK = 72
const snapStrip = () => Math.round(window.innerHeight * 0.45)
const snapDetail = () => Math.round(window.innerHeight * 0.65)

function avgRating(loc: Location): number {
  if (!loc.avg_ratings) return 0
  const vals = Object.values(loc.avg_ratings).filter((v): v is number => v != null)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}

function ListRow({ loc, selected, onClick }: { loc: Location; selected: boolean; onClick: () => void }) {
  const meta = getPrimaryTagMeta(loc.tags ?? [])
  const photo = loc.photos?.[0]
  const rating = avgRating(loc)
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-4 text-left transition-colors cursor-pointer min-h-[72px]',
        selected ? 'bg-rust-light' : 'hover:bg-parchment'
      )}
    >
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        {photo ? (
          <Image src={photo.url} alt="" fill className="object-cover" sizes="56px" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xl">{meta.emoji}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">{loc.name}</p>
        <p className="text-xs text-stone mt-0.5 flex items-center gap-1 truncate">
          <span>{meta.emoji} {meta.label}</span>
          <span>·</span>
          <span>{loc.suburb}</span>
        </p>
      </div>
      {rating > 0 && (
        <div className="shrink-0 flex items-center gap-0.5 text-xs font-medium text-ink">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {rating.toFixed(1)}
        </div>
      )}
    </button>
  )
}

function DetailPanel({ loc, onBack }: { loc: Location; onBack: () => void }) {
  const rating = avgRating(loc)
  const ageLabels = AGE_RANGES.filter((a) => loc.age_ranges?.includes(a.value)).map((a) => a.label)
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address)}`
  const mapsUrl = `https://maps.google.com/?q=${loc.lat},${loc.lng}`

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-2 px-4 pb-2 shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>
        <span className="text-xs text-stone font-medium flex-1 truncate">{loc.suburb}</span>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-10">
        {/* Photos — full carousel, same as the listing page */}
        {(loc.photos?.length ?? 0) > 0 && (
          <div className="pt-1">
            <PhotoCarousel photos={loc.photos ?? []} locationName={loc.name} />
          </div>
        )}

        {/* Title + rating */}
        <h3 className="text-xl font-bold text-ink leading-tight mt-4">{loc.name}</h3>
        <div className="flex items-center gap-3 mt-1 text-sm text-stone">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {loc.suburb}
          </span>
          {rating > 0 && (
            <span className="flex items-center gap-1 ml-auto font-medium text-ink">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
              {loc.review_count != null && (
                <span className="text-stone font-normal">({loc.review_count})</span>
              )}
            </span>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5 mt-2 text-sm text-stone">
          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{loc.address}</span>
        </div>

        {/* Tags + open times */}
        {((loc.tags?.length ?? 0) > 0 || (loc.open_times?.length ?? 0) > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(loc.tags ?? []).map((tag) => <TagBadge key={tag} tag={tag} />)}
            {(loc.open_times ?? []).map((t) => <OpenTimeBadge key={t} time={t} />)}
          </div>
        )}

        {/* Action links */}
        <div className="flex flex-col gap-2.5 mt-4">
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-rust hover:text-rust-dark font-medium transition-colors">
            <Navigation className="w-3.5 h-3.5" /> Get directions
          </a>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-rust hover:text-rust-dark font-medium transition-colors">
            <MapPin className="w-3.5 h-3.5" /> View on Google Maps
          </a>
          {loc.website && (
            <a href={loc.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-rust hover:text-rust-dark font-medium transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Visit website
            </a>
          )}
        </div>

        {/* About */}
        {loc.description && (
          <section className="mt-5">
            <h4 className="text-sm font-semibold text-ink mb-1">About</h4>
            <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{loc.description}</p>
          </section>
        )}

        {/* Opening hours */}
        {loc.opening_hours && (
          <section className="mt-5">
            <h4 className="text-sm font-semibold text-ink mb-1">Opening hours</h4>
            <p className="text-sm text-stone whitespace-pre-line">{loc.opening_hours}</p>
          </section>
        )}

        {/* Visitor tips */}
        {loc.tips && (
          <section className="mt-5 bg-parchment border border-border rounded p-3">
            <h4 className="text-xs font-semibold text-stone mb-1">Visitor tips</h4>
            <p className="text-sm text-ink">{loc.tips}</p>
          </section>
        )}

        {/* Best for ages */}
        {ageLabels.length > 0 && (
          <section className="mt-5">
            <h4 className="text-sm font-semibold text-ink mb-2">👶 Best for</h4>
            <div className="flex flex-wrap gap-2">
              {ageLabels.map((label) => (
                <Badge key={label} bgColor="bg-[#f7eed9]" color="text-[#9e7c48]">{label}</Badge>
              ))}
            </div>
          </section>
        )}

        {/* Full details CTA */}
        <a
          href={`/location/${loc.slug}`}
          className="flex items-center justify-center gap-2 mt-6 w-full bg-rust hover:bg-rust-dark text-paper font-semibold text-sm py-3 rounded transition-colors"
        >
          View full details →
        </a>

        {/* Report + owner */}
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <ReportButton locationId={loc.id} />
          <p className="text-xs text-stone leading-relaxed">
            Are you the owner?{' '}
            <a
              href={`mailto:support@kidfriendlyeats.space?subject=Listing enquiry: ${encodeURIComponent(loc.name)}`}
              className="underline underline-offset-2 hover:text-ink"
            >
              Contact us to update or remove this listing.
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function HomeMapSection({ locations }: { locations: Location[] }) {
  const [activeTag, setActiveTag] = useState<Tag | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetPx, setSheetPx] = useState(300)
  const [isDragging, setIsDragging] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const sheetPxRef = useRef(sheetPx)
  useEffect(() => { sheetPxRef.current = sheetPx }, [sheetPx])

  const draggingRef = useRef(false)
  const dragStartY = useRef(0)
  const dragStartH = useRef(0)

  useEffect(() => { setSheetPx(snapStrip()); setHydrated(true) }, [])

  function onHandlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    draggingRef.current = true
    setIsDragging(true)
    dragStartY.current = e.clientY
    dragStartH.current = sheetPxRef.current
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onHandlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!draggingRef.current) return
    const delta = dragStartY.current - e.clientY
    const maxH = Math.round(window.innerHeight * 0.9)
    setSheetPx(Math.max(SNAP_PEEK, Math.min(maxH, dragStartH.current + delta)))
  }

  function onHandlePointerUp() {
    if (!draggingRef.current) return
    draggingRef.current = false
    setIsDragging(false)
    const h = sheetPxRef.current
    const strip = snapStrip()
    const detail = snapDetail()
    const dPeek = Math.abs(h - SNAP_PEEK)
    const dStrip = Math.abs(h - strip)
    const dDetail = Math.abs(h - detail)
    if (dPeek <= dStrip && dPeek <= dDetail) setSheetPx(SNAP_PEEK)
    else if (dStrip <= dDetail) setSheetPx(strip)
    else setSheetPx(detail)
  }

  const filtered = activeTag ? locations.filter((l) => l.tags.includes(activeTag)) : locations
  const showContent = sheetPx > SNAP_PEEK + 40
  const selectedLoc = filtered.find((l) => l.id === selectedId) ?? null

  const handlePinClick = useCallback((loc: Location) => {
    setSelectedId(loc.id)
    setSheetPx(snapDetail())
  }, [])

  const handleCardClick = useCallback((loc: Location) => {
    setSelectedId(loc.id)
    setSheetPx(snapDetail())
  }, [])

  const handleBack = useCallback(() => {
    setSelectedId(null)
    setSheetPx(snapStrip())
  }, [])

  return (
    <section>
      <div className="max-w-2xl mx-auto px-4 pt-2 pb-4 text-center">
        <h2 className="font-display italic font-700 text-2xl text-ink mb-2">
          All spots, on the map
        </h2>
        <p className="text-sm text-stone max-w-md mx-auto">
          Browse every kid-friendly place in Melbourne — tap a pin or scroll the list.
        </p>
      </div>

      <div className="relative" style={{ height: 'calc(100vh - 56px)' }}>

        {/* Map fills background */}
        <div className="absolute inset-0">
          <MapView
            locations={filtered}
            center={MELBOURNE}
            zoom={9}
            selectedId={selectedId}
            onLocationClick={handlePinClick}
            bottomPadding={sheetPx}
          />
        </div>

        {/* Tag filter pills — sit above the sheet */}
        <div
          className={cn('absolute left-0 right-0 z-10 flex gap-2 overflow-x-auto px-3 pb-1 scrollbar-hide', hydrated && !isDragging && '[transition:bottom_0.3s]')}
          style={{ bottom: `${sheetPx + 8}px` }}
        >
          <button
            onClick={() => { setActiveTag(null); setSelectedId(null) }}
            className={cn(
              'shrink-0 px-3 py-3 rounded-full text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap min-h-[44px] flex items-center',
              !activeTag ? 'bg-rust text-paper border-transparent' : 'bg-paper text-ink border-border shadow-sm'
            )}
          >
            All
          </button>
          {TAGS.map((t) => (
            <button
              key={t.value}
              onClick={() => { setActiveTag(activeTag === t.value ? null : t.value); setSelectedId(null) }}
              className={cn(
                'shrink-0 px-3 py-3 rounded-full text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap min-h-[44px] flex items-center',
                activeTag === t.value ? 'bg-rust text-paper border-transparent' : 'bg-paper text-ink border-border shadow-sm'
              )}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Bottom sheet */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] flex flex-col',
            hydrated && !isDragging && '[transition:height_0.3s]'
          )}
          style={{ height: `${sheetPx}px` }}
        >
          {/* Drag handle */}
          <button
            className="flex justify-center pt-2.5 pb-2 shrink-0 w-full touch-none select-none cursor-ns-resize"
            style={{ touchAction: 'none' }}
            onPointerDown={onHandlePointerDown}
            onPointerMove={onHandlePointerMove}
            onPointerUp={onHandlePointerUp}
            onPointerCancel={onHandlePointerUp}
            aria-label="Resize panel"
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </button>

          {showContent && (
            showContent && selectedLoc ? (
              <DetailPanel loc={selectedLoc} onBack={handleBack} />
            ) : (
              <div className="flex flex-col h-full min-h-0">
                <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-gray-100">
                  <span className="text-sm text-stone font-medium">
                    {filtered.length} place{filtered.length !== 1 ? 's' : ''}
                  </span>
                  <a href="/search" className="text-xs font-medium text-rust hover:text-rust-dark underline underline-offset-2">
                    Open full map →
                  </a>
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-gray-50">
                  {filtered.map((loc) => (
                    <ListRow key={loc.id} loc={loc} selected={selectedId === loc.id} onClick={() => handleCardClick(loc)} />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
