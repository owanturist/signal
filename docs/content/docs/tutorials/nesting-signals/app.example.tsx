// @ts-nocheck

//#region code
import { Signal } from "@owanturist/signal"
import { useState } from "react"

import { type State as ItemState, initState as initItemState } from "./item/state"
import { List } from "./list"
import { Summary } from "./summary"
import { RenderBoundary } from "/render-boundary"

export default function App() {
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
//#endregion code
