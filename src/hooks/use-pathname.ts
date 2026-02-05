import { useState, useEffect } from 'react'

/**
 * Singleton history patch — shared across all hook instances.
 * Only the first mount patches pushState/replaceState; last unmount restores.
 */
let patchRefCount = 0
let origPush: typeof history.pushState | null = null
let origReplace: typeof history.replaceState | null = null
const listeners = new Set<() => void>()

function installPatch() {
  if (patchRefCount++ > 0) return // already patched
  origPush = history.pushState.bind(history)
  origReplace = history.replaceState.bind(history)

  history.pushState = (...args) => {
    origPush!(...args)
    listeners.forEach((fn) => fn())
  }
  history.replaceState = (...args) => {
    origReplace!(...args)
    listeners.forEach((fn) => fn())
  }
}

function uninstallPatch() {
  if (--patchRefCount > 0) return // other instances still active
  if (origPush) history.pushState = origPush
  if (origReplace) history.replaceState = origReplace
  origPush = null
  origReplace = null
}

/**
 * Track current pathname reactively.
 * Works with both browser navigation (popstate) and SPA routers
 * that use pushState/replaceState.
 * Safe for multiple instances — uses singleton patch with ref counting.
 */
export function usePathname(): string {
  const [pathname, setPathname] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/',
  )

  useEffect(() => {
    const update = () => setPathname(window.location.pathname)

    window.addEventListener('popstate', update)
    listeners.add(update)
    installPatch()

    return () => {
      window.removeEventListener('popstate', update)
      listeners.delete(update)
      uninstallPatch()
    }
  }, [])

  return pathname
}
