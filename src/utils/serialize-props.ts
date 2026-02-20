/** Keys to always skip during serialization */
const SKIP_KEYS = new Set(['children', 'key', 'ref', '$$typeof', '__self', '__source'])

/** Security-sensitive key patterns */
const SENSITIVE_PATTERN = /password|token|secret|apiKey|authorization|credential/i

/** Max string length before truncation */
const MAX_STRING_LENGTH = 50

/** Max props to serialize */
const MAX_PROPS = 15

/** Serialize a single value to a display string */
function serializeValue(value: unknown, depth: number): string | null {
  if (value === null) return 'null'
  if (value === undefined) return null

  switch (typeof value) {
    case 'boolean':
      return String(value)
    case 'number':
      return String(value)
    case 'string': {
      const truncated = value.length > MAX_STRING_LENGTH
        ? `${value.slice(0, MAX_STRING_LENGTH - 3)}...`
        : value
      return `"${truncated}"`
    }
    case 'function': {
      const name = (value as Function).name || 'anonymous'
      return `ƒ ${name}()`
    }
    case 'symbol':
      return `Symbol(${(value as symbol).description || ''})`
    case 'object': {
      if (Array.isArray(value)) {
        return `[${value.length} items]`
      }
      // React element detection
      if (value && typeof value === 'object' && '$$typeof' in value) {
        const el = value as { type?: { displayName?: string; name?: string } | string }
        const typeName = typeof el.type === 'string'
          ? el.type
          : el.type?.displayName || el.type?.name || 'Component'
        return `<${typeName} />`
      }
      // Plain object: 1-level serialization (no nesting beyond depth 0)
      if (depth > 0) return '{...}'
      const entries = Object.entries(value as Record<string, unknown>)
      if (entries.length === 0) return '{}'
      const parts = entries.slice(0, 5).map(([k, v]) => {
        const serialized = serializeValue(v, depth + 1)
        return serialized !== null ? `${k}: ${serialized}` : null
      }).filter(Boolean)
      const suffix = entries.length > 5 ? ', ...' : ''
      return `{ ${parts.join(', ')}${suffix} }`
    }
    default:
      return String(value)
  }
}

/**
 * Serialize React component props to display-friendly strings.
 * Skips internal keys (children, key, ref), security-sensitive keys,
 * and applies smart truncation for functions, objects, arrays, and long strings.
 */
export function serializeProps(props: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {}
  let count = 0

  for (const [key, value] of Object.entries(props)) {
    if (count >= MAX_PROPS) break
    if (SKIP_KEYS.has(key)) continue
    if (SENSITIVE_PATTERN.test(key)) continue
    if (value === undefined) continue

    const serialized = serializeValue(value, 0)
    if (serialized !== null) {
      result[key] = serialized
      count++
    }
  }

  return result
}
