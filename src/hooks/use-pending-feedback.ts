import { useState, useCallback } from 'react'
import type { FeedbackItem, InspectedElement } from '../types'
import type { InspectClickEvent, InspectAreaEvent, DragArea } from './use-smart-inspector'

interface PendingFeedback {
  x: number
  y: number
  element: InspectedElement
}

interface PendingAreaFeedback {
  area: DragArea
  elements: InspectedElement[]
}

interface UsePendingFeedbackOptions {
  addFeedback: (content: string, clickX: number, clickY: number, inspected: InspectedElement) => FeedbackItem
  addGroupFeedback: (content: string, area: { x: number; y: number; width: number; height: number }, elements: InspectedElement[]) => FeedbackItem
  onInspect?: (element: InspectedElement) => void
  onFeedbackSubmit?: (feedback: FeedbackItem) => void
}

export function usePendingFeedback({ addFeedback, addGroupFeedback, onInspect, onFeedbackSubmit }: UsePendingFeedbackOptions) {
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback | null>(null)
  const [pendingAreaFeedback, setPendingAreaFeedback] = useState<PendingAreaFeedback | null>(null)

  const handleInspectClick = useCallback((event: InspectClickEvent) => {
    onInspect?.(event.element)
    setPendingFeedback({
      x: event.clickX,
      y: event.clickY,
      element: event.element,
    })
  }, [onInspect])

  const handleInspectArea = useCallback((event: InspectAreaEvent) => {
    setPendingAreaFeedback({
      area: event.area,
      elements: event.elements,
    })
  }, [])

  const handleFeedbackSubmit = useCallback((content: string) => {
    if (!pendingFeedback) return
    const item = addFeedback(content, pendingFeedback.x, pendingFeedback.y, pendingFeedback.element)
    onFeedbackSubmit?.(item)
    setPendingFeedback(null)
  }, [pendingFeedback, addFeedback, onFeedbackSubmit])

  const handleFeedbackClose = useCallback(() => {
    setPendingFeedback(null)
  }, [])

  const handleAreaFeedbackSubmit = useCallback((content: string) => {
    if (!pendingAreaFeedback) return
    const item = addGroupFeedback(content, pendingAreaFeedback.area, pendingAreaFeedback.elements)
    onFeedbackSubmit?.(item)
    setPendingAreaFeedback(null)
  }, [pendingAreaFeedback, addGroupFeedback, onFeedbackSubmit])

  const handleAreaFeedbackClose = useCallback(() => {
    setPendingAreaFeedback(null)
  }, [])

  const clearPending = useCallback(() => {
    setPendingFeedback(null)
    setPendingAreaFeedback(null)
  }, [])

  return {
    pendingFeedback,
    pendingAreaFeedback,
    handleInspectClick,
    handleInspectArea,
    handleFeedbackSubmit,
    handleFeedbackClose,
    handleAreaFeedbackSubmit,
    handleAreaFeedbackClose,
    clearPending,
  }
}
