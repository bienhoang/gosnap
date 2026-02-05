import type { FeedbackItem, SerializedFeedbackItem, InspectedElement } from '../types'
import { collectMetadata } from './element-metadata'

const STORAGE_PREFIX = 'pro-ui-fb:'

/** Compute localStorage key from persist prop value */
export function buildPersistKey(persist: boolean | string, pathname?: string): string | undefined {
  if (persist === true) {
    const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
    return STORAGE_PREFIX + path
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
    pageX: item.pageX,
    pageY: item.pageY,
    createdAt: item.createdAt,
    tagName: item.element?.tagName ?? '',
    className: item.element?.className ?? '',
    elementId: item.element?.id ?? '',
    metadata: item.element?.metadata,
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

/** Safe querySelector that returns null on invalid selectors */
function safeQuerySelector(selector: string): HTMLElement | null {
  try {
    return document.querySelector(selector) as HTMLElement | null
  } catch {
    return null
  }
}

/** Resolve a serialized item against the live DOM */
function resolveSerializedItem(item: SerializedFeedbackItem): FeedbackItem {
  const el = safeQuerySelector(item.selector)

  if (el) {
    const rect = el.getBoundingClientRect()
    const metadata = collectMetadata(el)
    const inspected: InspectedElement = {
      element: el,
      tagName: el.tagName.toLowerCase(),
      className: el.className,
      id: el.id,
      selector: item.selector,
      rect,
      dimensions: { width: rect.width, height: rect.height },
      metadata,
    }
    return {
      id: item.id,
      stepNumber: item.stepNumber,
      content: item.content,
      selector: item.selector,
      offsetX: item.offsetX,
      offsetY: item.offsetY,
      pageX: item.pageX ?? 0,
      pageY: item.pageY ?? 0,
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
    pageX: item.pageX ?? 0,
    pageY: item.pageY ?? 0,
    targetElement: null,
    element: null,
    createdAt: item.createdAt,
    orphan: true,
  }
}

/**
 * Create placeholder FeedbackItems from serialized data without DOM queries.
 * Used for immediate loading — DOM resolution happens separately.
 */
export function loadAsPlaceholders(items: SerializedFeedbackItem[]): FeedbackItem[] {
  return items.map((item) => ({
    id: item.id,
    stepNumber: item.stepNumber,
    content: item.content,
    selector: item.selector,
    offsetX: item.offsetX,
    offsetY: item.offsetY,
    pageX: item.pageX ?? 0,
    pageY: item.pageY ?? 0,
    targetElement: null,
    element: null,
    createdAt: item.createdAt,
    orphan: false, // not orphan yet — pending resolution
  }))
}

/**
 * Resolve placeholders against the live DOM.
 * Items whose selectors match get connected; others become orphans.
 */
export function resolveFromDOM(items: SerializedFeedbackItem[]): FeedbackItem[] {
  return items.map(resolveSerializedItem)
}

/** Clear persisted feedbacks from localStorage */
export function clearPersistedFeedbacks(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // silent
  }
}
