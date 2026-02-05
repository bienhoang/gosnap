import type { CSSProperties } from 'react'
import type { ToolbarPosition, ToolbarTheme } from './types'

// Position offsets
const POSITION_MAP: Record<ToolbarPosition, CSSProperties> = {
  'bottom-right': { bottom: 20, right: 20 },
  'bottom-left': { bottom: 20, left: 20 },
  'top-right': { top: 20, right: 20 },
  'top-left': { top: 20, left: 20 },
}

// Theme colors
const THEME_MAP: Record<ToolbarTheme, { bg: string; text: string; hover: string; border: string; divider: string; activeBg: string }> = {
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

export function getContainerStyle(position: ToolbarPosition, zIndex: number): CSSProperties {
  return {
    position: 'fixed',
    ...POSITION_MAP[position],
    zIndex,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    lineHeight: 1,
  }
}

export function getToolbarStyle(theme: ToolbarTheme, expanded: boolean): CSSProperties {
  const colors = THEME_MAP[theme]
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    padding: expanded ? '6px 8px' : '6px',
    backgroundColor: colors.bg,
    borderRadius: expanded ? 12 : 20,
    border: `1px solid ${colors.border}`,
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
  }
}

export function getTriggerButtonStyle(theme: ToolbarTheme): CSSProperties {
  const colors = THEME_MAP[theme]
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    padding: 0,
    border: 'none',
    borderRadius: 8,
    backgroundColor: 'transparent',
    color: colors.text,
    cursor: 'pointer',
    transition: 'background-color 150ms ease, transform 150ms ease',
    flexShrink: 0,
  }
}

export function getItemButtonStyle(theme: ToolbarTheme, active?: boolean, disabled?: boolean, accentColor?: string): CSSProperties {
  const colors = THEME_MAP[theme]
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    padding: 0,
    border: 'none',
    borderRadius: 8,
    backgroundColor: active ? (accentColor ?? colors.activeBg) : 'transparent',
    color: active ? '#ffffff' : colors.text,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'background-color 150ms ease, transform 150ms ease',
    flexShrink: 0,
  }
}

export function getDividerStyle(theme: ToolbarTheme): CSSProperties {
  const colors = THEME_MAP[theme]
  return {
    width: 1,
    height: 20,
    backgroundColor: colors.divider,
    flexShrink: 0,
    margin: '0 4px',
  }
}

export function getItemsContainerStyle(expanded: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    overflow: 'hidden',
    maxWidth: expanded ? 500 : 0,
    opacity: expanded ? 1 : 0,
    transition: 'max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease',
  }
}

export function getHoverBg(theme: ToolbarTheme): string {
  return THEME_MAP[theme].hover
}

export function getBadgeStyle(theme: ToolbarTheme, accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 5px',
    backgroundColor: accentColor,
    color: '#ffffff',
    borderRadius: 9,
    fontSize: 10,
    fontWeight: 700,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1,
    border: `2px solid ${THEME_MAP[theme].bg}`,
    boxSizing: 'border-box',
    pointerEvents: 'none',
  }
}

// --- Smart Inspector styles ---

export const DEFAULT_ACCENT_COLOR = '#3b82f6'

/** Convert 7-char hex (#rrggbb) to rgba. Falls back to default accent on invalid input. */
function hexToRgba(hex: string, alpha: number): string {
  const valid = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : DEFAULT_ACCENT_COLOR
  const r = parseInt(valid.slice(1, 3), 16)
  const g = parseInt(valid.slice(3, 5), 16)
  const b = parseInt(valid.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

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

// --- Feedback Popover styles ---

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

// --- Step Number Marker styles ---

export function getStepMarkerStyle(x: number, y: number, accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    position: 'fixed',
    left: x - 12,
    top: y - 12,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentColor,
    color: '#ffffff',
    borderRadius: '50%',
    fontSize: 11,
    fontWeight: 700,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxShadow: `0 2px 8px ${hexToRgba(accentColor, 0.4)}`,
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform 150ms ease',
    zIndex: 1,
  }
}

export function getOrphanMarkerStyle(index: number): CSSProperties {
  return {
    position: 'fixed',
    left: 20,
    bottom: 80 + index * 32,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '2px dashed #ef4444',
    borderRadius: '50%',
    fontSize: 11,
    fontWeight: 700,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    opacity: 0.6,
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform 150ms ease, opacity 150ms ease',
    zIndex: 1,
  }
}

export function getStepMarkerTooltipStyle(theme: ToolbarTheme): CSSProperties {
  const colors = THEME_MAP[theme]
  return {
    position: 'absolute',
    left: 32,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 'max-content',
    maxWidth: 260,
    padding: '8px 10px',
    backgroundColor: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: 12,
    lineHeight: 1.4,
    whiteSpace: 'pre-wrap' as const,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    pointerEvents: 'none' as const,
    wordBreak: 'break-word' as const,
  }
}

export function getMarkerTooltipSelectorStyle(accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    color: accentColor,
    fontSize: 10,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
    opacity: 0.8,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: 240,
    display: 'block',
    marginBottom: 2,
  }
}

export function getFocusedMarkerStyle(accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    transform: 'scale(1.2)',
    boxShadow: `0 0 0 3px white, 0 0 0 5px ${accentColor}, 0 2px 8px ${hexToRgba(accentColor, 0.4)}`,
    zIndex: 2,
  }
}

// --- Feedback Edit Popup styles ---

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
