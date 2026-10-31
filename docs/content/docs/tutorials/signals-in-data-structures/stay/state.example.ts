// @ts-nocheck

//#region code
import type { Monitor } from "@owanturist/signal"

import { Counter } from "../counter/state"

export interface StayParent {
  canRemoveStay(monitor: Monitor): boolean
  removeStay(stay: Stay): void
}

export class Stay {
  readonly rooms = new Counter(1, 5)
  readonly nights = new Counter(1, 14)

  constructor(private readonly parent: StayParent) {}

  canRemove(monitor: Monitor): boolean {
    return this.parent.canRemoveStay(monitor)
  }

  remove(): void {
    this.parent.removeStay(this)
  }
}
//#endregion code
