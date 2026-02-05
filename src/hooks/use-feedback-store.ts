import { useState, useCallback } from 'react'
import type { FeedbackItem, InspectedElement } from '../types'

let idCounter = 0

export function useFeedbackStore() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])

  const addFeedback = useCallback((
    content: string,
    clickX: number,
    clickY: number,
    inspected: InspectedElement,
  ): FeedbackItem => {
    // Calculate offset relative to the target element's top-left
    const rect = inspected.element.getBoundingClientRect()
    const offsetX = clickX - rect.left
    const offsetY = clickY - rect.top

    const item: FeedbackItem = {
      id: `fb-${++idCounter}-${Date.now()}`,
      stepNumber: 0, // set below
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
  }, [])

  return { feedbacks, addFeedback, deleteFeedback, clearFeedbacks }
}
