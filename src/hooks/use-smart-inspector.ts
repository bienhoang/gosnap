import { useState, useEffect, useCallback, useRef } from 'react'
import type { InspectedElement } from '../types'

/** Generate a simple CSS selector for an element */
function generateSelector(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  if (el.id) return `${tag}#${el.id}`
  const classes = Array.from(el.classList).join('.')
  return classes ? `${tag}.${classes}` : tag
}

/** Build InspectedElement metadata from a DOM element */
function buildInspectedElement(el: HTMLElement): InspectedElement {
  const rect = el.getBoundingClientRect()
  return {
    element: el,
    tagName: el.tagName.toLowerCase(),
    className: el.className,
    id: el.id,
    selector: generateSelector(el),
    rect,
    dimensions: { width: Math.round(rect.width), height: Math.round(rect.height) },
  }
}

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
  onDeactivate?: () => void
  /** Ref to exclude from inspection (e.g. the toolbar itself) */
  excludeRef?: React.RefObject<HTMLElement | null>
}

export function useSmartInspector({ active, onInspect, onInspectClick, onDeactivate, excludeRef }: UseSmartInspectorOptions) {
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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onDeactivate?.()
    }
  }, [onDeactivate])

  useEffect(() => {
    if (!active) {
      setHoveredElement(null)
      return
    }

    // Add cursor style to body
    document.body.style.cursor = 'crosshair'

    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('click', handleClick, true)
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.body.style.cursor = ''
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [active, handleMouseMove, handleClick, handleKeyDown])

  return { hoveredElement }
}
