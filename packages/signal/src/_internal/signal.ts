import type { Equal } from "../equal"

import { BaseSignal } from "./base-signal"

class Signal<T> extends BaseSignal<T> {
  public constructor(
    private _value: T,
    equals: Equal<T>,
  ) {
    super(equals)
  }

  protected _getter(): T {
    return this._value
  }

  protected _setter(value: T): boolean {
    if (!this._equals(this._value, value)) {
      this._value = value

      return true
    }

    return false
  }

  // biome-ignore lint/nursery/useThisInClassMethods: polymorphic override of abstract BaseSignal._clone (factory method returns new instance)
  protected _clone(value: T, equals: Equal<T>): Signal<T> {
    return new Signal(value, equals)
  }
}

export { Signal }
