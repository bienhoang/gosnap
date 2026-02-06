import { useState, useCallback, useEffect, useRef } from 'react'
import type { FeedbackItem, InspectedElement, AreaData } from '../types'
import type { SerializedFeedbackItem } from '../types'
import {
  saveFeedbacks,
  loadSerializedFeedbacks,
  loadAsPlaceholders,
  resolveFromDOM,
  clearPersistedFeedbacks,
} from '../utils/feedback-persistence'

const DEBOUNCE_MS = 300

/** Generate a unique feedback ID without shared mutable state (SSR-safe) */
function generateId(): string {
  return `fb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Max attempts to resolve DOM elements after SPA navigation */
const RESOLVE_MAX_RETRIES = 5
const RESOLVE_INTERVAL_MS = 100
const UNDO_MAX_DEPTH = 10

export function useFeedbackStore(persistKey?: string) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  /** Ref mirror of feedbacks — used for synchronous reads in addFeedback */
  const feedbacksRef = useRef<FeedbackItem[]>([])
  feedbacksRef.current = feedbacks
  const hydratedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const serializedRef = useRef<SerializedFeedbackItem[]>([])
  /** Undo stack — snapshots of feedbacks before delete operations */
  const undoStackRef = useRef<FeedbackItem[][]>([])

  // Two-phase hydration:
  // 1. Load serialized data as placeholders immediately (no DOM queries)
  // 2. Resolve against live DOM with retries (handles SPA navigation timing)
  useEffect(() => {
    if (!persistKey) {
      setFeedbacks([])
      serializedRef.current = []
      hydratedRef.current = true
      return
    }

    hydratedRef.current = false
    undoStackRef.current = []
    const serialized = loadSerializedFeedbacks(persistKey)
    serializedRef.current = serialized

    if (serialized.length === 0) {
      setFeedbacks([])
      hydratedRef.current = true
      return
    }

    // Phase 1: load placeholders (hidden — markers won't render without targetElement)
    const placeholders = loadAsPlaceholders(serialized)
    setFeedbacks(placeholders)

    // Phase 2: resolve DOM elements with retries
    let attempt = 0
    let timerId: ReturnType<typeof setTimeout> | undefined

    const tryResolve = () => {
      attempt++
      const resolved = resolveFromDOM(serialized)
      const hasUnresolved = resolved.some((fb) => fb.orphan)

      if (hasUnresolved && attempt < RESOLVE_MAX_RETRIES) {
        // Retry — new page DOM may not be ready yet
        timerId = setTimeout(tryResolve, RESOLVE_INTERVAL_MS)
        return
      }

      // Final result — either all resolved or max retries reached
      setFeedbacks(resolved)
      hydratedRef.current = true
    }

    // Start first attempt after a frame (let React commit)
    timerId = setTimeout(tryResolve, RESOLVE_INTERVAL_MS)

    return () => clearTimeout(timerId)
  }, [persistKey])

  // Debounced sync to localStorage on feedbacks change
  useEffect(() => {
    if (!persistKey || !hydratedRef.current) return

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      saveFeedbacks(persistKey, feedbacks)
    }, DEBOUNCE_MS)

    return () => clearTimeout(debounceRef.current)
  }, [feedbacks, persistKey])

  const addFeedback = useCallback((
    content: string,
    clickX: number,
    clickY: number,
    inspected: InspectedElement,
  ): FeedbackItem => {
    const rect = inspected.element.getBoundingClientRect()
    const offsetX = clickX - rect.left
    const offsetY = clickY - rect.top
    // Compute stepNumber from ref (synchronous, always up-to-date)
    const stepNumber = feedbacksRef.current.length + 1
    const item: FeedbackItem = {
      id: generateId(),
      stepNumber,
      content,
      selector: inspected.selector,
      offsetX,
      offsetY,
      pageX: clickX + window.scrollX,
      pageY: clickY + window.scrollY,
      targetElement: inspected.element,
      element: inspected,
      createdAt: Date.now(),
    }

    setFeedbacks((prev) => [...prev, { ...item, stepNumber: prev.length + 1 }])
    return item
  }, [])

  /** Add feedback for area (drag) selection - creates ONE item with multiple elements */
  const addGroupFeedback = useCallback((
    content: string,
    area: { x: number; y: number; width: number; height: number },
    elements: InspectedElement[],
  ): FeedbackItem => {
    // Calculate area center (page coordinates)
    const centerX = area.x + area.width / 2 + window.scrollX
    const centerY = area.y + area.height / 2 + window.scrollY

    const areaData: AreaData = {
      centerX,
      centerY,
      width: area.width,
      height: area.height,
      elementCount: elements.length,
    }

    const createdAt = Date.now()
    const isAreaOnly = elements.length === 0

    // Create ONE feedback item (single or multi-element)
    const item: FeedbackItem = {
      id: generateId(),
      stepNumber: feedbacksRef.current.length + 1,
      content,
      selector: elements[0]?.selector ?? '', // First element's selector for reference
      offsetX: 0,
      offsetY: 0,
      pageX: centerX,
      pageY: centerY,
      targetElement: null, // Group has no single target
      element: null, // Group has no single element
      createdAt,
      areaData,
      isAreaOnly,
      elements: isAreaOnly ? undefined : elements, // Store all elements
    }

    setFeedbacks((prev) => [...prev, { ...item, stepNumber: prev.length + 1 }])
    return item
  }, [])

  const updateFeedback = useCallback((id: string, content: string) => {
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, content } : f)))
  }, [])

  const deleteFeedback = useCallback((id: string) => {
    setFeedbacks((prev) => {
      undoStackRef.current = [...undoStackRef.current.slice(-(UNDO_MAX_DEPTH - 1)), prev]
      const filtered = prev.filter((f) => f.id !== id)
      return filtered.map((f, i) => ({ ...f, stepNumber: i + 1 }))
    })
  }, [])

  const clearFeedbacks = useCallback(() => {
    setFeedbacks((prev) => {
      if (prev.length > 0) {
        undoStackRef.current = [...undoStackRef.current.slice(-(UNDO_MAX_DEPTH - 1)), prev]
      }
      return []
    })
    if (persistKey) clearPersistedFeedbacks(persistKey)
  }, [persistKey])

  const undoDelete = useCallback(() => {
    const stack = undoStackRef.current
    if (stack.length === 0) return
    const snapshot = stack[stack.length - 1]
    undoStackRef.current = stack.slice(0, -1)
    setFeedbacks(snapshot)
  }, [])

  const canUndo = undoStackRef.current.length > 0

  return { feedbacks, addFeedback, addGroupFeedback, updateFeedback, deleteFeedback, clearFeedbacks, undoDelete, canUndo }
}
