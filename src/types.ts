import type { ReactNode, CSSProperties } from 'react'

export type ToolbarPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export type ToolbarTheme = 'dark' | 'light'

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
}

/** A single feedback annotation tied to a DOM element */
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
  /** Absolute page coordinates of the click */
  pageX: number
  pageY: number
  /** The target DOM element reference (null when orphaned after reload) */
  targetElement: HTMLElement | null
  /** Inspected element metadata at creation time (null when orphaned) */
  element: InspectedElement | null
  createdAt: number
  /** True when the target element could not be found after rehydration */
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
}

export interface ProUIFeedbacksProps {
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
}
