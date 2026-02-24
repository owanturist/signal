// @ts-nocheck

//#region code
import { useMonitor } from "@owanturist/signal-react"

import type { State as ToolbarState } from "../toolbar/state"

import { RenderBoundary } from "/render-boundary"

interface Props {
  state: ToolbarState
}

export function TextPreview({ state }: Props) {
  const monitor = useMonitor()
  const alignment = state.align.alignment.read(monitor)
  const family = state.font.family.read(monitor)
  const size = state.font.size.read(monitor)

  return (
    <RenderBoundary
      name="TextPreview"
      style={{
        textAlign: alignment,
        fontFamily: family,
        fontSize: size,
        minHeight: 80,
        margin: 0,
      }}
    >
      The quick brown fox jumps over the lazy dog.
    </RenderBoundary>
  )
}
//#endregion code
