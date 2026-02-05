import { useCallback } from 'react'
import { Sun, Moon } from 'lucide-react'
import type { ToolbarTheme } from '../types'
import type { OutputMode } from '../hooks/use-settings-store'
import { MARKER_COLORS } from '../hooks/use-settings-store'

const PKG_NAME = 'Pro UI Feedbacks'
const PKG_VERSION = '0.2.1'

interface SettingsPopupProps {
  theme: ToolbarTheme
  outputMode: OutputMode
  markerColor: string
  onToggleTheme: () => void
  onOutputModeChange: (mode: OutputMode) => void
  onMarkerColorChange: (color: string) => void
  onClose: () => void
  /** Position rect of the toolbar for anchoring */
  toolbarRect: DOMRect | null
  zIndex: number
}

export function SettingsPopup({
  theme,
  outputMode,
  markerColor,
  onToggleTheme,
  onOutputModeChange,
  onMarkerColorChange,
  onClose,
  toolbarRect,
  zIndex,
}: SettingsPopupProps) {
  const isDark = theme === 'dark'
  const bg = isDark ? '#1a1a1a' : '#ffffff'
  const text = isDark ? '#e5e5e5' : '#1a1a1a'
  const border = isDark ? '#333333' : '#e5e5e5'
  const mutedText = isDark ? '#888888' : '#999999'
  const hoverBg = isDark ? '#2a2a2a' : '#f5f5f5'

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  // Calculate popup position above toolbar
  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    width: toolbarRect ? toolbarRect.width : 280,
    padding: 14,
    backgroundColor: bg,
    border: `1px solid ${border}`,
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 13,
    color: text,
    zIndex: zIndex + 5,
    ...(toolbarRect
      ? { bottom: window.innerHeight - toolbarRect.top + 8, right: window.innerWidth - toolbarRect.right }
      : { bottom: 80, right: 20 }),
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: mutedText,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 6,
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const segmentedStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '5px 0',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    backgroundColor: isActive ? (isDark ? '#2a2a2a' : '#e5e5e5') : 'transparent',
    color: isActive ? text : mutedText,
    transition: 'all 150ms ease',
  })

  const colorSwatchStyle = (color: string, isActive: boolean): React.CSSProperties => ({
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: color,
    border: isActive ? '2px solid white' : '2px solid transparent',
    boxShadow: isActive ? `0 0 0 2px ${color}` : 'none',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    flexShrink: 0,
  })

  const themeToggleBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 0,
    border: `1px solid ${border}`,
    borderRadius: 6,
    backgroundColor: hoverBg,
    color: text,
    cursor: 'pointer',
    transition: 'all 150ms ease',
    flexShrink: 0,
  }

  return (
    <div
      data-smart-inspector="settings-popup"
      style={{ position: 'fixed', inset: 0, zIndex: zIndex + 4 }}
      onMouseDown={handleOverlayClick}
    >
      <div style={popupStyle} onMouseDown={(e) => e.stopPropagation()}>
        {/* Row 1: Header — package name + version + theme toggle */}
        <div style={{ ...rowStyle, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{PKG_NAME}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: mutedText }}>v{PKG_VERSION}</span>
            <button
              type="button"
              style={themeToggleBtnStyle}
              onClick={onToggleTheme}
              title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: border, margin: '0 -14px 12px', }} />

        {/* Row 2: Output Setting */}
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>Output Setting</div>
          <div style={{
            display: 'flex',
            gap: 2,
            padding: 3,
            backgroundColor: isDark ? '#111111' : '#f0f0f0',
            borderRadius: 8,
          }}>
            <button
              type="button"
              style={segmentedStyle(outputMode === 'detailed')}
              onClick={() => onOutputModeChange('detailed')}
            >
              Detailed
            </button>
            <button
              type="button"
              style={segmentedStyle(outputMode === 'debug')}
              onClick={() => onOutputModeChange('debug')}
            >
              Debug
            </button>
          </div>
        </div>

        {/* Row 3: Marker Color */}
        <div>
          <div style={labelStyle}>Marker Color</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {MARKER_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                style={colorSwatchStyle(c.value, markerColor === c.value)}
                onClick={() => onMarkerColorChange(c.value)}
                title={c.name}
                aria-label={`Set marker color to ${c.name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
