"use client"

import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Phone, AlertTriangle, Anchor, Shield, Siren } from 'lucide-react'

interface EmergencyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmergencyModal({ open, onOpenChange }: EmergencyModalProps) {
  const { t, isUrdu } = useLanguage()

  const emergencyContacts = [
    {
      name: 'Coast Guard',
      nameKey: 'contact.coast_guard',
      number: '1122',
      icon: Siren,
      priority: true
    },
    {
      name: 'Pakistan Navy',
      nameKey: 'contact.navy',
      number: '111-222-786',
      icon: Anchor,
      priority: true
    },
    {
      name: 'Search & Rescue',
      nameKey: 'contact.rescue',
      number: '115',
      icon: Shield,
      priority: true
    },
    {
      name: 'Maritime Security',
      nameKey: 'contact.maritime',
      number: '021-99203836',
      icon: AlertTriangle,
      priority: false
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md ${isUrdu ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle className="w-6 h-6" />
            {t('emergency.help')}
          </DialogTitle>
          <DialogDescription>
            {isUrdu 
              ? 'فوری مدد کے لیے نیچے دیے گئے نمبروں پر کال کریں'
              : 'Call the numbers below for immediate assistance'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {emergencyContacts.map((contact) => {
            const Icon = contact.icon
            return (
              <div 
                key={contact.number}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  contact.priority 
                    ? 'bg-danger/5 border-danger/20' 
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    contact.priority ? 'bg-danger/10' : 'bg-muted'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      contact.priority ? 'text-danger' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold">{t(contact.nameKey)}</p>
                    <p className="text-xl font-bold text-primary">{contact.number}</p>
                  </div>
                </div>
                <Button
                  variant={contact.priority ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => window.open(`tel:${contact.number}`)}
                  className="gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {t('call_now')}
                </Button>
              </div>
            )
          })}
        </div>

        {/* MAYDAY Instructions */}
        <div className="mt-4 p-4 bg-caution/10 border border-caution/20 rounded-lg">
          <p className="font-semibold text-sm mb-2">
            {isUrdu ? 'VHF چینل 16 پر میڈے کال' : 'MAYDAY Call on VHF Channel 16'}
          </p>
          <ol className={`text-sm text-muted-foreground space-y-1 ${isUrdu ? 'pr-4' : 'pl-4'} list-decimal`}>
            <li>{isUrdu ? '"میڈے میڈے میڈے" تین بار کہیں' : 'Say "MAYDAY MAYDAY MAYDAY" three times'}</li>
            <li>{isUrdu ? 'اپنے جہاز کا نام بتائیں' : 'State your vessel name'}</li>
            <li>{isUrdu ? 'اپنا مقام بتائیں' : 'Give your position'}</li>
            <li>{isUrdu ? 'مسئلے کی نوعیت بتائیں' : 'Describe the nature of distress'}</li>
            <li>{isUrdu ? 'سوار افراد کی تعداد بتائیں' : 'State number of persons on board'}</li>
          </ol>
        </div>

        <Button 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          className="w-full mt-2"
        >
          {t('close')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
