import { useState, useCallback } from 'react'
import type { ToolbarTheme } from '../types'
import { getItemButtonStyle, getHoverBg } from '../styles'
import type { ReactNode } from 'react'

interface ToolbarButtonProps {
  icon: ReactNode
  label: string
  theme: ToolbarTheme
  tabIndex: number
  active?: boolean
  disabled?: boolean
  accentColor?: string
  onClick: () => void
}

export function ToolbarButton({ icon, label, theme, tabIndex, active, disabled, accentColor, onClick }: ToolbarButtonProps) {
  const [hovered, setHovered] = useState(false)
  const baseStyle = getItemButtonStyle(theme, active, disabled, accentColor)

  const style = {
    ...baseStyle,
    backgroundColor: hovered && !active && !disabled
      ? getHoverBg(theme)
      : baseStyle.backgroundColor,
  }

  const handleClick = useCallback(() => {
    if (!disabled) onClick()
  }, [disabled, onClick])

  return (
    <button
      type="button"
      style={style}
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      aria-disabled={disabled || undefined}
      tabIndex={tabIndex}
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
    </button>
  )
}
