/**
 * Utilities for detecting elements within a drag selection area.
 * Used by both the smart inspector hook and the overlay component.
 */

import type { AreaBounds } from '../types'

// Re-export for convenience
export type { AreaBounds }

const EXCLUDED_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'HEAD', 'HTML'])

/** Check if element should be excluded from selection */
function isExcluded(el: HTMLElement, excludeRef?: React.RefObject<HTMLElement | null>): boolean {
  if (EXCLUDED_TAGS.has(el.tagName)) return true
  if (el.closest('[data-smart-inspector]')) return true
  if (excludeRef?.current?.contains(el)) return true

  const style = getComputedStyle(el)
  if (style.display === 'none') return true
  if (style.visibility === 'hidden') return true
  // Skip elements with no offset parent (hidden) except fixed/sticky
  if (el.offsetParent === null && style.position !== 'fixed' && style.position !== 'sticky') return true

  return false
}

/** Check if two rectangles intersect */
export function rectsIntersect(a: DOMRect | AreaBounds, b: AreaBounds): boolean {
  const aRight = 'right' in a ? a.right : a.x + a.width
  const aBottom = 'bottom' in a ? a.bottom : a.y + a.height
  const aLeft = 'left' in a ? a.left : a.x
  const aTop = 'top' in a ? a.top : a.y

  return !(
    aRight < b.x ||
    aLeft > b.x + b.width ||
    aBottom < b.y ||
    aTop > b.y + b.height
  )
}

/** Normalize drag coordinates to ensure positive width/height (handles any drag direction) */
export function normalizeArea(x1: number, y1: number, x2: number, y2: number): AreaBounds {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  }
}

/** Filter to keep only "leaf" elements - remove ancestors of other selected elements */
function filterToLeafElements(elements: HTMLElement[]): HTMLElement[] {
  return elements.filter((el) => {
    return !elements.some((other) => other !== el && el.contains(other))
  })
}

/** Maximum elements to return (performance guard) */
const MAX_ELEMENTS = 50

/**
 * Get all visible elements that intersect with the given area.
 * Returns leaf elements only (no ancestors of other selected elements).
 */
export function getElementsInArea(
  area: AreaBounds,
  excludeRef?: React.RefObject<HTMLElement | null>
): HTMLElement[] {
  const elements: HTMLElement[] = []
  const seen = new Set<HTMLElement>()

  // Use TreeWalker for efficient DOM traversal
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        const el = node as HTMLElement
        if (isExcluded(el, excludeRef)) return NodeFilter.FILTER_REJECT
        return NodeFilter.FILTER_ACCEPT
      }
    }
  )

  while (walker.nextNode()) {
    const el = walker.currentNode as HTMLElement
    if (seen.has(el)) continue

    const rect = el.getBoundingClientRect()
    // Skip zero-size elements
    if (rect.width === 0 || rect.height === 0) continue

    if (rectsIntersect(rect, area)) {
      seen.add(el)
      elements.push(el)
    }

    // Early exit if we have too many elements
    if (elements.length >= MAX_ELEMENTS * 2) break
  }

  // Filter to leaf elements and limit
  return filterToLeafElements(elements).slice(0, MAX_ELEMENTS)
}
