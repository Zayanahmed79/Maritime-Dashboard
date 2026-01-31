"use client"

import { useLanguage } from '@/contexts/language-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react'

interface BoundaryWidgetProps {
  distanceToNational: number
  distanceToInternational: number
  distanceToRestricted: number
  currentZone: 'territorial' | 'contiguous' | 'eez' | 'international'
}

export function BoundaryWidget({ 
  distanceToNational, 
  distanceToInternational, 
  distanceToRestricted,
  currentZone 
}: BoundaryWidgetProps) {
  const { t, isUrdu } = useLanguage()

  const getStatus = (distance: number, threshold: number) => {
    if (distance > threshold * 2) return 'safe'
    if (distance > threshold) return 'warning'
    return 'danger'
  }

  const internationalStatus = getStatus(distanceToInternational, 5)
  const restrictedStatus = getStatus(distanceToRestricted, 2)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-safe text-safe-foreground'
      case 'warning':
        return 'bg-caution text-caution-foreground'
      case 'danger':
        return 'bg-danger text-danger-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-safe/10 border-safe/20'
      case 'warning':
        return 'bg-caution/10 border-caution/20'
      case 'danger':
        return 'bg-danger/10 border-danger/20'
      default:
        return 'bg-muted/10 border-muted/20'
    }
  }

  const getZoneLabel = () => {
    switch (currentZone) {
      case 'territorial':
        return t('zones.territorial')
      case 'contiguous':
        return t('zones.contiguous')
      case 'eez':
        return t('zones.eez')
      case 'international':
        return t('zones.international')
    }
  }

  const overallStatus = internationalStatus === 'danger' || restrictedStatus === 'danger' 
    ? 'danger' 
    : internationalStatus === 'warning' || restrictedStatus === 'warning'
    ? 'warning'
    : 'safe'

  return (
    <Card className={`border-2 ${overallStatus === 'safe' ? 'border-safe/30' : overallStatus === 'warning' ? 'border-caution/30' : 'border-danger/30'} ${isUrdu ? 'rtl' : 'ltr'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {t('boundary.title')}
          </CardTitle>
          {overallStatus === 'safe' ? (
            <ShieldCheck className="w-5 h-5 text-safe" />
          ) : overallStatus === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-caution" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-danger" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Zone */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">{t('map.zones')}</p>
          <p className="text-sm font-medium">{getZoneLabel()}</p>
        </div>

        {/* Distance Indicators */}
        <div className="space-y-2">
          {/* International Boundary */}
          <div className={`p-3 rounded-lg border ${getStatusBg(internationalStatus)}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{t('boundary.international')}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(internationalStatus)}`}>
                {t(`boundary.${internationalStatus === 'safe' ? 'safe' : internationalStatus === 'warning' ? 'warning' : 'danger'}`)}
              </span>
            </div>
            <p className="text-lg font-bold">{distanceToInternational.toFixed(1)} {t('unit.nm')}</p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  internationalStatus === 'safe' ? 'bg-safe' : 
                  internationalStatus === 'warning' ? 'bg-caution' : 'bg-danger'
                }`}
                style={{ width: `${Math.min(100, (distanceToInternational / 20) * 100)}%` }}
              />
            </div>
          </div>

          {/* Restricted Zone */}
          <div className={`p-3 rounded-lg border ${getStatusBg(restrictedStatus)}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{t('boundary.restricted')}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(restrictedStatus)}`}>
                {t(`boundary.${restrictedStatus === 'safe' ? 'safe' : restrictedStatus === 'warning' ? 'warning' : 'danger'}`)}
              </span>
            </div>
            <p className="text-lg font-bold">{distanceToRestricted.toFixed(1)} {t('unit.nm')}</p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  restrictedStatus === 'safe' ? 'bg-safe' : 
                  restrictedStatus === 'warning' ? 'bg-caution' : 'bg-danger'
                }`}
                style={{ width: `${Math.min(100, (distanceToRestricted / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
