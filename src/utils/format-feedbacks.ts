import type { FeedbackItem, InspectedElement, ComponentInfo } from '../types'
import { detectReact } from './react-fiber'
import { isMultiSelect } from './feedback-helpers'

type FormatMode = 'detailed' | 'debug'

/** Collect current environment info */
function getEnvironment(): {
  viewport: string
  url: string
  userAgent: string
  timestamp: string
  dpr: number
} {
  return {
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    dpr: window.devicePixelRatio,
  }
}

/** Format computed styles as semicolon-separated string */
function formatStyles(styles: Record<string, string>): string {
  return Object.entries(styles)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const prop = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
      return `${prop}: ${v}`
    })
    .join('; ')
}

/** Build element description list for multi-select header */
function buildElementDescriptions(elements: InspectedElement[], maxItems = 5): string {
  const descriptions: string[] = []

  for (let i = 0; i < Math.min(elements.length, maxItems); i++) {
    const el = elements[i]
    const desc = el.metadata?.elementDescription ?? el.selector.split('>').pop()?.trim() ?? 'element'
    descriptions.push(desc)
  }

  if (elements.length > maxItems) {
    descriptions.push(`+${elements.length - maxItems} more`)
  }

  return descriptions.join(', ')
}

/** Get common CSS classes across elements */
function getCommonClasses(elements: InspectedElement[]): string[] {
  const classCounts = new Map<string, number>()

  for (const el of elements) {
    const classes = el.metadata?.cssClasses ?? []
    for (const cls of classes) {
      classCounts.set(cls, (classCounts.get(cls) || 0) + 1)
    }
  }

  const threshold = Math.ceil(elements.length / 2)
  return Array.from(classCounts.entries())
    .filter(([, count]) => count >= threshold)
    .map(([cls]) => cls)
    .slice(0, 3)
}

/** Get context text from first element */
function getContextText(elements: InspectedElement[]): string {
  for (const el of elements) {
    const m = el.metadata
    if (m?.nearbyText) return m.nearbyText
    if (m?.elementDescription) {
      const match = m.elementDescription.match(/"([^"]+)"/)
      if (match) return match[1].slice(0, 40)
    }
  }
  return ''
}

// =============================================================================
// COMPONENT INFO HELPERS
// =============================================================================

/** Get framework info line for output header */
function getFrameworkLine(): string | null {
  try {
    const detection = detectReact()
    if (!detection.detected) return null
    const mode = detection.isDev ? 'development' : 'production'
    return detection.version
      ? `**Framework:** React ${detection.version} (${mode})`
      : `**Framework:** React (${mode})`
  } catch {
    return null
  }
}

/** Format component info lines for a feedback item */
function formatComponentLines(info: ComponentInfo, mode: FormatMode, lines: string[]): void {
  if (info.treePath.length > 0) {
    lines.push(`**Component Tree:** ${info.treePath.join(' > ')}`)
  }

  if (info.source) {
    const file = info.source.fileName.replace(/^(\.\/|\/app\/|\/src\/)/, '')
    lines.push(`**Source:** ${file}:${info.source.lineNumber}`)
  }

  const propEntries = Object.entries(info.props)
  if (propEntries.length > 0) {
    if (mode === 'debug') {
      lines.push(`**Props:**`)
      for (const [key, value] of propEntries) {
        lines.push(`  - ${key}: ${value}`)
      }
    } else {
      const shown = propEntries.slice(0, 5)
      const propsStr = shown.map(([k, v]) => `${k}: ${v}`).join(', ')
      const suffix = propEntries.length > 5 ? `, +${propEntries.length - 5} more` : ''
      lines.push(`**Props:** { ${propsStr}${suffix} }`)
    }
  }
}

// =============================================================================
// UNIFIED FORMATTERS
// =============================================================================

/** Format a single-element feedback for either mode */
function formatSingle(fb: FeedbackItem, mode: FormatMode, lines: string[]): void {
  const m = fb.element?.metadata
  const ci = fb.element?.componentInfo
  const bb = m?.boundingBox

  // Header: prefer component name over element description
  if (ci) {
    const source = ci.source ? ` — ${ci.source.fileName.split('/').pop()}:${ci.source.lineNumber}` : ''
    lines.push(`### ${fb.stepNumber}. <${ci.name} />${source}`)
  } else {
    const desc = m?.elementDescription ?? fb.selector
    lines.push(`### ${fb.stepNumber}. ${desc}`)
  }

  if (fb.orphan) {
    if (mode === 'detailed') {
      lines.push(`**Status:** Orphaned (element not found)`)
      lines.push(`**Last Selector:** \`${fb.selector}\``)
    } else {
      lines.push(`**Status:** Orphaned`)
      lines.push(`**Last Known Selector:** ${fb.selector}`)
    }
    lines.push(`**Feedback:** ${fb.content}`)
    return
  }

  // Component info section (when available)
  if (ci) {
    formatComponentLines(ci, mode, lines)
  }

  if (mode === 'detailed') {
    if (m?.elementPath) lines.push(`**Location:** ${m.elementPath}`)
    if (bb) lines.push(`**Position:** ${bb.x}px, ${bb.y}px (${bb.width}×${bb.height}px)`)
  } else {
    if (m?.fullPath) lines.push(`**Full DOM Path:** ${m.fullPath}`)
    if (bb) lines.push(`**Position:** x:${bb.x}, y:${bb.y} (${bb.width}×${bb.height}px)`)

    if (bb && bb.width > 0) {
      const pctLeft = ((fb.offsetX / bb.width) * 100).toFixed(1)
      const pxFromTop = Math.round(bb.y + fb.offsetY)
      lines.push(`**Annotation at:** ${pctLeft}% from left, ${pxFromTop}px from top`)
    }

    if (m?.computedStyles && Object.keys(m.computedStyles).length > 0) {
      lines.push(`**Computed Styles:** ${formatStyles(m.computedStyles)}`)
    }

    if (m?.nearbyElements) lines.push(`**Nearby Elements:** ${m.nearbyElements}`)
  }

  lines.push(`**Feedback:** ${fb.content}`)
}

/** Format a multi-select feedback for either mode */
function formatMultiSelect(fb: FeedbackItem, mode: FormatMode, lines: string[]): void {
  const elements = fb.elements ?? []
  const elementCount = fb.areaData?.elementCount ?? elements.length
  const areaData = fb.areaData

  if (fb.isAreaOnly) {
    lines.push(`### ${fb.stepNumber}. Area Annotation (empty space)`)
  } else {
    const elementDescs = buildElementDescriptions(elements)
    lines.push(`### ${fb.stepNumber}. ${elementCount} elements: ${elementDescs}`)
  }

  lines.push(`**Location:** multi-select`)

  const commonClasses = getCommonClasses(elements)
  if (commonClasses.length > 0) {
    lines.push(`**Classes:** ${commonClasses.join(', ')}`)
  }

  if (areaData) {
    const x = Math.round(areaData.centerX - areaData.width / 2)
    const y = Math.round(areaData.centerY - areaData.height / 2)
    lines.push(`**Position:** ${x}px, ${y}px (${areaData.width}×${areaData.height}px)`)
  }

  const context = getContextText(elements)
  if (context) {
    lines.push(`**Context:** ${context}`)
  }

  lines.push(`**Feedback:** ${fb.content}`)

  if (fb.isAreaOnly) {
    lines.push('')
    lines.push(mode === 'detailed'
      ? `_Note: This annotation targets empty space, not specific elements._`
      : `_Note: Empty space annotation - no element data._`)
  }
}

/** Format a single feedback item (dispatches to single or multi-select) */
function formatFeedback(fb: FeedbackItem, mode: FormatMode, lines: string[]): void {
  if (isMultiSelect(fb)) {
    formatMultiSelect(fb, mode, lines)
  } else {
    formatSingle(fb, mode, lines)
  }
}

// =============================================================================
// PUBLIC EXPORTS
// =============================================================================

/**
 * Detailed format — lighter markdown with viewport,
 * location (elementPath), position, feedback.
 */
export function formatDetailed(feedbacks: FeedbackItem[]): string {
  const pathname = window.location.pathname
  const lines: string[] = []

  lines.push(`## Page Feedback: ${pathname}`)
  lines.push(`**Viewport:** ${window.innerWidth}×${window.innerHeight}`)
  const frameworkLine = getFrameworkLine()
  if (frameworkLine) lines.push(frameworkLine)

  const sorted = [...feedbacks].sort((a, b) => a.stepNumber - b.stepNumber)

  for (const fb of sorted) {
    lines.push('')
    formatFeedback(fb, 'detailed', lines)
  }

  return lines.join('\n')
}

/** Detailed format for a single feedback item */
export function formatDetailedSingle(fb: FeedbackItem): string {
  const lines: string[] = []

  lines.push(`## Page: ${window.location.pathname}`)
  lines.push(`**Viewport:** ${window.innerWidth}×${window.innerHeight}`)
  const frameworkLine = getFrameworkLine()
  if (frameworkLine) lines.push(frameworkLine)
  lines.push('')

  formatFeedback(fb, 'detailed', lines)

  return lines.join('\n')
}

/**
 * Debug format — rich markdown with environment, full DOM path,
 * computed styles, annotation position, nearby elements.
 */
export function formatDebug(feedbacks: FeedbackItem[]): string {
  const env = getEnvironment()
  const pathname = window.location.pathname
  const lines: string[] = []

  lines.push(`## Page Feedback: ${pathname}`)
  lines.push('')
  lines.push('**Environment:**')
  lines.push(`- Viewport: ${env.viewport}`)
  lines.push(`- URL: ${env.url}`)
  lines.push(`- User Agent: ${env.userAgent}`)
  lines.push(`- Timestamp: ${env.timestamp}`)
  lines.push(`- Device Pixel Ratio: ${env.dpr}`)
  const detection = detectReact()
  if (detection.detected) {
    const mode = detection.isDev ? 'development' : 'production'
    lines.push(`- Framework: React ${detection.version ?? 'unknown'} (${mode})`)
  }
  lines.push('')
  lines.push('---')

  const sorted = [...feedbacks].sort((a, b) => a.stepNumber - b.stepNumber)

  for (const fb of sorted) {
    lines.push('')
    formatFeedback(fb, 'debug', lines)
  }

  return lines.join('\n')
}

/** Debug format for a single feedback item */
export function formatDebugSingle(fb: FeedbackItem): string {
  const env = getEnvironment()
  const lines: string[] = []

  lines.push(`## Page: ${window.location.pathname}`)
  lines.push('')
  lines.push('**Environment:**')
  lines.push(`- Viewport: ${env.viewport}`)
  lines.push(`- URL: ${env.url}`)
  lines.push(`- Timestamp: ${env.timestamp}`)
  lines.push(`- Device Pixel Ratio: ${env.dpr}`)
  const detection = detectReact()
  if (detection.detected) {
    const mode = detection.isDev ? 'development' : 'production'
    lines.push(`- Framework: React ${detection.version ?? 'unknown'} (${mode})`)
  }
  lines.push('')

  formatFeedback(fb, 'debug', lines)

  return lines.join('\n')
}
