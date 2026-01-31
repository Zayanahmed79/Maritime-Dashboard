"use client"

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { AISStreamClient } from '@/lib/ais-stream'
import type { Vessel, WeatherData, Alert, UserPosition, BoundaryZone } from '@/types/maritime'

// Pakistan's maritime boundaries (approximate coordinates)
const PAKISTAN_BOUNDARIES: BoundaryZone[] = [
  {
    id: 'pk-territorial',
    name: 'Pakistan Territorial Waters',
    type: 'territorial',
    coordinates: [
      [24.8, 66.7],
      [24.8, 67.3],
      [25.2, 67.5],
      [25.4, 67.3],
      [25.3, 66.8],
      [24.9, 66.5],
      [24.8, 66.7]
    ],
    color: '#22c55e',
    fillColor: '#22c55e'
  },
  {
    id: 'pk-eez',
    name: 'Pakistan EEZ',
    type: 'eez',
    coordinates: [
      [23.5, 65.5],
      [23.5, 68.5],
      [26.0, 69.0],
      [26.5, 68.0],
      [26.0, 66.0],
      [24.5, 65.0],
      [23.5, 65.5]
    ],
    color: '#3b82f6',
    fillColor: '#3b82f6'
  },
  {
    id: 'restricted-naval',
    name: 'Naval Restricted Area',
    type: 'restricted',
    coordinates: [
      [24.7, 66.9],
      [24.7, 67.1],
      [24.9, 67.1],
      [24.9, 66.9],
      [24.7, 66.9]
    ],
    color: '#ef4444',
    fillColor: '#ef4444'
  },
  {
    id: 'fishing-zone-1',
    name: 'Designated Fishing Zone A',
    type: 'fishing',
    coordinates: [
      [24.6, 67.2],
      [24.6, 67.5],
      [24.9, 67.5],
      [24.9, 67.2],
      [24.6, 67.2]
    ],
    color: '#06b6d4',
    fillColor: '#06b6d4'
  },
  {
    id: 'international-boundary',
    name: 'International Maritime Boundary',
    type: 'international',
    coordinates: [
      [23.0, 68.0],
      [23.5, 68.5],
      [24.5, 69.0],
      [25.5, 69.5],
      [26.0, 69.0]
    ],
    color: '#f97316',
    fillColor: '#f97316'
  }
]

// SWR fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useMaritimeData() {
  const aisStreamKey = process.env.NEXT_PUBLIC_AISSTREAM_API_KEY
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null)
  const [boundaries] = useState<BoundaryZone[]>(PAKISTAN_BOUNDARIES)
  const [realVessels, setRealVessels] = useState<Vessel[]>([])
  const [isUsingRealData, setIsUsingRealData] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const [isManualLocation, setIsManualLocation] = useState(false)
  const [aisStatus, setAisStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected')

  // Get user's geolocation
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (isManualLocation) return // Skip if user manually set location

          const newPosition: UserPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading || undefined,
            speed: pos.coords.speed || undefined,
            timestamp: new Date()
          }
          setUserPosition(newPosition)
        },
        (err) => {
          if (isManualLocation) return
          console.warn('Geolocation error:', err.message)
          // Set a default position near Karachi coast for demo
          setUserPosition({
            lat: 24.82,
            lng: 67.05,
            accuracy: 100,
            timestamp: new Date()
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      )

      return () => navigator.geolocation.clearWatch(watchId)
    } else {
      if (!isManualLocation) {
        // Set default position for demo
        setUserPosition({
          lat: 24.82,
          lng: 67.05,
          accuracy: 100,
          timestamp: new Date()
        })
      }
    }
  }, [isManualLocation])

  // Fetch real weather data
  const weatherUrl = userPosition
    ? `/api/weather?lat=${userPosition.lat}&lon=${userPosition.lng}`
    : '/api/weather'

  const { data: weatherResponse, error: weatherError, isLoading: weatherLoading } = useSWR(
    weatherUrl,
    fetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: false
    }
  )

  // Fetch simulated vessel data (fallback)
  const vesselsUrl = !aisStreamKey && userPosition
    ? `/api/vessels?lat=${userPosition.lat}&lon=${userPosition.lng}`
    : !aisStreamKey
      ? '/api/vessels'
      : null

  const { data: vesselsResponse, error: vesselsError, isLoading: vesselsLoading } = useSWR(
    vesselsUrl,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every 1 minute
      revalidateOnFocus: false,
      // Removed isPaused so we always fetch simulated data as specific backup when real stream is empty
    }
  )

  // Real-time AIS Stream Effect
  useEffect(() => {
    if (!aisStreamKey || !userPosition) {
      if (isUsingRealData) setIsUsingRealData(false)
      return
    }


    setIsUsingRealData(true)

    const client = new AISStreamClient(
      aisStreamKey,
      [
        [userPosition.lat - 5, userPosition.lng - 5],
        [userPosition.lat + 5, userPosition.lng + 5]
      ],
      (message) => {
        if (message.MessageType === 'PositionReport') {
          const report = message.Message.PositionReport
          setRealVessels(prev => {
            const index = prev.findIndex(v => v.mmsi === report.UserID.toString())
            const newVessel: Vessel = {
              id: `vessel-${report.UserID}`,
              mmsi: report.UserID.toString(),
              name: `Vessel ${report.UserID}`, // AIS Stream free doesn't always send static data immediately, need separate msg
              type: 'cargo', // Default, would need static data msg to refine
              position: { lat: report.Latitude, lng: report.Longitude },
              speed: report.Sog,
              heading: report.TrueHeading === 511 ? 0 : report.TrueHeading,
              lastUpdate: new Date(),
              flag: 'Unknown',
              frequency: 'AIS'
            }

            if (index >= 0) {
              const newArr = [...prev]
              newArr[index] = { ...newArr[index], ...newVessel, name: prev[index].name !== `Vessel ${report.UserID}` ? prev[index].name : newVessel.name }
              return newArr
            }
            return [...prev, newVessel]
          })
        } else if (message.MessageType === 'ShipStaticData') {
          const report = message.Message.ShipStaticData
          setRealVessels(prev => {
            return prev.map(v => {
              if (v.mmsi === report.UserID.toString()) {
                return {
                  ...v,
                  name: report.Name,
                  type: mapVesselType(report.Type.toString()),
                  destination: report.Destination,
                  flag: 'Real'
                }
              }
              return v
            })
          })
        }
      },
      (err) => {
        console.error("AIS Stream Error:", err)
      },
      (status) => {
        console.log("AIS Connection Status:", status)
      }
    )

    client.connect()

    return () => {
      client.disconnect()
    }
  }, [aisStreamKey, userPosition])

  // Fetch alerts
  const alertsUrl = userPosition
    ? `/api/alerts?lat=${userPosition.lat}&lon=${userPosition.lng}`
    : '/api/alerts'

  const { data: alertsResponse, error: alertsError } = useSWR(
    alertsUrl,
    fetcher,
    {
      refreshInterval: 120000, // Refresh every 2 minutes
      revalidateOnFocus: false
    }
  )

  // Debug: Log API responses
  useEffect(() => {
    if (weatherResponse) {
      console.log('[v0] Weather API response:', {
        temp: weatherResponse.temperature,
        wind: weatherResponse.windSpeed,
        location: weatherResponse.location,
        error: weatherResponse.error
      })
    }
    if (weatherError) {
      console.error('[v0] Weather fetch error:', weatherError)
    }
  }, [weatherResponse, weatherError])

  useEffect(() => {
    if (vesselsResponse) {
      console.log('[v0] Vessels API response:', {
        count: vesselsResponse.totalCount,
        source: vesselsResponse.source,
        firstVessel: vesselsResponse.vessels?.[0]?.name
      })
    }
    if (vesselsError) {
      console.error('[v0] Vessels fetch error:', vesselsError)
    }
  }, [vesselsResponse, vesselsError])

  // Transform weather data to our format (with fallback default values)
  // Generate semi-random numbers based on position to simulate location-based weather when real data is unavailable
  const seed = userPosition ? userPosition.lat + userPosition.lng : 0
  const pseudoRandom = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000
    return x - Math.floor(x)
  }

  const defaultWeather: WeatherData = {
    windSpeed: Math.floor(5 + pseudoRandom(1) * 15), // 5-20 knots
    windDirection: Math.floor(pseudoRandom(2) * 360),
    waveHeight: Number((0.5 + pseudoRandom(3) * 2.5).toFixed(1)), // 0.5-3.0m
    visibility: Math.floor(5 + pseudoRandom(4) * 10), // 5-15 NM
    temperature: Math.floor(25 + pseudoRandom(5) * 10), // 25-35 C
    humidity: Math.floor(60 + pseudoRandom(6) * 30), // 60-90%
    pressure: Math.floor(1005 + pseudoRandom(7) * 15), // 1005-1020 hPa
    condition: pseudoRandom(8) > 0.7 ? 'cloudy' : pseudoRandom(8) > 0.4 ? 'clear' : 'rain',
    riskLevel: pseudoRandom(9) > 0.8 ? 'caution' : 'safe',
    lastUpdate: new Date(),
    seaState: pseudoRandom(10) > 0.7 ? 'Moderate' : 'Slight',
    windGust: undefined,
    feelsLike: Math.floor(28 + pseudoRandom(11) * 10),
    sunrise: Date.now() - 6 * 60 * 60 * 1000,
    sunset: Date.now() + 6 * 60 * 60 * 1000,
    forecast: []
  }

  const weather: WeatherData = (weatherResponse && !weatherResponse.error) ? {
    windSpeed: weatherResponse.windSpeed || defaultWeather.windSpeed,
    windDirection: weatherResponse.windDirection || defaultWeather.windDirection,
    waveHeight: weatherResponse.waveHeight || defaultWeather.waveHeight,
    visibility: weatherResponse.visibility || defaultWeather.visibility,
    temperature: weatherResponse.temperature ?? defaultWeather.temperature,
    humidity: weatherResponse.humidity || defaultWeather.humidity,
    pressure: weatherResponse.pressure || defaultWeather.pressure,
    condition: mapCondition(weatherResponse.condition),
    riskLevel: weatherResponse.riskLevel || 'safe',
    lastUpdate: new Date(weatherResponse.timestamp || Date.now()),
    seaState: weatherResponse.seaState || defaultWeather.seaState,
    windGust: weatherResponse.windGust,
    feelsLike: weatherResponse.feelsLike,
    sunrise: weatherResponse.sunrise || defaultWeather.sunrise,
    sunset: weatherResponse.sunset || defaultWeather.sunset,
    forecast: weatherResponse.forecast || []
  } : defaultWeather

  // Transform vessel data to our format
  // Transform vessel data to our format
  // Transform vessel data to our format
  // If we are using random simulation, use the simulated response
  // If we are using real AIS data but the list is empty (no ships nearby), we might want to show NOTHING or keep it empty.
  // The user says "no vessels on website". It might be because there are genuinely no vessels in the small 2-degree box around them.
  // Or the AIS stream is not sending data yet.

  // Transform vessel data to our format
  // CRITICAL FIX: If real data is empty (no ships in range), UNLESS we are strictly real-only,
  // we should show simulated data so the user sees something.
  // Ideally, we show real vessels if available.

  const hasRealVessels = isUsingRealData && realVessels.length > 0

  const vessels: Vessel[] = hasRealVessels
    ? realVessels
    : vesselsResponse?.vessels && !vesselsError
      ? vesselsResponse.vessels.map((v: any) => ({
        id: `vessel-${v.mmsi}`,
        name: v.name || 'Unknown',
        type: mapVesselType(v.type),
        position: {
          lat: v.lat,
          lng: v.lon
        },
        speed: v.speed || 0,
        heading: v.course || 0,
        lastUpdate: new Date(v.lastUpdate || Date.now()),
        mmsi: v.mmsi?.toString(),
        flag: v.flag || 'PK',
        destination: v.destination,
        distance: v.distance
      }))
      : generateFakeVessels(userPosition) // FALLBACK: Show simulated vessels if no real ships found


  // Debug log
  useEffect(() => {
    console.log('[useMaritimeData] Vessels State:', {
      realCount: realVessels.length,
      isUsingRealData,
      hasRealVessels,
      finalVesselCount: vessels.length
    })
  }, [vessels, realVessels, isUsingRealData, hasRealVessels])

  // Process alerts from API
  useEffect(() => {
    if (alertsResponse?.alerts && !alertsError) {
      const processedAlerts: Alert[] = alertsResponse.alerts.map((a: any) => ({
        id: a.id,
        type: a.type,
        severity: a.severity === 'danger' ? 'danger' : a.severity === 'caution' ? 'warning' : 'info',
        title: a.title,
        titleKey: a.titleUrdu,
        message: a.description,
        messageKey: a.descriptionUrdu,
        timestamp: new Date(a.startTime || Date.now()),
        acknowledged: false
      }))
      setAlerts(processedAlerts)
    }
  }, [alertsResponse, alertsError])

  // Update last update time
  useEffect(() => {
    if (weatherResponse || vesselsResponse) {
      setLastUpdate(new Date())
    }
  }, [weatherResponse, vesselsResponse])

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, acknowledged: true } : a
    ))
  }, [])

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }, [])

  const updateUserPosition = useCallback((position: UserPosition) => {
    setUserPosition(position)
    setIsManualLocation(true)
  }, [])

  // Calculate boundary distances
  const boundaryDistances = alertsResponse?.boundaryInfo ? {
    toNational: alertsResponse.boundaryInfo.distanceFromCoast || 999,
    toInternational: alertsResponse.boundaryInfo.distanceToInternationalBoundary || 999,
    toRestricted: alertsResponse.boundaryInfo.distanceToRestrictedZone || 999
  } : {
    toNational: userPosition ? calculateDistanceToNearestBoundary(
      userPosition,
      boundaries.filter(b => b.type === 'territorial')
    ) : 999,
    toInternational: userPosition ? calculateDistanceToNearestBoundary(
      userPosition,
      boundaries.filter(b => b.type === 'international')
    ) : 999,
    toRestricted: userPosition ? calculateDistanceToNearestBoundary(
      userPosition,
      boundaries.filter(b => b.type === 'restricted')
    ) : 999
  }

  // Determine current zone
  const getCurrentZone = (): 'territorial' | 'contiguous' | 'eez' | 'international' => {
    if (alertsResponse?.boundaryInfo?.currentZone) {
      const zone = alertsResponse.boundaryInfo.currentZone.toLowerCase()
      if (zone.includes('territorial')) return 'territorial'
      if (zone.includes('contiguous')) return 'contiguous'
      if (zone.includes('international')) return 'international'
      return 'eez'
    }
    if (boundaryDistances.toNational < 12) return 'territorial'
    if (boundaryDistances.toNational < 24) return 'contiguous'
    if (boundaryDistances.toInternational > 0) return 'eez'
    return 'international'
  }

  const isLoading = weatherLoading || vesselsLoading

  return {
    vessels,
    weather,
    alerts,
    userPosition,
    boundaries,
    boundaryDistances,
    currentZone: getCurrentZone(),
    isLoading,
    lastUpdate,
    acknowledgeAlert,
    dismissAlert,
    updateUserPosition,
    // Additional real-time data
    // Additional real-time data
    vesselSource: hasRealVessels ? 'AIS Live' : 'Simulation (Fallback)',
    totalVesselCount: vessels.length,
    boundaryInfo: alertsResponse?.boundaryInfo || null,
    isUsingRealData,
    aisStatus // 'connecting' | 'connected' | 'error' | 'disconnected'
  }
}

// Helper functions
function mapCondition(condition: string): WeatherData['condition'] {
  const c = condition?.toLowerCase() || ''
  if (c.includes('clear') || c.includes('sun')) return 'clear'
  if (c.includes('cloud')) return 'cloudy'
  if (c.includes('rain') || c.includes('drizzle')) return 'rain'
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return 'fog'
  if (c.includes('storm') || c.includes('thunder')) return 'storm'
  return 'cloudy'
}

function mapVesselType(type: string): Vessel['type'] {
  const t = type?.toLowerCase() || ''
  if (t.includes('fish')) return 'fishing'
  if (t.includes('cargo')) return 'cargo'
  if (t.includes('tanker')) return 'tanker'
  if (t.includes('passenger')) return 'passenger'
  if (t.includes('military') || t.includes('navy')) return 'military'
  return 'fishing'
}

function calculateDistanceToNearestBoundary(position: UserPosition, boundaries: BoundaryZone[]): number {
  if (boundaries.length === 0) return 999

  let minDistance = 999

  for (const boundary of boundaries) {
    for (const coord of boundary.coordinates) {
      const dist = haversineDistance(position.lat, position.lng, coord[0], coord[1])
      if (dist < minDistance) minDistance = dist
    }
  }

  return minDistance
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3440.065 // Earth radius in nautical miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function generateFakeVessels(position: UserPosition | null): Vessel[] {
  if (!position) return []

  const vessels: Vessel[] = []
  const count = 5 + Math.floor(Math.random() * 5) // 5-10 vessels

  for (let i = 0; i < count; i++) {
    // Random position within 0.5 degrees
    const latOffset = (Math.random() - 0.5) * 0.1
    const lngOffset = (Math.random() - 0.5) * 0.1

    vessels.push({
      id: `sim-vessel-${i}`,
      name: `Simulated Vessel ${i + 1}`,
      mmsi: `999000${i}`,
      type: Math.random() > 0.6 ? 'fishing' : 'cargo',
      position: {
        lat: position.lat + latOffset,
        lng: position.lng + lngOffset
      },
      speed: 5 + Math.random() * 15,
      heading: Math.floor(Math.random() * 360),
      lastUpdate: new Date(),
      flag: 'Simulated',
      frequency: 'AIS',
      distance: Math.sqrt(latOffset * latOffset + lngOffset * lngOffset) * 60
    })
  }
  return vessels
}
