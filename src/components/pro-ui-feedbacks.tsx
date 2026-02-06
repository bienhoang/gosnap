import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, Play, Pause, MessageSquare, Copy, Check, Trash2, Settings, X } from '../icons'
import type { ProUIFeedbacksProps, InspectedElement } from '../types'
import type { InspectClickEvent, InspectAreaEvent, DragArea } from '../hooks/use-smart-inspector'
import {
  getContainerStyle,
  getToolbarStyle,
  getTriggerButtonStyle,
  getDividerStyle,
  getItemsContainerStyle,
  getHoverBg,
  getBadgeStyle,
} from '../styles'
import { ToolbarButton } from './toolbar-button'
import { useSmartInspector } from '../hooks/use-smart-inspector'
import { useFeedbackStore } from '../hooks/use-feedback-store'
import { useKeyboardShortcuts, isInputFocused } from '../hooks/use-keyboard-shortcuts'
import { useSettingsStore } from '../hooks/use-settings-store'
import { usePathname } from '../hooks/use-pathname'
import { buildPersistKey } from '../utils/feedback-persistence'
import { formatDetailed, formatDebug } from '../utils/format-feedbacks'
import { SmartInspectorOverlay } from './smart-inspector-overlay'
import { FeedbackPopover } from './feedback-popover'
import { FeedbackMarkers } from './feedback-markers'
import { SettingsPopup } from './settings-popup'
import { FeedbackListPopup } from './feedback-list-popup'
import { PortalContext } from '../contexts/portal-context'

const ICON_SIZE = 16

interface PendingFeedback {
  x: number
  y: number
  element: InspectedElement
}

interface PendingAreaFeedback {
  area: DragArea
  elements: InspectedElement[]
}

export function ProUIFeedbacks({
  onToggle,
  onInspect,
  onFeedbackSubmit,
  onFeedbackDelete,
  onFeedbackUpdate,
  onFeedback,
  onCopy,
  onDelete,
  onSettings,
  position = 'bottom-right',
  theme: themeProp = 'dark',
  defaultCollapsed = true,
  zIndex = 9999,
  triggerIcon,
  style,
  persist,
  portalContainer,
}: ProUIFeedbacksProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [active, setActive] = useState(false)
  const [triggerHovered, setTriggerHovered] = useState(false)
  const [focusIndex, setFocusIndex] = useState(-1)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [feedbackListOpen, setFeedbackListOpen] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback | null>(null)
  const [pendingAreaFeedback, setPendingAreaFeedback] = useState<PendingAreaFeedback | null>(null)
  const [focusedMarkerIndex, setFocusedMarkerIndex] = useState<number | null>(null)
  const [editTargetId, setEditTargetId] = useState<string | null>(null)
  const [copiedRecently, setCopiedRecently] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const pathname = usePathname()
  const persistKey = persist ? buildPersistKey(persist, pathname) : undefined
  const { feedbacks, addFeedback, addGroupFeedback, updateFeedback, deleteFeedback, clearFeedbacks, undoDelete, canUndo } = useFeedbackStore(persistKey)
  const settings = useSettingsStore(themeProp)
  const theme = settings.theme
  const accentColor = settings.markerColor

  const expanded = !collapsed

  // Reset inspector/popups on page change
  const prevPathnameRef = useRef(pathname)
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      setActive(false)
      setPendingFeedback(null)
      setPendingAreaFeedback(null)
      setSettingsOpen(false)
      setFeedbackListOpen(false)
      setFocusedMarkerIndex(null)
      setEditTargetId(null)
    }
  }, [pathname])

  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
      clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  const handleDeactivate = useCallback(() => {
    setActive(false)
    setPendingFeedback(null)
    setPendingAreaFeedback(null)
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

  const handleInspectArea = useCallback((event: InspectAreaEvent) => {
    // Store area selection for popover
    setPendingAreaFeedback({
      area: event.area,
      elements: event.elements,
    })
  }, [])

  // Smart Inspector hook
  // Escape handling is centralized in handleEscapeChain via useKeyboardShortcuts
  const { hoveredElement, dragArea } = useSmartInspector({
    active: active && !pendingFeedback && !pendingAreaFeedback, // pause hover when popover is open
    onInspectClick: handleInspectClick,
    onInspectArea: handleInspectArea,
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

  /** Submit feedback for area (drag) selection */
  const handleAreaFeedbackSubmit = useCallback((content: string) => {
    if (!pendingAreaFeedback) return
    const item = addGroupFeedback(content, pendingAreaFeedback.area, pendingAreaFeedback.elements)
    onFeedbackSubmit?.(item)
    setPendingAreaFeedback(null)
  }, [pendingAreaFeedback, addGroupFeedback, onFeedbackSubmit])

  const handleAreaFeedbackClose = useCallback(() => {
    setPendingAreaFeedback(null)
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
      if (!next) {
        setPendingFeedback(null)
        setPendingAreaFeedback(null)
      }
      onToggle?.(next)
      return next
    })
  }, [onToggle])

  const handleClose = useCallback(() => {
    if (active) {
      setActive(false)
      setPendingFeedback(null)
      setPendingAreaFeedback(null)
      onToggle?.(false)
    }
    setCollapsed(true)
    setFocusIndex(-1)
  }, [active, onToggle])

  const handleDeleteAll = useCallback(() => {
    clearFeedbacks()
    onDelete?.()
  }, [clearFeedbacks, onDelete])

  const handleCopy = useCallback(() => {
    const text = settings.outputMode === 'debug' ? formatDebug(feedbacks) : formatDetailed(feedbacks)
    navigator.clipboard.writeText(text).catch(() => { /* silent */ })
    onCopy?.()
    // Show success icon for 1 second
    clearTimeout(copyTimeoutRef.current)
    setCopiedRecently(true)
    copyTimeoutRef.current = setTimeout(() => setCopiedRecently(false), 1000)
  }, [feedbacks, settings.outputMode, onCopy])

  const handleFeedbackListToggle = useCallback(() => {
    setFeedbackListOpen((prev) => !prev)
    onFeedback?.()
  }, [onFeedback])

  const handleSettingsToggle = useCallback(() => {
    setSettingsOpen((prev) => !prev)
    onSettings?.()
  }, [onSettings])

  // --- Keyboard shortcut handlers ---

  const focusPrev = useCallback(() => {
    setFocusedMarkerIndex((prev) => {
      if (prev === null || prev === 0) return feedbacks.length - 1
      return prev - 1
    })
  }, [feedbacks.length])

  const focusNext = useCallback(() => {
    setFocusedMarkerIndex((prev) => {
      if (prev === null) return 0
      return (prev + 1) % feedbacks.length
    })
  }, [feedbacks.length])

  const openFocusedEdit = useCallback(() => {
    if (focusedMarkerIndex === null) return
    const fb = feedbacks[focusedMarkerIndex]
    if (fb) setEditTargetId(fb.id)
  }, [focusedMarkerIndex, feedbacks])

  const handleEscapeChain = useCallback(() => {
    // 1. Edit popup — handled by FeedbackMarkers internal keydown; check if it exists
    if (document.querySelector('[data-smart-inspector="edit-popup"]')) return
    // 2. Feedback list popup
    if (feedbackListOpen) { setFeedbackListOpen(false); return }
    // 3. Settings popup
    if (settingsOpen) { setSettingsOpen(false); return }
    // 4. Inspector
    if (active) { handleDeactivate(); return }
    // 5. Focused marker
    if (focusedMarkerIndex !== null) { setFocusedMarkerIndex(null); return }
    // 6. Collapse toolbar
    if (expanded) { handleClose(); return }
  }, [feedbackListOpen, settingsOpen, active, handleDeactivate, focusedMarkerIndex, expanded, handleClose])

  useKeyboardShortcuts({
    'mod+shift+f': { handler: toggleCollapsed },
    'mod+shift+i': { handler: handleToggle, guard: () => expanded },
    'mod+shift+c': { handler: handleCopy, guard: () => feedbacks.length > 0 },
    'mod+shift+l': { handler: handleFeedbackListToggle, guard: () => expanded },
    'mod+shift+,': { handler: handleSettingsToggle, guard: () => expanded },
    'mod+shift+backspace': { handler: handleDeleteAll, guard: () => feedbacks.length > 0 },
    'mod+z': { handler: undoDelete, guard: () => canUndo },
    '[': { handler: focusPrev, guard: () => expanded && feedbacks.length > 0 && !isInputFocused() },
    ']': { handler: focusNext, guard: () => expanded && feedbacks.length > 0 && !isInputFocused() },
    'enter': { handler: openFocusedEdit, guard: () => focusedMarkerIndex !== null && !isInputFocused() },
    'escape': { handler: handleEscapeChain },
  })

  // Scroll focused marker's target element into view
  useEffect(() => {
    if (focusedMarkerIndex === null) return
    const fb = feedbacks[focusedMarkerIndex]
    if (!fb) return
    const el = fb.targetElement?.isConnected ? fb.targetElement : document.querySelector(fb.selector) as HTMLElement | null
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusedMarkerIndex, feedbacks])

  // Reset focused marker on collapse or feedbacks length change
  useEffect(() => {
    if (collapsed) setFocusedMarkerIndex(null)
  }, [collapsed])

  useEffect(() => {
    setFocusedMarkerIndex(null)
  }, [feedbacks.length])

  const focusedMarkerId = focusedMarkerIndex !== null ? feedbacks[focusedMarkerIndex]?.id : undefined

  const tooltipAbove = position.startsWith('bottom')

  // Build the pre-configured items
  const items = [
    { id: 'toggle', icon: active ? <Pause size={ICON_SIZE} /> : <Play size={ICON_SIZE} />, label: active ? 'Stop' : 'Start', description: active ? 'Deactivate inspector' : 'Activate inspector', shortcut: '⌘⇧I', onClick: handleToggle, active },
    { id: 'feedback', icon: <MessageSquare size={ICON_SIZE} />, label: `Feedbacks (${feedbacks.length})`, description: 'View feedback list', shortcut: '⌘⇧L', onClick: handleFeedbackListToggle },
    { id: 'copy', icon: copiedRecently ? <Check size={ICON_SIZE} color="#22c55e" /> : <Copy size={ICON_SIZE} />, label: copiedRecently ? 'Copied!' : 'Copy', description: 'Copy all to clipboard', shortcut: '⌘⇧C', onClick: handleCopy },
    { id: 'delete', icon: <Trash2 size={ICON_SIZE} />, label: 'Delete All', description: 'Remove all feedbacks', shortcut: '⌘⇧⌫', onClick: handleDeleteAll, hoverColor: '#ef4444' },
    { id: 'settings', icon: <Settings size={ICON_SIZE} />, label: 'Settings', description: 'Theme, output & colors', shortcut: '⌘⇧,', onClick: handleSettingsToggle },
    { id: 'close', icon: <X size={ICON_SIZE} />, label: 'Close', description: 'Collapse toolbar', onClick: handleClose },
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
      // Use composedPath to get actual target (handles Shadow DOM retargeting)
      const path = e.composedPath()
      const target = (path.length > 0 ? path[0] : e.target) as HTMLElement

      // Ignore clicks on toolbar, feedback markers, and edit popups
      if (toolbarRef.current?.contains(target)) return
      if (target.closest?.('[data-smart-inspector]')) return

      setCollapsed(true)
      setFocusIndex(-1)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [collapsed, active])

  if (!mounted) return null

  const containerStyle = {
    ...getContainerStyle(position, zIndex),
    ...style,
  }

  const triggerStyle: React.CSSProperties = {
    ...getTriggerButtonStyle(theme),
    backgroundColor: triggerHovered ? getHoverBg(theme) : 'transparent',
    position: 'relative',
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
          aria-label={expanded ? 'Collapse toolbar' : `Expand toolbar${collapsed && feedbacks.length > 0 ? ` (${feedbacks.length} feedbacks)` : ''}`}
          onMouseEnter={() => setTriggerHovered(true)}
          onMouseLeave={() => setTriggerHovered(false)}
        >
          {triggerIcon || <Menu size={18} />}
          {collapsed && feedbacks.length > 0 && (
            <span style={getBadgeStyle(theme, accentColor)} aria-hidden="true">
              {feedbacks.length > 99 ? '99+' : feedbacks.length}
            </span>
          )}
        </button>

        {/* Pre-configured items with animation */}
        <div style={expanded ? getDividerStyle(theme) : { width: 0, transition: 'width 200ms ease' }} />
        <div style={getItemsContainerStyle(expanded)}>
          {items.map((item, index) => (
            <ToolbarButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              description={item.description}
              shortcut={item.shortcut}
              theme={theme}
              tabIndex={index === focusIndex ? 0 : -1}
              active={item.active}
              accentColor={accentColor}
              tooltipAbove={tooltipAbove}
              zIndex={zIndex}
              hoverColor={item.hoverColor}
              onClick={item.onClick}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const toolbarRect = toolbarRef.current?.getBoundingClientRect() ?? null

  const container = portalContainer ?? document.body

  return (
    <PortalContext.Provider value={container}>
      {createPortal(toolbar, container)}
      {active && !pendingFeedback && !pendingAreaFeedback && (
        <SmartInspectorOverlay hoveredElement={hoveredElement} dragArea={dragArea} theme={theme} zIndex={zIndex} accentColor={accentColor} />
      )}
      {pendingFeedback && (
        <FeedbackPopover
          x={pendingFeedback.x}
          y={pendingFeedback.y}
          inspectedElement={pendingFeedback.element}
          theme={theme}
          zIndex={zIndex}
          stepNumber={feedbacks.length + 1}
          accentColor={accentColor}
          onSubmit={handleFeedbackSubmit}
          onClose={handleFeedbackClose}
        />
      )}
      {pendingAreaFeedback && (
        <FeedbackPopover
          x={pendingAreaFeedback.area.x + pendingAreaFeedback.area.width / 2}
          y={pendingAreaFeedback.area.y + pendingAreaFeedback.area.height / 2}
          elements={pendingAreaFeedback.elements}
          theme={theme}
          zIndex={zIndex}
          stepNumber={feedbacks.length + 1}
          accentColor={accentColor}
          onSubmit={handleAreaFeedbackSubmit}
          onClose={handleAreaFeedbackClose}
        />
      )}
      <FeedbackMarkers
        feedbacks={feedbacks}
        theme={theme}
        zIndex={zIndex}
        visible={expanded || active}
        accentColor={accentColor}
        focusedMarkerId={focusedMarkerId}
        editTargetId={editTargetId ?? undefined}
        onEditTriggered={() => setEditTargetId(null)}
        onUpdate={(id, content) => {
          updateFeedback(id, content)
          onFeedbackUpdate?.(id, content)
        }}
        onDelete={(fb) => {
          deleteFeedback(fb.id)
          onFeedbackDelete?.(fb.id)
        }}
      />
      {settingsOpen && createPortal(
        <SettingsPopup
          theme={theme}
          outputMode={settings.outputMode}
          markerColor={accentColor}
          onToggleTheme={settings.toggleTheme}
          onOutputModeChange={settings.setOutputMode}
          onMarkerColorChange={settings.setMarkerColor}
          onClose={() => setSettingsOpen(false)}
          toolbarRect={toolbarRect}
          zIndex={zIndex}
        />,
        container
      )}
      {feedbackListOpen && createPortal(
        <FeedbackListPopup
          feedbacks={feedbacks}
          theme={theme}
          accentColor={accentColor}
          outputMode={settings.outputMode}
          onClose={() => setFeedbackListOpen(false)}
          toolbarRect={toolbarRect}
          zIndex={zIndex}
        />,
        container
      )}
    </PortalContext.Provider>
  )
}
