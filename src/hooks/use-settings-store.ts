import { useState, useCallback, useEffect } from 'react'
import type { ToolbarTheme, InspectMode } from '../types'

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
  inspectMode?: InspectMode
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
  // Load persisted settings once on mount (not 3 separate JSON.parse calls)
  const [{ theme, outputMode, markerColor, inspectMode }, setAll] = useState(() => {
    const saved = loadSettings()
    return {
      theme: saved.theme ?? defaultTheme,
      outputMode: saved.outputMode ?? ('detailed' as OutputMode),
      markerColor: saved.markerColor ?? MARKER_COLORS[0].value,
      inspectMode: (saved.inspectMode ?? 'dom') as InspectMode,
    }
  })

  // Persist on change
  useEffect(() => {
    saveSettings({ theme, outputMode, markerColor, inspectMode })
  }, [theme, outputMode, markerColor, inspectMode])

  const setTheme = useCallback((t: ToolbarTheme) => {
    setAll(prev => ({ ...prev, theme: t }))
  }, [])

  const toggleTheme = useCallback(() => {
    setAll(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))
  }, [])

  const setOutputMode = useCallback((mode: OutputMode) => {
    setAll(prev => ({ ...prev, outputMode: mode }))
  }, [])

  const setMarkerColor = useCallback((color: string) => {
    setAll(prev => ({ ...prev, markerColor: color }))
  }, [])

  const setInspectMode = useCallback((mode: InspectMode) => {
    setAll(prev => ({ ...prev, inspectMode: mode }))
  }, [])

  const toggleInspectMode = useCallback(() => {
    setAll(prev => ({ ...prev, inspectMode: prev.inspectMode === 'dom' ? 'component' : 'dom' }))
  }, [])

  return {
    theme,
    setTheme,
    toggleTheme,
    outputMode,
    setOutputMode,
    markerColor,
    setMarkerColor,
    inspectMode,
    setInspectMode,
    toggleInspectMode,
  }
}
