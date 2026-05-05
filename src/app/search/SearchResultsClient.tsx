'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import SearchBar from '@/components/search/SearchBar'
import LocationCard from '@/components/location/LocationCard'
import { TagBadge, OpenTimeBadge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import type { Location, Tag, SortOption } from '@/lib/types'
import { TAGS, RADIUS_OPTIONS, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants'
import { cn, getPrimaryTagMeta } from '@/lib/utils'
import { Star, MapPin, ArrowLeft, X, SlidersHorizontal, ChevronRight } from 'lucide-react'
import BodyScrollLock from '@/components/ui/BodyScrollLock'

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'nearest', label: 'Nearest' },
  { value: 'highest_rated', label: 'Highest rated' },
  { value: 'most_reviewed', label: 'Most reviewed' },
  { value: 'newest', label: 'Newest' },
]

const IS_MOCK = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ?? true

function TagPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap',
        active ? 'bg-[#7da87b] text-white border-transparent' : 'bg-white text-[#2c2c2c] border-gray-200'
      )}
    >
      {label}
    </button>
  )
}

function ListRow({
  loc,
  selected,
  onClick,
}: {
  loc: Location
  selected: boolean
  onClick: () => void
}) {
  const meta = getPrimaryTagMeta(loc.tags ?? [])
  const photo = loc.photos?.[0]
  const rating = avgRating(loc)
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-3 text-left transition-colors cursor-pointer',
        selected ? 'bg-[#f2f7f2]' : 'hover:bg-gray-50'
      )}
    >
      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        {photo ? (
          <Image src={photo.url} alt="" fill className="object-cover" sizes="48px" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xl">{meta.emoji}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#2c2c2c] truncate">{loc.name}</p>
        <p className="text-xs text-[#6b7280] mt-0.5 flex items-center gap-1 truncate">
          <span>{meta.emoji} {meta.label}</span>
          <span>·</span>
          <span>{loc.suburb}</span>
          {loc.distance_km != null && (
            <span className="text-[#5e8e5c] font-medium ml-1">{loc.distance_km.toFixed(1)}km</span>
          )}
        </p>
      </div>
      {rating > 0 && (
        <div className="shrink-0 flex items-center gap-0.5 text-xs font-medium text-[#2c2c2c]">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {rating.toFixed(1)}
        </div>
      )}
    </button>
  )
}

function ListStrip({
  locations,
  loading,
  selectedId,
  onSelect,
  q,
  sortParam,
  onSortChange,
}: {
  locations: Location[]
  loading: boolean
  selectedId: string | null
  onSelect: (loc: Location) => void
  q: string
  sortParam: SortOption
  onSortChange: (s: string) => void
}) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-4 py-2 shrink-0 border-b border-gray-100">
        <span className="text-xs text-[#6b7280] font-medium">
          {loading ? 'Searching…' : `${locations.length} place${locations.length !== 1 ? 's' : ''}${q ? ` near ${q}` : ''}`}
        </span>
        <select
          value={sortParam}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-[#2c2c2c] cursor-pointer"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-gray-50">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-3xl mb-2">🔍</div>
            <p className="font-medium text-[#2c2c2c] text-sm">No spots found here yet</p>
            <p className="text-xs text-[#6b7280] mt-1">Try a different area or category</p>
          </div>
        ) : (
          locations.map((loc) => (
            <ListRow key={loc.id} loc={loc} selected={selectedId === loc.id} onClick={() => onSelect(loc)} />
          ))
        )}
      </div>
    </div>
  )
}

function DetailPanel({
  loc,
  onBack,
  onClose,
}: {
  loc: Location
  onBack: () => void
  onClose: () => void
}) {
  const rating = avgRating(loc)
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-2 px-4 pb-2 shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-[#2c2c2c]" />
        </button>
        <span className="text-xs text-[#6b7280] font-medium flex-1 truncate">{loc.suburb}</span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-[#6b7280]" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {loc.photos?.[0] && (
          <div className="relative w-full h-44 bg-gray-100">
            <Image src={loc.photos[0].url} alt={loc.name} fill className="object-cover" sizes="100vw" />
          </div>
        )}
        <div className="px-5 pt-4 pb-6">
          <h2 className="text-xl font-bold text-[#2c2c2c] leading-tight">{loc.name}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-[#6b7280]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {loc.suburb}
            </span>
            {loc.distance_km != null && (
              <span className="text-[#5e8e5c] font-medium">{loc.distance_km.toFixed(1)}km away</span>
            )}
            {rating > 0 && (
              <span className="flex items-center gap-1 ml-auto font-medium text-[#2c2c2c]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {rating.toFixed(1)}
                {loc.review_count != null && (
                  <span className="text-[#6b7280] font-normal">({loc.review_count})</span>
                )}
              </span>
            )}
          </div>
          {(loc.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(loc.tags ?? []).map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
              {(loc.open_times ?? []).map((t) => (
                <OpenTimeBadge key={t} time={t} />
              ))}
            </div>
          )}
          <p className="text-sm text-[#4b5563] leading-relaxed mt-4">{loc.description}</p>
          {loc.tips && (
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">💡 Tip</p>
              <p className="text-sm text-amber-900 leading-relaxed">{loc.tips}</p>
            </div>
          )}
          <a
            href={`/location/${loc.slug}`}
            className="flex items-center justify-center gap-2 mt-5 w-full bg-[#7da87b] hover:bg-[#5e8e5c] text-white font-semibold text-sm py-3 rounded-2xl transition-colors"
          >
            View full details
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function SearchResultsClient() {
  const router = useRouter()
  const params = useSearchParams()

  const q = params.get('q') ?? ''
  const lat = parseFloat(params.get('lat') ?? '') || DEFAULT_MAP_CENTER.lat
  const lng = parseFloat(params.get('lng') ?? '') || DEFAULT_MAP_CENTER.lng
  const radius = parseInt(params.get('radius') ?? '10') || 10
  const tagParam = params.get('tag') as Tag | null
  const sortParam = (params.get('sort') ?? 'nearest') as SortOption

  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const supabase = createClient()

  const fetchLocations = useCallback(async () => {
    setLoading(true)

    let base: Location[]

    if (IS_MOCK) {
      const { mockLocations } = await import('@/lib/mock/locations')
      base = mockLocations
    } else {
      const { data, error } = await supabase
        .from('locations')
        .select(`
          *,
          photos:location_photos(id, url, sort_order),
          reviews(rating_food, rating_noise, rating_safety, rating_cleanliness, rating_access, rating_weather, rating_age_suitability)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error || !data) { setLoading(false); return }

      base = data.map((loc) => {
        const reviews = loc.reviews ?? []
        const photos = (loc.photos ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
        return { ...loc, photos, avg_ratings: computeAvgRatings(reviews), review_count: reviews.length } as Location
      })
    }

    let results = base.map((loc) => ({ ...loc, distance_km: haversine(lat, lng, loc.lat, loc.lng) }))
    results = results.filter((l) => (l.distance_km ?? 999) <= radius)

    if (tagParam) {
      results = results.filter((l) => l.tags.includes(tagParam))
    }

    if (sortParam === 'nearest') results.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
    else if (sortParam === 'highest_rated') results.sort((a, b) => avgRating(b) - avgRating(a))
    else if (sortParam === 'most_reviewed') results.sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0))
    else results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setLocations(results)
    setLoading(false)
  }, [lat, lng, radius, tagParam, sortParam])

  useEffect(() => { fetchLocations() }, [fetchLocations])

  function updateParam(key: string, value: string) {
    const p = new URLSearchParams(params.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    router.push(`/search?${p.toString()}`)
  }

  function handleSearch(searchQ: string, searchLat: number, searchLng: number) {
    const p = new URLSearchParams(params.toString())
    p.set('q', searchQ); p.set('lat', searchLat.toString()); p.set('lng', searchLng.toString())
    router.push(`/search?${p.toString()}`)
  }

  const handlePinClick = useCallback((loc: Location) => {
    setSelectedId(loc.id)
    setSheetOpen(true)
  }, [])

  const handleCardClick = useCallback((loc: Location) => {
    setSelectedId(loc.id)
    setSheetOpen(true)
  }, [])

  const handleBack = useCallback(() => setSheetOpen(false), [])
  const handleClose = useCallback(() => { setSheetOpen(false); setSelectedId(null) }, [])

  const selectedLoc = locations.find((l) => l.id === selectedId) ?? null
  const mapCenter = { lat, lng }

  return (
    <>
      <BodyScrollLock />
      {/* ── Mobile layout ── */}
      <div className="relative md:hidden" style={{ height: 'calc(100vh - 64px)' }}>

        {/* Search bar */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-white border-b border-gray-100 px-3 py-2">
          <SearchBar defaultValue={q} onSearch={handleSearch} />
        </div>

        {/* Map */}
        <div className="absolute inset-0" style={{ paddingTop: '56px' }}>
          <MapView
            locations={locations}
            center={mapCenter}
            zoom={DEFAULT_MAP_ZOOM}
            selectedId={selectedId}
            onLocationClick={handlePinClick}
          />
        </div>

        {/* Floating tag legend */}
        <div
          className="absolute left-0 right-0 z-10 flex gap-2 overflow-x-auto px-3 pb-1 scrollbar-hide transition-all duration-300"
          style={{ bottom: sheetOpen ? 'calc(65vh + 8px)' : 'calc(50vh + 8px)' }}
        >
          <TagPill label="All" active={!tagParam} onClick={() => updateParam('tag', '')} />
          {TAGS.map((t) => (
            <TagPill
              key={t.value}
              label={`${t.emoji} ${t.label}`}
              active={tagParam === t.value}
              onClick={() => updateParam('tag', t.value)}
            />
          ))}
        </div>

        {/* Bottom sheet */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col"
          style={{ height: sheetOpen ? '65vh' : '50vh' }}
        >
          <button
            onClick={() => !sheetOpen && setSheetOpen(true)}
            className="flex justify-center pt-2.5 pb-1 shrink-0 w-full cursor-pointer"
            aria-label={sheetOpen ? undefined : 'Expand'}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </button>
          {sheetOpen && selectedLoc ? (
            <DetailPanel loc={selectedLoc} onBack={handleBack} onClose={handleClose} />
          ) : (
            <ListStrip
              locations={locations}
              loading={loading}
              selectedId={selectedId}
              onSelect={handleCardClick}
              q={q}
              sortParam={sortParam}
              onSortChange={(s) => updateParam('sort', s)}
            />
          )}
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden md:flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="flex-1 max-w-md">
            <SearchBar defaultValue={q} onSearch={handleSearch} />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors cursor-pointer',
              showFilters ? 'bg-[#f2f7f2] border-[#7da87b] text-[#426340]' : 'border-gray-200 text-[#6b7280] hover:bg-[#f7eed9]'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6b7280] font-medium">Radius</span>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateParam('radius', opt.value.toString())}
                    className={cn(
                      'px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
                      radius === opt.value ? 'bg-[#7da87b] text-white' : 'bg-white text-[#6b7280] hover:bg-[#f2f7f2]'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#6b7280] font-medium">Tag</span>
              <button
                onClick={() => updateParam('tag', '')}
                className={cn(
                  'px-3 py-1 text-xs rounded-full border font-medium transition-colors cursor-pointer',
                  !tagParam ? 'bg-[#7da87b] text-white border-[#7da87b]' : 'bg-white text-[#6b7280] border-gray-200 hover:bg-[#f2f7f2]'
                )}
              >
                All
              </button>
              {TAGS.map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => updateParam('tag', tag.value)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1 text-xs rounded-full border font-medium transition-colors cursor-pointer',
                    tagParam === tag.value ? `${tag.bgColor} ${tag.color} border-transparent` : 'bg-white text-[#6b7280] border-gray-200 hover:bg-[#f2f7f2]'
                  )}
                >
                  {tag.emoji} {tag.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6b7280] font-medium">Sort</span>
              <select
                value={sortParam}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-[#2c2c2c] cursor-pointer"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Status bar */}
        <div className="bg-white px-4 py-2 text-xs text-[#6b7280] border-b border-gray-100">
          {loading ? 'Searching…' : `${locations.length} place${locations.length !== 1 ? 's' : ''} found${q ? ` near ${q}` : ''}`}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* List panel */}
          <div className="overflow-y-auto bg-[#faf8f4] md:w-96 lg:w-[420px] shrink-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
                ))}
              </div>
            ) : locations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="font-medium text-[#2c2c2c]">No spots found here yet</p>
                <p className="text-sm text-[#6b7280] mt-1">Try a larger radius or different category</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {locations.map((loc) => (
                  <LocationCard
                    key={loc.id}
                    location={loc}
                    compact
                    className={cn(selectedId === loc.id && 'ring-2 ring-[#7da87b]')}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Map panel with floating tag legend */}
          <div className="relative flex-1">
            <MapView
              locations={locations}
              center={mapCenter}
              zoom={DEFAULT_MAP_ZOOM}
              onLocationClick={(loc) => setSelectedId(loc.id === selectedId ? null : loc.id)}
              selectedId={selectedId}
            />
            <div className="absolute bottom-4 left-0 right-0 z-10 flex gap-2 overflow-x-auto px-3 scrollbar-hide">
              <TagPill label="All" active={!tagParam} onClick={() => updateParam('tag', '')} />
              {TAGS.map((t) => (
                <TagPill
                  key={t.value}
                  label={`${t.emoji} ${t.label}`}
                  active={tagParam === t.value}
                  onClick={() => updateParam('tag', t.value)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function deg2rad(d: number) { return d * (Math.PI / 180) }

function computeAvgRatings(reviews: Record<string, number | null>[]) {
  const keys = ['food', 'noise', 'safety', 'cleanliness', 'access', 'weather', 'age_suitability'] as const
  const result: Record<string, number | null> = {}
  for (const key of keys) {
    const vals = reviews.map((r) => r[`rating_${key}`]).filter((v): v is number => v != null)
    result[key] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }
  return result
}

function avgRating(loc: Location): number {
  if (!loc.avg_ratings) return 0
  const vals = Object.values(loc.avg_ratings).filter((v): v is number => v != null)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}
