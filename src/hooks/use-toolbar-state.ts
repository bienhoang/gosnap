import { useState, useCallback, useEffect } from 'react'

export function useToolbarState(defaultCollapsed: boolean) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [focusIndex, setFocusIndex] = useState(-1)
  const [mounted, setMounted] = useState(false)

  const expanded = !collapsed

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      if (!next) setTimeout(() => setFocusIndex(0), 300)
      else setFocusIndex(-1)
      return next
    })
  }, [])

  const collapse = useCallback(() => {
    setCollapsed(true)
    setFocusIndex(-1)
  }, [])

  return {
    collapsed,
    expanded,
    focusIndex,
    setFocusIndex,
    mounted,
    toggleCollapsed,
    collapse,
  }
}
