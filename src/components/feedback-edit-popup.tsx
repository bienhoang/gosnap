import { useState, useRef, useEffect, useCallback } from 'react'
import { Trash2 } from '../icons'
import type { FeedbackItem, ToolbarTheme } from '../types'
import { isMultiSelect } from '../utils/feedback-helpers'
import {
  getEditPopupOverlayStyle,
  getEditPopupStyle,
  getEditPopupHeaderStyle,
  getEditPopupFooterStyle,
  getEditPopupBtnStyle,
  getFeedbackTextareaStyle,
} from '../styles'

interface FeedbackEditPopupProps {
  feedback: FeedbackItem
  theme: ToolbarTheme
  zIndex: number
  accentColor?: string
  onSave: (id: string, content: string) => void
  onDelete: (feedback: FeedbackItem) => void
  onCancel: () => void
}

export function FeedbackEditPopup({ feedback, theme, zIndex, accentColor, onSave, onDelete, onCancel }: FeedbackEditPopupProps) {
  const [editContent, setEditContent] = useState(feedback.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSave = useCallback(() => {
    const trimmed = editContent.trim()
    if (!trimmed) return
    onSave(feedback.id, trimmed)
  }, [feedback.id, editContent, onSave])

  const handleDelete = useCallback(() => {
    onDelete(feedback)
  }, [feedback, onDelete])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    }
  }, [onCancel, handleSave])

  const isMulti = isMultiSelect(feedback)
  const elementCount = feedback.areaData?.elementCount ?? feedback.elements?.length ?? 0

  return (
    <div
      data-smart-inspector="edit-popup"
      style={{ ...getEditPopupOverlayStyle(), zIndex: zIndex + 10 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div style={getEditPopupStyle(theme)} onKeyDown={handleKeyDown}>
        <div style={getEditPopupHeaderStyle(theme, accentColor)} title={feedback.selector}>
          #{feedback.stepNumber} — {isMulti
            ? `${elementCount} elements`
            : feedback.selector || 'Unknown'}
        </div>

        {/* Show element list for multi-select */}
        {isMulti && feedback.elements && feedback.elements.length > 0 && (
          <details style={{ marginBottom: 8 }}>
            <summary style={{ cursor: 'pointer', fontSize: 12, opacity: 0.7, color: theme === 'dark' ? '#e5e5e5' : '#1a1a1a' }}>
              View elements
            </summary>
            <ul style={{ margin: '8px 0', paddingLeft: 20, fontSize: 12, color: theme === 'dark' ? '#e5e5e5' : '#1a1a1a', maxHeight: 120, overflowY: 'auto' }}>
              {feedback.elements.map((el, i) => (
                <li key={el.selector + i} style={{ marginBottom: 2 }}>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>{el.tagName}: {el.selector.split('>').pop()?.trim()}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        {feedback.isAreaOnly && (
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
            <button type="button" style={getEditPopupBtnStyle(theme, 'ghost', accentColor)} onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              style={getEditPopupBtnStyle(theme, 'primary', accentColor)}
              onClick={handleSave}
              disabled={!editContent.trim()}
            >
              Save
            </button>
          </div>
          <button type="button" style={getEditPopupBtnStyle(theme, 'danger', accentColor)} onClick={handleDelete}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}
