// @ts-nocheck

//#region code
import type { ReadableSignal } from "@owanturist/signal"
import { useComputed } from "@owanturist/signal-react"

import type { State as ItemState } from "./item/state"
import { RenderBoundary } from "/render-boundary"

interface Props {
  items: ReadableSignal<ReadonlyArray<ItemState>>
}

export function Summary({ items }: Props) {
  const summary = useComputed((monitor) => {
    const states = items.read(monitor)
    const packed = states.filter((state) => state.packed.read(monitor)).length

    return `${packed} of ${states.length} packed`
  }, [items])

  return <RenderBoundary name="Summary">{summary}</RenderBoundary>
}
//#endregion code
