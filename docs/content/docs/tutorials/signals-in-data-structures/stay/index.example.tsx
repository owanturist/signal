// @ts-nocheck

//#region code
import { useMonitor } from "@owanturist/signal-react"

import { Counter } from "../counter"
import type { Stay as StayState } from "./state"

interface Props {
  title: string
  stay: StayState
}

export function Stay({ title, stay }: Props) {
  const monitor = useMonitor()

  return (
    <section className="panel">
      <h4 className="title">{title}</h4>
      <div className="row">
        <Counter label="Rooms" counter={stay.rooms} />
        <Counter label="Nights" counter={stay.nights} />
        <button
          type="button"
          className="btn"
          disabled={!stay.canRemove(monitor)}
          onClick={() => stay.remove()}
        >
          Remove stay
        </button>
      </div>
    </section>
  )
}
//#endregion code
