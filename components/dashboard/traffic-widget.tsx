"use client"

import { useLanguage } from '@/contexts/language-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Ship, Users, AlertTriangle } from 'lucide-react'
import type { Vessel } from '@/types/maritime'

interface TrafficWidgetProps {
  vessels: Vessel[]
  userPosition: { lat: number; lng: number } | null
  totalCount?: number
  source?: string
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3440.065 // Earth radius in nautical miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function TrafficWidget({ vessels, userPosition, totalCount, source }: TrafficWidgetProps) {
  const { t, isUrdu } = useLanguage()

  const nearbyVessels = userPosition 
    ? vessels.filter(v => calculateDistance(
        userPosition.lat, userPosition.lng,
        v.position.lat, v.position.lng
      ) < 10)
    : vessels

  const veryCloseVessels = userPosition
    ? vessels.filter(v => calculateDistance(
        userPosition.lat, userPosition.lng,
        v.position.lat, v.position.lng
      ) < 2)
    : []

  const trafficDensity = nearbyVessels.length > 10 ? 'high' : nearbyVessels.length > 5 ? 'moderate' : 'low'
  const collisionRisk = veryCloseVessels.length > 2 ? 'high' : veryCloseVessels.length > 0 ? 'moderate' : 'low'

  const getDensityColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-safe text-safe-foreground'
      case 'moderate':
        return 'bg-caution text-caution-foreground'
      case 'high':
        return 'bg-danger text-danger-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const vesselsByType = {
    fishing: nearbyVessels.filter(v => v.type === 'fishing').length,
    cargo: nearbyVessels.filter(v => v.type === 'cargo').length,
    tanker: nearbyVessels.filter(v => v.type === 'tanker').length,
    other: nearbyVessels.filter(v => !['fishing', 'cargo', 'tanker'].includes(v.type)).length
  }

  return (
    <Card className={`${isUrdu ? 'rtl' : 'ltr'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Ship className="w-5 h-5 text-primary" />
          {t('traffic.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{nearbyVessels.length}</p>
            <p className="text-xs text-muted-foreground">{t('traffic.nearby')}</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${
              collisionRisk === 'high' ? 'text-danger' : 
              collisionRisk === 'moderate' ? 'text-caution' : 'text-safe'
            }`} />
            <p className={`text-sm font-semibold px-2 py-1 rounded ${getDensityColor(collisionRisk)}`}>
              {t(`traffic.${collisionRisk}`)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t('traffic.collision_risk')}</p>
          </div>
        </div>

        {/* Traffic Density */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t('traffic.density')}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDensityColor(trafficDensity)}`}>
              {t(`traffic.${trafficDensity}`)}
            </span>
          </div>
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i < nearbyVessels.length 
                    ? trafficDensity === 'high' ? 'bg-danger' :
                      trafficDensity === 'moderate' ? 'bg-caution' : 'bg-safe'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Vessel Types */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold text-primary">{vesselsByType.fishing}</p>
            <p className="text-[10px] text-muted-foreground">{t('vessel.fishing').split(' ')[0]}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold text-chart-2">{vesselsByType.cargo}</p>
            <p className="text-[10px] text-muted-foreground">{t('vessel.cargo').split(' ')[0]}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold text-chart-4">{vesselsByType.tanker}</p>
            <p className="text-[10px] text-muted-foreground">{t('vessel.tanker').split(' ')[0]}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold text-muted-foreground">{vesselsByType.other}</p>
            <p className="text-[10px] text-muted-foreground">Other</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
