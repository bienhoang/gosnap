import type { CSSProperties } from 'react'
import type { ToolbarTheme } from '../types'
import { THEME_MAP, DEFAULT_ACCENT_COLOR, hexToRgba } from './theme'

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

export function getGroupMarkerStyle(left: number, top: number, accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    position: 'fixed',
    left,
    top,
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: accentColor,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    cursor: 'pointer',
    boxShadow: `0 2px 8px ${hexToRgba(accentColor, 0.4)}`,
    transition: 'transform 150ms ease',
    userSelect: 'none',
    zIndex: 1,
  }
}

export function getGroupOrphanBadgeStyle(): CSSProperties {
  return {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: 9,
    padding: '1px 4px',
    borderRadius: 8,
    fontWeight: 500,
    pointerEvents: 'none',
  }
}

export function getGroupTooltipStyle(theme: ToolbarTheme): CSSProperties {
  const colors = THEME_MAP[theme]
  return {
    position: 'absolute',
    left: 36,
    top: '50%',
    transform: 'translateY(-50%)',
    minWidth: 200,
    maxWidth: 300,
    padding: 12,
    backgroundColor: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    fontSize: 13,
    lineHeight: 1.5,
    whiteSpace: 'normal',
    zIndex: 1,
    pointerEvents: 'none',
  }
}

export function getAreaOnlyMarkerStyle(left: number, top: number, accentColor = DEFAULT_ACCENT_COLOR): CSSProperties {
  return {
    position: 'fixed',
    left,
    top,
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: 'transparent',
    color: accentColor,
    border: `2px dashed ${accentColor}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    cursor: 'pointer',
    transition: 'transform 150ms ease',
    userSelect: 'none',
    zIndex: 1,
  }
}
