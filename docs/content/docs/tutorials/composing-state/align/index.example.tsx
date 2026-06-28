// @ts-nocheck

//#region code
import { useComputed } from "@owanturist/signal-react"

import type { Alignment, State } from "./state"
import { RenderBoundary } from "/render-boundary"

const ALIGNMENTS: ReadonlyArray<Alignment> = ["left", "center", "right", "justify"]

interface Props {
  state: State
}

export function Align({ state }: Props) {
  const alignment = useComputed(state.alignment)

  return (
    <RenderBoundary name="Align" style={{ display: "flex", gap: 4 }}>
      {ALIGNMENTS.map((value) => (
        <button
          type="button"
          key={value}
          onClick={() => state.alignment.write(value)}
          style={{
            fontWeight: alignment === value ? "bold" : "normal",
            border: "1px solid #ccc",
            padding: "2px 8px",
            cursor: "pointer",
          }}
        >
          {value}
        </button>
      ))}
    </RenderBoundary>
  )
}
//#endregion code
