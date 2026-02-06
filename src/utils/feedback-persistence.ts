import type { FeedbackItem, SerializedFeedbackItem, InspectedElement, SerializedElement } from '../types'
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

/** Serialize elements array for multi-select feedback */
function serializeElements(elements: InspectedElement[]): SerializedElement[] {
  return elements.map((el) => ({
    selector: el.selector,
    tagName: el.tagName,
    className: el.className,
    elementId: el.id,
    metadata: el.metadata,
  }))
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
    // Area selection fields
    ...(item.areaData ? { areaData: item.areaData } : {}),
    ...(item.isAreaOnly ? { isAreaOnly: item.isAreaOnly } : {}),
    ...(item.elements ? { elements: serializeElements(item.elements) } : {}),
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
  if (!selector) return null
  try {
    return document.querySelector(selector) as HTMLElement | null
  } catch {
    return null
  }
}

/** Resolve serialized elements against the DOM */
function resolveElements(serializedElements: SerializedElement[]): InspectedElement[] {
  const resolved: InspectedElement[] = []

  for (const se of serializedElements) {
    const el = safeQuerySelector(se.selector)
    if (el) {
      const rect = el.getBoundingClientRect()
      const metadata = collectMetadata(el)
      resolved.push({
        element: el,
        tagName: el.tagName.toLowerCase(),
        className: el.className,
        id: el.id,
        selector: se.selector,
        rect,
        dimensions: { width: rect.width, height: rect.height },
        metadata,
      })
    }
  }

  return resolved
}

/** Resolve a serialized item against the live DOM */
function resolveSerializedItem(item: SerializedFeedbackItem): FeedbackItem {
  // Handle isAreaOnly items (empty area annotations - no element to resolve)
  if (item.isAreaOnly) {
    return {
      id: item.id,
      stepNumber: item.stepNumber,
      content: item.content,
      selector: item.selector || '',
      offsetX: item.offsetX,
      offsetY: item.offsetY,
      pageX: item.pageX ?? 0,
      pageY: item.pageY ?? 0,
      targetElement: null,
      element: null,
      createdAt: item.createdAt,
      orphan: false, // Area-only items can't be orphaned
      areaData: item.areaData,
      isAreaOnly: true,
    }
  }

  // Handle multi-select items (has elements array)
  if (item.elements && item.elements.length > 0) {
    const resolvedElements = resolveElements(item.elements)
    const hasOrphans = resolvedElements.length < item.elements.length

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
      orphan: resolvedElements.length === 0, // Only orphan if ALL elements missing
      areaData: item.areaData,
      elements: resolvedElements.length > 0 ? resolvedElements : undefined,
    }
  }

  // Handle single-element items
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
      areaData: item.areaData,
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
    areaData: item.areaData,
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
    areaData: item.areaData,
    isAreaOnly: item.isAreaOnly,
    // elements will be resolved later
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
