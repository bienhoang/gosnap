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
}

export function SmartInspectorOverlay({ hoveredElement, theme, zIndex }: SmartInspectorOverlayProps) {
  if (!hoveredElement) return null

  const { rect, selector, dimensions } = hoveredElement

  const overlay = (
    <div data-smart-inspector="true" style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: zIndex + 1 }}>
      {/* Highlight box */}
      <div style={getInspectorHighlightStyle(rect)} />

      {/* Element info tooltip */}
      <div style={getInspectorTooltipStyle(rect, theme)}>
        <span style={getInspectorTooltipTextStyle()}>{selector}</span>
        <span style={getInspectorTooltipDimStyle(theme)}>
          {dimensions.width} × {dimensions.height}
        </span>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
