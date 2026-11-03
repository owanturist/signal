// @ts-nocheck

//#region code
import { type FC, useState } from "react"

import { TextPreview } from "./text-preview"
import { Toolbar } from "./toolbar"
import { RenderBoundary } from "/render-boundary"
import { initState } from "./toolbar/state"

const App: FC = () => {
  const [state] = useState(initState)

  return (
    <RenderBoundary name="App" className="stack">
      <Toolbar state={state} />
      <TextPreview state={state} />
    </RenderBoundary>
  )
}

export default App
//#endregion code
