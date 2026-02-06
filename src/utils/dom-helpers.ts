import type { FeedbackItem } from '../types'

/** Safe querySelector that returns null on invalid selectors */
export function safeQuerySelector(selector: string): HTMLElement | null {
  if (!selector) return null
  try {
    return document.querySelector(selector) as HTMLElement | null
  } catch {
    return null
  }
}

/** Resolve the target element for a feedback — use stored ref, fall back to querySelector */
export function resolveElement(fb: FeedbackItem): HTMLElement | null {
  if (fb.targetElement?.isConnected) return fb.targetElement
  if (!fb.selector) return null
  return safeQuerySelector(fb.selector)
}
