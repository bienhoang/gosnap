import type { FeedbackItem } from '../types'

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
      // Convert camelCase to kebab-case for display
      const prop = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
      return `${prop}: ${v}`
    })
    .join('; ')
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
  lines.push('')
  lines.push('---')

  for (const fb of feedbacks) {
    const m = fb.element?.metadata
    const bb = m?.boundingBox

    lines.push('')
    // Heading: step + element description
    const desc = m?.elementDescription ?? fb.selector
    lines.push(`### ${fb.stepNumber}. ${desc}`)

    // Full DOM path
    if (m?.fullPath) {
      lines.push(`**Full DOM Path:** ${m.fullPath}`)
    }

    // Position: x, y (width×height)
    if (bb) {
      lines.push(`**Position:** x:${bb.x}, y:${bb.y} (${bb.width}×${bb.height}px)`)
    }

    // Annotation at: % from left, px from top
    if (bb && bb.width > 0) {
      const pctLeft = ((fb.offsetX / bb.width) * 100).toFixed(1)
      const pxFromTop = Math.round(bb.y + fb.offsetY)
      lines.push(`**Annotation at:** ${pctLeft}% from left, ${pxFromTop}px from top`)
    }

    // Computed styles
    if (m?.computedStyles && Object.keys(m.computedStyles).length > 0) {
      lines.push(`**Computed Styles:** ${formatStyles(m.computedStyles)}`)
    }

    // Nearby elements
    if (m?.nearbyElements) {
      lines.push(`**Nearby Elements:** ${m.nearbyElements}`)
    }

    // Feedback content
    lines.push(`**Feedback:** ${fb.content}`)
  }

  return lines.join('\n')
}

/**
 * Detailed format — lighter markdown with viewport,
 * location (elementPath), position, feedback.
 */
export function formatDetailed(feedbacks: FeedbackItem[]): string {
  const pathname = window.location.pathname
  const lines: string[] = []

  lines.push(`## Page Feedback: ${pathname}`)
  lines.push(`**Viewport:** ${window.innerWidth}×${window.innerHeight}`)

  for (const fb of feedbacks) {
    const m = fb.element?.metadata
    const bb = m?.boundingBox

    lines.push('')
    // Heading: step + element description
    const desc = m?.elementDescription ?? fb.selector
    lines.push(`### ${fb.stepNumber}. ${desc}`)

    // Location: elementPath (short class-based)
    if (m?.elementPath) {
      lines.push(`**Location:** ${m.elementPath}`)
    }

    // Position
    if (bb) {
      lines.push(`**Position:** ${bb.x}px, ${bb.y}px (${bb.width}×${bb.height}px)`)
    }

    // Feedback content
    lines.push(`**Feedback:** ${fb.content}`)
  }

  return lines.join('\n')
}
