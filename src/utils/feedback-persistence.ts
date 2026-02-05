import type { FeedbackItem, SerializedFeedbackItem, InspectedElement, ElementMetadata } from '../types'

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

/** Build fresh metadata from a live DOM element */
function buildMetadataFromElement(el: HTMLElement): ElementMetadata {
  const rect = el.getBoundingClientRect()
  const computed = window.getComputedStyle(el)
  const tagMap: Record<string, string> = {
    p: 'paragraph', a: 'link', img: 'image', button: 'button',
    input: 'input', h1: 'heading 1', h2: 'heading 2', h3: 'heading 3',
  }
  const tag = el.tagName.toLowerCase()
  const name = tagMap[tag] || tag
  const text = el.textContent?.trim() || ''
  const preview = text.length > 60 ? text.slice(0, 57) + '...' : text

  const siblings = el.parentElement ? Array.from(el.parentElement.children) : []
  const idx = siblings.indexOf(el)
  const nearbyTags: string[] = []
  if (idx > 0) nearbyTags.push(siblings[idx - 1].tagName.toLowerCase())
  if (idx < siblings.length - 1) nearbyTags.push(siblings[idx + 1].tagName.toLowerCase())

  const nearbyTextParts: string[] = []
  const prev = el.previousElementSibling
  const next = el.nextElementSibling
  if (prev?.textContent?.trim()) {
    const t = prev.textContent.trim()
    nearbyTextParts.push(`before: "${t.length > 40 ? t.slice(0, 37) + '...' : t}"`)
  }
  if (next?.textContent?.trim()) {
    const t = next.textContent.trim()
    nearbyTextParts.push(`after: "${t.length > 40 ? t.slice(0, 37) + '...' : t}"`)
  }

  // Generate paths
  const pathParts: string[] = []
  const fullPathParts: string[] = []
  let current: HTMLElement | null = el
  while (current && current !== document.documentElement) {
    const t = current.tagName.toLowerCase()
    const classes = Array.from(current.classList)
    pathParts.unshift(classes.length > 0 ? `.${classes.join('.')}` : t)
    fullPathParts.unshift(`${t}${current.id ? `#${current.id}` : ''}${classes.length > 0 ? `.${classes.join('.')}` : ''}`)
    if (current.id) { pathParts[0] = `#${current.id}`; break }
    current = current.parentElement
  }

  return {
    accessibility: {
      role: el.getAttribute('role') || undefined,
      label: el.getAttribute('aria-label') || undefined,
      description: undefined,
    },
    boundingBox: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
    computedStyles: {
      color: computed.color,
      borderColor: computed.borderColor,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      fontFamily: computed.fontFamily,
      lineHeight: computed.lineHeight,
      letterSpacing: computed.letterSpacing,
      textAlign: computed.textAlign,
      width: computed.width,
      height: computed.height,
      margin: computed.margin,
      border: computed.border,
      display: computed.display,
      flexDirection: computed.flexDirection,
      opacity: computed.opacity,
      position: computed.position,
      backgroundColor: computed.backgroundColor,
    },
    cssClasses: Array.from(el.classList),
    elementDescription: preview ? `${name}: "${preview}"` : name,
    elementPath: pathParts.join(' > '),
    fullPath: fullPathParts.join(' > '),
    isFixed: computed.position === 'fixed',
    nearbyElements: nearbyTags.join(', '),
    nearbyText: nearbyTextParts.length > 0 ? `[${nearbyTextParts.join(', ')}]` : '',
  }
}

/** Default empty metadata for orphaned elements */
function emptyMetadata(): ElementMetadata {
  return {
    accessibility: {},
    boundingBox: { x: 0, y: 0, width: 0, height: 0 },
    computedStyles: {},
    cssClasses: [],
    elementDescription: '',
    elementPath: '',
    fullPath: '',
    isFixed: false,
    nearbyElements: '',
    nearbyText: '',
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
    const metadata = buildMetadataFromElement(el)
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

/** @deprecated Use loadAsPlaceholders + resolveFromDOM instead */
export function rehydrateFeedbacks(items: SerializedFeedbackItem[]): FeedbackItem[] {
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
