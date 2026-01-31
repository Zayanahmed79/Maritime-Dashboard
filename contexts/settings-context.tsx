"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface SettingsContextType {
    aisStreamKey: string | null
    openWeatherKey: string | null
    setAisStreamKey: (key: string | null) => void
    setOpenWeatherKey: (key: string | null) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [aisStreamKey, setAisStreamKey] = useState<string | null>(null)
    const [openWeatherKey, setOpenWeatherKey] = useState<string | null>(null)

    useEffect(() => {
        // Load from localStorage
        const storedAisKey = localStorage.getItem("aisStreamKey")
        const storedWeatherKey = localStorage.getItem("openWeatherKey")
        if (storedAisKey) setAisStreamKey(storedAisKey)
        if (storedWeatherKey) setOpenWeatherKey(storedWeatherKey)
    }, [])

    const saveAisKey = (key: string | null) => {
        setAisStreamKey(key)
        if (key) localStorage.setItem("aisStreamKey", key)
        else localStorage.removeItem("aisStreamKey")
    }

    const saveWeatherKey = (key: string | null) => {
        setOpenWeatherKey(key)
        if (key) localStorage.setItem("openWeatherKey", key)
        else localStorage.removeItem("openWeatherKey")
    }

    return (
        <SettingsContext.Provider
            value={{
                aisStreamKey,
                openWeatherKey,
                setAisStreamKey: saveAisKey,
                setOpenWeatherKey: saveWeatherKey
            }}
        >
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error("useSettings must be used within SettingsProvider")
    }
    return context
}
