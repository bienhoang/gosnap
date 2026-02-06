import type { CSSProperties } from 'react'
import type { ToolbarPosition, ToolbarTheme } from '../types'
import { POSITION_MAP, THEME_MAP, DEFAULT_ACCENT_COLOR } from './theme'

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
    gap: expanded ? 2 : 0,
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
