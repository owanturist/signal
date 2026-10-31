// @ts-nocheck

//#region code
import { useMonitor } from "@owanturist/signal-react"

import type { Counter as CounterState } from "./state"
import { RenderBoundary } from "/render-boundary"

interface Props {
  label: string
  counter: CounterState
}

export function Counter({ label, counter }: Props) {
  const monitor = useMonitor()

  return (
    <RenderBoundary name={label} className="row">
      <button
        type="button"
        disabled={!counter.canDecrement(monitor)}
        onClick={() => counter.decrement()}
        className="btn"
      >
        -
      </button>
      <strong>{counter.value(monitor)}</strong>
      <button
        type="button"
        disabled={!counter.canIncrement(monitor)}
        onClick={() => counter.increment()}
        className="btn"
      >
        +
      </button>
    </RenderBoundary>
  )
}
//#endregion code
