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
      const initials = this.getInitial(monitor)

      const nextStateElements = map(
        isFunction(setter) ? setter(this._state._getElements(monitor), monitor) : setter,
        SignalForm._getState,
      )

      for (const [index, child] of entries(nextStateElements)) {
        if (index < initials.length) {
          if (child._hasSameRootWith(this._state)) {
            // existing: force initial override
            child._setInitial(monitor, initials[index])
          } else {
            // new: respect explicit initial
            child._patchInitial(monitor, initials[index])
          }
        }
      }

      this._state._elements.write(
        map(nextStateElements, (element) => this._state._parentOf(element)),
      )
    })
  }
}

export { FormList }
