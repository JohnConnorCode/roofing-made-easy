import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps focus within a container element while active.
 * Returns a ref to attach to the container div.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(active: boolean): RefObject<T | null> {
  const containerRef = useRef<T | null>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    // Focus first focusable element
    const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    if (focusables.length > 0) {
      focusables[0].focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const currentFocusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (currentFocusables.length === 0) return

      const first = currentFocusables[0]
      const last = currentFocusables[currentFocusables.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus to previously focused element
      previouslyFocused?.focus()
    }
  }, [active])

  return containerRef
}
