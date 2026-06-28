// @ts-nocheck

//#region code
import { useState } from "react"

import { TextPreview } from "./text-preview"
import { Toolbar } from "./toolbar"
import { RenderBoundary } from "/render-boundary"
import { initState } from "./toolbar/state"

export default function App() {
  const [state] = useState(initState)

  return (
    <RenderBoundary name="App" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Toolbar state={state} />
      <TextPreview state={state} />
    </RenderBoundary>
  )
}
//#endregion code
