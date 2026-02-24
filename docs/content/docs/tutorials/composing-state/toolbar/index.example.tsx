// @ts-nocheck

//#region code
import { Align } from "../align"
import { Font } from "../font"

import type { State } from "./state"
import { RenderBoundary } from "/render-boundary"

interface Props {
  state: State
}

export function Toolbar({ state }: Props) {
  return (
    <RenderBoundary name="Toolbar" style={{ display: "flex", flexDirection: "row", gap: 8 }}>
      <Align state={state.align} />
      <Font state={state.font} />
    </RenderBoundary>
  )
}
//#endregion code
