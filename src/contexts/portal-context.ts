/**
 * Context for portal container (Shadow DOM support)
 * Provides the container element for createPortal calls
 */

import { createContext, useContext } from 'react'

/** Context holding the portal container element (document.body by default) */
export const PortalContext = createContext<HTMLElement | null>(null)

/**
 * Hook to get the portal container for createPortal calls
 * Returns provided container or document.body as fallback
 */
export function usePortalContainer(): HTMLElement {
  const container = useContext(PortalContext)
  return container ?? document.body
}
