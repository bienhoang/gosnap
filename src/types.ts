import type { ReactNode, CSSProperties } from 'react'

export type ToolbarPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export type ToolbarTheme = 'dark' | 'light'

/** Inspection mode: DOM-level or React component-level */
export type InspectMode = 'dom' | 'component'

/** Accessibility info extracted from the element */
export interface ElementAccessibility {
  role?: string
  label?: string
  description?: string
}

/** Rich metadata captured at inspection time */
export interface ElementMetadata {
  /** Accessibility attributes (role, aria-label, aria-describedby) */
  accessibility: ElementAccessibility
  /** Bounding box in viewport coordinates */
  boundingBox: { x: number; y: number; width: number; height: number }
  /** Key computed CSS styles */
  computedStyles: Record<string, string>
  /** CSS class list */
  cssClasses: string[]
  /** Human-readable element description, e.g. `paragraph: "Some text..."` */
  elementDescription: string
  /** Short class-based CSS path, e.g. `.main-content > .article > section > p` */
  elementPath: string
  /** Full tag+class CSS path, e.g. `body > main.main-content > article.article > section > p` */
  fullPath: string
  /** Whether element has position: fixed */
  isFixed: boolean
  /** Tag names of nearby sibling elements */
  nearbyElements: string
  /** Text content of adjacent elements */
  nearbyText: string
}

/** Metadata about an inspected DOM element */
export interface InspectedElement {
  element: HTMLElement
  tagName: string
  className: string
  id: string
  /** Generated CSS selector for the element (unique, for querySelector) */
  selector: string
  rect: DOMRect
  dimensions: { width: number; height: number }
  /** Rich metadata about the element */
  metadata: ElementMetadata
  /** React component info (present only in component inspect mode) */
  componentInfo?: ComponentInfo
}

/** React component info extracted from Fiber internals */
export interface ComponentInfo {
  /** Component name (may be minified in production) */
  name: string
  /** Display name if set (e.g., via Component.displayName) */
  displayName?: string
  /** Source file location (development builds only) */
  source?: { fileName: string; lineNumber: number }
  /** Serialized props (smart-truncated, security-filtered) */
  props: Record<string, string>
  /** Component tree breadcrumb from root, e.g. ['App', 'Layout', 'Card'] */
  treePath: string[]
  /** Union bounding box of all DOM nodes rendered by this component */
  boundary: DOMRect
  /** True if name appears to be minified (production build) */
  isMinified?: boolean
}

/** React framework detection result */
export interface ReactDetection {
  /** Whether React was detected on the page */
  detected: boolean
  /** React version string if detected */
  version?: string
  /** Whether development mode is detected (presence of _debugSource) */
  isDev?: boolean
}

/** Metadata for area (drag) selection */
export interface AreaData {
  /** Absolute page X coordinate of area center */
  centerX: number
  /** Absolute page Y coordinate of area center */
  centerY: number
  /** Area width in pixels */
  width: number
  /** Area height in pixels */
  height: number
  /** Total elements count in group */
  elementCount: number
}

/** Area bounds in viewport coordinates */
export interface AreaBounds {
  x: number
  y: number
  width: number
  height: number
}

/** Event emitted when area selection completes (drag-to-select) */
export interface InspectAreaEvent {
  /** Normalized area bounds (x/y = top-left) in viewport coords */
  area: AreaBounds
  /** Elements fully or partially within the area */
  elements: InspectedElement[]
}

/** A single feedback annotation tied to a DOM element or group of elements */
export interface FeedbackItem {
  id: string
  /** Step number (1-based) */
  stepNumber: number
  /** Feedback text entered by user */
  content: string
  /** CSS selector of the target element (used to re-find it in DOM) */
  selector: string
  /** Offset from target element's top-left corner */
  offsetX: number
  offsetY: number
  /** Absolute page coordinates of the click/area center */
  pageX: number
  pageY: number
  /** The target DOM element reference (null when orphaned after reload or group) */
  targetElement: HTMLElement | null
  /** Inspected element metadata at creation time (null when orphaned or group) */
  element: InspectedElement | null
  createdAt: number
  /** True when the target element could not be found after rehydration */
  orphan?: boolean
  /** Area metadata for multi-select (undefined for single-element) */
  areaData?: AreaData
  /** True if annotation on empty space (no elements) */
  isAreaOnly?: boolean
  /** Array of elements for multi-select (undefined for single-element) */
  elements?: InspectedElement[]
}

/** Serialized element for multi-select persistence */
export interface SerializedElement {
  selector: string
  tagName: string
  className: string
  elementId: string
  metadata?: ElementMetadata
  /** True when element not found on reload */
  orphan?: boolean
}

/** JSON-serializable subset of FeedbackItem for localStorage persistence */
export interface SerializedFeedbackItem {
  id: string
  stepNumber: number
  content: string
  selector: string
  offsetX: number
  offsetY: number
  pageX: number
  pageY: number
  createdAt: number
  tagName: string
  className: string
  elementId: string
  /** Rich element metadata (persisted) */
  metadata?: ElementMetadata
  /** Area data for multi-select */
  areaData?: AreaData
  /** Empty space annotation flag */
  isAreaOnly?: boolean
  /** Serialized elements for multi-select */
  elements?: SerializedElement[]
}

// =============================================================================
// SYNC TYPES
// =============================================================================

/** Sync mode: 'each' fires per feedback, 'batch' collects and fires on trigger */
export type SyncMode = 'each' | 'batch'

/** Event types for sync payloads */
export type SyncEventType = 'feedback.created' | 'feedback.updated' | 'feedback.deleted' | 'feedback.batch'

/** Serialized element data for sync (no DOM refs) */
export interface SyncElementData {
  selector: string
  tagName: string
  className: string
  elementId: string
  elementPath?: string
  fullPath?: string
  elementDescription?: string
  boundingBox?: { x: number; y: number; width: number; height: number }
  accessibility?: { role?: string; label?: string }
  /** Component name (if inspected in component mode) */
  componentName?: string
  /** Component tree path */
  componentTree?: string[]
  /** Serialized component props */
  componentProps?: Record<string, string>
}

/** Single feedback in sync payload */
export interface SyncFeedbackData {
  id: string
  stepNumber: number
  content: string
  selector: string
  pageX: number
  pageY: number
  createdAt: number
  element?: SyncElementData
  areaData?: AreaData
  isAreaOnly?: boolean
  elements?: SyncElementData[]
}

/** Webhook payload sent to sync endpoint */
export interface SyncPayload {
  event: SyncEventType
  timestamp: number
  page: {
    url: string
    pathname: string
    viewport: { width: number; height: number }
  }
  feedback?: SyncFeedbackData
  feedbacks?: SyncFeedbackData[]
  feedbackId?: string
  updatedContent?: string
}

/** Sync configuration props */
export interface SyncConfig {
  /** URL to POST webhook payloads to */
  syncUrl?: string
  /** Additional headers for sync requests */
  syncHeaders?: Record<string, string>
  /** Sync mode: 'each' (default) or 'batch' */
  syncMode?: SyncMode
  /** Sync on feedback delete (default: false) */
  syncDelete?: boolean
  /** Sync on feedback update (default: false) */
  syncUpdate?: boolean
  /** Called on successful sync */
  onSyncSuccess?: (payload: SyncPayload) => void
  /** Called on sync failure after retries exhausted */
  onSyncError?: (error: Error, payload: SyncPayload) => void
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface GoSnapProps extends SyncConfig {
  /** Callback when Start/Stop is toggled */
  onToggle?: (active: boolean) => void
  /** Callback when an element is selected via inspector */
  onInspect?: (element: InspectedElement) => void
  /** Callback when a feedback is submitted */
  onFeedbackSubmit?: (feedback: FeedbackItem) => void
  /** Callback when a feedback is deleted */
  onFeedbackDelete?: (feedbackId: string) => void
  /** Callback when a feedback is updated */
  onFeedbackUpdate?: (feedbackId: string, content: string) => void
  /** Callback when Feedbacks toolbar button is clicked */
  onFeedback?: () => void
  /** Callback when Copy is clicked */
  onCopy?: () => void
  /** Callback when Delete is clicked */
  onDelete?: () => void
  /** Callback when Settings is clicked */
  onSettings?: () => void
  /** Position on viewport */
  position?: ToolbarPosition
  /** Color theme */
  theme?: ToolbarTheme
  /** Start collapsed */
  defaultCollapsed?: boolean
  /** Custom z-index */
  zIndex?: number
  /** Custom trigger icon (shown when collapsed) */
  triggerIcon?: ReactNode
  /** Additional inline styles for the container */
  style?: CSSProperties
  /** Enable localStorage persistence. `true` = per-page key, string = custom key */
  persist?: boolean | string
  /** Custom portal container for rendering overlays (used by Web Component) */
  portalContainer?: HTMLElement
  /** Default inspection mode ('dom' or 'component'). Default: 'dom' */
  defaultInspectMode?: InspectMode
}
