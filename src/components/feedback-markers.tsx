import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { FeedbackItem, ToolbarTheme } from '../types'
import { getStepMarkerStyle, getStepMarkerTooltipStyle } from '../styles'

interface FeedbackMarkersProps {
  feedbacks: FeedbackItem[]
  theme: ToolbarTheme
  zIndex: number
  onMarkerClick?: (feedback: FeedbackItem) => void
}

/** Resolve the target element — use stored ref, fall back to querySelector */
function resolveElement(fb: FeedbackItem): HTMLElement | null {
  if (fb.targetElement.isConnected) return fb.targetElement
  return document.querySelector(fb.selector) as HTMLElement | null
}

export function FeedbackMarkers({ feedbacks, theme, zIndex, onMarkerClick }: FeedbackMarkersProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  // Update marker positions via direct DOM manipulation (avoids React re-render)
  const syncPositions = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    for (const fb of feedbacks) {
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
  }, [feedbacks])

  // Throttled sync using rAF
  const requestSync = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(syncPositions)
  }, [syncPositions])

  useEffect(() => {
    if (feedbacks.length === 0) return

    // Initial position sync
    syncPositions()

    // Re-sync on scroll (any scrollable ancestor) and resize
    window.addEventListener('scroll', requestSync, true)
    window.addEventListener('resize', requestSync)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', requestSync, true)
      window.removeEventListener('resize', requestSync)
    }
  }, [feedbacks, syncPositions, requestSync])

  if (feedbacks.length === 0) return null

  const markers = (
    <div
      ref={containerRef}
      data-smart-inspector="feedback-markers"
      style={{ position: 'fixed', inset: 0, zIndex: zIndex + 1, pointerEvents: 'none' }}
    >
      {feedbacks.map((fb) => (
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
    </div>
  )

  return createPortal(markers, document.body)
}
