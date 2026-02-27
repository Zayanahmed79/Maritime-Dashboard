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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'


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
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${isActive ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
              >
                <div className={`p-2 rounded-lg bg-muted ${section.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{section.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            </div>
          )
        })}
      </CardContent>

      <Dialog open={activeSection !== null} onOpenChange={(open) => { if (!open) setActiveSection(null) }}>
        <DialogContent className={`${isUrdu ? 'rtl text-right' : 'ltr text-left'}`}>
          <DialogHeader>
            <DialogTitle>
              {activeSection && sections.find(s => s.id === activeSection)?.title}
            </DialogTitle>
            <DialogDescription>
              {activeSection && sections.find(s => s.id === activeSection)?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Zones Content */}
            {activeSection === 'zones' && (
              <div className="space-y-2">
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
            {activeSection === 'safety' && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-safe mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {t('do')}
                  </p>
                  <div className="space-y-2">
                    {safetyDos.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm bg-safe/5 p-2 rounded-md border border-safe/20">
                        <CheckCircle className="w-4 h-4 text-safe flex-shrink-0 mt-0.5" />
                        <span>{t(item)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-danger mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {t('dont')}
                  </p>
                  <div className="space-y-2">
                    {safetyDonts.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm bg-danger/5 p-2 rounded-md border border-danger/20">
                        <XCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                        <span>{t(item)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Content */}
            {activeSection === 'emergency' && (
              <div className="space-y-3">
                {emergencyProcedures.map((proc) => (
                  <div key={proc.key} className="p-4 bg-background rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{proc.icon}</span>
                      <p className="font-semibold text-base">{t(`emergency.${proc.key}`)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(`emergency.${proc.key}_desc`)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Contacts Content */}
            {activeSection === 'contacts' && (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.key}
                    className={`flex items-center justify-between p-4 rounded-lg border shadow-sm ${contact.important ? 'bg-danger/5 border-danger/30' : 'bg-background hover:bg-muted/50 transition-colors'
                      }`}
                  >
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">{t(`contact.${contact.key}`)}</p>
                      <p className="text-xl font-bold text-primary mt-1">{contact.number}</p>
                    </div>
                    <Button
                      size="default"
                      variant={contact.important ? 'destructive' : 'outline'}
                      className="gap-2 shrink-0"
                      onClick={() => window.open(`tel:${contact.number}`)}
                    >
                      <Phone className="w-4 h-4" />
                      {t('call_now')}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
