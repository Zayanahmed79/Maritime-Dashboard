import { NextResponse } from 'next/server'

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

// Pakistan coastal coordinates
const COASTAL_POINTS = [
  { name: 'Karachi', lat: 24.8607, lon: 66.9833 },
  { name: 'Gwadar', lat: 25.1264, lon: 62.3225 },
  { name: 'Pasni', lat: 25.2631, lon: 63.4697 },
  { name: 'Ormara', lat: 25.2075, lon: 64.6367 }
]

// International maritime boundary coordinates (simplified)
const PAKISTAN_MARITIME_BOUNDARY = {
  territorialSea: 12, // nautical miles
  contiguousZone: 24,
  eez: 200,
  // Approximate boundary with India
  easternLimit: {
    lat: 23.5,
    lon: 68.5
  },
  // Approximate boundary with Iran
  westernLimit: {
    lat: 25.3,
    lon: 61.5
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userLat = parseFloat(searchParams.get('lat') || '24.8607')
  const userLon = parseFloat(searchParams.get('lon') || '66.9833')

  try {
    const alerts: any[] = []

    // Note: Weather alerts from onecall API require paid subscription
    // We'll generate alerts based on current weather conditions instead

    // Calculate boundary distances and generate proximity alerts
    const boundaryInfo = calculateBoundaryDistances(userLat, userLon)

    // Add boundary proximity alerts
    if (boundaryInfo.distanceToInternationalBoundary < 5) {
      alerts.push({
        id: 'boundary-critical',
        type: 'boundary',
        severity: 'danger',
        title: 'Critical: Near International Boundary',
        titleUrdu: 'خطرناک: بین الاقوامی سرحد کے قریب',
        description: `You are only ${boundaryInfo.distanceToInternationalBoundary.toFixed(1)} NM from the international boundary. Turn back immediately.`,
        descriptionUrdu: `آپ بین الاقوامی سرحد سے صرف ${boundaryInfo.distanceToInternationalBoundary.toFixed(1)} ناٹیکل میل دور ہیں۔ فوری طور پر واپس مڑیں۔`,
        source: 'System',
        startTime: Date.now(),
        endTime: null
      })
    } else if (boundaryInfo.distanceToInternationalBoundary < 12) {
      alerts.push({
        id: 'boundary-warning',
        type: 'boundary',
        severity: 'caution',
        title: 'Warning: Approaching International Boundary',
        titleUrdu: 'انتباہ: بین الاقوامی سرحد کے قریب پہنچ رہے ہیں',
        description: `You are ${boundaryInfo.distanceToInternationalBoundary.toFixed(1)} NM from the international boundary. Maintain awareness.`,
        descriptionUrdu: `آپ بین الاقوامی سرحد سے ${boundaryInfo.distanceToInternationalBoundary.toFixed(1)} ناٹیکل میل دور ہیں۔ ہوشیار رہیں۔`,
        source: 'System',
        startTime: Date.now(),
        endTime: null
      })
    }

    // Check if in restricted zone
    if (boundaryInfo.inRestrictedZone) {
      alerts.push({
        id: 'restricted-zone',
        type: 'zone',
        severity: 'danger',
        title: 'Warning: Inside Restricted Zone',
        titleUrdu: 'انتباہ: ممنوعہ علاقے میں',
        description: 'You are currently in a restricted maritime zone. Leave immediately and contact authorities if needed.',
        descriptionUrdu: 'آپ فی الوقت ممنوعہ سمندری علاقے میں ہیں۔ فوری طور پر نکلیں۔',
        source: 'System',
        startTime: Date.now(),
        endTime: null
      })
    }

    // Fetch current weather for condition-based alerts
    if (OPENWEATHER_API_KEY) {
      try {
        const currentWeather = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${userLat}&lon=${userLon}&appid=${OPENWEATHER_API_KEY}&units=metric`,
          { next: { revalidate: 300 } }
        )

        if (currentWeather.ok) {
          const weather = await currentWeather.json()
          const windSpeedKnots = Math.round(weather.wind.speed * 1.944)
          const visibility = weather.visibility ? weather.visibility / 1000 : 10

          // High wind alert
          if (windSpeedKnots > 25) {
            alerts.push({
              id: 'wind-warning',
              type: 'weather',
              severity: windSpeedKnots > 34 ? 'danger' : 'caution',
              title: `High Winds: ${windSpeedKnots} knots`,
              titleUrdu: `تیز ہوائیں: ${windSpeedKnots} ناٹس`,
              description: 'Strong winds detected. Small vessels should return to port.',
              descriptionUrdu: 'تیز ہوائیں۔ چھوٹی کشتیوں کو بندرگاہ واپس جانا چاہیے۔',
              source: 'Weather Station',
              startTime: Date.now(),
              endTime: null
            })
          }

          // Low visibility alert
          if (visibility < 3) {
            alerts.push({
              id: 'visibility-warning',
              type: 'weather',
              severity: visibility < 1 ? 'danger' : 'caution',
              title: `Low Visibility: ${visibility.toFixed(1)} km`,
              titleUrdu: `کم مرئیت: ${visibility.toFixed(1)} کلومیٹر`,
              description: 'Reduced visibility conditions. Use navigation lights and radar.',
              descriptionUrdu: 'کم مرئیت۔ نیویگیشن لائٹس اور ریڈار استعمال کریں۔',
              source: 'Weather Station',
              startTime: Date.now(),
              endTime: null
            })
          }

          // Storm/thunderstorm alert
          const weatherId = weather.weather[0]?.id
          if (weatherId >= 200 && weatherId < 300) {
            alerts.push({
              id: 'storm-warning',
              type: 'weather',
              severity: 'danger',
              title: 'Thunderstorm Warning',
              titleUrdu: 'طوفان کا انتباہ',
              description: 'Thunderstorm activity in area. Seek shelter immediately.',
              descriptionUrdu: 'علاقے میں طوفان۔ فوری طور پر پناہ لیں۔',
              source: 'Weather Station',
              startTime: Date.now(),
              endTime: null
            })
          }
        }
      } catch (e) {
        console.error('Current weather fetch error:', e)
      }
    }

    // Sort alerts by severity
    const severityOrder = { danger: 0, caution: 1, safe: 2 }
    alerts.sort((a, b) => severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder])

    return NextResponse.json({
      alerts,
      boundaryInfo,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Alerts API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts', alerts: [], boundaryInfo: null },
      { status: 500 }
    )
  }
}

function calculateBoundaryDistances(lat: number, lon: number) {
  // Simplified boundary calculations
  // In production, this would use precise maritime boundary coordinates
  
  // Distance to nearest point on India boundary (eastern)
  const distToIndia = calculateDistanceNM(lat, lon, 23.5, 68.176)
  
  // Distance to nearest point on Iran boundary (western)
  const distToIran = calculateDistanceNM(lat, lon, 25.0, 61.5)
  
  // Distance to international waters (beyond EEZ)
  const distToInternational = Math.min(distToIndia, distToIran)
  
  // Check if in restricted zones (naval areas, protected areas)
  const restrictedZones = [
    { lat: 24.85, lon: 66.98, radius: 5, name: 'Karachi Port Area' },
    { lat: 25.12, lon: 62.32, radius: 3, name: 'Gwadar Port Area' }
  ]
  
  let inRestrictedZone = false
  let nearestRestrictedZone = null
  let distToRestrictedZone = Infinity
  
  for (const zone of restrictedZones) {
    const dist = calculateDistanceNM(lat, lon, zone.lat, zone.lon)
    if (dist < zone.radius) {
      inRestrictedZone = true
      nearestRestrictedZone = zone.name
    }
    if (dist < distToRestrictedZone) {
      distToRestrictedZone = dist
    }
  }

  // Determine current zone
  let currentZone = 'Exclusive Economic Zone'
  const distFromCoast = calculateDistanceFromCoast(lat, lon)
  
  if (distFromCoast <= 12) {
    currentZone = 'Territorial Waters'
  } else if (distFromCoast <= 24) {
    currentZone = 'Contiguous Zone'
  }

  return {
    distanceToInternationalBoundary: distToInternational,
    distanceToIndiaBoundary: distToIndia,
    distanceToIranBoundary: distToIran,
    distanceFromCoast: distFromCoast,
    inRestrictedZone,
    nearestRestrictedZone,
    distanceToRestrictedZone: distToRestrictedZone,
    currentZone,
    coordinates: { lat, lon }
  }
}

function calculateDistanceFromCoast(lat: number, lon: number): number {
  // Simplified - calculate distance from nearest coastal point
  const coastalPoints = [
    { lat: 24.8607, lon: 66.9833 }, // Karachi
    { lat: 25.1264, lon: 62.3225 }, // Gwadar
    { lat: 24.9, lon: 66.7 },
    { lat: 25.0, lon: 65.0 },
    { lat: 25.2, lon: 64.0 },
    { lat: 25.2, lon: 63.0 }
  ]
  
  let minDist = Infinity
  for (const point of coastalPoints) {
    const dist = calculateDistanceNM(lat, lon, point.lat, point.lon)
    if (dist < minDist) minDist = dist
  }
  
  return minDist
}

function calculateDistanceNM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065 // Earth's radius in nautical miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

function getSeverityFromEvent(event: string): 'safe' | 'caution' | 'danger' {
  const dangerKeywords = ['severe', 'extreme', 'hurricane', 'typhoon', 'tsunami', 'tornado']
  const cautionKeywords = ['warning', 'watch', 'advisory', 'storm', 'gale', 'flood']
  
  const eventLower = event.toLowerCase()
  
  if (dangerKeywords.some(k => eventLower.includes(k))) return 'danger'
  if (cautionKeywords.some(k => eventLower.includes(k))) return 'caution'
  return 'caution'
}

function translateAlertTitle(event: string): string {
  const translations: Record<string, string> = {
    'Storm Warning': 'طوفان کا انتباہ',
    'Gale Warning': 'تیز ہوا کا انتباہ',
    'Flood Warning': 'سیلاب کا انتباہ',
    'Heavy Rain': 'شدید بارش',
    'Thunderstorm': 'گرج چمک',
    'High Winds': 'تیز ہوائیں',
    'Fog': 'دھند'
  }
  
  return translations[event] || 'موسمی انتباہ'
}
