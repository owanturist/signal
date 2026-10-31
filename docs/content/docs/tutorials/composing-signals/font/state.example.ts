// @ts-nocheck

//#region code
import { Signal } from "@owanturist/signal"

export function initState() {
  return {
    family: Signal("serif"),
    size: Signal(16),
  }
}

export type State = ReturnType<typeof initState>
//#endregion code
