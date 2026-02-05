import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Send } from 'lucide-react'
import type { InspectedElement, ToolbarTheme } from '../types'
import {
  getFeedbackPopoverStyle,
  getFeedbackTextareaStyle,
  getFeedbackSubmitStyle,
  getFeedbackHeaderStyle,
  getFeedbackCloseStyle,
} from '../styles'

interface FeedbackPopoverProps {
  x: number
  y: number
  inspectedElement: InspectedElement
  theme: ToolbarTheme
  zIndex: number
  stepNumber: number
  onSubmit: (content: string) => void
  onClose: () => void
}

export function FeedbackPopover({ x, y, inspectedElement, theme, zIndex, stepNumber, onSubmit, onClose }: FeedbackPopoverProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Auto-focus textarea on mount
    const timer = setTimeout(() => textareaRef.current?.focus(), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }, [text, onSubmit])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }, [handleSubmit, onClose])

  const isEmpty = text.trim().length === 0

  const popover = (
    <div
      data-smart-inspector="feedback-popover"
      style={{ position: 'fixed', inset: 0, zIndex: zIndex + 2 }}
      onClick={(e) => {
        // Close when clicking backdrop (outside popover)
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div style={getFeedbackPopoverStyle(x, y, theme)} onClick={(e) => e.stopPropagation()}>
        <div style={getFeedbackHeaderStyle(theme)}>
          <span>#{stepNumber} — {inspectedElement.selector}</span>
          <button type="button" style={getFeedbackCloseStyle(theme)} onClick={onClose} aria-label="Close">
            <X size={12} />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add your feedback..."
          style={getFeedbackTextareaStyle(theme)}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, opacity: 0.5, color: theme === 'dark' ? '#e5e5e5' : '#1a1a1a' }}>
            ⌘+Enter
          </span>
          <button
            type="button"
            style={getFeedbackSubmitStyle(theme, isEmpty)}
            onClick={handleSubmit}
            disabled={isEmpty}
          >
            <Send size={12} />
            Submit
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(popover, document.body)
}
