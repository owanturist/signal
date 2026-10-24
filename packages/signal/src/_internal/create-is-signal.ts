import type { BaseSignal } from "./base-signal"
import type { Monitor } from "./monitor"

function createIsSignal(isSignal: (input: unknown) => input is BaseSignal<unknown>) {
  return (
    ...args:
      | [input: unknown]
      | [monitor: Monitor, check: (input: unknown) => boolean, input: unknown]
  ): boolean => {
    if (args.length === 1) {
      return isSignal(args[0])
    }

    const [monitor, check, input] = args

    if (isSignal(input)) {
      return check(input.read(monitor))
    }

    return false
  }
}

export { createIsSignal }
