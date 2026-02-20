import type { CSSProperties } from 'react'
import type { ToolbarTheme } from '../types'
import { THEME_MAP, DEFAULT_ACCENT_COLOR, hexToRgba } from './theme'

export function getInspectorHighlightStyle(rect: DOMRect, accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    position: 'fixed',
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    border: `2px solid ${accentColor}`,
    backgroundColor: hexToRgba(accentColor, 0.08),
    borderRadius: 2,
    pointerEvents: 'none',
    transition: 'all 50ms ease-out',
  }
}

export function getInspectorTooltipStyle(rect: DOMRect, theme: ToolbarTheme): CSSProperties {
  const colors = THEME_MAP[theme]
  // Position tooltip below element, or above if near bottom of viewport
  const spaceBelow = window.innerHeight - rect.bottom
  const placeAbove = spaceBelow < 60

  return {
    position: 'fixed',
    left: Math.max(4, rect.left),
    ...(placeAbove
      ? { bottom: window.innerHeight - rect.top + 6 }
      : { top: rect.bottom + 6 }),
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 8px',
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
    fontSize: 11,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    maxWidth: 400,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
}

export function getInspectorTooltipTextStyle(accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    color: accentColor,
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
}

export function getInspectorTooltipDimStyle(theme: ToolbarTheme): CSSProperties {
  const colors = THEME_MAP[theme]
  return {
    color: colors.text,
    opacity: 0.6,
    flexShrink: 0,
  }
}

/** Component mode: dashed highlight around component boundary */
export function getComponentHighlightStyle(rect: DOMRect, accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    position: 'fixed',
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    border: `2px dashed ${accentColor}`,
    backgroundColor: hexToRgba(accentColor, 0.05),
    borderRadius: 4,
    pointerEvents: 'none',
    transition: 'all 80ms ease-out',
  }
}

/** Component tooltip: component name style */
export function getComponentTooltipNameStyle(accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    color: accentColor,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
}

/** Component tooltip: source path style */
export function getComponentTooltipSourceStyle(theme: ToolbarTheme): CSSProperties {
  return {
    fontSize: 10,
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
}

export function getDragSelectionRectStyle(x: number, y: number, w: number, h: number, accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    position: 'absolute',
    left: x,
    top: y,
    width: w,
    height: h,
    border: `2px dashed ${accentColor}`,
    backgroundColor: hexToRgba(accentColor, 0.06),
    borderRadius: 4,
    pointerEvents: 'none',
  }
}

export function getDragElementHighlightStyle(rect: DOMRect, accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    position: 'fixed',
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    backgroundColor: hexToRgba(accentColor, 0.15),
    border: `1px solid ${accentColor}`,
    borderRadius: 2,
    pointerEvents: 'none',
  }
}

export function getDragCountBadgeStyle(x: number, y: number, accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    position: 'absolute',
    left: x + 8,
    top: y,
    backgroundColor: accentColor,
    color: '#ffffff',
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
  }
}
