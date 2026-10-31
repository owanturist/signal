// @ts-nocheck

//#region code
import { useMonitor } from "@owanturist/signal-react"

import type { Booking } from "../booking/state"
import { RenderBoundary } from "/render-boundary"

interface Props {
  booking: Booking
}

export function Summary({ booking }: Props) {
  const monitor = useMonitor()
  const rooms = booking.totalRooms(monitor)
  const nights = booking.totalNights(monitor)

  return (
    <RenderBoundary name="Summary">
      {rooms} {rooms === 1 ? "room" : "rooms"} for {nights} {nights === 1 ? "night" : "nights"} in
      total
    </RenderBoundary>
  )
}
//#endregion code
