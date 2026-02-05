import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, Play, Pause, MessageSquare, Copy, Trash2, Settings, X } from 'lucide-react'
import type { ProUIFeedbacksProps, InspectedElement } from '../types'
import type { InspectClickEvent } from '../hooks/use-smart-inspector'
import {
  getContainerStyle,
  getToolbarStyle,
  getTriggerButtonStyle,
  getDividerStyle,
  getItemsContainerStyle,
  getHoverBg,
} from '../styles'
import { ToolbarButton } from './toolbar-button'
import { useSmartInspector } from '../hooks/use-smart-inspector'
import { useFeedbackStore } from '../hooks/use-feedback-store'
import { SmartInspectorOverlay } from './smart-inspector-overlay'
import { FeedbackPopover } from './feedback-popover'
import { FeedbackMarkers } from './feedback-markers'

const ICON_SIZE = 16

interface PendingFeedback {
  x: number
  y: number
  element: InspectedElement
}

export function ProUIFeedbacks({
  onToggle,
  onInspect,
  onFeedbackSubmit,
  onFeedbackDelete,
  onFeedback,
  onCopy,
  onDelete,
  onSettings,
  position = 'bottom-right',
  theme = 'dark',
  defaultCollapsed = true,
  zIndex = 9999,
  triggerIcon,
  style,
}: ProUIFeedbacksProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [active, setActive] = useState(false)
  const [triggerHovered, setTriggerHovered] = useState(false)
  const [focusIndex, setFocusIndex] = useState(-1)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback | null>(null)

  const { feedbacks, addFeedback, deleteFeedback, clearFeedbacks } = useFeedbackStore()

  const expanded = !collapsed

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleDeactivate = useCallback(() => {
    setActive(false)
    setPendingFeedback(null)
    onToggle?.(false)
  }, [onToggle])

  const handleInspectClick = useCallback((event: InspectClickEvent) => {
    onInspect?.(event.element)
    // Open feedback popover at click position
    setPendingFeedback({
      x: event.clickX,
      y: event.clickY,
      element: event.element,
    })
  }, [onInspect])

  // Smart Inspector hook
  const { hoveredElement } = useSmartInspector({
    active: active && !pendingFeedback, // pause hover when popover is open
    onInspectClick: handleInspectClick,
    onDeactivate: handleDeactivate,
    excludeRef: toolbarRef,
  })

  const handleFeedbackSubmit = useCallback((content: string) => {
    if (!pendingFeedback) return
    const item = addFeedback(content, pendingFeedback.x, pendingFeedback.y, pendingFeedback.element)
    onFeedbackSubmit?.(item)
    setPendingFeedback(null)
  }, [pendingFeedback, addFeedback, onFeedbackSubmit])

  const handleFeedbackClose = useCallback(() => {
    setPendingFeedback(null)
  }, [])

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      if (!next) setTimeout(() => setFocusIndex(0), 300)
      else setFocusIndex(-1)
      return next
    })
  }, [])

  const handleToggle = useCallback(() => {
    setActive((prev) => {
      const next = !prev
      if (!next) setPendingFeedback(null)
      onToggle?.(next)
      return next
    })
  }, [onToggle])

  const handleClose = useCallback(() => {
    if (active) {
      setActive(false)
      setPendingFeedback(null)
      onToggle?.(false)
    }
    setCollapsed(true)
    setFocusIndex(-1)
  }, [active, onToggle])

  const handleDeleteAll = useCallback(() => {
    clearFeedbacks()
    onDelete?.()
  }, [clearFeedbacks, onDelete])

  // Build the pre-configured items
  const items = [
    { id: 'toggle', icon: active ? <Pause size={ICON_SIZE} /> : <Play size={ICON_SIZE} />, label: active ? 'Stop' : 'Start', onClick: handleToggle, active },
    { id: 'feedback', icon: <MessageSquare size={ICON_SIZE} />, label: `Feedbacks (${feedbacks.length})`, onClick: onFeedback ?? (() => {}) },
    { id: 'copy', icon: <Copy size={ICON_SIZE} />, label: 'Copy', onClick: onCopy ?? (() => {}) },
    { id: 'delete', icon: <Trash2 size={ICON_SIZE} />, label: 'Delete All', onClick: handleDeleteAll },
    { id: 'settings', icon: <Settings size={ICON_SIZE} />, label: 'Settings', onClick: onSettings ?? (() => {}) },
    { id: 'close', icon: <X size={ICON_SIZE} />, label: 'Close', onClick: handleClose },
  ]

  // Keyboard navigation (roving tabindex)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (collapsed) return
      const count = items.length

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusIndex((prev) => (prev + 1) % count)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusIndex((prev) => (prev - 1 + count) % count)
      } else if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === 'Home') {
        e.preventDefault()
        setFocusIndex(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setFocusIndex(count - 1)
      }
    },
    [collapsed, items.length, handleClose]
  )

  // Focus management via DOM query
  useEffect(() => {
    if (focusIndex >= 0 && toolbarRef.current) {
      const buttons = toolbarRef.current.querySelectorAll<HTMLButtonElement>('[role="toolbar"] button[aria-label]:not([aria-expanded])')
      buttons[focusIndex]?.focus()
    }
  }, [focusIndex])

  // Close on click outside (only when inspector is NOT active)
  useEffect(() => {
    if (collapsed || active) return

    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setCollapsed(true)
        setFocusIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [collapsed, active])

  if (!mounted) return null

  const containerStyle = {
    ...getContainerStyle(position, zIndex),
    ...style,
  }

  const triggerStyle = {
    ...getTriggerButtonStyle(theme),
    backgroundColor: triggerHovered ? getHoverBg(theme) : 'transparent',
  }

  const toolbar = (
    <div ref={toolbarRef} style={containerStyle}>
      <div
        role="toolbar"
        aria-label="Pro UI Feedbacks"
        aria-orientation="horizontal"
        style={getToolbarStyle(theme, expanded)}
        onKeyDown={handleKeyDown}
      >
        {/* Trigger button - opens/collapses */}
        <button
          type="button"
          style={triggerStyle}
          onClick={toggleCollapsed}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse toolbar' : 'Expand toolbar'}
          onMouseEnter={() => setTriggerHovered(true)}
          onMouseLeave={() => setTriggerHovered(false)}
        >
          {triggerIcon || <Menu size={18} />}
        </button>

        {/* Pre-configured items with animation */}
        <div style={expanded ? getDividerStyle(theme) : { width: 0, transition: 'width 200ms ease' }} />
        <div style={getItemsContainerStyle(expanded)}>
          {items.map((item, index) => (
            <ToolbarButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              theme={theme}
              tabIndex={index === focusIndex ? 0 : -1}
              active={item.active}
              onClick={item.onClick}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {createPortal(toolbar, document.body)}
      {active && !pendingFeedback && (
        <SmartInspectorOverlay hoveredElement={hoveredElement} theme={theme} zIndex={zIndex} />
      )}
      {pendingFeedback && (
        <FeedbackPopover
          x={pendingFeedback.x}
          y={pendingFeedback.y}
          inspectedElement={pendingFeedback.element}
          theme={theme}
          zIndex={zIndex}
          stepNumber={feedbacks.length + 1}
          onSubmit={handleFeedbackSubmit}
          onClose={handleFeedbackClose}
        />
      )}
      <FeedbackMarkers
        feedbacks={feedbacks}
        theme={theme}
        zIndex={zIndex}
        onMarkerClick={(fb) => {
          deleteFeedback(fb.id)
          onFeedbackDelete?.(fb.id)
        }}
      />
    </>
  )
}
