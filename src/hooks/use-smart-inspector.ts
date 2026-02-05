import { useState, useEffect, useCallback, useRef } from 'react'
import type { InspectedElement, ElementMetadata, ElementAccessibility } from '../types'

/** Escape a string for use in CSS selectors (IDs, classes) */
function esc(value: string): string {
  return typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(value) : value.replace(/([^\w-])/g, '\\$1')
}

/** Generate a unique CSS selector for an element by walking up the DOM tree */
function generateSelector(el: HTMLElement): string {
  if (el.id) return `#${esc(el.id)}`

  const parts: string[] = []
  let current: HTMLElement | null = el

  while (current && current !== document.body && current !== document.documentElement) {
    let part = current.tagName.toLowerCase()

    if (current.id) {
      parts.unshift(`#${esc(current.id)}`)
      break
    }

    const parent = current.parentElement
    if (parent) {
      const sameTag = Array.from(parent.children).filter(
        (child) => child.tagName === current!.tagName,
      )
      if (sameTag.length > 1) {
        const index = sameTag.indexOf(current) + 1
        part += `:nth-of-type(${index})`
      }
    }

    parts.unshift(part)
    current = current.parentElement
  }

  return parts.join(' > ')
}

/** Generate a class-based short path, e.g. `.main > .article > p` */
function generateElementPath(el: HTMLElement): string {
  const parts: string[] = []
  let current: HTMLElement | null = el

  while (current && current !== document.body && current !== document.documentElement) {
    const classes = Array.from(current.classList)
    const tag = current.tagName.toLowerCase()
    const part = classes.length > 0
      ? `.${classes.map(esc).join('.')}` // class-based
      : tag // fallback to tag
    parts.unshift(part)
    if (current.id) { parts[0] = `#${esc(current.id)}`; break }
    current = current.parentElement
  }

  return parts.join(' > ')
}

/** Generate full tag+class path, e.g. `body > main.main-content > p` */
function generateFullPath(el: HTMLElement): string {
  const parts: string[] = []
  let current: HTMLElement | null = el

  while (current && current !== document.documentElement) {
    const tag = current.tagName.toLowerCase()
    const classes = Array.from(current.classList)
    const suffix = classes.length > 0 ? `.${classes.map(esc).join('.')}` : ''
    const idSuffix = current.id ? `#${esc(current.id)}` : ''
    parts.unshift(`${tag}${idSuffix}${suffix}`)
    current = current.parentElement
  }

  return parts.join(' > ')
}

/** Extract accessibility attributes */
function extractAccessibility(el: HTMLElement): ElementAccessibility {
  return {
    role: el.getAttribute('role') || el.closest('[role]')?.getAttribute('role') || undefined,
    label: el.getAttribute('aria-label') || el.closest('[aria-label]')?.getAttribute('aria-label') || undefined,
    description: el.getAttribute('aria-describedby')
      ? document.getElementById(el.getAttribute('aria-describedby')!)?.textContent?.trim() || undefined
      : undefined,
  }
}

/** Build human-readable element description, e.g. `paragraph: "Some text..."` */
function buildElementDescription(el: HTMLElement): string {
  const tagMap: Record<string, string> = {
    p: 'paragraph', a: 'link', img: 'image', button: 'button',
    input: 'input', h1: 'heading 1', h2: 'heading 2', h3: 'heading 3',
    h4: 'heading 4', h5: 'heading 5', h6: 'heading 6', li: 'list item',
    span: 'span', div: 'div', section: 'section', nav: 'nav',
    header: 'header', footer: 'footer', main: 'main', form: 'form',
    table: 'table', textarea: 'textarea', select: 'select', label: 'label',
  }
  const tag = el.tagName.toLowerCase()
  const name = tagMap[tag] || tag
  const text = el.textContent?.trim() || ''
  const preview = text.length > 60 ? text.slice(0, 57) + '...' : text
  return preview ? `${name}: "${preview}"` : name
}

/** Get nearby sibling element tag names */
function getNearbyElements(el: HTMLElement): string {
  const siblings = el.parentElement ? Array.from(el.parentElement.children) : []
  const idx = siblings.indexOf(el)
  const nearby: string[] = []
  if (idx > 0) nearby.push(siblings[idx - 1].tagName.toLowerCase())
  if (idx < siblings.length - 1) nearby.push(siblings[idx + 1].tagName.toLowerCase())
  return nearby.join(', ')
}

/** Get text content of adjacent siblings */
function getNearbyText(el: HTMLElement): string {
  const parts: string[] = []
  const prev = el.previousElementSibling
  const next = el.nextElementSibling

  if (prev?.textContent?.trim()) {
    const t = prev.textContent.trim()
    parts.push(`before: "${t.length > 40 ? t.slice(0, 37) + '...' : t}"`)
  }
  if (next?.textContent?.trim()) {
    const t = next.textContent.trim()
    parts.push(`after: "${t.length > 40 ? t.slice(0, 37) + '...' : t}"`)
  }

  return parts.length > 0 ? `[${parts.join(', ')}]` : ''
}

/** CSS properties to capture for metadata */
const CAPTURED_STYLES = [
  'color', 'borderColor', 'fontSize', 'fontWeight', 'fontFamily',
  'lineHeight', 'letterSpacing', 'textAlign', 'width', 'height',
  'margin', 'border', 'display', 'flexDirection', 'opacity',
  'position', 'backgroundColor', 'padding', 'borderRadius',
] as const

/** Collect rich element metadata */
function collectMetadata(el: HTMLElement): ElementMetadata {
  const rect = el.getBoundingClientRect()
  const computed = window.getComputedStyle(el)

  const computedStyles: Record<string, string> = {}
  for (const prop of CAPTURED_STYLES) {
    computedStyles[prop] = computed.getPropertyValue(
      prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
    )
  }

  return {
    accessibility: extractAccessibility(el),
    boundingBox: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
    computedStyles,
    cssClasses: Array.from(el.classList),
    elementDescription: buildElementDescription(el),
    elementPath: generateElementPath(el),
    fullPath: generateFullPath(el),
    isFixed: computed.position === 'fixed',
    nearbyElements: getNearbyElements(el),
    nearbyText: getNearbyText(el),
  }
}

/** Build InspectedElement metadata from a DOM element */
function buildInspectedElement(el: HTMLElement): InspectedElement {
  const rect = el.getBoundingClientRect()
  return {
    element: el,
    tagName: el.tagName.toLowerCase(),
    className: typeof el.className === 'string' ? el.className : (el.className as unknown as SVGAnimatedString)?.baseVal ?? '',
    id: el.id,
    selector: generateSelector(el),
    rect,
    dimensions: { width: Math.round(rect.width), height: Math.round(rect.height) },
    metadata: collectMetadata(el),
  }
}

export interface InspectClickEvent {
  element: InspectedElement
  /** Viewport X where click occurred */
  clickX: number
  /** Viewport Y where click occurred */
  clickY: number
}

interface UseSmartInspectorOptions {
  active: boolean
  onInspect?: (element: InspectedElement) => void
  /** Enhanced callback with click coordinates for feedback positioning */
  onInspectClick?: (event: InspectClickEvent) => void
  onDeactivate?: () => void
  /** Ref to exclude from inspection (e.g. the toolbar itself) */
  excludeRef?: React.RefObject<HTMLElement | null>
}

export function useSmartInspector({ active, onInspect, onInspectClick, onDeactivate, excludeRef }: UseSmartInspectorOptions) {
  const [hoveredElement, setHoveredElement] = useState<InspectedElement | null>(null)
  const rafRef = useRef<number>(0)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Throttle via rAF for smooth performance
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      if (!target || target === document.documentElement || target === document.body) {
        setHoveredElement(null)
        return
      }
      // Skip toolbar elements
      if (excludeRef?.current?.contains(target)) {
        setHoveredElement(null)
        return
      }
      // Skip our own overlay elements
      if (target.closest('[data-smart-inspector]')) {
        return
      }
      setHoveredElement(buildInspectedElement(target))
    })
  }, [excludeRef])

  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement | null
    // Let toolbar clicks through
    if (excludeRef?.current?.contains(target)) return
    // Let our overlay clicks through
    if (target?.closest('[data-smart-inspector]')) return

    e.preventDefault()
    e.stopPropagation()

    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    if (el && el !== document.documentElement && el !== document.body) {
      const inspected = buildInspectedElement(el)
      onInspect?.(inspected)
      onInspectClick?.({ element: inspected, clickX: e.clientX, clickY: e.clientY })
    }
  }, [excludeRef, onInspect, onInspectClick])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onDeactivate?.()
    }
  }, [onDeactivate])

  useEffect(() => {
    if (!active) {
      setHoveredElement(null)
      return
    }

    // Add cursor style to body
    document.body.style.cursor = 'crosshair'

    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('click', handleClick, true)
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.body.style.cursor = ''
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [active, handleMouseMove, handleClick, handleKeyDown])

  return { hoveredElement }
}
