/**
 * Embeddable entry point for pro-ui-feedbacks
 *
 * Self-contained IIFE bundle (~21KB gzip) with React bundled.
 * Works on any website without npm/bundler.
 *
 * @example Web Component API
 * ```html
 * <script src="embed.global.js"></script>
 * <pro-ui-feedbacks position="bottom-right" theme="dark"></pro-ui-feedbacks>
 * ```
 *
 * @example Imperative API
 * ```html
 * <script src="embed.global.js"></script>
 * <script>
 *   const widget = ProUIFeedbacks.init({ position: 'bottom-left', theme: 'light' });
 *   // Later: widget.destroy();
 * </script>
 * ```
 */

import { ProUIFeedbacksElement } from './web-component'
import type { ToolbarPosition, ToolbarTheme } from './types'

// Re-export component and types for advanced usage
export { ProUIFeedbacks } from './components/pro-ui-feedbacks'
export type {
  ProUIFeedbacksProps,
  InspectedElement,
  ElementMetadata,
  ElementAccessibility,
  FeedbackItem,
  SerializedFeedbackItem,
  ToolbarPosition,
  ToolbarTheme,
  AreaData,
  AreaBounds,
  InspectAreaEvent,
} from './types'

// ============================================
// Web Component Registration
// ============================================

const ELEMENT_NAME = 'pro-ui-feedbacks'

// Register custom element (only once)
if (typeof window !== 'undefined' && !customElements.get(ELEMENT_NAME)) {
  customElements.define(ELEMENT_NAME, ProUIFeedbacksElement)
}

// ============================================
// Imperative API
// ============================================

export interface InitOptions {
  /** Container element or selector (defaults to document.body) */
  container?: HTMLElement | string
  /** Toolbar position */
  position?: ToolbarPosition
  /** Color theme */
  theme?: ToolbarTheme
  /** z-index for layering */
  zIndex?: number
  /** Start collapsed */
  collapsed?: boolean
  /** LocalStorage key for persistence */
  persist?: string | boolean
  /** URL to POST webhook payloads to */
  syncUrl?: string
  /** Sync mode: 'each' (default) or 'batch' */
  syncMode?: 'each' | 'batch'
  /** Sync on feedback delete */
  syncDelete?: boolean
  /** Sync on feedback update */
  syncUpdate?: boolean
}

export interface WidgetInstance {
  /** The custom element instance */
  element: ProUIFeedbacksElement
  /** Remove the widget from DOM */
  destroy: () => void
}

/**
 * Initialize widget programmatically
 * @param options - Configuration options
 * @returns Widget instance with destroy method
 */
export function init(options: InitOptions = {}): WidgetInstance {
  const {
    container = document.body,
    position = 'bottom-right',
    theme = 'dark',
    zIndex = 9999,
    collapsed = true,
    persist,
    syncUrl,
    syncMode,
    syncDelete,
    syncUpdate,
  } = options

  // Resolve container
  const targetContainer =
    typeof container === 'string' ? document.querySelector(container) : container

  if (!targetContainer) {
    throw new Error(`[pro-ui-feedbacks] Container not found: ${container}`)
  }

  // Create and configure element
  const element = document.createElement(ELEMENT_NAME) as ProUIFeedbacksElement
  element.setAttribute('position', position)
  element.setAttribute('theme', theme)
  element.setAttribute('z-index', String(zIndex))
  element.setAttribute('collapsed', String(collapsed))

  if (persist !== undefined) {
    element.setAttribute('persist', persist === true ? '' : String(persist))
  }

  // Sync attributes
  if (syncUrl) element.setAttribute('sync-url', syncUrl)
  if (syncMode) element.setAttribute('sync-mode', syncMode)
  if (syncDelete) element.setAttribute('sync-delete', 'true')
  if (syncUpdate) element.setAttribute('sync-update', 'true')

  // Append to container
  targetContainer.appendChild(element)

  return {
    element,
    destroy: () => element.remove(),
  }
}
