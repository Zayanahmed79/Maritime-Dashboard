import { NextResponse } from "next/server"

// Pakistan coastal area - major shipping lanes and fishing zones
const SHIPPING_LANES = {
  // Main shipping channel to Karachi Port
  karachi: { lat: 24.8, lon: 66.9, radius: 0.5 },
  // Port Qasim approach
  portQasim: { lat: 24.75, lon: 67.35, radius: 0.4 },
  // Gwadar Port area
  gwadar: { lat: 25.12, lon: 62.33, radius: 0.3 },
  // Main fishing grounds
  fishingNorth: { lat: 24.5, lon: 67.2, radius: 0.8 },
  fishingSouth: { lat: 23.8, lon: 67.5, radius: 0.6 },
}

// Realistic vessel names based on region
const VESSEL_NAMES = {
  fishing: [
    "Al-Madina", "Noor-e-Sahar", "Karachi Star", "Sea Hawk", "Makran Pearl",
    "Arabian Fisher", "Sindh Pride", "Korangi-7", "Ibrahim Shah", "Baloch Star",
    "Kemari Queen", "Fish Master", "Ocean Hope", "Gwadar Pride", "Manora Light",
    "Clifton Bay", "Sandspit", "Hawks Bay", "Paradise Point", "Sonmiani Star"
  ],
  cargo: [
    "MSC Karachi", "Maersk Indus", "COSCO Pakistan", "Ever Fortune", "APL Sindh",
    "Yang Ming Express", "Hapag Punjab", "ONE Harmony", "CMA CGM Gwadar", "PIL Arabia"
  ],
  tanker: [
    "Crude Carrier I", "Pak Gulf", "Arabian Sea", "Indus Crude", "FOTCO Star",
    "PSO Pioneer", "Byco Spirit", "Parco Voyager", "Shell Karachi", "Attock Tanker"
  ],
  passenger: [
    "Karachi Express", "Coastal Queen", "Manora Ferry", "Port Shuttle"
  ],
  tug: [
    "KPT Tug 1", "Harbour Master", "Port Assist", "Channel Guide", "Pilot Boat"
  ]
}

// Use seeded random for consistent but varying positions
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userLat = parseFloat(searchParams.get("lat") || "24.8607")
  const userLon = parseFloat(searchParams.get("lon") || "66.9833")

  // Return empty array for strict real-only mode
  // The user requested NO DUMMY DATA.
  return NextResponse.json({
    vessels: [],
    totalCount: 0,
    timestamp: Date.now(),
    source: "maritime-real-only",
    note: "Simulation disabled. Real-time data only."
  })
}

function generateRealisticVessels(userLat: number, userLon: number, seed: number) {
  const vessels: any[] = []
  let vesselIndex = 0

  // Generate fishing vessels (most common) - scattered in fishing grounds
  for (let i = 0; i < 18; i++) {
    const zone = i < 10 ? SHIPPING_LANES.fishingNorth : SHIPPING_LANES.fishingSouth
    const lat = zone.lat + (seededRandom(seed + i * 7) - 0.5) * zone.radius * 2
    const lon = zone.lon + (seededRandom(seed + i * 11) - 0.5) * zone.radius * 2

    vessels.push(createVessel({
      index: vesselIndex++,
      type: "fishing",
      typeCode: 30,
      lat,
      lon,
      seed: seed + i,
      userLat,
      userLon,
      maxSpeed: 8
    }))
  }

  // Cargo vessels - in shipping lanes near Karachi and Port Qasim
  for (let i = 0; i < 8; i++) {
    const zone = i < 5 ? SHIPPING_LANES.karachi : SHIPPING_LANES.portQasim
    const lat = zone.lat + (seededRandom(seed + i * 13 + 100) - 0.5) * zone.radius * 2
    const lon = zone.lon + (seededRandom(seed + i * 17 + 100) - 0.5) * zone.radius * 2

    vessels.push(createVessel({
      index: vesselIndex++,
      type: "cargo",
      typeCode: 70,
      lat,
      lon,
      seed: seed + i + 100,
      userLat,
      userLon,
      maxSpeed: 14,
      destinations: ["Karachi", "Port Qasim", "Dubai", "Singapore", "Colombo"]
    }))
  }

  // Tankers - near port approaches
  for (let i = 0; i < 5; i++) {
    const zone = i < 3 ? SHIPPING_LANES.karachi : SHIPPING_LANES.portQasim
    const lat = zone.lat + (seededRandom(seed + i * 19 + 200) - 0.5) * zone.radius * 1.5
    const lon = zone.lon + (seededRandom(seed + i * 23 + 200) - 0.5) * zone.radius * 1.5

    vessels.push(createVessel({
      index: vesselIndex++,
      type: "tanker",
      typeCode: 80,
      lat,
      lon,
      seed: seed + i + 200,
      userLat,
      userLon,
      maxSpeed: 12,
      destinations: ["Karachi", "Port Qasim", "Fujairah", "Jebel Ali"]
    }))
  }

  // Passenger ferries - near Karachi harbor
  for (let i = 0; i < 3; i++) {
    const lat = 24.82 + (seededRandom(seed + i * 29 + 300) - 0.5) * 0.15
    const lon = 66.98 + (seededRandom(seed + i * 31 + 300) - 0.5) * 0.15

    vessels.push(createVessel({
      index: vesselIndex++,
      type: "passenger",
      typeCode: 60,
      lat,
      lon,
      seed: seed + i + 300,
      userLat,
      userLon,
      maxSpeed: 18,
      destinations: ["Manora Island", "Karachi Port", "Keamari"]
    }))
  }

  // Tugs - very close to ports
  for (let i = 0; i < 4; i++) {
    const lat = 24.83 + (seededRandom(seed + i * 37 + 400) - 0.5) * 0.08
    const lon = 66.97 + (seededRandom(seed + i * 41 + 400) - 0.5) * 0.08

    vessels.push(createVessel({
      index: vesselIndex++,
      type: "tug",
      typeCode: 31,
      lat,
      lon,
      seed: seed + i + 400,
      userLat,
      userLon,
      maxSpeed: 12,
      destinations: ["Karachi Port", "Berth Assignment"]
    }))
  }

  return vessels
}

interface VesselParams {
  index: number
  type: keyof typeof VESSEL_NAMES
  typeCode: number
  lat: number
  lon: number
  seed: number
  userLat: number
  userLon: number
  maxSpeed: number
  destinations?: string[]
}

function createVessel(params: VesselParams) {
  const { index, type, typeCode, lat, lon, seed, userLat, userLon, maxSpeed, destinations } = params

  const names = VESSEL_NAMES[type]
  const nameIndex = Math.floor(seededRandom(seed * 43) * names.length)
  const speed = Math.round(seededRandom(seed * 47) * maxSpeed * 10) / 10
  const course = Math.round(seededRandom(seed * 53) * 360)
  const heading = course + Math.round((seededRandom(seed * 59) - 0.5) * 20)

  const destination = destinations
    ? destinations[Math.floor(seededRandom(seed * 61) * destinations.length)]
    : type === "fishing" ? "Fishing Grounds" : "Karachi"

  // Generate realistic MMSI (470 = Pakistan)
  const mmsi = `470${String(100000 + index).slice(1)}${String(Math.floor(seededRandom(seed * 67) * 1000)).padStart(3, '0')}`

  return {
    id: `vessel-${index}`,
    mmsi,
    name: names[nameIndex],
    type: type.charAt(0).toUpperCase() + type.slice(1),
    typeCode,
    position: { lat, lng: lon },
    lat,
    lon,
    speed,
    course,
    heading: ((heading % 360) + 360) % 360,
    destination,
    flag: "PK",
    distance: calculateDistance(userLat, userLon, lat, lon),
    lastUpdate: Date.now() - Math.floor(seededRandom(seed * 71) * 300000) // 0-5 min ago
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Haversine formula - returns nautical miles
  const R = 3440.065
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
