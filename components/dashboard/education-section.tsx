"use client"

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Map, 
  Shield, 
  AlertCircle, 
  Phone,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react'

type Section = 'zones' | 'safety' | 'emergency' | 'contacts' | null

export function EducationSection() {
  const { t, isUrdu } = useLanguage()
  const [activeSection, setActiveSection] = useState<Section>(null)

  const sections = [
    {
      id: 'zones' as const,
      icon: Map,
      title: t('education.zones_title'),
      description: t('education.zones_desc'),
      color: 'text-primary'
    },
    {
      id: 'safety' as const,
      icon: Shield,
      title: t('education.safety_title'),
      description: t('education.safety_desc'),
      color: 'text-safe'
    },
    {
      id: 'emergency' as const,
      icon: AlertCircle,
      title: t('education.emergency_title'),
      description: t('education.emergency_desc'),
      color: 'text-caution'
    },
    {
      id: 'contacts' as const,
      icon: Phone,
      title: t('education.contacts_title'),
      description: t('education.contacts_desc'),
      color: 'text-danger'
    }
  ]

  const zones = [
    { key: 'territorial', color: 'bg-safe/20 border-safe' },
    { key: 'contiguous', color: 'bg-primary/20 border-primary' },
    { key: 'eez', color: 'bg-caution/20 border-caution' },
    { key: 'international', color: 'bg-danger/20 border-danger' }
  ]

  const safetyDos = [
    'safety.check_weather',
    'safety.inform',
    'safety.equipment',
    'safety.communication',
    'safety.boundaries'
  ]

  const safetyDonts = [
    'safety.avoid_night'
  ]

  const emergencyProcedures = [
    { key: 'mayday', icon: '🆘' },
    { key: 'man_overboard', icon: '🌊' },
    { key: 'fire', icon: '🔥' }
  ]

  const contacts = [
    { key: 'coast_guard', number: '1122', important: true },
    { key: 'navy', number: '111-222-786', important: true },
    { key: 'maritime', number: '021-99203836', important: false },
    { key: 'fisheries', number: '021-99211429', important: false },
    { key: 'rescue', number: '115', important: true }
  ]

  const toggleSection = (id: Section) => {
    setActiveSection(activeSection === id ? null : id)
  }

  return (
    <Card className={`${isUrdu ? 'rtl' : 'ltr'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          {t('education.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sections.map((section) => {
          const isActive = activeSection === section.id
          const Icon = section.icon
          
          return (
            <div key={section.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                  isActive ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <div className={`p-2 rounded-lg bg-muted ${section.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{section.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                </div>
                {isActive ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {isActive && (
                <div className="p-3 pt-0 border-t bg-muted/30">
                  {/* Zones Content */}
                  {section.id === 'zones' && (
                    <div className="space-y-2 mt-3">
                      {zones.map((zone) => (
                        <div key={zone.key} className={`p-3 rounded-lg border ${zone.color}`}>
                          <p className="font-medium text-sm">{t(`zones.${zone.key}`)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t(`zones.${zone.key}_desc`)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Safety Content */}
                  {section.id === 'safety' && (
                    <div className="space-y-3 mt-3">
                      <div>
                        <p className="text-xs font-semibold text-safe mb-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {t('do')}
                        </p>
                        <div className="space-y-1.5">
                          {safetyDos.map((item) => (
                            <div key={item} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-safe flex-shrink-0 mt-0.5" />
                              <span>{t(item)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-danger mb-2 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          {t('dont')}
                        </p>
                        <div className="space-y-1.5">
                          {safetyDonts.map((item) => (
                            <div key={item} className="flex items-start gap-2 text-sm">
                              <XCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                              <span>{t(item)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Emergency Content */}
                  {section.id === 'emergency' && (
                    <div className="space-y-2 mt-3">
                      {emergencyProcedures.map((proc) => (
                        <div key={proc.key} className="p-3 bg-background rounded-lg border">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{proc.icon}</span>
                            <p className="font-medium text-sm">{t(`emergency.${proc.key}`)}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t(`emergency.${proc.key}_desc`)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contacts Content */}
                  {section.id === 'contacts' && (
                    <div className="space-y-2 mt-3">
                      {contacts.map((contact) => (
                        <div 
                          key={contact.key} 
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            contact.important ? 'bg-danger/5 border-danger/20' : 'bg-background'
                          }`}
                        >
                          <div>
                            <p className="font-medium text-sm">{t(`contact.${contact.key}`)}</p>
                            <p className="text-lg font-bold text-primary">{contact.number}</p>
                          </div>
                          <Button
                            size="sm"
                            variant={contact.important ? 'destructive' : 'outline'}
                            className="gap-1"
                            onClick={() => window.open(`tel:${contact.number}`)}
                          >
                            <Phone className="w-3 h-3" />
                            {t('call_now')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
