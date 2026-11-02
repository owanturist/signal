// @ts-nocheck

//#region code
import { Signal } from "@owanturist/signal"
import { type FC, useState } from "react"

import { List } from "./list"
import { Summary } from "./summary"
import { RenderBoundary } from "/render-boundary"
import { type State as ItemState, initState as initItemState } from "./item/state"

const App: FC = () => {
  const [items] = useState(() =>
    Signal<ReadonlyArray<ItemState>>([initItemState("Passport"), initItemState("Sunscreen")]),
  )

  return (
    <RenderBoundary name="App" className="stack">
      <List items={items} />
      <Summary items={items} />
    </RenderBoundary>
  )
}

export default App
//#endregion code
