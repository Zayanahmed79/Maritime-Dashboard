"use client"

import { useLanguage } from '@/contexts/language-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  CloudRain, 
  MapPin, 
  Ship, 
  X,
  Bell,
  CheckCircle
} from 'lucide-react'
import type { Alert } from '@/types/maritime'

interface AlertPanelProps {
  alerts: Alert[]
  onAcknowledge: (alertId: string) => void
  onDismiss: (alertId: string) => void
}

export function AlertPanel({ alerts, onAcknowledge, onDismiss }: AlertPanelProps) {
  const { t, isUrdu } = useLanguage()

  const activeAlerts = alerts.filter(a => !a.acknowledged)
  const hasAlerts = activeAlerts.length > 0

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'weather':
        return CloudRain
      case 'boundary':
        return MapPin
      case 'zone':
        return AlertTriangle
      case 'traffic':
      case 'collision':
        return Ship
      default:
        return AlertTriangle
    }
  }

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'info':
        return 'bg-primary/10 border-primary/30 text-primary'
      case 'warning':
        return 'bg-caution/10 border-caution/30 text-caution-foreground'
      case 'danger':
        return 'bg-danger/10 border-danger/30 text-danger'
    }
  }

  const getSeverityBadge = (severity: Alert['severity']) => {
    switch (severity) {
      case 'info':
        return 'bg-primary text-primary-foreground'
      case 'warning':
        return 'bg-caution text-caution-foreground'
      case 'danger':
        return 'bg-danger text-danger-foreground'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return `${diff} ${t('time.seconds')} ${t('time.ago')}`
    if (diff < 3600) return `${Math.floor(diff / 60)} ${t('time.minutes')} ${t('time.ago')}`
    return date.toLocaleTimeString(isUrdu ? 'ur-PK' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className={`${hasAlerts ? 'border-danger/50' : ''} ${isUrdu ? 'rtl' : 'ltr'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className={`w-5 h-5 ${hasAlerts ? 'text-danger animate-pulse' : 'text-primary'}`} />
            {t('alerts.title')}
            {hasAlerts && (
              <span className="bg-danger text-danger-foreground text-xs px-2 py-0.5 rounded-full">
                {activeAlerts.length}
              </span>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="w-10 h-10 text-safe mb-2" />
            <p className="text-sm text-muted-foreground">{t('alerts.none')}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {activeAlerts.map((alert) => {
              const Icon = getAlertIcon(alert.type)
              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded ${getSeverityBadge(alert.severity)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">
                            {isUrdu && alert.titleKey ? alert.titleKey : alert.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isUrdu && alert.messageKey ? alert.messageKey : alert.message}
                          </p>
                        </div>
                        <button
                          onClick={() => onDismiss(alert.id)}
                          className="text-muted-foreground hover:text-foreground p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          {formatTime(alert.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => onAcknowledge(alert.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          OK
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Alert Legend */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex flex-wrap gap-4 justify-center text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-safe" />
              <span>{t('weather.safe')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-caution" />
              <span>{t('weather.caution')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-danger" />
              <span>{t('weather.danger')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
