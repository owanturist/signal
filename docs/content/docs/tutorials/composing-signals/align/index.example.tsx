// @ts-nocheck

import { useComputed } from "@owanturist/signal-react"
//#region code
import type { FC } from "react"

import type { Alignment, State } from "./state"
import { RenderBoundary } from "/render-boundary"

const ALIGNMENTS: ReadonlyArray<Alignment> = ["left", "center", "right", "justify"]

interface Props {
  state: State
}

export const Align: FC<Props> = ({ state }) => {
  const alignment = useComputed(state.alignment)

  return (
    <RenderBoundary name="Align" className="row tight">
      {ALIGNMENTS.map((value) => (
        <label key={value} className="btn">
          <input
            type="radio"
            name="alignment"
            value={value}
            checked={alignment === value}
            onChange={() => state.alignment.write(value)}
          />
          {value}
        </label>
      ))}
    </RenderBoundary>
  )
}
//#endregion code
