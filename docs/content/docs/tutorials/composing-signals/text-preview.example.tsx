// @ts-nocheck

import { useMonitor } from "@owanturist/signal-react"
//#region code
import type { FC } from "react"

import { RenderBoundary } from "/render-boundary"
import type { State as ToolbarState } from "./toolbar/state"

interface Props {
  state: ToolbarState
}

export const TextPreview: FC<Props> = ({ state }) => {
  const monitor = useMonitor()
  const alignment = state.align.alignment.read(monitor)
  const family = state.font.family.read(monitor)
  const size = state.font.size.read(monitor)

  return (
    <RenderBoundary
      name="TextPreview"
      className="preview"
      style={{ textAlign: alignment, fontFamily: family, fontSize: size }}
    >
      The quick brown fox jumps over the lazy dog.
    </RenderBoundary>
  )
}
//#endregion code
