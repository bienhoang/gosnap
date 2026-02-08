import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, Play, Pause, MessageSquare, Copy, Check, Trash2, Settings, X } from '../icons'
import type { GoSnapProps } from '../types'
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
import { useToolbarState } from '../hooks/use-toolbar-state'
import { usePendingFeedback } from '../hooks/use-pending-feedback'
import { useMarkerFocus } from '../hooks/use-marker-focus'
import { useSync } from '../hooks/use-sync'
import { buildPersistKey } from '../utils/feedback-persistence'
import { formatDetailed, formatDebug } from '../utils/format-feedbacks'
import { SmartInspectorOverlay } from './smart-inspector-overlay'
import { FeedbackPopover } from './feedback-popover'
import { FeedbackMarkers } from './feedback-markers'
import { SettingsPopup } from './settings-popup'
import { FeedbackListPopup } from './feedback-list-popup'
import { PortalContext } from '../contexts/portal-context'

const ICON_SIZE = 16

export function GoSnap({
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
  syncUrl,
  syncHeaders,
  syncMode,
  syncDelete,
  syncUpdate,
  onSyncSuccess,
  onSyncError,
}: GoSnapProps) {
  const [active, setActive] = useState(false)
  const [triggerHovered, setTriggerHovered] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [feedbackListOpen, setFeedbackListOpen] = useState(false)
  const [copiedRecently, setCopiedRecently] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const pathname = usePathname()
  const persistKey = persist ? buildPersistKey(persist, pathname) : undefined
  const { feedbacks, addFeedback, addGroupFeedback, updateFeedback, deleteFeedback, clearFeedbacks, undoDelete, canUndo } = useFeedbackStore(persistKey)
  const settings = useSettingsStore(themeProp)
  const theme = settings.theme
  const accentColor = settings.markerColor

  const { collapsed, expanded, focusIndex, setFocusIndex, mounted, toggleCollapsed, collapse } = useToolbarState(defaultCollapsed)

  const sync = useSync({ syncUrl, syncHeaders, syncMode, syncDelete, syncUpdate, onSyncSuccess, onSyncError })

  const pending = usePendingFeedback({
    addFeedback,
    addGroupFeedback,
    onInspect,
    onFeedbackSubmit: (item) => {
      onFeedbackSubmit?.(item)
      if (syncMode === 'batch') {
        sync.queueForSync(item)
      } else {
        sync.syncCreated(item)
      }
    },
  })

  const markerFocus = useMarkerFocus(feedbacks, collapsed)

  // Reset inspector/popups on page change
  const prevPathnameRef = useRef(pathname)
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      setActive(false)
      pending.clearPending()
      setSettingsOpen(false)
      setFeedbackListOpen(false)
    }
  }, [pathname, pending])

  useEffect(() => {
    return () => clearTimeout(copyTimeoutRef.current)
  }, [])

  const handleDeactivate = useCallback(() => {
    setActive(false)
    pending.clearPending()
    onToggle?.(false)
  }, [onToggle, pending])

  // Smart Inspector hook
  const { hoveredElement, dragArea } = useSmartInspector({
    active: active && !pending.pendingFeedback && !pending.pendingAreaFeedback,
    onInspectClick: pending.handleInspectClick,
    onInspectArea: pending.handleInspectArea,
    excludeRef: toolbarRef,
  })

  const handleToggle = useCallback(() => {
    setActive((prev) => {
      const next = !prev
      if (!next) pending.clearPending()
      onToggle?.(next)
      return next
    })
  }, [onToggle, pending])

  const handleClose = useCallback(() => {
    if (active) {
      setActive(false)
      pending.clearPending()
      onToggle?.(false)
    }
    collapse()
  }, [active, onToggle, pending, collapse])

  const handleDeleteAll = useCallback(() => {
    clearFeedbacks()
    onDelete?.()
  }, [clearFeedbacks, onDelete])

  const handleCopy = useCallback(() => {
    const text = settings.outputMode === 'debug' ? formatDebug(feedbacks) : formatDetailed(feedbacks)
    navigator.clipboard.writeText(text).catch(() => { /* silent */ })
    onCopy?.()
    sync.flushSync()
    clearTimeout(copyTimeoutRef.current)
    setCopiedRecently(true)
    copyTimeoutRef.current = setTimeout(() => setCopiedRecently(false), 1000)
  }, [feedbacks, settings.outputMode, onCopy, sync])

  const handleFeedbackListToggle = useCallback(() => {
    setFeedbackListOpen((prev) => !prev)
    onFeedback?.()
  }, [onFeedback])

  const handleSettingsToggle = useCallback(() => {
    setSettingsOpen((prev) => !prev)
    onSettings?.()
  }, [onSettings])

  // --- Escape chain ---
  const handleEscapeChain = useCallback(() => {
    if (document.querySelector('[data-smart-inspector="edit-popup"]')) return
    if (feedbackListOpen) { setFeedbackListOpen(false); return }
    if (settingsOpen) { setSettingsOpen(false); return }
    if (active) { handleDeactivate(); return }
    if (markerFocus.focusedMarkerIndex !== null) { markerFocus.clearFocus(); return }
    if (expanded) { handleClose(); return }
  }, [feedbackListOpen, settingsOpen, active, handleDeactivate, markerFocus, expanded, handleClose])

  useKeyboardShortcuts({
    'mod+shift+f': { handler: toggleCollapsed },
    'mod+shift+i': { handler: handleToggle, guard: () => expanded },
    'mod+shift+c': { handler: handleCopy, guard: () => feedbacks.length > 0 },
    'mod+shift+l': { handler: handleFeedbackListToggle, guard: () => expanded },
    'mod+shift+,': { handler: handleSettingsToggle, guard: () => expanded },
    'mod+shift+backspace': { handler: handleDeleteAll, guard: () => feedbacks.length > 0 },
    'mod+z': { handler: undoDelete, guard: () => canUndo },
    '[': { handler: markerFocus.focusPrev, guard: () => expanded && feedbacks.length > 0 && !isInputFocused() },
    ']': { handler: markerFocus.focusNext, guard: () => expanded && feedbacks.length > 0 && !isInputFocused() },
    'enter': { handler: markerFocus.openFocusedEdit, guard: () => markerFocus.focusedMarkerIndex !== null && !isInputFocused() },
    'escape': { handler: handleEscapeChain },
  })

  const tooltipAbove = position.startsWith('bottom')

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
    [collapsed, items.length, handleClose, setFocusIndex]
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
      const path = e.composedPath()
      const target = (path.length > 0 ? path[0] : e.target) as HTMLElement
      if (toolbarRef.current?.contains(target)) return
      if (target.closest?.('[data-smart-inspector]')) return
      collapse()
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [collapsed, active, collapse])

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
        aria-label="GoSnap"
        aria-orientation="horizontal"
        style={getToolbarStyle(theme, expanded)}
        onKeyDown={handleKeyDown}
      >
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
      {active && !pending.pendingFeedback && !pending.pendingAreaFeedback && (
        <SmartInspectorOverlay hoveredElement={hoveredElement} dragArea={dragArea} theme={theme} zIndex={zIndex} accentColor={accentColor} />
      )}
      {pending.pendingFeedback && (
        <FeedbackPopover
          x={pending.pendingFeedback.x}
          y={pending.pendingFeedback.y}
          inspectedElement={pending.pendingFeedback.element}
          theme={theme}
          zIndex={zIndex}
          stepNumber={feedbacks.length + 1}
          accentColor={accentColor}
          onSubmit={pending.handleFeedbackSubmit}
          onClose={pending.handleFeedbackClose}
        />
      )}
      {pending.pendingAreaFeedback && (
        <FeedbackPopover
          x={pending.pendingAreaFeedback.area.x + pending.pendingAreaFeedback.area.width / 2}
          y={pending.pendingAreaFeedback.area.y + pending.pendingAreaFeedback.area.height / 2}
          elements={pending.pendingAreaFeedback.elements}
          theme={theme}
          zIndex={zIndex}
          stepNumber={feedbacks.length + 1}
          accentColor={accentColor}
          onSubmit={pending.handleAreaFeedbackSubmit}
          onClose={pending.handleAreaFeedbackClose}
        />
      )}
      <FeedbackMarkers
        feedbacks={feedbacks}
        theme={theme}
        zIndex={zIndex}
        visible={expanded || active}
        accentColor={accentColor}
        focusedMarkerId={markerFocus.focusedMarkerId}
        editTargetId={markerFocus.editTargetId ?? undefined}
        onEditTriggered={() => markerFocus.setEditTargetId(null)}
        onUpdate={(id, content) => {
          updateFeedback(id, content)
          onFeedbackUpdate?.(id, content)
          sync.syncUpdated(id, content)
        }}
        onDelete={(fb) => {
          deleteFeedback(fb.id)
          onFeedbackDelete?.(fb.id)
          sync.syncDeleted(fb.id)
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
