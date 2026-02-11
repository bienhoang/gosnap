import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { usePortalContainer } from '../contexts/portal-context'
import type { InspectedElement, ToolbarTheme, InspectMode } from '../types'
import type { DragArea } from '../hooks/use-smart-inspector'
import { getElementsInArea } from '../utils/element-intersection'
import {
  getInspectorHighlightStyle,
  getInspectorTooltipStyle,
  getInspectorTooltipTextStyle,
  getInspectorTooltipDimStyle,
  getComponentHighlightStyle,
  getComponentTooltipNameStyle,
  getComponentTooltipSourceStyle,
  getDragSelectionRectStyle,
  getDragElementHighlightStyle,
  getDragCountBadgeStyle,
} from '../styles'

/** Shorten source path for display: '/app/src/components/Card.tsx' -> 'components/Card.tsx' */
function formatSourcePath(path: string): string {
  const cleaned = path.replace(/^(\.\/|\/app\/|\/src\/)/, '')
  const parts = cleaned.split('/')
  return parts.length > 3 ? parts.slice(-2).join('/') : cleaned
}

interface SmartInspectorOverlayProps {
  hoveredElement: InspectedElement | null
  /** Active drag area for selection rectangle rendering */
  dragArea?: DragArea | null
  theme: ToolbarTheme
  zIndex: number
  accentColor?: string
  /** Current inspection mode */
  inspectMode?: InspectMode
}

/** Maximum elements to highlight (performance guard) */
const MAX_HIGHLIGHTED = 50

export function SmartInspectorOverlay({ hoveredElement, dragArea, theme, zIndex, accentColor, inspectMode }: SmartInspectorOverlayProps) {
  const portalContainer = usePortalContainer()
  const [intersectingElements, setIntersectingElements] = useState<HTMLElement[]>([])
  const frameRef = useRef<number>(0)
  const frameCountRef = useRef(0)

  // Find intersecting elements during drag (throttled to every 2 frames for performance)
  useEffect(() => {
    if (!dragArea) {
      setIntersectingElements([])
      return
    }

    const update = () => {
      frameCountRef.current++
      // Update every 2 frames (~30fps) for smoother performance
      if (frameCountRef.current % 2 === 0) {
        const elements = getElementsInArea(dragArea)
        setIntersectingElements(elements.slice(0, MAX_HIGHLIGHTED))
      }
      frameRef.current = requestAnimationFrame(update)
    }

    frameRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frameRef.current)
  }, [dragArea])

  if (!hoveredElement && !dragArea) return null

  const overlay = (
    <div data-smart-inspector="true" style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: zIndex + 1 }}>
      {/* Drag area selection rectangle and element highlights */}
      {dragArea && (
        <>
          {/* Selection rectangle */}
          <div style={getDragSelectionRectStyle(dragArea.x, dragArea.y, dragArea.width, dragArea.height, accentColor)} />

          {/* Highlight each intersecting element */}
          {intersectingElements.map((el, i) => {
            const rect = el.getBoundingClientRect()
            return (
              <div key={i} style={getDragElementHighlightStyle(rect, accentColor)} />
            )
          })}

          {/* Count badge - positioned at top-right of selection area */}
          {intersectingElements.length > 0 && (
            <div style={getDragCountBadgeStyle(dragArea.x + dragArea.width, dragArea.y, accentColor)}>
              {intersectingElements.length >= MAX_HIGHLIGHTED ? `${MAX_HIGHLIGHTED}+` : intersectingElements.length} selected
            </div>
          )}
        </>
      )}

      {/* Single element hover highlight (only when not dragging) */}
      {hoveredElement && !dragArea && (() => {
        const ci = hoveredElement.componentInfo
        const isComponentMode = inspectMode === 'component' && ci
        return (
          <>
            {/* Highlight box — dashed for component, solid for DOM */}
            <div style={
              isComponentMode
                ? getComponentHighlightStyle(hoveredElement.rect, accentColor)
                : getInspectorHighlightStyle(hoveredElement.rect, accentColor)
            } />

            {/* Tooltip — component name or CSS selector */}
            <div style={getInspectorTooltipStyle(hoveredElement.rect, theme)}>
              {isComponentMode ? (
                <>
                  <span style={getComponentTooltipNameStyle(accentColor)}>
                    {'<'}{ci.name}{' />'}
                  </span>
                  {ci.source && (
                    <span style={getComponentTooltipSourceStyle(theme)}>
                      {formatSourcePath(ci.source.fileName)}:{ci.source.lineNumber}
                    </span>
                  )}
                  <span style={getInspectorTooltipDimStyle(theme)}>
                    {hoveredElement.dimensions.width} × {hoveredElement.dimensions.height}
                  </span>
                </>
              ) : (
                <>
                  <span style={getInspectorTooltipTextStyle(accentColor)}>{hoveredElement.selector}</span>
                  <span style={getInspectorTooltipDimStyle(theme)}>
                    {hoveredElement.dimensions.width} × {hoveredElement.dimensions.height}
                  </span>
                </>
              )}
            </div>
          </>
        )
      })()}
    </div>
  )

  return createPortal(overlay, portalContainer)
}
