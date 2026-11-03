// @ts-nocheck

import type { Signal } from "@owanturist/signal"
import { useMonitor } from "@owanturist/signal-react"
//#region code
import type { FC } from "react"

import { Item } from "./item"
import { RenderBoundary } from "/render-boundary"
import { type State as ItemState, initState as initItemState } from "./item/state"

interface Props {
  items: Signal<ReadonlyArray<ItemState>>
}

export const List: FC<Props> = ({ items }) => {
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
