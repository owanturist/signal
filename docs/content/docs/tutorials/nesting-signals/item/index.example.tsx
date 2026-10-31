// @ts-nocheck

//#region code
import { useMonitor } from "@owanturist/signal-react"

import type { State } from "./state"
import { RenderBoundary } from "/render-boundary"

interface Props {
  state: State
  onRemove: () => void
}

export function Item({ state, onRemove }: Props) {
  const monitor = useMonitor()

  return (
    <RenderBoundary name="Item" className="row">
      <input
        type="checkbox"
        checked={state.packed.read(monitor)}
        onChange={(event) => state.packed.write(event.target.checked)}
      />
      <input
        className="input"
        value={state.name.read(monitor)}
        placeholder="What to pack?"
        onChange={(event) => state.name.write(event.target.value)}
      />
      <button type="button" className="btn" onClick={onRemove}>
        Remove
      </button>
    </RenderBoundary>
  )
}
//#endregion code
