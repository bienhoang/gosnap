import type { FeedbackItem, SerializedFeedbackItem, InspectedElement } from '../types'

const STORAGE_PREFIX = 'pro-ui-fb:'

/** Compute localStorage key from persist prop value */
export function buildPersistKey(persist: boolean | string): string | undefined {
  if (persist === true) {
    return STORAGE_PREFIX + (typeof window !== 'undefined' ? window.location.pathname : '/')
  }
  if (typeof persist === 'string' && persist.length > 0) {
    return STORAGE_PREFIX + persist
  }
  return undefined
}

/** Extract serializable fields from a FeedbackItem */
function serializeFeedback(item: FeedbackItem): SerializedFeedbackItem {
  return {
    id: item.id,
    stepNumber: item.stepNumber,
    content: item.content,
    selector: item.selector,
    offsetX: item.offsetX,
    offsetY: item.offsetY,
    createdAt: item.createdAt,
    tagName: item.element?.tagName ?? '',
    className: item.element?.className ?? '',
    elementId: item.element?.id ?? '',
  }
}

/** Save feedbacks to localStorage */
export function saveFeedbacks(key: string, items: FeedbackItem[]): void {
  try {
    const serialized = items.map(serializeFeedback)
    localStorage.setItem(key, JSON.stringify(serialized))
  } catch {
    // localStorage disabled or quota exceeded — silent fallback
  }
}

/** Load serialized feedbacks from localStorage */
export function loadSerializedFeedbacks(key: string): SerializedFeedbackItem[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    // Corrupted data — clear and return empty
    clearPersistedFeedbacks(key)
    return []
  }
}

/** Rehydrate a serialized item back into a FeedbackItem */
function rehydrateFeedback(item: SerializedFeedbackItem): FeedbackItem {
  const el = document.querySelector(item.selector) as HTMLElement | null

  if (el) {
    const rect = el.getBoundingClientRect()
    const inspected: InspectedElement = {
      element: el,
      tagName: el.tagName.toLowerCase(),
      className: el.className,
      id: el.id,
      selector: item.selector,
      rect,
      dimensions: { width: rect.width, height: rect.height },
    }
    return {
      id: item.id,
      stepNumber: item.stepNumber,
      content: item.content,
      selector: item.selector,
      offsetX: item.offsetX,
      offsetY: item.offsetY,
      targetElement: el,
      element: inspected,
      createdAt: item.createdAt,
      orphan: false,
    }
  }

  // Element not found — orphan
  return {
    id: item.id,
    stepNumber: item.stepNumber,
    content: item.content,
    selector: item.selector,
    offsetX: item.offsetX,
    offsetY: item.offsetY,
    targetElement: null,
    element: null,
    createdAt: item.createdAt,
    orphan: true,
  }
}

/** Rehydrate all serialized items */
export function rehydrateFeedbacks(items: SerializedFeedbackItem[]): FeedbackItem[] {
  return items.map(rehydrateFeedback)
}

/** Clear persisted feedbacks from localStorage */
export function clearPersistedFeedbacks(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // silent
  }
}
