import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ToolbarTheme } from '../types'
import { getItemButtonStyle, getHoverBg } from '../styles'
import type { ReactNode } from 'react'

const TOOLTIP_DELAY_MS = 400

interface ToolbarButtonProps {
  icon: ReactNode
  label: string
  /** Description shown in tooltip popover */
  description?: string
  /** Keyboard shortcut hint shown in tooltip */
  shortcut?: string
  theme: ToolbarTheme
  tabIndex: number
  active?: boolean
  disabled?: boolean
  accentColor?: string
  /** Show tooltip above (default) or below the button */
  tooltipAbove?: boolean
  /** Base z-index for layering */
  zIndex?: number
  onClick: () => void
}

export function ToolbarButton({
  icon, label, description, shortcut, theme, tabIndex,
  active, disabled, accentColor, tooltipAbove = true, zIndex = 9999, onClick,
}: ToolbarButtonProps) {
  const [hovered, setHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const baseStyle = getItemButtonStyle(theme, active, disabled, accentColor)
  const style = {
    ...baseStyle,
    backgroundColor: hovered && !active && !disabled
      ? getHoverBg(theme)
      : baseStyle.backgroundColor,
  }

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
    timerRef.current = setTimeout(() => {
      setRect(buttonRef.current?.getBoundingClientRect() ?? null)
      setShowTooltip(true)
    }, TOOLTIP_DELAY_MS)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    setShowTooltip(false)
    clearTimeout(timerRef.current)
  }, [])

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  const handleClick = useCallback(() => {
    if (!disabled) onClick()
    setShowTooltip(false)
    clearTimeout(timerRef.current)
  }, [disabled, onClick])

  const isDark = theme === 'dark'
  const hasTooltip = showTooltip && description && rect

  const tooltipStyle: React.CSSProperties = rect ? {
    position: 'fixed',
    left: rect.left + rect.width / 2,
    ...(tooltipAbove
      ? { bottom: window.innerHeight - rect.top + 8 }
      : { top: rect.bottom + 8 }),
    transform: 'translateX(-50%)',
    padding: '6px 10px',
    backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
    border: `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: zIndex + 10,
    textAlign: 'center',
  } : {}

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        style={style}
        aria-label={label}
        aria-pressed={active || undefined}
        aria-disabled={disabled || undefined}
        tabIndex={tabIndex}
        disabled={disabled}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {icon}
      </button>
      {hasTooltip && createPortal(
        <div style={tooltipStyle} data-smart-inspector="tooltip">
          <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#e5e5e5' : '#1a1a1a', lineHeight: 1.3 }}>
            {label}
          </div>
          <div style={{ fontSize: 11, color: isDark ? '#999' : '#666', marginTop: 2, lineHeight: 1.3 }}>
            {description}
          </div>
          {shortcut && (
            <div style={{
              fontSize: 10,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
              color: isDark ? '#666' : '#999',
              marginTop: 3,
              lineHeight: 1,
            }}>
              {shortcut}
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  )
}
