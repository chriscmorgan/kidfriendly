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

function makePopupHTML(loc: Location): string {
  const photo = loc.photos?.[0]
  const meta = getPrimaryTagMeta(loc.tags ?? [])
  return `
    <div style="font-family: inherit; width: 220px;">
      ${photo ? `<div style="margin: 0 0 10px; overflow: hidden; border-radius: 8px;">
        <img src="${photo.url}" alt="" style="width: 100%; height: 110px; object-fit: cover; display: block;" />
      </div>` : ''}
      <p style="font-weight: 700; font-size: 13px; color: #2c2c2c; margin: 0 0 3px; line-height: 1.3;">${loc.name}</p>
      <p style="font-size: 11px; color: #6b7280; margin: 0 0 10px;">${meta.emoji} ${meta.label} · ${loc.suburb}</p>
      <a href="/location/${loc.slug}" style="
        display: inline-block; background: #7da87b; color: white;
        font-size: 12px; font-weight: 600; padding: 6px 14px;
        border-radius: 8px; text-decoration: none;
      ">View details →</a>
    </div>
  `
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

export default function MapView({ locations, center, zoom = 12, onLocationClick, selectedId }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map())
  const popupsRef = useRef<Map<string, maplibregl.Popup>>(new Map())

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [center.lng, center.lat],
      zoom,
    })
    mapRef.current.addControl(new maplibregl.NavigationControl(), 'bottom-right')
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
    popupsRef.current.clear()

    for (const loc of locations) {
      const el = makePinEl(loc)
      el.addEventListener('click', () => onLocationClick?.(loc))

      const popup = new maplibregl.Popup({
        offset: [0, -44],
        closeButton: true,
        maxWidth: 'none',
        className: 'kid-popup',
      }).setHTML(makePopupHTML(loc))

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(popup)
        .addTo(map)

      markersRef.current.set(loc.id, marker)
      popupsRef.current.set(loc.id, popup)
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
    const popup = popupsRef.current.get(selectedId)
    if (!marker || !popup) return

    popupsRef.current.forEach((p, id) => {
      if (id !== selectedId && p.isOpen()) p.remove()
    })

    const lngLat = marker.getLngLat()
    map.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: Math.max(map.getZoom(), 14), essential: true })

    if (!popup.isOpen()) marker.togglePopup()
  }, [selectedId])

  useEffect(() => {
    mapRef.current?.flyTo({ center: [center.lng, center.lat], zoom, essential: true })
  }, [center.lat, center.lng, zoom])

  return <div ref={containerRef} className="w-full h-full" />
}
