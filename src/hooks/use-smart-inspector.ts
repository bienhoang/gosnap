import { useState, useEffect, useCallback, useRef } from 'react'
import type { InspectedElement, AreaBounds, InspectAreaEvent } from '../types'
import { buildInspectedElement } from '../utils/element-metadata'
import { normalizeArea, getElementsInArea } from '../utils/element-intersection'

/** Minimum distance (px) to differentiate drag from click */
const DRAG_THRESHOLD = 5

/** Event emitted when single element is clicked */
export interface InspectClickEvent {
  element: InspectedElement
  /** Viewport X where click occurred */
  clickX: number
  /** Viewport Y where click occurred */
  clickY: number
}

/** Drag area bounds in viewport coordinates (alias for AreaBounds) */
export type DragArea = AreaBounds

// Re-export for backward compatibility
export type { InspectAreaEvent }

/** Internal drag tracking state */
interface DragState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  isDragging: boolean
}

interface UseSmartInspectorOptions {
  active: boolean
  onInspect?: (element: InspectedElement) => void
  /** Enhanced callback with click coordinates for feedback positioning */
  onInspectClick?: (event: InspectClickEvent) => void
  /** Callback when area selection completes (drag) */
  onInspectArea?: (event: InspectAreaEvent) => void
  /** Ref to exclude from inspection (e.g. the toolbar itself) */
  excludeRef?: React.RefObject<HTMLElement | null>
}

/** Convert raw HTMLElements to InspectedElements */
function buildInspectedElements(elements: HTMLElement[]): InspectedElement[] {
  return elements.map(buildInspectedElement)
}

export function useSmartInspector({ active, onInspect, onInspectClick, onInspectArea, excludeRef }: UseSmartInspectorOptions) {
  const [hoveredElement, setHoveredElement] = useState<InspectedElement | null>(null)
  const [dragArea, setDragArea] = useState<DragArea | null>(null)
  const rafRef = useRef<number>(0)
  const dragRef = useRef<DragState | null>(null)

  /** Get actual event target, handling Shadow DOM retargeting */
  const getActualTarget = useCallback((e: MouseEvent): HTMLElement | null => {
    // composedPath()[0] gives the actual target even across shadow boundaries
    const path = e.composedPath()
    return path.length > 0 ? (path[0] as HTMLElement) : (e.target as HTMLElement | null)
  }, [])

  /** Check if target is inside our widget (handles Shadow DOM) */
  const isInsideWidget = useCallback((target: HTMLElement | null): boolean => {
    if (!target) return false
    // Check if inside excludeRef (toolbar)
    if (excludeRef?.current?.contains(target)) return true
    // Check for data-smart-inspector attribute
    if (target.closest?.('[data-smart-inspector]')) return true
    // Check if target is inside a shadow host with our tag name
    const host = target.getRootNode() as ShadowRoot | Document
    if (host instanceof ShadowRoot && host.host?.tagName?.toLowerCase() === 'pro-ui-feedbacks') {
      return true
    }
    return false
  }, [excludeRef])

  /** Handle mouse move for hover highlight and drag tracking */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Drag tracking (if dragging)
    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > DRAG_THRESHOLD) {
        dragRef.current.isDragging = true
        dragRef.current.currentX = e.clientX
        dragRef.current.currentY = e.clientY

        // Update drag area for overlay rendering
        const area = normalizeArea(
          dragRef.current.startX,
          dragRef.current.startY,
          e.clientX,
          e.clientY
        )
        setDragArea(area)
        setHoveredElement(null) // Clear hover while dragging
        return
      }
    }

    // Throttle hover detection via rAF
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      if (!target || target === document.documentElement || target === document.body) {
        setHoveredElement(null)
        return
      }
      // Skip widget elements (toolbar, overlays, etc.)
      if (isInsideWidget(target)) {
        setHoveredElement(null)
        return
      }
      setHoveredElement(buildInspectedElement(target))
    })
  }, [excludeRef, isInsideWidget])

  /** Handle mouse down to start potential drag */
  const handleMouseDown = useCallback((e: MouseEvent) => {
    // Only handle left click
    if (e.button !== 0) return

    const target = getActualTarget(e)
    // Skip widget elements (toolbar, overlays, etc.)
    if (isInsideWidget(target)) return

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      isDragging: false,
    }
  }, [getActualTarget, isInsideWidget])

  /** Handle mouse up to complete drag or click */
  const handleMouseUp = useCallback((e: MouseEvent) => {
    const drag = dragRef.current
    dragRef.current = null
    setDragArea(null)

    if (!drag) return

    const target = getActualTarget(e)
    // Skip widget elements (toolbar, overlays, etc.)
    if (isInsideWidget(target)) return

    if (drag.isDragging) {
      // Area selection complete
      const area = normalizeArea(drag.startX, drag.startY, e.clientX, e.clientY)

      // Skip if area is too small
      if (area.width < 10 && area.height < 10) return

      const rawElements = getElementsInArea(area, excludeRef)
      const elements = buildInspectedElements(rawElements)
      onInspectArea?.({ area, elements })
    } else {
      // Was click, not drag - existing single element flow
      e.preventDefault()
      e.stopPropagation()

      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      if (el && el !== document.documentElement && el !== document.body && !isInsideWidget(el)) {
        const inspected = buildInspectedElement(el)
        onInspect?.(inspected)
        onInspectClick?.({ element: inspected, clickX: e.clientX, clickY: e.clientY })
      }
    }
  }, [excludeRef, getActualTarget, isInsideWidget, onInspect, onInspectClick, onInspectArea])

  /** Clear drag state if mouse leaves window */
  const handleMouseLeave = useCallback(() => {
    if (dragRef.current) {
      dragRef.current = null
      setDragArea(null)
    }
  }, [])

  useEffect(() => {
    if (!active) {
      setHoveredElement(null)
      setDragArea(null)
      dragRef.current = null
      return
    }

    // Add cursor style to body
    document.body.style.cursor = 'crosshair'

    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('mousedown', handleMouseDown, true)
    document.addEventListener('mouseup', handleMouseUp, true)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.body.style.cursor = ''
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('mousedown', handleMouseDown, true)
      document.removeEventListener('mouseup', handleMouseUp, true)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [active, handleMouseMove, handleMouseDown, handleMouseUp, handleMouseLeave])

  return { hoveredElement, dragArea }
}
