'use client'
import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Location, Category } from '@/lib/types'
import { getCategoryMeta } from '@/lib/utils'

interface MapViewProps {
  locations: Location[]
  center: { lat: number; lng: number }
  zoom?: number
  onLocationClick?: (location: Location) => void
  selectedId?: string | null
}

const CATEGORY_COLORS: Record<Category, string> = {
  playground: '#5e8e5c',
  food_cafe: '#d97706',
  activities: '#7c3aed',
  nature: '#059669',
  stuff: '#db2777',
  entertainment: '#2563eb',
  sport_swim: '#0891b2',
}

// Free vector tiles — no account needed (OpenFreeMap Positron style)
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron'

export default function MapView({ locations, center, zoom = 12, onLocationClick, selectedId }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [center.lng, center.lat],
      zoom,
    })

    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    for (const loc of locations) {
      const color = CATEGORY_COLORS[loc.primary_category] ?? '#7da87b'
      const meta = getCategoryMeta(loc.primary_category)
      const isSelected = loc.id === selectedId

      const el = document.createElement('div')
      el.innerHTML = `
        <div style="
          width: ${isSelected ? 44 : 36}px;
          height: ${isSelected ? 44 : 36}px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: ${isSelected ? '3px' : '2px'} solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        ">
          <span style="transform: rotate(45deg); font-size: ${isSelected ? 18 : 14}px; line-height: 1;">
            ${meta.emoji}
          </span>
        </div>
      `
      el.style.cssText = 'cursor: pointer;'
      el.addEventListener('click', () => onLocationClick?.(loc))

      const popup = new maplibregl.Popup({ offset: [0, -40], closeButton: false, maxWidth: '220px' })
        .setHTML(`
          <div style="font-family: inherit; padding: 4px 2px;">
            <p style="font-weight: 600; font-size: 13px; color: #2c2c2c; margin: 0 0 2px;">${loc.name}</p>
            <p style="font-size: 12px; color: #6b7280; margin: 0;">${loc.suburb}</p>
          </div>
        `)

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(popup)
        .addTo(map)

      markersRef.current.push(marker)
    }
  }, [locations, selectedId, onLocationClick])

  useEffect(() => {
    mapRef.current?.flyTo({ center: [center.lng, center.lat], zoom, essential: true })
  }, [center.lat, center.lng, zoom])

  return <div ref={containerRef} className="w-full h-full" />
}
