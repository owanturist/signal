// @ts-nocheck

//#region code
import { useMonitor } from "@owanturist/signal-react"
import { useState } from "react"

import { Booking } from "./booking"
import { Stay } from "./stay"
import { Summary } from "./summary"
import { RenderBoundary } from "/render-boundary"

export default function App() {
  const monitor = useMonitor()
  const [booking] = useState(() => new Booking())

  return (
    <RenderBoundary name="App" className="stack">
      {booking.allStays(monitor).map((stay, index) => (
        <Stay key={index} title={`Stay ${index + 1}`} stay={stay} />
      ))}
      <button type="button" className="btn" onClick={() => booking.addStay()}>
        Add stay
      </button>
      <Summary booking={booking} />
    </RenderBoundary>
  )
}
//#endregion code
