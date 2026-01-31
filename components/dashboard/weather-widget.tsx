"use client"

import { useLanguage } from '@/contexts/language-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wind, Waves, Eye, Thermometer, Droplets, Gauge, Compass, CloudRain, Sunrise, Sunset } from 'lucide-react'
import type { WeatherData } from '@/types/maritime'

interface WeatherWidgetProps {
  weather: WeatherData
}

export function WeatherWidget({ weather }: WeatherWidgetProps) {
  const { t, isUrdu, isBalochi } = useLanguage()

  const getRiskColor = (level: 'safe' | 'caution' | 'danger') => {
    switch (level) {
      case 'safe':
        return 'bg-safe text-safe-foreground'
      case 'caution':
        return 'bg-caution text-caution-foreground'
      case 'danger':
        return 'bg-danger text-danger-foreground'
    }
  }

  const getRiskBorderColor = (level: 'safe' | 'caution' | 'danger') => {
    switch (level) {
      case 'safe':
        return 'border-safe/30'
      case 'caution':
        return 'border-caution/30'
      case 'danger':
        return 'border-danger/30'
    }
  }

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const weatherItems = [
    {
      icon: Wind,
      label: t('weather.wind'),
      value: `${weather.windSpeed} ${t('unit.knots')}`,
      subValue: `${getWindDirection(weather.windDirection)}${weather.windGust ? ` (G${weather.windGust})` : ''}`,
      danger: weather.windSpeed > 25
    },
    {
      icon: Waves,
      label: t('weather.waves'),
      value: `${weather.waveHeight.toFixed(1)} ${t('unit.meters')}`,
      subValue: weather.seaState || '',
      danger: weather.waveHeight > 2.5
    },
    {
      icon: Eye,
      label: t('weather.visibility'),
      value: `${weather.visibility} NM`,
      danger: weather.visibility < 2
    },
    {
      icon: Thermometer,
      label: t('weather.temperature'),
      value: `${weather.temperature}°C`,
      subValue: weather.feelsLike ? `${isUrdu ? 'محسوس' : 'Feels'} ${weather.feelsLike}°C` : '',
      danger: false
    },
    {
      icon: Droplets,
      label: t('weather.humidity'),
      value: `${weather.humidity}%`,
      danger: false
    },
    {
      icon: Gauge,
      label: t('weather.pressure'),
      value: `${weather.pressure} hPa`,
      danger: weather.pressure < 1000
    }
  ]

  return (
    <Card className={`border-2 ${getRiskBorderColor(weather.riskLevel)} ${isUrdu || isBalochi ? 'rtl' : 'ltr'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Wind className="w-5 h-5 text-primary" />
            {t('weather.title')}
          </CardTitle>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(weather.riskLevel)}`}>
            {t(`weather.${weather.riskLevel}`)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {weatherItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${item.danger ? 'bg-danger/10' : 'bg-muted/50'
                }`}
            >
              <div className={`p-2 rounded-md ${item.danger ? 'bg-danger/20' : 'bg-primary/10'}`}>
                <item.icon className={`w-4 h-4 ${item.danger ? 'text-danger' : 'text-primary'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{item.label}</p>
                <div className="flex items-baseline gap-1">
                  <p className={`text-sm font-semibold ${item.danger ? 'text-danger' : ''}`}>
                    {item.value}
                  </p>
                  {item.subValue && (
                    <span className="text-xs text-muted-foreground">{item.subValue}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sea State & Sunrise/Sunset */}
        {(weather.seaState || weather.sunrise) && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              {weather.seaState && (
                <div className="flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-primary" />
                  <span className="text-muted-foreground">{isUrdu ? 'سمندر کی حالت' : 'Sea State'}:</span>
                  <span className="font-medium">{weather.seaState}</span>
                </div>
              )}
              {weather.sunrise && weather.sunset && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Sunrise className="w-3.5 h-3.5 text-caution" />
                    <span>{formatTime(weather.sunrise)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sunset className="w-3.5 h-3.5 text-chart-4" />
                    <span>{formatTime(weather.sunset)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
