"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Layers,
  LocateFixed,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Ship,
  MapPin,
  Cloud,
  Anchor
} from 'lucide-react'
import type { Vessel, UserPosition, BoundaryZone } from '@/types/maritime'

// Leaflet types - actual import is dynamic
import type { Map as LeafletMap, LayerGroup, Marker, LeafletMouseEvent } from 'leaflet'
let L: any = null

interface MaritimeMapProps {
  vessels: Vessel[]
  userPosition: UserPosition | null
  boundaries: BoundaryZone[]
  onVesselClick?: (vessel: Vessel) => void
  onUserPositionUpdate?: (position: UserPosition) => void
}

interface MapLayers {
  vessels: boolean
  boundaries: boolean
  weather: boolean
  zones: boolean
}

export function MaritimeMap({
  vessels,
  userPosition,
  boundaries,
  onVesselClick,
  onUserPositionUpdate
}: MaritimeMapProps) {
  const { t, isUrdu } = useLanguage()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<LayerGroup | null>(null)
  const boundariesRef = useRef<LayerGroup | null>(null)
  const userMarkerRef = useRef<Marker | null>(null)

  const [layers, setLayers] = useState<MapLayers>({
    vessels: true,
    boundaries: true,
    weather: false,
    zones: true
  })
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      // Dynamically import Leaflet only on client side
      const leaflet = await import('leaflet')
      // @ts-ignore
      await import('leaflet/dist/leaflet.css')
      L = leaflet.default || leaflet

      // Pakistan coastal region center (Karachi)
      const defaultCenter: [number, number] = [24.8607, 66.9900]
      const defaultZoom = 8

      const map = L.map(mapRef.current!, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: false,
        attributionControl: true
      })

      // Add OpenStreetMap tiles (sea-focused style)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map)

      // Create layer groups
      markersRef.current = L.layerGroup().addTo(map)
      boundariesRef.current = L.layerGroup().addTo(map)

      mapInstanceRef.current = map
      setMapLoaded(true)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update vessel markers
  useEffect(() => {
    if (!mapLoaded || !markersRef.current || !L) return

    const updateMarkers = () => {
      markersRef.current?.clearLayers()

      console.log('[MaritimeMap] Updating markers. Vessels count:', vessels.length)

      if (!layers.vessels) return

      vessels.forEach(vessel => {
        const vesselIcon = L.divIcon({
          className: 'vessel-marker',
          html: `
            <div class="relative">
              <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2
                ${vessel.type === 'fishing' ? 'bg-[oklch(0.55_0.18_180)]' :
              vessel.type === 'cargo' ? 'bg-[oklch(0.45_0.15_230)]' :
                vessel.type === 'tanker' ? 'bg-[oklch(0.70_0.18_60)]' :
                  vessel.type === 'military' ? 'bg-[oklch(0.55_0.22_25)]' : 'bg-gray-500'}
              ">
                <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor" style="transform: rotate(${vessel.heading}deg)">
                  <path d="M12 2L4 20l8-4 8 4L12 2z"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })

        const marker = L.marker([vessel.position.lat, vessel.position.lng], {
          icon: vesselIcon
        })

        marker.bindPopup(`
          <div class="p-2 min-w-[150px] ${isUrdu ? 'rtl text-right' : 'ltr'}">
            <p class="font-semibold text-sm">${vessel.name}</p>
            <p class="text-xs text-gray-600 mt-1">${t(`vessel.${vessel.type}`)}</p>
            <div class="mt-2 space-y-1 text-xs">
              <p><span class="text-gray-500">${t('vessel.speed')}:</span> ${vessel.speed.toFixed(1)} ${t('unit.knots')}</p>
              <p><span class="text-gray-500">${t('vessel.heading')}:</span> ${vessel.heading}°</p>
              ${vessel.distance ? `<p><span class="text-gray-500">${isUrdu ? 'فاصلہ' : 'Distance'}:</span> ${vessel.distance.toFixed(1)} NM</p>` : ''}
              ${vessel.destination ? `<p><span class="text-gray-500">${isUrdu ? 'منزل' : 'Destination'}:</span> ${vessel.destination}</p>` : ''}
            </div>
          </div>
        `, { className: 'vessel-popup' })

        marker.on('click', () => {
          setSelectedVessel(vessel)
          onVesselClick?.(vessel)
        })

        marker.addTo(markersRef.current!)
      })
    }

    updateMarkers()
  }, [vessels, layers.vessels, mapLoaded, t, isUrdu, onVesselClick])

  // Update boundaries
  useEffect(() => {
    if (!mapLoaded || !boundariesRef.current || !L) return

    const updateBoundaries = () => {
      boundariesRef.current?.clearLayers()

      if (!layers.boundaries && !layers.zones) return

      boundaries.forEach(boundary => {
        if (layers.boundaries || (layers.zones && ['restricted', 'fishing'].includes(boundary.type))) {
          const polygon = L.polygon(boundary.coordinates as [number, number][], {
            color: boundary.color,
            fillColor: boundary.fillColor,
            fillOpacity: 0.2,
            weight: 2,
            dashArray: boundary.type === 'international' ? '10, 5' : undefined
          })

          polygon.bindPopup(`
            <div class="p-2 ${isUrdu ? 'rtl text-right' : 'ltr'}">
              <p class="font-semibold text-sm">${boundary.name}</p>
              <p class="text-xs text-gray-600">${t(`boundary.${boundary.type}`)}</p>
            </div>
          `)

          polygon.addTo(boundariesRef.current!)
        }
      })
    }

    updateBoundaries()
  }, [boundaries, layers.boundaries, layers.zones, mapLoaded, t, isUrdu])

  // Map Click Handler for User Position
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !L) return

    const map = mapInstanceRef.current

    const handleMapClick = (e: LeafletMouseEvent) => {
      const { lat, lng } = e.latlng

      L!.popup()
        .setLatLng(e.latlng)
        .setContent(`
          <div class="p-2 text-center">
             <p class="font-semibold mb-2">${isUrdu ? 'کیا یہ آپ کا مقام ہے؟' : 'Set as your location?'}</p>
             <button 
               id="set-location-btn"
               class="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors"
             >
               ${isUrdu ? 'جی ہاں' : 'Yes, set location'}
             </button>
          </div>
        `)
        .openOn(map)

      // Add event listener to the button after it's in the DOM
      setTimeout(() => {
        const btn = document.getElementById('set-location-btn')
        if (btn) {
          btn.onclick = () => {
            onUserPositionUpdate?.({
              lat,
              lng,
              accuracy: 0,
              timestamp: new Date()
            })
            map.closePopup()
          }
        }
      }, 100)
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
    }
  }, [mapLoaded, isUrdu, onUserPositionUpdate])

  // Update user position marker
  useEffect(() => {
    if (!mapLoaded || !userPosition || !L) return

    const updateUserMarker = () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng])
      } else {
        const userIcon = L.divIcon({
          className: 'user-marker',
          html: `
            <div class="relative">
              <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2">
                <div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
              <div class="absolute -inset-2 bg-primary/20 rounded-full animate-ping"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })

        userMarkerRef.current = L.marker([userPosition.lat, userPosition.lng], {
          icon: userIcon,
          zIndexOffset: 1000
        }).addTo(mapInstanceRef.current!)

        userMarkerRef.current.bindPopup(`
          <div class="p-2 ${isUrdu ? 'rtl text-right' : 'ltr'}">
            <p class="font-semibold text-sm">${t('map.your_location')}</p>
            <p class="text-xs text-gray-600 mt-1">
              ${userPosition.lat.toFixed(4)}, ${userPosition.lng.toFixed(4)}
            </p>
          </div>
        `)
      }
    }

    updateUserMarker()
  }, [userPosition, mapLoaded, t, isUrdu])

  const handleZoomIn = useCallback(() => {
    mapInstanceRef.current?.zoomIn()
  }, [])

  const handleZoomOut = useCallback(() => {
    mapInstanceRef.current?.zoomOut()
  }, [])

  const handleCenterOnUser = useCallback(() => {
    if (userPosition && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userPosition.lat, userPosition.lng], 12)
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition: UserPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading || undefined,
            speed: pos.coords.speed || undefined,
            timestamp: new Date()
          }
          onUserPositionUpdate?.(newPosition)
          mapInstanceRef.current?.setView([newPosition.lat, newPosition.lng], 12)
        },
        (err) => console.error('Geolocation error:', err)
      )
    }
  }, [userPosition, onUserPositionUpdate])

  const handleResetView = useCallback(() => {
    mapInstanceRef.current?.setView([24.8607, 66.9900], 8)
  }, [])

  const toggleLayer = useCallback((layer: keyof MapLayers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
  }, [])

  return (
    <Card className="relative overflow-hidden h-full min-h-[400px] lg:min-h-[600px]">
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Map Controls */}
      <div className={`absolute top-4 ${isUrdu ? 'left-4' : 'right-4'} z-10 flex flex-col gap-2`}>
        {/* Zoom Controls */}
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="rounded-none border-b border-border"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="rounded-none"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Other Controls */}
        <Button
          variant="secondary"
          size="icon"
          onClick={handleCenterOnUser}
          className="shadow-lg"
          title={t('map.your_location')}
        >
          <LocateFixed className="w-4 h-4" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          onClick={handleResetView}
          className="shadow-lg"
          title={t('map.reset')}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        <Button
          variant={showLayerPanel ? 'default' : 'secondary'}
          size="icon"
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className="shadow-lg"
          title={t('map.layers')}
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>

      {/* Layer Panel */}
      {showLayerPanel && (
        <div className={`absolute top-4 ${isUrdu ? 'left-16' : 'right-16'} z-10 bg-card rounded-lg shadow-lg p-3 min-w-[160px] ${isUrdu ? 'rtl' : 'ltr'}`}>
          <p className="text-sm font-semibold mb-2">{t('map.layers')}</p>
          <div className="space-y-2">
            {[
              { key: 'vessels' as const, icon: Ship, label: t('map.vessels') },
              { key: 'boundaries' as const, icon: MapPin, label: t('map.boundaries') },
              { key: 'zones' as const, icon: Anchor, label: t('map.zones') },
              { key: 'weather' as const, icon: Cloud, label: t('map.weather') }
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => toggleLayer(key)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${layers[key]
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-muted-foreground'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                <div className={`ml-auto w-2 h-2 rounded-full ${layers[key] ? 'bg-safe' : 'bg-muted'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Vessel Info */}
      {selectedVessel && (
        <div className={`absolute bottom-4 ${isUrdu ? 'right-4' : 'left-4'} z-10 bg-card rounded-lg shadow-lg p-3 max-w-[250px] ${isUrdu ? 'rtl' : 'ltr'}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{selectedVessel.name}</p>
              <p className="text-xs text-muted-foreground">{t(`vessel.${selectedVessel.type}`)}</p>
            </div>
            <button
              onClick={() => setSelectedVessel(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="sr-only">Close</span>
              &times;
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">{t('vessel.speed')}</p>
              <p className="font-medium">{selectedVessel.speed.toFixed(1)} {t('unit.knots')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('vessel.heading')}</p>
              <p className="font-medium">{selectedVessel.heading}°</p>
            </div>
            {selectedVessel.distance && (
              <div>
                <p className="text-muted-foreground">{isUrdu ? 'فاصلہ' : 'Distance'}</p>
                <p className="font-medium">{selectedVessel.distance.toFixed(1)} NM</p>
              </div>
            )}
            {selectedVessel.destination && (
              <div>
                <p className="text-muted-foreground">{isUrdu ? 'منزل' : 'Dest.'}</p>
                <p className="font-medium truncate">{selectedVessel.destination}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className={`absolute bottom-4 ${isUrdu ? 'left-4' : 'right-4'} z-10 bg-card/90 backdrop-blur rounded-lg shadow-lg p-2 ${isUrdu ? 'rtl' : 'ltr'}`}>
        <div className="flex flex-wrap gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.55_0.18_180)]" />
            <span>{t('vessel.fishing').split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.45_0.15_230)]" />
            <span>{t('vessel.cargo').split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.70_0.18_60)]" />
            <span>{t('vessel.tanker').split(' ')[0]}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
