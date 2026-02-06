import { useState, useCallback } from 'react'
import { MessageSquare, Copy, Check } from '../icons'
import type { FeedbackItem, ToolbarTheme } from '../types'
import { formatDebugSingle, formatDetailedSingle } from '../utils/format-feedbacks'
import { getThemeColors, getPopupOverlayStyle, getPopupContainerStyle } from '../styles'

interface FeedbackListPopupProps {
  feedbacks: FeedbackItem[]
  theme: ToolbarTheme
  accentColor: string
  outputMode: 'detailed' | 'debug'
  onClose: () => void
  toolbarRect: DOMRect | null
  zIndex: number
}

export function FeedbackListPopup({
  feedbacks,
  theme,
  accentColor,
  outputMode,
  onClose,
  toolbarRect,
  zIndex,
}: FeedbackListPopupProps) {
  const colors = getThemeColors(theme)
  const isDark = theme === 'dark'

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const handleCopyFeedback = useCallback((fb: FeedbackItem) => {
    const text = outputMode === 'debug' ? formatDebugSingle(fb) : formatDetailedSingle(fb)
    navigator.clipboard.writeText(text).catch(() => { /* silent */ })
    setCopiedId(fb.id)
    setTimeout(() => setCopiedId(null), 1500)
  }, [outputMode])

  const popupStyle: React.CSSProperties = {
    ...getPopupContainerStyle(theme, toolbarRect, zIndex, 320),
    maxHeight: 360,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '12px 14px',
    fontWeight: 700,
    fontSize: 13,
    borderBottom: `1px solid ${colors.border}`,
    flexShrink: 0,
  }

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    gap: 10,
    padding: '10px 14px',
    borderBottom: `1px solid ${colors.border}`,
    position: 'relative',
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
    color: colors.muted,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }

  const copyBtnStyle: React.CSSProperties = {
    position: 'absolute',
    top: 10,
    right: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    padding: 0,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
    color: colors.muted,
    cursor: 'pointer',
    transition: 'color 150ms ease',
  }

  return (
    <div
      data-smart-inspector="feedback-list-popup"
      style={getPopupOverlayStyle(zIndex)}
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
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 14px',
            color: colors.muted,
            fontSize: 13,
            gap: 8,
          }}>
            <MessageSquare size={24} strokeWidth={1.5} />
            No feedbacks yet
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {feedbacks.map((fb, i) => {
              const isHovered = hoveredId === fb.id
              const isCopied = copiedId === fb.id
              return (
                <div
                  key={fb.id}
                  style={{ ...itemStyle, borderBottom: i === feedbacks.length - 1 ? 'none' : itemStyle.borderBottom }}
                  onMouseEnter={() => setHoveredId(fb.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div style={numberStyle}>{fb.stepNumber}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.4, wordBreak: 'break-word' }}>{fb.content}</div>
                    <div style={selectorStyle} title={fb.selector}>{fb.selector}</div>
                  </div>
                  {(isHovered || isCopied) && (
                    <button
                      type="button"
                      style={{ ...copyBtnStyle, color: isCopied ? '#22c55e' : colors.muted }}
                      onClick={() => handleCopyFeedback(fb)}
                      title={isCopied ? 'Copied!' : 'Copy feedback'}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
