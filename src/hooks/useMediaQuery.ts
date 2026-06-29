import { useEffect, useState } from "react"

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * Used to switch between mobile bottom-tab nav and desktop sidebar nav.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches)

    setMatches(mediaQueryList.matches)
    mediaQueryList.addEventListener("change", listener)
    return () => mediaQueryList.removeEventListener("change", listener)
  }, [query])

  return matches
}

/** Convenience hook: true at tablet width (768px) and above. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 768px)")
}