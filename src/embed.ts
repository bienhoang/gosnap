/**
 * Embeddable entry point for pro-ui-feedbacks
 *
 * Self-contained IIFE bundle (~21KB gzip) with React bundled.
 * Works on any website without npm/bundler.
 *
 * @example
 * ```html
 * <script src="embed.global.js"></script>
 * <script>
 *   const { ProUIFeedbacks } = window.ProUIFeedbacks;
 * </script>
 * ```
 *
 * Phases:
 * - Phase 1: Build configuration (current)
 * - Phase 2: Web Component registration (<pro-ui-feedbacks>)
 * - Phase 3: Imperative API (ProUIFeedbacks.init())
 */

// Re-export component and types (same as index.ts)
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

// Phase 2: Web Component registration will be added here
// Phase 3: Imperative API (init/destroy) will be added here
