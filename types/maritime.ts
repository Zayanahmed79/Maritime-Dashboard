export interface Vessel {
  id: string
  name: string
  type: 'fishing' | 'cargo' | 'tanker' | 'passenger' | 'military' | 'other'
  position: {
    lat: number
    lng: number
  }
  speed: number // knots
  heading: number // degrees
  lastUpdate: Date
  mmsi?: string
  flag?: string
  destination?: string
  distance?: number // nautical miles from user
  frequency?: string
}

export interface WeatherData {
  windSpeed: number // knots
  windDirection: number // degrees
  waveHeight: number // meters
  visibility: number // nautical miles
  temperature: number // celsius
  humidity: number // percentage
  pressure: number // hPa
  condition: 'clear' | 'cloudy' | 'rain' | 'storm' | 'fog'
  riskLevel: 'safe' | 'caution' | 'danger'
  lastUpdate: Date
  // Additional real-time data
  seaState?: string
  windGust?: number
  feelsLike?: number
  sunrise?: number
  sunset?: number
  forecast?: WeatherForecast[]
}

export interface WeatherForecast {
  time: number
  temp: number
  windSpeed: number
  condition: string
  icon: string
}

export interface BoundaryZone {
  id: string
  name: string
  type: 'territorial' | 'contiguous' | 'eez' | 'international' | 'restricted' | 'fishing'
  coordinates: Array<[number, number]>
  color: string
  fillColor: string
}

export interface Alert {
  id: string
  type: 'weather' | 'boundary' | 'zone' | 'traffic' | 'collision'
  severity: 'info' | 'warning' | 'danger'
  title: string
  titleKey: string
  message: string
  messageKey: string
  timestamp: Date
  acknowledged: boolean
}

export interface UserPosition {
  lat: number
  lng: number
  accuracy: number
  heading?: number
  speed?: number
  timestamp: Date
}

export interface MapLayer {
  id: string
  name: string
  nameKey: string
  visible: boolean
  icon: string
}

export interface EmergencyContact {
  name: string
  nameKey: string
  number: string
  description?: string
  descriptionKey?: string
}
