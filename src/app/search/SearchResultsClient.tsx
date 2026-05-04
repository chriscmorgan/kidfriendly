'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import SearchBar from '@/components/search/SearchBar'
import LocationCard from '@/components/location/LocationCard'
import { createClient } from '@/lib/supabase/client'
import type { Location, Tag, SortOption } from '@/lib/types'
import { TAGS, RADIUS_OPTIONS, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { List, Map as MapIcon, SlidersHorizontal } from 'lucide-react'

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })

type View = 'map' | 'list'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'nearest', label: 'Nearest' },
  { value: 'highest_rated', label: 'Highest rated' },
  { value: 'most_reviewed', label: 'Most reviewed' },
  { value: 'newest', label: 'Newest' },
]

const IS_MOCK = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ?? true

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
  const [view, setView] = useState<View>('map')
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

    // Attach distance from current search centre
    let results = base.map((loc) => ({ ...loc, distance_km: haversine(lat, lng, loc.lat, loc.lng) }))

    // Filter by radius
    results = results.filter((l) => (l.distance_km ?? 999) <= radius)

    // Filter by tag
    if (tagParam) {
      results = results.filter((l) => l.tags.includes(tagParam))
    }

    // Sort
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

  function handleSearch(q: string, lat: number, lng: number) {
    const p = new URLSearchParams(params.toString())
    p.set('q', q); p.set('lat', lat.toString()); p.set('lng', lng.toString())
    router.push(`/search?${p.toString()}`)
  }

  const mapCenter = { lat, lng }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
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

        {/* View toggle (mobile) */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden md:hidden">
          <button
            onClick={() => setView('map')}
            className={cn('p-2 cursor-pointer transition-colors', view === 'map' ? 'bg-[#7da87b] text-white' : 'bg-white text-[#6b7280]')}
          >
            <MapIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn('p-2 cursor-pointer transition-colors', view === 'list' ? 'bg-[#7da87b] text-white' : 'bg-white text-[#6b7280]')}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters panel */}
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

      <div className="bg-white px-4 py-2 text-xs text-[#6b7280] border-b border-gray-100">
        {loading ? 'Searching…' : `${locations.length} place${locations.length !== 1 ? 's' : ''} found${q ? ` near ${q}` : ''}`}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* List panel */}
        <div className={cn(
          'overflow-y-auto bg-[#faf8f4]',
          'hidden md:block md:w-96 lg:w-[420px] shrink-0',
          view === 'list' && 'block w-full'
        )}>
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

        {/* Map panel */}
        <div className={cn(
          'flex-1',
          'hidden md:block',
          view === 'map' && 'block w-full'
        )}>
          <MapView
            locations={locations}
            center={mapCenter}
            zoom={DEFAULT_MAP_ZOOM}
            onLocationClick={(loc) => setSelectedId(loc.id === selectedId ? null : loc.id)}
            selectedId={selectedId}
          />
        </div>
      </div>
    </div>
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
