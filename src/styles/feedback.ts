import type { CSSProperties } from 'react'
import type { ToolbarTheme } from '../types'
import { THEME_MAP, DEFAULT_ACCENT_COLOR } from './theme'

export function getFeedbackPopoverStyle(x: number, y: number, theme: ToolbarTheme): CSSProperties {
  const colors = THEME_MAP[theme]
  // Position popover to the right of click point, flip if near right edge
  const flipX = x > window.innerWidth - 320
  const flipY = y > window.innerHeight - 220

  return {
    position: 'fixed',
    left: flipX ? x - 288 : x + 16,
    top: flipY ? y - 180 : y + 16,
    width: 272,
    padding: 12,
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 13,
    zIndex: 1,
  }
}

export function getFeedbackTextareaStyle(theme: ToolbarTheme): CSSProperties {
  const colors = THEME_MAP[theme]
  return {
    width: '100%',
    minHeight: 72,
    padding: 8,
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontFamily: 'inherit',
    fontSize: 13,
    lineHeight: 1.5,
    resize: 'none' as const,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }
}

export function getFeedbackSubmitStyle(theme: ToolbarTheme, disabled: boolean, accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 14px',
    backgroundColor: disabled ? '#6b7280' : accentColor,
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'opacity 150ms ease',
  }
}

export function getFeedbackHeaderStyle(theme: ToolbarTheme): CSSProperties {
  const colors = THEME_MAP[theme]
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    color: colors.text,
    fontSize: 12,
    fontWeight: 600,
  }
}

export function getFeedbackCloseStyle(theme: ToolbarTheme): CSSProperties {
  const colors = THEME_MAP[theme]
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    padding: 0,
    border: 'none',
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: colors.text,
    cursor: 'pointer',
    opacity: 0.6,
  }
}
