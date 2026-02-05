import { useCallback } from 'react'
import { MessageSquare } from 'lucide-react'
import type { FeedbackItem, ToolbarTheme } from '../types'

interface FeedbackListPopupProps {
  feedbacks: FeedbackItem[]
  theme: ToolbarTheme
  accentColor: string
  onClose: () => void
  toolbarRect: DOMRect | null
  zIndex: number
}

export function FeedbackListPopup({
  feedbacks,
  theme,
  accentColor,
  onClose,
  toolbarRect,
  zIndex,
}: FeedbackListPopupProps) {
  const isDark = theme === 'dark'
  const bg = isDark ? '#1a1a1a' : '#ffffff'
  const text = isDark ? '#e5e5e5' : '#1a1a1a'
  const border = isDark ? '#333333' : '#e5e5e5'
  const mutedText = isDark ? '#888888' : '#999999'

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    width: toolbarRect ? toolbarRect.width : 320,
    maxHeight: 360,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: bg,
    border: `1px solid ${border}`,
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 13,
    color: text,
    zIndex: zIndex + 5,
    overflow: 'hidden',
    ...(toolbarRect
      ? { bottom: window.innerHeight - toolbarRect.top + 8, right: window.innerWidth - toolbarRect.right }
      : { bottom: 80, right: 20 }),
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '12px 14px',
    fontWeight: 700,
    fontSize: 13,
    borderBottom: `1px solid ${border}`,
    flexShrink: 0,
  }

  const listStyle: React.CSSProperties = {
    overflowY: 'auto',
    flex: 1,
  }

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    gap: 10,
    padding: '10px 14px',
    borderBottom: `1px solid ${border}`,
  }

  const numberStyle: React.CSSProperties = {
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentColor,
    color: '#ffffff',
    borderRadius: '50%',
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 1,
  }

  const selectorStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
    color: mutedText,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }

  const contentStyle: React.CSSProperties = {
    fontSize: 13,
    lineHeight: 1.4,
    wordBreak: 'break-word',
  }

  const emptyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 14px',
    color: mutedText,
    fontSize: 13,
    gap: 8,
  }

  return (
    <div
      data-smart-inspector="feedback-list-popup"
      style={{ position: 'fixed', inset: 0, zIndex: zIndex + 4 }}
      onMouseDown={handleOverlayClick}
    >
      <div style={popupStyle} onMouseDown={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <MessageSquare size={14} />
          Feedbacks ({feedbacks.length})
        </div>

        {/* List */}
        {feedbacks.length === 0 ? (
          <div style={emptyStyle}>
            <MessageSquare size={24} strokeWidth={1.5} />
            No feedbacks yet
          </div>
        ) : (
          <div style={listStyle}>
            {feedbacks.map((fb, i) => (
              <div key={fb.id} style={{ ...itemStyle, borderBottom: i === feedbacks.length - 1 ? 'none' : itemStyle.borderBottom }}>
                <div style={numberStyle}>{fb.stepNumber}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={contentStyle}>{fb.content}</div>
                  <div style={selectorStyle} title={fb.selector}>{fb.selector}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
