'use client'
import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Location } from '@/lib/types'
import { getPrimaryTagMeta } from '@/lib/utils'

interface MapViewProps {
  locations: Location[]
  center: { lat: number; lng: number }
  zoom?: number
  onLocationClick?: (location: Location) => void
  selectedId?: string | null
  onMapMove?: (center: { lat: number; lng: number }) => void
  bottomPadding?: number
}

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron'

function makePinEl(loc: Location): HTMLElement {
  const meta = getPrimaryTagMeta(loc.tags ?? [])
  const el = document.createElement('div')
  el.dataset.locationId = loc.id
  el.style.cssText = 'cursor: pointer; z-index: 1;'
  el.innerHTML = `
    <div style="
      width: 36px; height: 36px;
      background: ${meta.pinColor};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center;
      transition: width 0.15s, height 0.15s, border 0.15s;
    ">
      <span style="transform: rotate(45deg); font-size: 14px; line-height: 1;">${meta.emoji}</span>
    </div>
  `
  return el
}


function setSelected(el: HTMLElement, selected: boolean) {
  const inner = el.querySelector('div') as HTMLElement | null
  if (!inner) return
  inner.style.width = selected ? '44px' : '36px'
  inner.style.height = selected ? '44px' : '36px'
  inner.style.border = selected ? '3px solid white' : '2px solid white'
  inner.style.boxShadow = selected ? '0 3px 12px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.25)'
  const span = inner.querySelector('span') as HTMLElement | null
  if (span) span.style.fontSize = selected ? '18px' : '14px'
  el.style.zIndex = selected ? '10' : '1'
}

export default function MapView({ locations, center, zoom = 12, onLocationClick, selectedId, onMapMove, bottomPadding = 0 }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map())
  const onMapMoveRef = useRef(onMapMove)
  const bottomPaddingRef = useRef(bottomPadding)
  const programmaticRef = useRef(false)
  useEffect(() => { onMapMoveRef.current = onMapMove }, [onMapMove])
  useEffect(() => { bottomPaddingRef.current = bottomPadding }, [bottomPadding])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [center.lng, center.lat],
      zoom,
    })
    mapRef.current.addControl(new maplibregl.NavigationControl(), 'bottom-right')
    mapRef.current.on('moveend', () => {
      if (programmaticRef.current) { programmaticRef.current = false; return }
      const c = mapRef.current?.getCenter()
      if (c) onMapMoveRef.current?.({ lat: c.lat, lng: c.lng })
    })
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()

    for (const loc of locations) {
      const el = makePinEl(loc)
      el.addEventListener('click', () => onLocationClick?.(loc))

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map)

      markersRef.current.set(loc.id, marker)
    }
  }, [locations, onLocationClick])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((marker, id) => {
      setSelected(marker.getElement(), id === selectedId)
    })

    if (!selectedId) return

    const marker = markersRef.current.get(selectedId)
    if (!marker) return

    const lngLat = marker.getLngLat()
    programmaticRef.current = true
    map.flyTo({
      center: [lngLat.lng, lngLat.lat],
      zoom: Math.max(map.getZoom(), 14),
      padding: { bottom: bottomPaddingRef.current, top: 60, left: 0, right: 0 },
      essential: true,
    })
  }, [selectedId])

  useEffect(() => {
    programmaticRef.current = true
    mapRef.current?.flyTo({ center: [center.lng, center.lat], zoom, essential: true })
  }, [center.lat, center.lng, zoom])

  return <div ref={containerRef} className="w-full h-full" />
}
