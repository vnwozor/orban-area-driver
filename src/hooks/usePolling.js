import { useEffect, useRef } from 'react'

// Calls fn every `ms` milliseconds while the tab is visible (used to pick up
// status changes, e.g. the driver accepting a booking). Pass enabled=false to pause.
export const usePolling = (fn, ms, enabled = true) => {
    const saved = useRef(fn)
    saved.current = fn
    useEffect(() => {
        if (!enabled) return undefined
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') saved.current()
        }, ms)
        return () => clearInterval(id)
    }, [ms, enabled])
}
