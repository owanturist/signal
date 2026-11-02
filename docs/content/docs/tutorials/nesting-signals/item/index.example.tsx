// @ts-nocheck

import { useMonitor } from "@owanturist/signal-react"
//#region code
import type { FC } from "react"

import type { State } from "./state"
import { RenderBoundary } from "/render-boundary"

interface Props {
  state: State
  onRemove: () => void
}

export const Item: FC<Props> = ({ state, onRemove }) => {
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
