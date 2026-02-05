import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, Trash2 } from 'lucide-react'
import type { FeedbackItem, ToolbarTheme } from '../types'
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

/** Resolve the target element — use stored ref, fall back to querySelector */
function resolveElement(fb: FeedbackItem): HTMLElement | null {
  if (fb.targetElement?.isConnected) return fb.targetElement
  try {
    return document.querySelector(fb.selector) as HTMLElement | null
  } catch {
    return null
  }
}

export function FeedbackMarkers({ feedbacks, theme, zIndex, visible = true, accentColor, focusedMarkerId, editTargetId, onEditTriggered, onDelete, onUpdate }: FeedbackMarkersProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingFb, setEditingFb] = useState<FeedbackItem | null>(null)
  const [editContent, setEditContent] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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

  // Re-sync positions before every paint so React re-renders
  // don't reset DOM-manipulated left/top back to (0, 0)
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
    if (!editingFb || !editContent.trim()) return
    onUpdate?.(editingFb.id, editContent.trim())
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

  const editPopup = editingFb && (
    <div
      data-smart-inspector="edit-popup"
      style={{ ...getEditPopupOverlayStyle(), zIndex: zIndex + 10 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleEditCancel() }}
    >
      <div style={getEditPopupStyle(theme)} onKeyDown={handleEditKeyDown}>
        {/* Header — selector */}
        <div style={getEditPopupHeaderStyle(theme, accentColor)} title={editingFb.selector}>
          #{editingFb.stepNumber} — {editingFb.selector}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          style={getFeedbackTextareaStyle(theme)}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="Edit feedback..."
        />

        {/* Footer — cancel/save left, delete right */}
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
      {/* Active markers — positioned relative to target elements */}
      {active.map((fb) => {
        const isHovered = hoveredId === fb.id
        const isFocused = fb.id === focusedMarkerId
        return (
          <div
            key={fb.id}
            data-marker-id={fb.id}
            style={{
              ...getStepMarkerStyle(0, 0, accentColor),
              ...(isFocused ? getFocusedMarkerStyle(accentColor) : {}),
              pointerEvents: 'auto',
            }}
            onMouseEnter={() => setHoveredId(fb.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleEditOpen(fb)}
            title={`#${fb.stepNumber}: ${fb.content}`}
          >
            {isHovered ? <Pencil size={12} /> : fb.stepNumber}
            {isHovered && (
              <div style={getStepMarkerTooltipStyle(theme)}>
                <span style={getMarkerTooltipSelectorStyle(accentColor)}>{fb.selector}</span>
                {fb.content}
              </div>
            )}
          </div>
        )
      })}

      {/* Orphan markers — stacked at bottom-left */}
      {orphans.map((fb, i) => {
        const isHovered = hoveredId === fb.id
        return (
          <div
            key={fb.id}
            style={{ ...getOrphanMarkerStyle(i), pointerEvents: 'auto' }}
            onMouseEnter={() => setHoveredId(fb.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleEditOpen(fb)}
            title={`#${fb.stepNumber}: Element not found`}
          >
            {isHovered ? <Pencil size={12} /> : fb.stepNumber}
            {isHovered && (
              <div style={getStepMarkerTooltipStyle(theme)}>
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
      {createPortal(markers, document.body)}
      {editPopup && createPortal(editPopup, document.body)}
    </>
  )
}
