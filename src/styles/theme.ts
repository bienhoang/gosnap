import type { CSSProperties } from 'react'
import type { ToolbarPosition, ToolbarTheme } from '../types'

/** Position offsets for toolbar placement */
export const POSITION_MAP: Record<ToolbarPosition, CSSProperties> = {
  'bottom-right': { bottom: 20, right: 20 },
  'bottom-left': { bottom: 20, left: 20 },
  'top-right': { top: 20, right: 20 },
  'top-left': { top: 20, left: 20 },
}

/** Theme color tokens */
export const THEME_MAP: Record<ToolbarTheme, { bg: string; text: string; hover: string; border: string; divider: string; activeBg: string }> = {
  dark: {
    bg: '#1a1a1a',
    text: '#e5e5e5',
    hover: '#2a2a2a',
    border: '#333333',
    divider: '#333333',
    activeBg: '#3b82f6',
  },
  light: {
    bg: '#ffffff',
    text: '#1a1a1a',
    hover: '#f5f5f5',
    border: '#e5e5e5',
    divider: '#e5e5e5',
    activeBg: '#3b82f6',
  },
}

export const DEFAULT_ACCENT_COLOR = '#3b82f6'

/** Convert 7-char hex (#rrggbb) to rgba. Falls back to default accent on invalid input. */
export function hexToRgba(hex: string, alpha: number): string {
  const valid = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : DEFAULT_ACCENT_COLOR
  const r = parseInt(valid.slice(1, 3), 16)
  const g = parseInt(valid.slice(3, 5), 16)
  const b = parseInt(valid.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function getHoverBg(theme: ToolbarTheme): string {
  return THEME_MAP[theme].hover
}

/** Derive common theme colors used by popup components */
export function getThemeColors(theme: ToolbarTheme) {
  const t = THEME_MAP[theme]
  return {
    bg: t.bg,
    text: t.text,
    border: t.border,
    muted: theme === 'dark' ? '#888888' : '#999999',
    hover: t.hover,
  }
}
