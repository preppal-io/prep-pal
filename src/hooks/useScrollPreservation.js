import { useRef, useCallback } from 'react'

/**
 * Hook to preserve and restore scroll position
 * Useful when modals or data updates cause unwanted scroll resets
 * @returns {Object} { saveScrollPosition, restoreScrollPosition }
 */
export function useScrollPreservation() {
  const savedScrollPosition = useRef(0)

  const saveScrollPosition = useCallback(() => {
    savedScrollPosition.current = window.scrollY
  }, [])

  const restoreScrollPosition = useCallback(() => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      window.scrollTo(0, savedScrollPosition.current)
    })
  }, [])

  return {
    saveScrollPosition,
    restoreScrollPosition
  }
}
