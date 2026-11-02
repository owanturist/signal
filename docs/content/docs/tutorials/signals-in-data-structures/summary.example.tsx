// @ts-nocheck

import { useMonitor } from "@owanturist/signal-react"
//#region code
import type { FC } from "react"

import type { Booking } from "./booking"
import { RenderBoundary } from "/render-boundary"

interface Props {
  booking: Booking
}

export const Summary: FC<Props> = ({ booking }) => {
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
