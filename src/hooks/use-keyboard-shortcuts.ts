import { useEffect, useRef } from 'react'

export type ShortcutMap = Record<string, {
  handler: () => void
  guard?: () => boolean
}>

/** Check if an input-like element is currently focused */
export function isInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select'
    || (el as HTMLElement).isContentEditable
}

/** Normalize keyboard event to a key string like "mod+shift+f" */
function buildKeyString(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.metaKey || e.ctrlKey) parts.push('mod')
  if (e.shiftKey) parts.push('shift')
  parts.push(e.key.toLowerCase())
  return parts.join('+')
}

/**
 * Central keyboard shortcuts hook.
 * Registers a single document-level keydown listener.
 * Shortcuts map is kept in a ref to avoid stale closures.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap): void {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = buildKeyString(e)
      const shortcut = shortcutsRef.current[key]
      if (!shortcut) return
      if (shortcut.guard && !shortcut.guard()) return

      e.preventDefault()
      shortcut.handler()
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])
}
