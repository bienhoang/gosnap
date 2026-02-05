import type { ReactNode, CSSProperties } from 'react'

export type ToolbarPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export type ToolbarTheme = 'dark' | 'light'

/** Metadata about an inspected DOM element */
export interface InspectedElement {
  element: HTMLElement
  tagName: string
  className: string
  id: string
  /** Generated CSS selector for the element */
  selector: string
  rect: DOMRect
  dimensions: { width: number; height: number }
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
  createdAt: number
  tagName: string
  className: string
  elementId: string
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
