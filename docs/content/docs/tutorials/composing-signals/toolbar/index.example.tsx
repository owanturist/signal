// @ts-nocheck

//#region code
import type { FC } from "react"

import { Align } from "../align"
import { Font } from "../font"

import type { State } from "./state"
import { RenderBoundary } from "/render-boundary"

interface Props {
  state: State
}

export const Toolbar: FC<Props> = ({ state }) => (
  <RenderBoundary name="Toolbar" className="row">
    <Align state={state.align} />
    <Font state={state.font} />
  </RenderBoundary>
)
//#endregion code
