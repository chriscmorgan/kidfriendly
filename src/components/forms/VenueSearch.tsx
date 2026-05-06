'use client'
import { useState, useRef, useEffect } from 'react'
import { Store, MapPin, Loader2 } from 'lucide-react'

export interface PlaceResult {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  suburb: string
  website: string | null
  opening_hours: string | null
}

interface VenueSearchProps {
  onSelect: (result: PlaceResult) => void
}

export default function VenueSearch({ onSelect }: VenueSearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchSuggestions(q: string) {
    if (!q.trim() || q.length < 2) { setSuggestions([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`)
      const data: PlaceResult[] = await res.json()
      setSuggestions(data)
      setOpen(true)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(e.target.value), 400)
  }

  function handleSelect(result: PlaceResult) {
    setQuery('')
    setOpen(false)
    setSuggestions([])
    onSelect(result)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-[#4abfc0] bg-white">
        <Store className="w-4 h-4 text-[#6b7280] shrink-0 mr-2" />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search by business name…"
          className="flex-1 min-w-0 outline-none text-sm text-[#2c2c2c] placeholder:text-[#6b7280] bg-transparent"
          autoComplete="off"
        />
        {loading && <Loader2 className="w-4 h-4 animate-spin text-[#6b7280] shrink-0" />}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-30">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="flex items-start gap-3 w-full px-4 py-3 hover:bg-[#f0fbfb] transition-colors cursor-pointer text-left"
              >
                <MapPin className="w-4 h-4 text-[#6b7280] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#2c2c2c] truncate">{s.name}</p>
                  <p className="text-xs text-[#6b7280] truncate mt-0.5">{s.address}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
