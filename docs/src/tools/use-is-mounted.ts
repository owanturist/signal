import { useSyncExternalStore } from "react"

function subscribe(): () => void {
  return noop
}

function noop(): void {
  // there is nothing to unsubscribe from
}

/**
 * A React hook that returns whether the component has been mounted on the client.
 * Helps preventing hydration mismatches when children depend on client-only state
 * (e.g. `localStorage`).
 *
 * @returns `false` during SSR and hydration, then `true` on the client.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
