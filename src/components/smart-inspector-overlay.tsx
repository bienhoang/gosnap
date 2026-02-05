import { createPortal } from 'react-dom'
import type { InspectedElement, ToolbarTheme } from '../types'
import {
  getInspectorHighlightStyle,
  getInspectorTooltipStyle,
  getInspectorTooltipTextStyle,
  getInspectorTooltipDimStyle,
} from '../styles'

interface SmartInspectorOverlayProps {
  hoveredElement: InspectedElement | null
  theme: ToolbarTheme
  zIndex: number
  accentColor?: string
}

export function SmartInspectorOverlay({ hoveredElement, theme, zIndex, accentColor }: SmartInspectorOverlayProps) {
  if (!hoveredElement) return null

  const { rect, selector, dimensions } = hoveredElement

  const overlay = (
    <div data-smart-inspector="true" style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: zIndex + 1 }}>
      {/* Highlight box */}
      <div style={getInspectorHighlightStyle(rect, accentColor)} />

      {/* Element info tooltip */}
      <div style={getInspectorTooltipStyle(rect, theme)}>
        <span style={getInspectorTooltipTextStyle(accentColor)}>{selector}</span>
        <span style={getInspectorTooltipDimStyle(theme)}>
          {dimensions.width} × {dimensions.height}
        </span>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
