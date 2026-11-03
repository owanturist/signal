// @ts-nocheck

//#region code
import { initState as initAlignState } from "../align/state"
import { initState as initFontState } from "../font/state"

export function initState() {
  return {
    align: initAlignState(),
    font: initFontState(),
  }
}

export type State = ReturnType<typeof initState>
//#endregion code
