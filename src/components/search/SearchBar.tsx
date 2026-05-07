'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Loader2, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GeocodeResult {
  id: string
  label: string
  lat: number
  lng: number
  suburb: string
  type?: 'venue' | 'place'
  slug?: string
}

interface SearchBarProps {
  defaultValue?: string
  className?: string
  onSearch?: (query: string, lat: number, lng: number) => void
  size?: 'default' | 'hero'
}

export default function SearchBar({ defaultValue = '', className, onSearch, size = 'default' }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([])
  const [loading, setLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchSuggestions(q: string) {
    if (!q.trim() || q.length < 2) { setSuggestions([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
      const data: GeocodeResult[] = await res.json()
      setSuggestions(data)
      setOpen(true)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 400)
  }

  function handleSelect(s: GeocodeResult) {
    setOpen(false)
    setSuggestions([])
    if (s.type === 'venue' && s.slug) {
      router.push(`/location/${s.slug}`)
      return
    }
    const label = s.label.split(',')[0].trim()
    setQuery(label)
    navigate(label, s.lat, s.lng)
  }

  function navigate(q: string, lat: number, lng: number) {
    if (onSearch) {
      onSearch(q, lat, lng)
    } else {
      router.push(`/search?q=${encodeURIComponent(q)}&lat=${lat}&lng=${lng}`)
    }
  }

  async function useMyLocation() {
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setGeoLoading(false)
        navigate('Near me', lat, lng)
      },
      () => setGeoLoading(false)
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (suggestions.length > 0) handleSelect(suggestions[0])
  }

  const isHero = size === 'hero'

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit}>
        <div className={cn(
          'flex items-center gap-2 bg-white border border-gray-200 rounded-2xl shadow-sm transition-shadow focus-within:shadow-md focus-within:border-[#4abfc0]',
          isHero ? 'p-3 pr-3' : 'p-2 pr-2'
        )}>
          <Search className={cn('shrink-0 text-[#6b7280]', isHero ? 'w-5 h-5 ml-1' : 'w-4 h-4 ml-1')} />
          <input
            type="text"
            placeholder="Search suburb, postcode…"
            value={query}
            onChange={handleInput}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            className={cn(
              'flex-1 min-w-0 bg-transparent outline-none text-[#2c2c2c] placeholder:text-[#6b7280]',
              isHero ? 'text-base py-1' : 'text-sm py-0.5'
            )}
            autoComplete="off"
          />
          {loading && <Loader2 className="w-4 h-4 text-[#6b7280] animate-spin shrink-0" />}
          <button
            type="button"
            onClick={useMyLocation}
            disabled={geoLoading}
            title="Use my location"
            className={cn(
              'shrink-0 flex items-center gap-1 font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50',
              isHero
                ? 'px-3 py-2 text-sm text-[#38a5a0] hover:bg-[#edf8f8]'
                : 'px-2 py-1 text-xs text-[#38a5a0] hover:bg-[#edf8f8]'
            )}
          >
            {geoLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <MapPin className={isHero ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            }
            <span className="hidden sm:inline">Near me</span>
          </button>
          <button
            type="submit"
            className={cn(
              'shrink-0 bg-[#4abfc0] text-white font-medium rounded-xl hover:bg-[#38a5a0] transition-colors cursor-pointer',
              isHero ? 'px-5 py-2 text-sm' : 'px-3 py-1.5 text-xs'
            )}
          >
            Search
          </button>
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-30">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[#2c2c2c] hover:bg-[#f7eed9] transition-colors cursor-pointer text-left"
              >
                {s.type === 'venue'
                  ? <Store className="w-4 h-4 text-[#4abfc0] shrink-0" />
                  : <MapPin className="w-4 h-4 text-[#6b7280] shrink-0" />
                }
                <span className="truncate">{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
