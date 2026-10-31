// @ts-nocheck

//#region code
import type { Signal } from "@owanturist/signal"
import { useMonitor } from "@owanturist/signal-react"

import { Item } from "./item"
import { type State as ItemState, initState as initItemState } from "./item/state"
import { RenderBoundary } from "/render-boundary"

interface Props {
  items: Signal<ReadonlyArray<ItemState>>
}

export function List({ items }: Props) {
  const monitor = useMonitor()

  return (
    <RenderBoundary name="List" className="stack">
      {items.read(monitor).map((state, index) => (
        <Item
          key={index}
          state={state}
          onRemove={() => items.write((current) => current.filter((item) => item !== state))}
        />
      ))}
      <button
        type="button"
        className="btn"
        onClick={() => items.write((current) => [...current, initItemState("")])}
      >
        Add item
      </button>
    </RenderBoundary>
  )
}
//#endregion code
