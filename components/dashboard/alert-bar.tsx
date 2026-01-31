"use client"

import { useLanguage } from '@/contexts/language-context'
import { AlertTriangle, CloudRain, MapPin, Ship, X, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import type { Alert } from '@/types/maritime'

interface AlertBarProps {
  alerts: Alert[]
  onDismiss: (alertId: string) => void
}

export function AlertBar({ alerts, onDismiss }: AlertBarProps) {
  const { t, isUrdu } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)

  const activeAlerts = alerts.filter(a => !a.acknowledged)
  const dangerAlerts = activeAlerts.filter(a => a.severity === 'danger')
  const warningAlerts = activeAlerts.filter(a => a.severity === 'warning')

  if (activeAlerts.length === 0) return null

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
      case 'danger':
        return 'bg-danger text-danger-foreground'
      case 'warning':
        return 'bg-caution text-caution-foreground'
      default:
        return 'bg-primary text-primary-foreground'
    }
  }

  const mostSevereAlert = dangerAlerts[0] || warningAlerts[0] || activeAlerts[0]
  const barColor = dangerAlerts.length > 0 ? 'bg-danger' : warningAlerts.length > 0 ? 'bg-caution' : 'bg-primary'
  const textColor = dangerAlerts.length > 0 ? 'text-danger-foreground' : warningAlerts.length > 0 ? 'text-caution-foreground' : 'text-primary-foreground'

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${isUrdu ? 'rtl' : 'ltr'}`}>
      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-card border-t border-border shadow-lg max-h-[40vh] overflow-y-auto">
          <div className="p-4 space-y-2">
            {activeAlerts.map(alert => {
              const Icon = getAlertIcon(alert.type)
              return (
                <div 
                  key={alert.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    alert.severity === 'danger' ? 'bg-danger/10' : 
                    alert.severity === 'warning' ? 'bg-caution/10' : 'bg-primary/10'
                  }`}
                >
                  <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">
                      {isUrdu && alert.titleKey ? alert.titleKey : alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isUrdu && alert.messageKey ? alert.messageKey : alert.message}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => onDismiss(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Collapsed Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full ${barColor} ${textColor} px-4 py-3 flex items-center justify-between transition-all ${
          dangerAlerts.length > 0 ? 'animate-pulse' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          {(() => {
            const Icon = getAlertIcon(mostSevereAlert.type)
            return <Icon className="w-5 h-5" />
          })()}
          <div className="text-left">
            <p className="font-semibold text-sm">
              {isUrdu && mostSevereAlert.titleKey ? mostSevereAlert.titleKey : mostSevereAlert.title}
            </p>
            {activeAlerts.length > 1 && (
              <p className="text-xs opacity-80">
                +{activeAlerts.length - 1} {isUrdu ? 'مزید' : 'more'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20">
            {activeAlerts.length}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </div>
      </button>
    </div>
  )
}
