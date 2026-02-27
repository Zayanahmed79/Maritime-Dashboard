"use client"

import { useLanguage } from '@/contexts/language-context'
import { useMaritimeData } from '@/hooks/use-maritime-data'
import { DashboardHeader } from '@/components/dashboard/header'
import { MaritimeMap } from '@/components/dashboard/maritime-map'
import { WeatherWidget } from '@/components/dashboard/weather-widget'
import { BoundaryWidget } from '@/components/dashboard/boundary-widget'
import { TrafficWidget } from '@/components/dashboard/traffic-widget'
import { AlertPanel } from '@/components/dashboard/alert-panel'
import { VideoGuidelines } from '@/components/dashboard/video-guidelines'
import { EducationSection } from '@/components/dashboard/education-section'
import { AlertBar } from '@/components/dashboard/alert-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw } from 'lucide-react'

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 bg-sidebar animate-pulse" />
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-[200px] rounded-lg" />
            <Skeleton className="h-[180px] rounded-lg" />
            <Skeleton className="h-[150px] rounded-lg" />
          </div>
          <div className="lg:col-span-6">
            <Skeleton className="h-[500px] lg:h-[calc(100vh-140px)] rounded-lg" />
          </div>
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-[200px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MaritimeDashboard() {
  const { isUrdu, t } = useLanguage()
  const {
    vessels,
    weather,
    alerts,
    userPosition,
    boundaries,
    boundaryDistances,
    currentZone,
    isLoading,
    lastUpdate,
    acknowledgeAlert,
    dismissAlert,
    updateUserPosition,
    totalVesselCount,
    vesselSource,
    isUsingRealData,
    aisStatus
  } = useMaritimeData()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className={`min-h-screen bg-background ${isUrdu ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <DashboardHeader
        aisStatus={aisStatus}
        isUsingRealData={isUsingRealData}
      />

      {/* Main Content */}
      <main className="p-4 lg:p-6 pb-24 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Panel - Info Widgets */}
          <aside className={`lg:col-span-3 space-y-4 ${isUrdu ? 'lg:order-3' : 'lg:order-1'}`}>
            {/* Weather Widget */}
            <WeatherWidget weather={weather} />

            {/* Boundary Widget */}
            <BoundaryWidget
              distanceToNational={boundaryDistances.toNational}
              distanceToInternational={boundaryDistances.toInternational}
              distanceToRestricted={boundaryDistances.toRestricted}
              currentZone={currentZone}
            />

            {/* Traffic Widget */}
            <TrafficWidget
              vessels={vessels}
              userPosition={userPosition}
              totalCount={totalVesselCount}
              source={vesselSource}
            />
          </aside>

          {/* Center - Map */}
          <section className={`lg:col-span-6 ${isUrdu ? 'lg:order-2' : 'lg:order-2'}`}>
            <div className="h-[50vh] lg:h-[calc(100vh-140px)] min-h-[400px]">
              <MaritimeMap
                vessels={vessels}
                userPosition={userPosition}
                boundaries={boundaries}
                onUserPositionUpdate={updateUserPosition}
              />
            </div>
            {/* Last Update Indicator */}
            <div className={`flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground ${isUrdu ? 'flex-row-reverse' : ''}`}>
              <RefreshCw className="w-3 h-3" />
              <span>{t('time.last_updated')}: {lastUpdate.toLocaleTimeString(isUrdu ? 'ur-PK' : 'en-US')}</span>
            </div>
          </section>

          {/* Right Panel - Alerts & Education */}
          <aside className={`lg:col-span-3 space-y-4 ${isUrdu ? 'lg:order-1' : 'lg:order-3'}`}>
            {/* Alert Panel */}
            <AlertPanel
              alerts={alerts}
              onAcknowledge={acknowledgeAlert}
              onDismiss={dismissAlert}
            />

            {/* Video Guidelines */}
            <VideoGuidelines />

            {/* Education Section */}
            <EducationSection />
          </aside>
        </div>
      </main>

      {/* Mobile Alert Bar */}
      <div className="lg:hidden">
        <AlertBar alerts={alerts} onDismiss={dismissAlert} />
      </div>
    </div>
  )
}
