import { useState, useCallback, useEffect } from 'react'
import type { ToolbarTheme } from '../types'

const SETTINGS_KEY = 'pro-ui-settings'

export type OutputMode = 'detailed' | 'debug'

export const MARKER_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
] as const

interface PersistedSettings {
  theme?: ToolbarTheme
  outputMode?: OutputMode
  markerColor?: string
}

function loadSettings(): PersistedSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveSettings(settings: PersistedSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // silent
  }
}

export function useSettingsStore(defaultTheme: ToolbarTheme) {
  const [theme, setThemeState] = useState<ToolbarTheme>(() => {
    const saved = loadSettings()
    return saved.theme ?? defaultTheme
  })

  const [outputMode, setOutputModeState] = useState<OutputMode>(() => {
    const saved = loadSettings()
    return saved.outputMode ?? 'detailed'
  })

  const [markerColor, setMarkerColorState] = useState<string>(() => {
    const saved = loadSettings()
    return saved.markerColor ?? MARKER_COLORS[0].value
  })

  // Persist on change
  useEffect(() => {
    saveSettings({ theme, outputMode, markerColor })
  }, [theme, outputMode, markerColor])

  const setTheme = useCallback((t: ToolbarTheme) => {
    setThemeState(t)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const setOutputMode = useCallback((mode: OutputMode) => {
    setOutputModeState(mode)
  }, [])

  const setMarkerColor = useCallback((color: string) => {
    setMarkerColorState(color)
  }, [])

  return {
    theme,
    setTheme,
    toggleTheme,
    outputMode,
    setOutputMode,
    markerColor,
    setMarkerColor,
  }
}
