import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, Trash2 } from '../icons'
import { usePortalContainer } from '../contexts/portal-context'
import type { FeedbackItem, ToolbarTheme, InspectedElement } from '../types'
import {
  getStepMarkerStyle,
  getFocusedMarkerStyle,
  getStepMarkerTooltipStyle,
  getMarkerTooltipSelectorStyle,
  getOrphanMarkerStyle,
  getEditPopupOverlayStyle,
  getEditPopupStyle,
  getEditPopupHeaderStyle,
  getEditPopupFooterStyle,
  getEditPopupBtnStyle,
  getFeedbackTextareaStyle,
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

/** Check if feedback is a multi-select (has elements array or areaData) */
function isMultiSelect(fb: FeedbackItem): boolean {
  return !!(fb.elements && fb.elements.length > 0) || !!fb.areaData
}

/** Resolve the target element — use stored ref, fall back to querySelector */
function resolveElement(fb: FeedbackItem): HTMLElement | null {
  if (fb.targetElement?.isConnected) return fb.targetElement
  if (!fb.selector) return null
  try {
    return document.querySelector(fb.selector) as HTMLElement | null
  } catch {
    return null
  }
}

export function FeedbackMarkers({ feedbacks, theme, zIndex, visible = true, accentColor, focusedMarkerId, editTargetId, onEditTriggered, onDelete, onUpdate }: FeedbackMarkersProps) {
  const portalContainer = usePortalContainer()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingFb, setEditingFb] = useState<FeedbackItem | null>(null)
  const [editContent, setEditContent] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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

  // Auto-focus textarea when edit popup opens
  useEffect(() => {
    if (editingFb && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [editingFb])

  const handleEditOpen = useCallback((fb: FeedbackItem) => {
    setEditingFb(fb)
    setEditContent(fb.content)
    setHoveredId(null)
  }, [])

  // Trigger edit popup when parent sets editTargetId (Enter key)
  useEffect(() => {
    if (!editTargetId) return
    const fb = feedbacks.find((f) => f.id === editTargetId)
    if (fb) handleEditOpen(fb)
    onEditTriggered?.()
  }, [editTargetId, feedbacks, handleEditOpen, onEditTriggered])

  const handleEditSave = useCallback(() => {
    const trimmed = editContent.trim()
    if (!trimmed || !editingFb) return
    onUpdate?.(editingFb.id, trimmed)
    setEditingFb(null)
  }, [editingFb, editContent, onUpdate])

  const handleEditDelete = useCallback(() => {
    if (!editingFb) return
    onDelete?.(editingFb)
    setEditingFb(null)
  }, [editingFb, onDelete])

  const handleEditCancel = useCallback(() => {
    setEditingFb(null)
  }, [])

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleEditCancel()
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleEditSave()
    }
  }, [handleEditCancel, handleEditSave])

  if (feedbacks.length === 0 || !visible) return null

  // Edit popup
  const editPopup = editingFb && (
    <div
      data-smart-inspector="edit-popup"
      style={{ ...getEditPopupOverlayStyle(), zIndex: zIndex + 10 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleEditCancel() }}
    >
      <div style={getEditPopupStyle(theme)} onKeyDown={handleEditKeyDown}>
        <div style={getEditPopupHeaderStyle(theme, accentColor)} title={editingFb.selector}>
          #{editingFb.stepNumber} — {isMultiSelect(editingFb)
            ? `${editingFb.areaData?.elementCount ?? editingFb.elements?.length ?? 0} elements`
            : editingFb.selector || 'Unknown'}
        </div>

        {/* Show element list for multi-select */}
        {isMultiSelect(editingFb) && editingFb.elements && editingFb.elements.length > 0 && (
          <details style={{ marginBottom: 8 }}>
            <summary style={{ cursor: 'pointer', fontSize: 12, opacity: 0.7, color: theme === 'dark' ? '#e5e5e5' : '#1a1a1a' }}>
              View elements
            </summary>
            <ul style={{ margin: '8px 0', paddingLeft: 20, fontSize: 12, color: theme === 'dark' ? '#e5e5e5' : '#1a1a1a', maxHeight: 120, overflowY: 'auto' }}>
              {editingFb.elements.map((el, i) => (
                <li key={el.selector + i} style={{ marginBottom: 2 }}>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>{el.tagName}: {el.selector.split('>').pop()?.trim()}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        {editingFb.isAreaOnly && (
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8, color: theme === 'dark' ? '#e5e5e5' : '#1a1a1a' }}>
            Empty area annotation
          </div>
        )}

        <textarea
          ref={textareaRef}
          style={getFeedbackTextareaStyle(theme)}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="Edit feedback..."
        />
        <div style={getEditPopupFooterStyle()}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" style={getEditPopupBtnStyle(theme, 'ghost', accentColor)} onClick={handleEditCancel}>
              Cancel
            </button>
            <button
              type="button"
              style={getEditPopupBtnStyle(theme, 'primary', accentColor)}
              onClick={handleEditSave}
              disabled={!editContent.trim()}
            >
              Save
            </button>
          </div>
          <button type="button" style={getEditPopupBtnStyle(theme, 'danger', accentColor)} onClick={handleEditDelete}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  )

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
      {editPopup && createPortal(editPopup, portalContainer)}
    </>
  )
}
