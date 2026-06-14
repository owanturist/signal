import { type Monitor, Signal, batch } from "@owanturist/signal"

import { entries } from "~/tools/entries"
import { isFunction } from "~/tools/is-function"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { map } from "~/tools/map"
import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import { SignalForm } from "../../signal-form/_internal/signal-form"
import type { FormListParams } from "../form-list-params"

import type { FormListState } from "./form-list-state"

class FormList<TElement extends SignalForm> extends SignalForm<FormListParams<TElement>> {
  public static override _getState = SignalForm._getState

  private readonly _elements = Signal((monitor) => this._state._getElements(monitor), {
    equals: isShallowArrayEqual,
  })

  public constructor(public readonly _state: FormListState<TElement>) {
    super()
  }

  public getElements(monitor: Monitor): ReadonlyArray<TElement>
  public getElements<TResult>(
    monitor: Monitor,
    select: (elements: ReadonlyArray<TElement>) => TResult,
  ): TResult
  public getElements<TResult>(
    monitor: Monitor,
    select: (elements: ReadonlyArray<TElement>) => TResult = params._first as typeof select,
  ): TResult {
    return select(this._elements.read(monitor))
  }

  public setElements(
    setter: Setter<ReadonlyArray<TElement>, [ReadonlyArray<TElement>, Monitor]>,
  ): void {
    batch((monitor) => {
      const initialInputs = this.getInitial(monitor)

      const nextStateElements = map(
        isFunction(setter) ? setter(this._state._getElements(monitor), monitor) : setter,
        (element) => this._state._parentOf(SignalForm._getState(element)),
      )

      for (const [index, child] of entries(nextStateElements)) {
        if (index < initialInputs.length) {
          child._setInitial(monitor, initialInputs.at(index))
        }
      }

      this._state._elements.write(nextStateElements)
    })
  }
}

export { FormList }
