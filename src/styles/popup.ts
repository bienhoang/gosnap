import type { CSSProperties } from 'react'
import type { ToolbarTheme } from '../types'
import { THEME_MAP, DEFAULT_ACCENT_COLOR, getThemeColors } from './theme'

/** Full-screen overlay for popup dismissal */
export function getPopupOverlayStyle(zIndex: number): CSSProperties {
  return {
    position: 'fixed',
    inset: 0,
    zIndex: zIndex + 4,
  }
}

/** Shared popup container positioning + chrome (anchored above toolbar) */
export function getPopupContainerStyle(
  theme: ToolbarTheme,
  toolbarRect: DOMRect | null,
  zIndex: number,
  width?: number,
): CSSProperties {
  const colors = getThemeColors(theme)
  return {
    position: 'fixed',
    width: toolbarRect ? toolbarRect.width : (width ?? 280),
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 13,
    color: colors.text,
    zIndex: zIndex + 5,
    ...(toolbarRect
      ? { bottom: window.innerHeight - toolbarRect.top + 8, right: window.innerWidth - toolbarRect.right }
      : { bottom: 80, right: 20 }),
  }
}

/** Uppercase section label used in popups */
export function getPopupLabelStyle(theme: ToolbarTheme): CSSProperties {
  const colors = getThemeColors(theme)
  return {
    fontSize: 11,
    fontWeight: 600,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 6,
  }
}

export function getEditPopupOverlayStyle(): CSSProperties {
  return {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}

export function getEditPopupStyle(theme: ToolbarTheme): CSSProperties {
  const colors = THEME_MAP[theme]
  return {
    width: 340,
    padding: 16,
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0, 0, 0, 0.15)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 13,
  }
}

export function getEditPopupHeaderStyle(theme: ToolbarTheme, accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    color: accentColor,
    fontSize: 11,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  }
}

export function getEditPopupFooterStyle(): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  }
}

export function getEditPopupBtnStyle(theme: ToolbarTheme, variant: 'primary' | 'ghost' | 'danger', accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  const colors = THEME_MAP[theme]
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 14px',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 150ms ease',
  }
  if (variant === 'primary') {
    return { ...base, backgroundColor: accentColor, color: '#ffffff' }
  }
  if (variant === 'danger') {
    return { ...base, backgroundColor: 'transparent', color: '#ef4444', padding: '6px 10px' }
  }
  // ghost
  return { ...base, backgroundColor: 'transparent', color: colors.text, opacity: 0.7 }
}
