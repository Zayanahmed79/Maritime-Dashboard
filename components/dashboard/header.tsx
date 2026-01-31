"use client"

import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Phone, Globe, Clock, Wifi, WifiOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { EmergencyModal } from './emergency-modal'

interface DashboardHeaderProps {
  aisStatus?: 'connecting' | 'connected' | 'error' | 'disconnected'
  isUsingRealData?: boolean
}

export function DashboardHeader({ aisStatus, isUsingRealData }: DashboardHeaderProps) {
  const { t, toggleLanguage, isUrdu, language } = useLanguage()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(true)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine)
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    return () => {
      clearInterval(timer)
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(isUrdu ? 'ur-PK' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <header className={`bg-sidebar text-sidebar-foreground border-b border-sidebar-border ${isUrdu || language === 'bal' ? 'rtl' : 'ltr'}`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title and Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16z" />
                  <path d="M17 20v-4" />
                  <path d="M13 20v-4" />
                  <path d="M9 20v-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold leading-tight text-balance">
                  {t('dashboard.title')}
                </h1>
                <p className="text-xs text-sidebar-foreground/70 hidden sm:block">
                  {t('dashboard.subtitle')}
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isOnline
              ? 'bg-safe/20 text-safe'
              : 'bg-destructive/20 text-destructive'
              }`}>
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
              <span>{isOnline ? t('status.live') : t('status.offline')}</span>
            </div>

            {/* Data Source Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              <span>{isOnline ? 'Real-Time' : 'Simulation'}</span>
            </div>
          </div>

          {/* Right: Time, Language Toggle, Emergency */}
          <div className="flex items-center gap-3">
            {/* Time Display */}
            <div className="hidden md:flex items-center gap-2 text-sidebar-foreground/80 bg-sidebar-accent px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4" />
              <div className="text-sm">
                <span className="font-medium">{formatTime(currentTime)}</span>
                <span className="hidden lg:inline text-xs ml-2 text-sidebar-foreground/60">
                  {formatDate(currentTime)}
                </span>
              </div>
            </div>



            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/80 gap-2"
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">
                {language === 'en' ? 'اردو' : language === 'ur' ? 'Balochī' : 'English'}
              </span>
            </Button>

            {/* Emergency Button */}
            <Button
              variant="destructive"
              size="sm"
              className="gap-2 font-semibold"
              onClick={() => setShowEmergencyModal(true)}
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{t('emergency')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Emergency Modal */}
      <EmergencyModal
        open={showEmergencyModal}
        onOpenChange={setShowEmergencyModal}
      />
    </header>
  )
}
