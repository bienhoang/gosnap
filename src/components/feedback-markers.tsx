import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Pencil } from '../icons'
import { usePortalContainer } from '../contexts/portal-context'
import type { FeedbackItem, ToolbarTheme } from '../types'
import { isMultiSelect } from '../utils/feedback-helpers'
import { resolveElement } from '../utils/dom-helpers'
import { FeedbackEditPopup } from './feedback-edit-popup'
import {
  getStepMarkerStyle,
  getFocusedMarkerStyle,
  getStepMarkerTooltipStyle,
  getMarkerTooltipSelectorStyle,
  getOrphanMarkerStyle,
  getGroupTooltipStyle,
  getAreaOnlyMarkerStyle,
} from '../styles'

interface FeedbackMarkersProps {
  feedbacks: FeedbackItem[]
  theme: ToolbarTheme
  zIndex: number
  /** When false, markers are hidden but feedbacks data is preserved */
  visible?: boolean
  accentColor?: string
  /** Highlight this marker with a focus ring (set by keyboard navigation) */
  focusedMarkerId?: string
  /** Trigger edit popup for this marker (set by Enter key) */
  editTargetId?: string
  /** Notify parent that edit was opened (clear editTargetId) */
  onEditTriggered?: () => void
  onDelete?: (feedback: FeedbackItem) => void
  onUpdate?: (id: string, content: string) => void
}

export function FeedbackMarkers({ feedbacks, theme, zIndex, visible = true, accentColor, focusedMarkerId, editTargetId, onEditTriggered, onDelete, onUpdate }: FeedbackMarkersProps) {
  const portalContainer = usePortalContainer()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingFb, setEditingFb] = useState<FeedbackItem | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  // Separate feedbacks into active and orphans
  const { active, orphans } = useMemo(() => {
    const active: FeedbackItem[] = []
    const orphans: FeedbackItem[] = []

    for (const fb of feedbacks) {
      // Multi-select items use areaData for positioning, not orphan status
      if (isMultiSelect(fb)) {
        active.push(fb)
      } else if (fb.orphan) {
        orphans.push(fb)
      } else {
        active.push(fb)
      }
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

      // Multi-select: use areaData center position
      if (isMultiSelect(fb) && fb.areaData) {
        markerEl.style.display = 'flex'
        markerEl.style.left = `${fb.areaData.centerX - window.scrollX - 12}px`
        markerEl.style.top = `${fb.areaData.centerY - window.scrollY - 12}px`
        continue
      }

      // Single element: use element position + offset
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

  // Re-sync positions before every paint
  useLayoutEffect(syncPositions)

  useEffect(() => {
    if (active.length === 0) return

    window.addEventListener('scroll', requestSync, true)
    window.addEventListener('resize', requestSync)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', requestSync, true)
      window.removeEventListener('resize', requestSync)
    }
  }, [active, syncPositions, requestSync])

  const handleEditOpen = useCallback((fb: FeedbackItem) => {
    setEditingFb(fb)
    setHoveredId(null)
  }, [])

  // Trigger edit popup when parent sets editTargetId (Enter key)
  useEffect(() => {
    if (!editTargetId) return
    const fb = feedbacks.find((f) => f.id === editTargetId)
    if (fb) handleEditOpen(fb)
    onEditTriggered?.()
  }, [editTargetId, feedbacks, handleEditOpen, onEditTriggered])

  const handleEditSave = useCallback((id: string, content: string) => {
    onUpdate?.(id, content)
    setEditingFb(null)
  }, [onUpdate])

  const handleEditDelete = useCallback((fb: FeedbackItem) => {
    onDelete?.(fb)
    setEditingFb(null)
  }, [onDelete])

  const handleEditCancel = useCallback(() => {
    setEditingFb(null)
  }, [])

  if (feedbacks.length === 0 || !visible) return null

  const markers = (
    <div
      ref={containerRef}
      data-smart-inspector="feedback-markers"
      style={{ position: 'fixed', inset: 0, zIndex: zIndex + 1, pointerEvents: 'none' }}
    >
      {/* Active markers */}
      {active.map((fb) => {
        const isHovered = hoveredId === fb.id
        const isFocused = fb.id === focusedMarkerId
        const isMulti = isMultiSelect(fb)
        const elementCount = fb.areaData?.elementCount ?? fb.elements?.length ?? 0

        const MarkerStyle = fb.isAreaOnly
          ? getAreaOnlyMarkerStyle(0, 0, accentColor)
          : getStepMarkerStyle(0, 0, accentColor)

        const ariaLabel = isMulti
          ? `Multi-select feedback ${fb.stepNumber}: ${fb.content}. ${elementCount} elements. Press Enter to edit.`
          : `Feedback ${fb.stepNumber}: ${fb.content}. Press Enter to edit.`

        return (
          <div
            key={fb.id}
            data-marker-id={fb.id}
            role="button"
            tabIndex={0}
            aria-label={ariaLabel}
            style={{
              ...MarkerStyle,
              ...(isFocused ? getFocusedMarkerStyle(accentColor) : {}),
              pointerEvents: 'auto',
            }}
            onMouseEnter={() => setHoveredId(fb.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleEditOpen(fb)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleEditOpen(fb) }}
            title={isMulti ? `#${fb.stepNumber}: ${elementCount} elements` : `#${fb.stepNumber}: ${fb.content}`}
          >
            {isHovered ? <Pencil size={12} /> : fb.stepNumber}
            {isHovered && (
              <div style={isMulti ? getGroupTooltipStyle(theme) : getStepMarkerTooltipStyle(theme)} role="tooltip">
                {isMulti && (
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {elementCount} element{elementCount !== 1 ? 's' : ''}{fb.isAreaOnly ? ' (empty area)' : ''}
                  </div>
                )}
                {isMulti && fb.elements && fb.elements.length > 0 && (
                  <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 8, maxHeight: 40, overflow: 'hidden' }}>
                    {fb.elements.map((el) => el.tagName).join(', ')}
                  </div>
                )}
                {!isMulti && <span style={getMarkerTooltipSelectorStyle(accentColor)}>{fb.selector}</span>}
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{fb.content}</div>
              </div>
            )}
          </div>
        )
      })}

      {/* Orphan markers */}
      {orphans.map((fb, i) => {
        const isHovered = hoveredId === fb.id
        return (
          <div
            key={fb.id}
            role="button"
            tabIndex={0}
            aria-label={`Orphaned feedback ${fb.stepNumber}: ${fb.content}. Element not found. Press Enter to edit.`}
            style={{ ...getOrphanMarkerStyle(i), pointerEvents: 'auto' }}
            onMouseEnter={() => setHoveredId(fb.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleEditOpen(fb)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleEditOpen(fb) }}
            title={`#${fb.stepNumber}: Element not found`}
          >
            {isHovered ? <Pencil size={12} /> : fb.stepNumber}
            {isHovered && (
              <div style={getStepMarkerTooltipStyle(theme)} role="tooltip">
                <span style={{ ...getMarkerTooltipSelectorStyle(accentColor), color: '#ef4444' }}>
                  Element not found — {fb.selector}
                </span>
                {fb.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <>
      {createPortal(markers, portalContainer)}
      {editingFb && createPortal(
        <FeedbackEditPopup
          feedback={editingFb}
          theme={theme}
          zIndex={zIndex}
          accentColor={accentColor}
          onSave={handleEditSave}
          onDelete={handleEditDelete}
          onCancel={handleEditCancel}
        />,
        portalContainer
      )}
    </>
  )
}
