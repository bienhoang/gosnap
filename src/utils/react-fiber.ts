import type { ComponentInfo, ReactDetection } from '../types'
import { serializeProps } from './serialize-props'

// =============================================================================
// INTERNAL TYPES
// =============================================================================

/** Minimal Fiber node shape — only fields we access */
interface FiberNode {
  tag: number
  type: string | (Function & { displayName?: string; name?: string; render?: Function; type?: Function })
  memoizedProps: Record<string, unknown> | null
  _debugSource?: { fileName: string; lineNumber: number; columnNumber?: number }
  return: FiberNode | null
  child: FiberNode | null
  sibling: FiberNode | null
  stateNode: HTMLElement | null
}

// Fiber tags we skip when looking for custom components
const HOST_TAGS = new Set([3, 5, 6, 27]) // HostRoot, HostComponent, HostText, HostHoistable

/** Max iterations for fiber walks (safety guard) */
const MAX_WALK = 50
const MAX_TREE_DEPTH = 20
const MAX_BOUNDARY_NODES = 100

// =============================================================================
// FIBER ACCESS
// =============================================================================

/** Get React Fiber node attached to a DOM element */
export function getReactFiber(element: HTMLElement): FiberNode | null {
  try {
    const key = Object.keys(element).find(
      (k) =>
        k.startsWith('__reactFiber$') ||
        k.startsWith('__reactInternalInstance$') ||
        k.startsWith('__reactContainer$'),
    )
    return key ? (element as unknown as Record<string, FiberNode>)[key] : null
  } catch {
    return null
  }
}

/** Resolve component name from a fiber's type */
function resolveComponentName(fiber: FiberNode): string {
  const { type, tag } = fiber
  if (typeof type === 'function') {
    // ForwardRef (tag 11): name is on type.render
    if (tag === 11 && type.render) {
      const render = type.render as Function & { displayName?: string; name?: string }
      return render.displayName || render.name || 'ForwardRef'
    }
    // Memo (tag 15): name is on type.type
    if (tag === 15 && type.type) {
      const inner = type.type as Function & { displayName?: string; name?: string }
      return inner.displayName || inner.name || 'Memo'
    }
    return type.displayName || type.name || 'Anonymous'
  }
  return 'Anonymous'
}

// =============================================================================
// COMPONENT RESOLUTION
// =============================================================================

/** Find nearest custom React component by walking fiber tree upward */
export function findNearestComponent(
  fiber: FiberNode,
): { fiber: FiberNode; name: string } | null {
  let current: FiberNode | null = fiber
  let iterations = 0

  while (current && iterations < MAX_WALK) {
    iterations++
    // Skip host elements (div, span, etc.) and internal React fibers
    if (typeof current.type === 'function' && !HOST_TAGS.has(current.tag)) {
      return { fiber: current, name: resolveComponentName(current) }
    }
    current = current.return
  }
  return null
}

/** Build component tree breadcrumb from fiber to root */
export function buildComponentTree(fiber: FiberNode): string[] {
  const path: string[] = []
  let current: FiberNode | null = fiber
  let iterations = 0

  while (current && iterations < MAX_WALK) {
    iterations++
    if (typeof current.type === 'function' && !HOST_TAGS.has(current.tag)) {
      const name = resolveComponentName(current)
      // Deduplicate consecutive same-name entries (memo wrappers)
      if (path.length === 0 || path[path.length - 1] !== name) {
        path.push(name)
      }
    }
    current = current.return
    if (path.length >= MAX_TREE_DEPTH) break
  }

  return path.reverse()
}

// =============================================================================
// COMPONENT BOUNDARY
// =============================================================================

/** Collect all host DOM nodes rendered by a component fiber */
function collectHostNodes(fiber: FiberNode): HTMLElement[] {
  const nodes: HTMLElement[] = []
  const stack: FiberNode[] = [fiber]
  let visited = 0

  // Walk child/sibling tree; stop at another custom component boundary
  while (stack.length > 0 && visited < MAX_BOUNDARY_NODES) {
    const node = stack.pop()!
    visited++

    if (node.stateNode instanceof HTMLElement && typeof node.type === 'string') {
      nodes.push(node.stateNode)
    }

    // Descend into children only if they're host elements or same component
    if (node.child) {
      // Stop descending if child is a different custom component (unless it's the root fiber)
      if (node !== fiber && typeof node.type === 'function' && !HOST_TAGS.has(node.tag)) {
        // Don't descend into child components
      } else {
        // Add siblings first (stack is LIFO), then child
        let sibling = node.child.sibling
        while (sibling) {
          stack.push(sibling)
          sibling = sibling.sibling
        }
        stack.push(node.child)
      }
    }
  }

  return nodes
}

/** Get union bounding box of all DOM nodes rendered by a component */
export function getComponentBoundary(fiber: FiberNode): DOMRect {
  try {
    const nodes = collectHostNodes(fiber)
    if (nodes.length === 0) {
      // Fallback: try stateNode directly
      if (fiber.stateNode instanceof HTMLElement) {
        return fiber.stateNode.getBoundingClientRect()
      }
      return new DOMRect(0, 0, 0, 0)
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const node of nodes) {
      const rect = node.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue
      minX = Math.min(minX, rect.left)
      minY = Math.min(minY, rect.top)
      maxX = Math.max(maxX, rect.right)
      maxY = Math.max(maxY, rect.bottom)
    }

    if (minX === Infinity) return new DOMRect(0, 0, 0, 0)
    return new DOMRect(minX, minY, maxX - minX, maxY - minY)
  } catch {
    return new DOMRect(0, 0, 0, 0)
  }
}

// =============================================================================
// COMPONENT INFO BUILDER
// =============================================================================

/** Build full ComponentInfo from a DOM element's fiber */
export function buildComponentInfo(element: HTMLElement): ComponentInfo | null {
  try {
    const fiber = getReactFiber(element)
    if (!fiber) return null

    const result = findNearestComponent(fiber)
    if (!result) return null

    const { fiber: componentFiber, name } = result

    return {
      name,
      displayName: typeof componentFiber.type === 'function'
        ? componentFiber.type.displayName
        : undefined,
      source: componentFiber._debugSource
        ? { fileName: componentFiber._debugSource.fileName, lineNumber: componentFiber._debugSource.lineNumber }
        : undefined,
      props: componentFiber.memoizedProps
        ? serializeProps(componentFiber.memoizedProps as Record<string, unknown>)
        : {},
      treePath: buildComponentTree(componentFiber),
      boundary: getComponentBoundary(componentFiber),
      isMinified: isMangledName(name),
    }
  } catch {
    return null
  }
}

// =============================================================================
// REACT DETECTION
// =============================================================================

let cachedDetection: ReactDetection | null = null

/** Detect React presence, version, and dev/prod mode on the page */
export function detectReact(): ReactDetection {
  if (cachedDetection) return cachedDetection

  try {
    // Check for React DevTools hook (most reliable)
    const hook = (window as unknown as Record<string, unknown>).__REACT_DEVTOOLS_GLOBAL_HOOK__ as
      | { renderers?: Map<number, { version?: string }> }
      | undefined

    if (hook?.renderers?.size) {
      const renderer = hook.renderers.values().next().value as { version?: string } | undefined
      const version = renderer?.version

      // Check dev mode: look for _debugSource on any fiber
      let isDev = false
      const candidates = [
        document.getElementById('root'),
        document.getElementById('__next'),
        document.querySelector('[data-reactroot]'),
      ].filter(Boolean) as HTMLElement[]

      // Also try first element with a fiber key
      if (candidates.length === 0) {
        const all = document.querySelectorAll('*')
        for (let i = 0; i < Math.min(all.length, 100); i++) {
          const fiber = getReactFiber(all[i] as HTMLElement)
          if (fiber) {
            candidates.push(all[i] as HTMLElement)
            break
          }
        }
      }

      for (const el of candidates) {
        const fiber = getReactFiber(el)
        if (!fiber) continue
        // Walk a few fibers to check for _debugSource
        let current: FiberNode | null = fiber
        for (let i = 0; i < 10 && current; i++) {
          if (current._debugSource) {
            isDev = true
            break
          }
          current = current.child || current.return
        }
        if (isDev) break
      }

      cachedDetection = { detected: true, version, isDev }
      return cachedDetection
    }

    // Fallback: check for fiber keys on common root elements
    const fallbackCandidates = [
      document.getElementById('root'),
      document.getElementById('__next'),
      document.querySelector('[data-reactroot]'),
    ].filter(Boolean) as HTMLElement[]

    // Scan arbitrary DOM elements if no common roots found
    if (fallbackCandidates.length === 0) {
      const all = document.querySelectorAll('*')
      for (let i = 0; i < Math.min(all.length, 100); i++) {
        const fiber = getReactFiber(all[i] as HTMLElement)
        if (fiber) {
          fallbackCandidates.push(all[i] as HTMLElement)
          break
        }
      }
    }

    for (const el of fallbackCandidates) {
      const fiber = getReactFiber(el)
      if (!fiber) continue

      // Check dev mode
      let isDev = false
      let current: FiberNode | null = fiber
      for (let i = 0; i < 10 && current; i++) {
        if (current._debugSource) { isDev = true; break }
        current = current.child || current.return
      }

      cachedDetection = { detected: true, isDev }
      return cachedDetection
    }

    cachedDetection = { detected: false }
    return cachedDetection
  } catch {
    cachedDetection = { detected: false }
    return cachedDetection
  }
}

/** Check if component name appears to be minified/mangled */
export function isMangledName(name: string): boolean {
  if (!name || name === 'Anonymous') return true
  // Single or double char lowercase = likely minified
  if (name.length <= 2 && /^[a-z]+$/.test(name)) return true
  // Single uppercase char = likely minified
  if (/^[A-Z]$/.test(name)) return true
  return false
}

/** Reset cached detection (for testing or SPA navigation) */
export function resetDetectionCache(): void {
  cachedDetection = null
}
