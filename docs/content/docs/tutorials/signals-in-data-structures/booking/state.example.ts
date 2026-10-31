// @ts-nocheck

//#region code
import { type Monitor, Signal } from "@owanturist/signal"

import { Stay, type StayParent } from "../stay/state"

export class Booking implements StayParent {
  private readonly stays = Signal<ReadonlyArray<Stay>>([new Stay(this)])

  allStays(monitor: Monitor): ReadonlyArray<Stay> {
    return this.stays.read(monitor)
  }

  canRemoveStay(monitor: Monitor): boolean {
    return this.stays.read(monitor).length > 1
  }

  addStay(): void {
    this.stays.write((current) => [...current, new Stay(this)])
  }

  removeStay(stay: Stay): void {
    this.stays.write((current) =>
      current.length > 1 ? current.filter((candidate) => candidate !== stay) : current,
    )
  }

  totalRooms(monitor: Monitor): number {
    return this.allStays(monitor).reduce((total, stay) => total + stay.rooms.value(monitor), 0)
  }

  totalNights(monitor: Monitor): number {
    return this.allStays(monitor).reduce((total, stay) => total + stay.nights.value(monitor), 0)
  }
}
//#endregion code
