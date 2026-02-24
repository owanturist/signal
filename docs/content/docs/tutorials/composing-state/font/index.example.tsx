// @ts-nocheck

//#region code
import { useMonitor } from "@owanturist/signal-react"

import type { State } from "./state"
import { RenderBoundary } from "/render-boundary"

interface Props {
  state: State
}

export function Font({ state }: Props) {
  const monitor = useMonitor()
  const family = state.family.read(monitor)
  const size = state.size.read(monitor)

  return (
    <RenderBoundary name="Font" style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <select
        value={family}
        onChange={(e) => state.family.write(e.target.value)}
        style={{ border: "1px solid #ccc", padding: "2px 4px" }}
      >
        <option value="serif">serif</option>
        <option value="sans-serif">sans-serif</option>
        <option value="monospace">monospace</option>
      </select>
      <input
        type="number"
        value={size}
        min={8}
        max={72}
        onChange={(e) => state.size.write(Number(e.target.value))}
        style={{ width: 60, border: "1px solid #ccc", padding: "2px 4px" }}
      />
      <span>px</span>
    </RenderBoundary>
  )
}
//#endregion code
