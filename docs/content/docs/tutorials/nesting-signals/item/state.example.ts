// @ts-nocheck

//#region code
import { Signal } from "@owanturist/signal"

export function initState(name: string) {
  return {
    name: Signal(name),
    packed: Signal(false),
  }
}

export type State = ReturnType<typeof initState>
//#endregion code
