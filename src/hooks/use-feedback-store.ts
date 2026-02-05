import { useState, useCallback, useEffect, useRef } from 'react'
import type { FeedbackItem, InspectedElement } from '../types'
import {
  saveFeedbacks,
  loadSerializedFeedbacks,
  rehydrateFeedbacks,
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

export function useFeedbackStore(persistKey?: string) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const hydratedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (!persistKey) return
    const serialized = loadSerializedFeedbacks(persistKey)
    if (serialized.length === 0) {
      hydratedRef.current = true
      return
    }
    const hydrated = rehydrateFeedbacks(serialized)
    syncIdCounter(hydrated)
    setFeedbacks(hydrated)
    // Mark hydrated after state update flushes
    requestAnimationFrame(() => { hydratedRef.current = true })
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

  return { feedbacks, addFeedback, deleteFeedback, clearFeedbacks }
}
