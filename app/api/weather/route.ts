import { NextResponse } from 'next/server'

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

// Default coordinates for Karachi coast
const DEFAULT_LAT = 24.8607
const DEFAULT_LON = 66.9833

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat') || DEFAULT_LAT.toString()
  const lon = searchParams.get('lon') || DEFAULT_LON.toString()

  const apiKey = OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenWeather API key not configured on server.' },
      { status: 500 }
    )
  }

  try {
    console.log('[v0] Fetching weather for coordinates:', lat, lon)

    // Fetch current weather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    )

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text()
      console.error('[Weather API Error]', weatherResponse.status, errorText)
      throw new Error(`Weather API error: ${weatherResponse.status} - ${errorText}`)
    }

    const weatherData = await weatherResponse.json()
    console.log('[v0] Weather data received for:', weatherData.name, '- Temp:', weatherData.main.temp, '- Wind:', weatherData.wind.speed)

    // Fetch marine data from Open-Meteo (Free, No Key needed)
    // This gives us REAL wave height, direction, and period
    const marineResponse = await fetch(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period&hourly=wave_height&timezone=auto`,
      { next: { revalidate: 300 } }
    )

    let marineData = null
    let realWaveHeight = null
    let realWaveDirection = null

    if (marineResponse.ok) {
      marineData = await marineResponse.json()
      // Open-Meteo returns wave height in meters
      if (marineData.current) {
        realWaveHeight = marineData.current.wave_height
        realWaveDirection = marineData.current.wave_direction
        console.log('[v0] Marine data received - Wave Height:', realWaveHeight, 'm')
      }
    } else {
      console.warn('[v0] Failed to fetch marine data from Open-Meteo')
    }

    // Calculate wind speed in knots (1 m/s = 1.944 knots)
    const windSpeedKnots = Math.round(weatherData.wind.speed * 1.944)

    // Calculate visibility in nautical miles (1 meter = 0.000539957 nautical miles)
    const visibilityNm = weatherData.visibility
      ? Math.round((weatherData.visibility * 0.000539957) * 10) / 10
      : 10

    // Estimate wave height only if real data failed
    const estimatedWaveHeight = realWaveHeight !== null ? realWaveHeight : calculateWaveHeight(windSpeedKnots)

    // Determine risk level based on conditions
    const riskLevel = calculateRiskLevel(windSpeedKnots, estimatedWaveHeight, visibilityNm)

    // Get weather condition
    const condition = weatherData.weather[0]?.main || 'Unknown'
    const conditionDescription = weatherData.weather[0]?.description || ''

    // Calculate sea state based on Beaufort scale
    const seaState = getSeaState(windSpeedKnots)

    const result = {
      temperature: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      windSpeed: windSpeedKnots,
      windDirection: weatherData.wind.deg || 0,
      windGust: weatherData.wind.gust ? Math.round(weatherData.wind.gust * 1.944) : null,
      visibility: visibilityNm,
      waveHeight: estimatedWaveHeight,
      seaState,
      condition,
      conditionDescription,
      riskLevel,
      icon: weatherData.weather[0]?.icon,
      sunrise: weatherData.sys.sunrise * 1000,
      sunset: weatherData.sys.sunset * 1000,
      clouds: weatherData.clouds?.all || 0,
      location: weatherData.name || 'Arabian Sea',
      coordinates: {
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      },
      timestamp: Date.now(),
      forecast: []
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}

function calculateWaveHeight(windSpeedKnots: number): number {
  // Estimation based on Beaufort scale
  if (windSpeedKnots < 1) return 0
  if (windSpeedKnots < 4) return 0.1
  if (windSpeedKnots < 7) return 0.3
  if (windSpeedKnots < 11) return 0.6
  if (windSpeedKnots < 17) return 1.0
  if (windSpeedKnots < 22) return 2.0
  if (windSpeedKnots < 28) return 3.0
  if (windSpeedKnots < 34) return 4.0
  if (windSpeedKnots < 41) return 5.5
  if (windSpeedKnots < 48) return 7.5
  if (windSpeedKnots < 56) return 10.0
  return 14.0
}

function getSeaState(windSpeedKnots: number): string {
  if (windSpeedKnots < 1) return 'Calm (glassy)'
  if (windSpeedKnots < 4) return 'Calm (rippled)'
  if (windSpeedKnots < 7) return 'Smooth'
  if (windSpeedKnots < 11) return 'Slight'
  if (windSpeedKnots < 17) return 'Moderate'
  if (windSpeedKnots < 22) return 'Rough'
  if (windSpeedKnots < 28) return 'Very Rough'
  if (windSpeedKnots < 34) return 'High'
  if (windSpeedKnots < 41) return 'Very High'
  return 'Phenomenal'
}

function calculateRiskLevel(windSpeed: number, waveHeight: number, visibility: number): 'safe' | 'caution' | 'danger' {
  // High danger conditions
  if (windSpeed > 34 || waveHeight > 4 || visibility < 1) {
    return 'danger'
  }

  // Caution conditions
  if (windSpeed > 17 || waveHeight > 2 || visibility < 3) {
    return 'caution'
  }

  return 'safe'
}
