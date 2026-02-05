import { useState, useEffect, useCallback, useRef } from 'react'
import type { InspectedElement } from '../types'
import { buildInspectedElement } from '../utils/element-metadata'

export interface InspectClickEvent {
  element: InspectedElement
  /** Viewport X where click occurred */
  clickX: number
  /** Viewport Y where click occurred */
  clickY: number
}

interface UseSmartInspectorOptions {
  active: boolean
  onInspect?: (element: InspectedElement) => void
  /** Enhanced callback with click coordinates for feedback positioning */
  onInspectClick?: (event: InspectClickEvent) => void
  /** Ref to exclude from inspection (e.g. the toolbar itself) */
  excludeRef?: React.RefObject<HTMLElement | null>
}

export function useSmartInspector({ active, onInspect, onInspectClick, excludeRef }: UseSmartInspectorOptions) {
  const [hoveredElement, setHoveredElement] = useState<InspectedElement | null>(null)
  const rafRef = useRef<number>(0)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Throttle via rAF for smooth performance
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      if (!target || target === document.documentElement || target === document.body) {
        setHoveredElement(null)
        return
      }
      // Skip toolbar elements
      if (excludeRef?.current?.contains(target)) {
        setHoveredElement(null)
        return
      }
      // Skip our own overlay elements
      if (target.closest('[data-smart-inspector]')) {
        return
      }
      setHoveredElement(buildInspectedElement(target))
    })
  }, [excludeRef])

  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement | null
    // Let toolbar clicks through
    if (excludeRef?.current?.contains(target)) return
    // Let our overlay clicks through
    if (target?.closest('[data-smart-inspector]')) return

    e.preventDefault()
    e.stopPropagation()

    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    if (el && el !== document.documentElement && el !== document.body) {
      const inspected = buildInspectedElement(el)
      onInspect?.(inspected)
      onInspectClick?.({ element: inspected, clickX: e.clientX, clickY: e.clientY })
    }
  }, [excludeRef, onInspect, onInspectClick])

  useEffect(() => {
    if (!active) {
      setHoveredElement(null)
      return
    }

    // Add cursor style to body
    document.body.style.cursor = 'crosshair'

    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('click', handleClick, true)

    return () => {
      document.body.style.cursor = ''
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('click', handleClick, true)
    }
  }, [active, handleMouseMove, handleClick])

  return { hoveredElement }
}
