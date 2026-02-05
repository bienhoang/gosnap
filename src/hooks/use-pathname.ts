import { useState, useEffect } from 'react'

/**
 * Track current pathname reactively.
 * Works with both browser navigation (popstate) and SPA routers
 * that use pushState/replaceState.
 */
export function usePathname(): string {
  const [pathname, setPathname] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/',
  )

  useEffect(() => {
    const update = () => setPathname(window.location.pathname)

    // Browser back/forward
    window.addEventListener('popstate', update)

    // Intercept pushState/replaceState for SPA routers
    const origPush = history.pushState.bind(history)
    const origReplace = history.replaceState.bind(history)

    history.pushState = (...args) => {
      origPush(...args)
      update()
    }
    history.replaceState = (...args) => {
      origReplace(...args)
      update()
    }

    return () => {
      window.removeEventListener('popstate', update)
      history.pushState = origPush
      history.replaceState = origReplace
    }
  }, [])

  return pathname
}
