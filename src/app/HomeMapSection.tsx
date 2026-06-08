'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { TagBadge, OpenTimeBadge } from '@/components/ui/Badge'
import { TAGS } from '@/lib/constants'
import type { Location, Tag } from '@/lib/types'
import { cn, getPrimaryTagMeta } from '@/lib/utils'
import { Star, MapPin, ArrowLeft, X } from 'lucide-react'

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
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {loc.photos?.[0] && (
          <div className="relative w-full h-40 bg-gray-100">
            <Image src={loc.photos[0].url} alt={loc.name} fill className="object-cover" sizes="100vw" />
          </div>
        )}
        <div className="px-5 pt-4 pb-6">
          <h3 className="text-xl font-bold text-ink leading-tight">{loc.name}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-stone">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
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
          {(loc.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(loc.tags ?? []).map((tag) => <TagBadge key={tag} tag={tag} />)}
              {(loc.open_times ?? []).map((t) => <OpenTimeBadge key={t} time={t} />)}
            </div>
          )}
          <p className="text-sm text-stone leading-relaxed mt-4 line-clamp-4">{loc.description}</p>
          <a
            href={`/location/${loc.slug}`}
            className="flex items-center justify-center gap-2 mt-5 w-full bg-rust hover:bg-rust-dark text-paper font-semibold text-sm py-3 rounded transition-colors"
          >
            View full details →
          </a>
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
            zoom={11}
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
