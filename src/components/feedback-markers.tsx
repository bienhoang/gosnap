import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import type { FeedbackItem, ToolbarTheme } from '../types'
import { getStepMarkerStyle, getStepMarkerTooltipStyle, getOrphanMarkerStyle } from '../styles'

interface FeedbackMarkersProps {
  feedbacks: FeedbackItem[]
  theme: ToolbarTheme
  zIndex: number
  onMarkerClick?: (feedback: FeedbackItem) => void
}

/** Resolve the target element — use stored ref, fall back to querySelector */
function resolveElement(fb: FeedbackItem): HTMLElement | null {
  if (fb.targetElement?.isConnected) return fb.targetElement
  return document.querySelector(fb.selector) as HTMLElement | null
}

export function FeedbackMarkers({ feedbacks, theme, zIndex, onMarkerClick }: FeedbackMarkersProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  const { active, orphans } = useMemo(() => {
    const active: FeedbackItem[] = []
    const orphans: FeedbackItem[] = []
    for (const fb of feedbacks) {
      if (fb.orphan) orphans.push(fb)
      else active.push(fb)
    }
    return { active, orphans }
  }, [feedbacks])

  // Update marker positions via direct DOM manipulation (avoids React re-render)
  const syncPositions = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    for (const fb of active) {
      const markerEl = container.querySelector(`[data-marker-id="${fb.id}"]`) as HTMLElement | null
      if (!markerEl) continue

      const target = resolveElement(fb)
      if (!target) {
        markerEl.style.display = 'none'
        continue
      }

      const rect = target.getBoundingClientRect()
      markerEl.style.display = 'flex'
      markerEl.style.left = `${rect.left + fb.offsetX - 12}px`
      markerEl.style.top = `${rect.top + fb.offsetY - 12}px`
    }
  }, [active])

  // Throttled sync using rAF
  const requestSync = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(syncPositions)
  }, [syncPositions])

  useEffect(() => {
    if (active.length === 0) return

    syncPositions()

    window.addEventListener('scroll', requestSync, true)
    window.addEventListener('resize', requestSync)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', requestSync, true)
      window.removeEventListener('resize', requestSync)
    }
  }, [active, syncPositions, requestSync])

  if (feedbacks.length === 0) return null

  const markers = (
    <div
      ref={containerRef}
      data-smart-inspector="feedback-markers"
      style={{ position: 'fixed', inset: 0, zIndex: zIndex + 1, pointerEvents: 'none' }}
    >
      {/* Active markers — positioned relative to target elements */}
      {active.map((fb) => (
        <div
          key={fb.id}
          data-marker-id={fb.id}
          style={{ ...getStepMarkerStyle(0, 0), pointerEvents: 'auto' }}
          onMouseEnter={() => setHoveredId(fb.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onMarkerClick?.(fb)}
          title={`#${fb.stepNumber}: ${fb.content}`}
        >
          {fb.stepNumber}
          {hoveredId === fb.id && (
            <div style={getStepMarkerTooltipStyle(theme)}>
              {fb.content}
            </div>
          )}
        </div>
      ))}

      {/* Orphan markers — stacked at bottom-left */}
      {orphans.map((fb, i) => (
        <div
          key={fb.id}
          style={{ ...getOrphanMarkerStyle(i), pointerEvents: 'auto' }}
          onMouseEnter={() => setHoveredId(fb.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onMarkerClick?.(fb)}
          title={`#${fb.stepNumber}: Element not found`}
        >
          {fb.stepNumber}
          {hoveredId === fb.id && (
            <div style={getStepMarkerTooltipStyle(theme)}>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>Element not found</span>
              {'\n'}
              {fb.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return createPortal(markers, document.body)
}
