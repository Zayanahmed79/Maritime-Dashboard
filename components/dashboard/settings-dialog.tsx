"use client"

import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { useSettings } from "@/contexts/settings-context"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import { toast } from "sonner"

export function SettingsDialog() {
    const { t, isUrdu, isBalochi } = useLanguage()
    const { aisStreamKey, openWeatherKey, setAisStreamKey, setOpenWeatherKey } = useSettings()
    const [open, setOpen] = useState(false)
    const [tempAisKey, setTempAisKey] = useState(aisStreamKey || "")
    const [tempWeatherKey, setTempWeatherKey] = useState(openWeatherKey || "")

    const handleSave = () => {
        setAisStreamKey(tempAisKey.trim() || null)
        setOpenWeatherKey(tempWeatherKey.trim() || null)
        setOpen(false)
        toast.success(t("settings.saved"))
    }

    const rtlClass = isUrdu || isBalochi ? "rtl text-right" : "ltr"

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title={t("settings.title")}>
                    <Settings className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className={rtlClass}>
                <DialogHeader>
                    <DialogTitle>{t("settings.title")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">{t("settings.api_keys")}</h4>
                        <p className="text-sm text-muted-foreground">
                            Enter API keys to enable real-time data. Without keys, simulated data is used.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ais-key">{t("settings.ais_key")}</Label>
                        <Input
                            id="ais-key"
                            value={tempAisKey}
                            onChange={(e) => setTempAisKey(e.target.value)}
                            placeholder="AISStream.io API Key"
                            className="font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="weather-key">{t("settings.weather_key")}</Label>
                        <Input
                            id="weather-key"
                            value={tempWeatherKey}
                            onChange={(e) => setTempWeatherKey(e.target.value)}
                            placeholder="OpenWeatherMap API Key"
                            className="font-mono text-sm"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave}>
                        {t("settings.save")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
