/**
 * Web Component wrapper for ProUIFeedbacks
 * Enables usage as <pro-ui-feedbacks> custom element
 */

import React from 'react'
import { createRoot, Root } from 'react-dom/client'
import { ProUIFeedbacks } from './components/pro-ui-feedbacks'
import type { ProUIFeedbacksProps, ToolbarPosition, ToolbarTheme } from './types'

const OBSERVED_ATTRS = ['position', 'theme', 'z-index', 'collapsed', 'persist'] as const

/**
 * Custom Element that wraps ProUIFeedbacks React component
 * Uses Shadow DOM for style isolation from host page
 *
 * @example
 * ```html
 * <pro-ui-feedbacks position="bottom-right" theme="dark"></pro-ui-feedbacks>
 * ```
 */
export class ProUIFeedbacksElement extends HTMLElement {
  private root: Root | null = null
  private shadowContainer: HTMLDivElement | null = null

  static get observedAttributes() {
    return [...OBSERVED_ATTRS]
  }

  connectedCallback() {
    // Create Shadow DOM for style isolation
    const shadow = this.attachShadow({ mode: 'open' })

    // Create container for React - reset inherited styles
    this.shadowContainer = document.createElement('div')
    this.shadowContainer.style.all = 'initial'
    this.shadowContainer.style.fontFamily =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    shadow.appendChild(this.shadowContainer)

    // Create React root and render
    this.root = createRoot(this.shadowContainer)
    this.render()
  }

  disconnectedCallback() {
    // Cleanup React on element removal
    this.root?.unmount()
    this.root = null
    this.shadowContainer = null
  }

  attributeChangedCallback() {
    // Re-render when attributes change
    this.render()
  }

  private render() {
    if (!this.root || !this.shadowContainer) return

    const props = this.getProps()
    this.root.render(React.createElement(ProUIFeedbacks, props))
  }

  private getProps(): ProUIFeedbacksProps {
    // Parse attributes to React props
    const position = (this.getAttribute('position') || 'bottom-right') as ToolbarPosition
    const theme = (this.getAttribute('theme') || 'dark') as ToolbarTheme
    const zIndex = parseInt(this.getAttribute('z-index') || '9999', 10)
    const collapsed = this.getAttribute('collapsed') !== 'false'
    const persistAttr = this.getAttribute('persist')

    return {
      position,
      theme,
      zIndex,
      defaultCollapsed: collapsed,
      persist: persistAttr === '' ? true : persistAttr || undefined,
      // Portal container for Shadow DOM rendering
      portalContainer: this.shadowContainer!,
      // Callback wrappers that dispatch CustomEvents
      onToggle: (active) => this.dispatch('toggle', { active }),
      onInspect: (element) => this.dispatch('inspect', { element }),
      onFeedbackSubmit: (feedback) => this.dispatch('feedback-submit', { feedback }),
      onFeedbackDelete: (feedbackId) => this.dispatch('feedback-delete', { feedbackId }),
      onFeedbackUpdate: (feedbackId, content) =>
        this.dispatch('feedback-update', { feedbackId, content }),
      onCopy: () => this.dispatch('copy', {}),
      onDelete: () => this.dispatch('delete', {}),
      onSettings: () => this.dispatch('settings', {}),
      onFeedback: () => this.dispatch('feedback', {}),
    }
  }

  private dispatch(name: string, detail: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }))
  }
}
