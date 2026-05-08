'use client'
import { useState, useRef, useEffect } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface AddressResult {
  place_name: string
  lat: number
  lng: number
  suburb: string
}

interface GeocodeResult {
  id: string
  label: string
  lat: number
  lng: number
  suburb: string
}

interface AddressSearchProps {
  value: string
  onChange: (result: AddressResult) => void
}

export default function AddressSearch({ value, onChange }: AddressSearchProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([])
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
    if (!q.trim() || q.length < 3) { setSuggestions([]); return }
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
    setQuery(e.target.value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(e.target.value), 400)
  }

  function handleSelect(s: GeocodeResult) {
    setQuery(s.label)
    setOpen(false)
    onChange({ place_name: s.label, lat: s.lat, lng: s.lng, suburb: s.suburb })
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center border border-border rounded px-3 py-2.5 focus-within:border-rust bg-paper">
        <MapPin className="w-4 h-4 text-stone shrink-0 mr-2" />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Start typing an address or place name…"
          className="flex-1 outline-none text-sm text-ink placeholder:text-stone bg-transparent"
          autoComplete="off"
        />
        {loading && <Loader2 className="w-4 h-4 animate-spin text-stone" />}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-paper border border-border rounded shadow-lg overflow-hidden z-30">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="flex items-start gap-2 w-full px-4 py-3 text-sm text-ink hover:bg-parchment transition-colors cursor-pointer text-left"
              >
                <MapPin className="w-4 h-4 text-stone shrink-0 mt-0.5" />
                <span>{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
