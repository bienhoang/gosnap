import { useState, useCallback, useEffect } from 'react'
import type { FeedbackItem } from '../types'

export function useMarkerFocus(feedbacks: FeedbackItem[], collapsed: boolean) {
  const [focusedMarkerIndex, setFocusedMarkerIndex] = useState<number | null>(null)
  const [editTargetId, setEditTargetId] = useState<string | null>(null)

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

  // Scroll focused marker's target element into view
  useEffect(() => {
    if (focusedMarkerIndex === null) return
    const fb = feedbacks[focusedMarkerIndex]
    if (!fb) return
    const el = fb.targetElement?.isConnected ? fb.targetElement : document.querySelector(fb.selector) as HTMLElement | null
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusedMarkerIndex, feedbacks])

  // Reset focused marker on collapse
  useEffect(() => {
    if (collapsed) setFocusedMarkerIndex(null)
  }, [collapsed])

  // Reset on feedbacks length change
  useEffect(() => {
    setFocusedMarkerIndex(null)
  }, [feedbacks.length])

  const clearFocus = useCallback(() => {
    setFocusedMarkerIndex(null)
  }, [])

  const focusedMarkerId = focusedMarkerIndex !== null ? feedbacks[focusedMarkerIndex]?.id : undefined

  return {
    focusedMarkerIndex,
    focusedMarkerId,
    editTargetId,
    setEditTargetId,
    focusPrev,
    focusNext,
    openFocusedEdit,
    clearFocus,
  }
}
