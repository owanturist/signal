// @ts-nocheck

//#region code
import { Signal } from "@owanturist/signal"

export type Alignment = "left" | "center" | "right" | "justify"

export function initState() {
  return {
    alignment: Signal<Alignment>("left"),
  }
}

export type State = ReturnType<typeof initState>
//#endregion code
