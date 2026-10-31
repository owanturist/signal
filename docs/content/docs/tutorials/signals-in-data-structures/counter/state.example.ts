// @ts-nocheck

//#region code
import { type Monitor, Signal } from "@owanturist/signal"

export class Counter {
  private readonly count: Signal<number>

  constructor(
    private readonly min: number,
    private readonly max: number,
  ) {
    this.count = Signal(min)
  }

  value(monitor: Monitor): number {
    return this.count.read(monitor)
  }

  canDecrement(monitor: Monitor): boolean {
    return this.count.read(monitor) > this.min
  }

  canIncrement(monitor: Monitor): boolean {
    return this.count.read(monitor) < this.max
  }

  decrement(): void {
    this.count.write((current) => Math.max(current - 1, this.min))
  }

  increment(): void {
    this.count.write((current) => Math.min(current + 1, this.max))
  }
}
//#endregion code
