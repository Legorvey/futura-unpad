import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY)
  
  if (mql.addEventListener) {
    mql.addEventListener("change", callback)
  } else {
    // Fallback for older Safari/WebKit
    mql.addListener(callback)
  }

  return () => {
    if (mql.removeEventListener) {
      mql.removeEventListener("change", callback)
    } else {
      mql.removeListener(callback)
    }
  }
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )
}
