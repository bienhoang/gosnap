import { useState, useCallback, useEffect, useRef } from 'react'
import type { FeedbackItem, InspectedElement } from '../types'
import type { SerializedFeedbackItem } from '../types'
import {
  saveFeedbacks,
  loadSerializedFeedbacks,
  loadAsPlaceholders,
  resolveFromDOM,
  clearPersistedFeedbacks,
} from '../utils/feedback-persistence'

let idCounter = 0

const DEBOUNCE_MS = 300

/** Sync idCounter to avoid collisions with restored items */
function syncIdCounter(items: FeedbackItem[]): void {
  for (const item of items) {
    const match = item.id.match(/^fb-(\d+)-/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > idCounter) idCounter = num
    }
  }
}

/** Max attempts to resolve DOM elements after SPA navigation */
const RESOLVE_MAX_RETRIES = 5
const RESOLVE_INTERVAL_MS = 100

export function useFeedbackStore(persistKey?: string) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const hydratedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const serializedRef = useRef<SerializedFeedbackItem[]>([])

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
    const serialized = loadSerializedFeedbacks(persistKey)
    serializedRef.current = serialized

    if (serialized.length === 0) {
      setFeedbacks([])
      hydratedRef.current = true
      return
    }

    // Phase 1: load placeholders (hidden — markers won't render without targetElement)
    const placeholders = loadAsPlaceholders(serialized)
    syncIdCounter(placeholders)
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
      syncIdCounter(resolved)
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

    const item: FeedbackItem = {
      id: `fb-${++idCounter}-${Date.now()}`,
      stepNumber: 0,
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

    let created: FeedbackItem = item
    setFeedbacks((prev) => {
      created = { ...item, stepNumber: prev.length + 1 }
      return [...prev, created]
    })
    return created
  }, [])

  const updateFeedback = useCallback((id: string, content: string) => {
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content } : f)),
    )
  }, [])

  const deleteFeedback = useCallback((id: string) => {
    setFeedbacks((prev) => {
      const filtered = prev.filter((f) => f.id !== id)
      return filtered.map((f, i) => ({ ...f, stepNumber: i + 1 }))
    })
  }, [])

  const clearFeedbacks = useCallback(() => {
    setFeedbacks([])
    if (persistKey) clearPersistedFeedbacks(persistKey)
  }, [persistKey])

  return { feedbacks, addFeedback, updateFeedback, deleteFeedback, clearFeedbacks }
}
