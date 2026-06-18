import { type Monitor, Signal, untracked } from "@owanturist/signal"

import { concat } from "~/tools/concat"
import { drop } from "~/tools/drop"
import { entries } from "~/tools/entries"
import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { isString } from "~/tools/is-string"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"
import { map } from "~/tools/map"
import { take } from "~/tools/take"

import { toConcise } from "../../_internal/to-concise"
import type { GetSignalFormParams } from "../../signal-form/_internal/get-signal-form-params"
import {
  type SignalFormChild,
  SignalFormState,
} from "../../signal-form/_internal/signal-form-state"
import type { GetSignalFormInput } from "../../signal-form/get-signal-form-input"
import type { SignalForm } from "../../signal-form/signal-form"
import type { SignalFormParams } from "../../signal-form/signal-form-params"
import { VALIDATE_ON_TOUCH } from "../../validate-strategy"
import type { FormListError } from "../form-list-error"
import type { FormListErrorSetter } from "../form-list-error-setter"
import type { FormListErrorVerbose } from "../form-list-error-verbose"
import type { FormListFlag } from "../form-list-flag"
import type { FormListFlagSetter } from "../form-list-flag-setter"
import type { FormListFlagVerbose } from "../form-list-flag-verbose"
import type { FormListInput } from "../form-list-input"
import type { FormListInputSetter } from "../form-list-input-setter"
import type { FormListOutput } from "../form-list-output"
import type { FormListOutputVerbose } from "../form-list-output-verbose"
import type { FormListParams } from "../form-list-params"
import type { FormListValidateOn } from "../form-list-validate-on"
import type { FormListValidateOnSetter } from "../form-list-validate-on-setter"
import type { FormListValidateOnVerbose } from "../form-list-validate-on-verbose"

import { FormList } from "./form-list"

type FormListElementFactoryInternal<TElement extends SignalForm> = (
  input: GetSignalFormInput<TElement>,
  index: number,
) => SignalFormState<GetSignalFormParams<TElement>>

class FormListState<TElement extends SignalForm = SignalForm> extends SignalFormState<
  FormListParams<TElement>
> {
  public readonly _host = Lazy(() => new FormList(this))

  public readonly _elements: Signal<ReadonlyArray<SignalFormState<GetSignalFormParams<TElement>>>>

  public readonly _initialInputs: Signal<ReadonlyArray<GetSignalFormInput<TElement>>>

  public constructor(
    parent: null | SignalFormState,
    private readonly _factory: FormListElementFactoryInternal<TElement>,
    initialInputs: ReadonlyArray<GetSignalFormInput<TElement>> = [],
    elements: ReadonlyArray<SignalFormState<GetSignalFormParams<TElement>>> = [],
  ) {
    super(parent)

    this._initialInputs = Signal(initialInputs, {
      equals: isShallowArrayEqual,
    })
    this._elements = Signal(map(elements, (element) => this._parentOf(element)))
  }

  public _childOf(parent: null | SignalFormState): FormListState<TElement> {
    return untracked(
      (monitor) =>
        new FormListState<TElement>(
          parent,
          this._factory,
          this._initialInputs.read(monitor),
          this._elements.read(monitor),
        ),
    )
  }

  public _getElements(monitor: Monitor): ReadonlyArray<TElement> {
    return map(this._elements.read(monitor), ({ _host }) => _host() as TElement)
  }

  public readonly _initial = Signal((monitor): FormListInput<TElement> => {
    const elements = this._elements.read(monitor)
    const initialInputs = this._initialInputs.read(monitor)

    return map(initialInputs, (input, index) => {
      const element = elements.at(index)

      return element ? element._initial.read(monitor) : input
    })
  })

  public _setInitial(monitor: Monitor, setter: FormListInputSetter<TElement>): void {
    const initial = isFunction(setter)
      ? setter(this._initial.read(monitor), this._input.read(monitor))
      : setter

    const existing = take(this._elements.read(monitor), initial.length)

    for (const [index, element] of entries(existing)) {
      element._setInitial(monitor, initial.at(index))
    }

    this._initialInputs.write(initial)
  }

  public readonly _input = Signal(
    (monitor): FormListInput<TElement> =>
      map(this._elements.read(monitor), ({ _input }) => _input.read(monitor)),
  )

  public _setInput(monitor: Monitor, setter: FormListInputSetter<TElement>): void {
    const initials = this._initial.read(monitor)

    const inputs = isFunction(setter) ? setter(this._input.read(monitor), initials) : setter

    const existing = take(this._elements.read(monitor), inputs.length)

    for (const [index, element] of entries(existing)) {
      element._setInput(monitor, inputs.at(index))
    }

    const created = drop(inputs, existing.length).map((input, index) => {
      const slotIndex = existing.length + index
      const element = this._factory(input, slotIndex)

      // assign stored initial values
      if (slotIndex < initials.length) {
        element._setInitial(monitor, initials.at(slotIndex))
      }

      return this._parentOf(element)
    })

    this._elements.write(concat(existing, created))
  }

  public readonly _error = Signal((monitor): FormListError<TElement> => {
    const error = map(this._elements.read(monitor), ({ _error }) => _error.read(monitor))

    if (error.every(isNull)) {
      return null
    }

    return error
  })

  public readonly _errorVerbose = Signal(
    (monitor): FormListErrorVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _errorVerbose }) => _errorVerbose.read(monitor)),
  )

  public _setError(monitor: Monitor, setter: FormListErrorSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._errorVerbose.read(monitor)) : setter

    for (const [index, element] of entries(this._elements.read(monitor))) {
      const error = isNull(setters) ? setters : setters.at(index)

      if (!isUndefined(error)) {
        element._setError(monitor, error)
      }
    }
  }

  public readonly _validateOn = Signal((monitor): FormListValidateOn<TElement> => {
    const validateOn = map(this._elements.read(monitor), ({ _validateOn }) =>
      _validateOn.read(monitor),
    )

    return toConcise(validateOn, isString, VALIDATE_ON_TOUCH)
  })

  public readonly _validateOnVerbose = Signal(
    (monitor): FormListValidateOnVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _validateOnVerbose }) =>
        _validateOnVerbose.read(monitor),
      ),
  )

  public _setValidateOn(monitor: Monitor, setter: FormListValidateOnSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._validateOnVerbose.read(monitor)) : setter

    for (const [index, element] of entries(this._elements.read(monitor))) {
      const validateOn = isString(setters) ? setters : setters.at(index)

      if (!isUndefined(validateOn)) {
        element._setValidateOn(monitor, validateOn)
      }
    }
  }

  public readonly _touched = Signal((monitor): FormListFlag<TElement> => {
    const touched = map(this._elements.read(monitor), ({ _touched }) => _touched.read(monitor))

    return toConcise(touched, isBoolean, false)
  })

  public readonly _touchedVerbose = Signal(
    (monitor): FormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _touchedVerbose }) => _touchedVerbose.read(monitor)),
  )

  public _setTouched(monitor: Monitor, setter: FormListFlagSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._touchedVerbose.read(monitor)) : setter

    for (const [index, element] of entries(this._elements.read(monitor))) {
      const touched = isBoolean(setters) ? setters : setters.at(index)

      if (!isUndefined(touched)) {
        element._setTouched(monitor, touched)
      }
    }
  }

  public readonly _output = Signal((monitor): null | FormListOutput<TElement> => {
    const output = map(this._elements.read(monitor), ({ _output }) => _output.read(monitor))

    if (output.some(isNull)) {
      return null
    }

    return output
  })

  public readonly _outputVerbose = Signal(
    (monitor): FormListOutputVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _outputVerbose }) => _outputVerbose.read(monitor)),
  )

  public readonly _valid = Signal((monitor): FormListFlag<TElement> => {
    const valid = map(this._elements.read(monitor), ({ _valid }) => _valid.read(monitor))

    return toConcise(valid, isBoolean, false)
  })

  public readonly _validVerbose = Signal(
    (monitor): FormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _validVerbose }) => _validVerbose.read(monitor)),
  )

  public readonly _invalid = Signal((monitor): FormListFlag<TElement> => {
    const invalid = map(this._elements.read(monitor), ({ _invalid }) => _invalid.read(monitor))

    return toConcise(invalid, isBoolean, false)
  })

  public readonly _invalidVerbose = Signal(
    (monitor): FormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _invalidVerbose }) => _invalidVerbose.read(monitor)),
  )

  public readonly _validated = Signal((monitor): FormListFlag<TElement> => {
    const validated = map(this._elements.read(monitor), ({ _validated }) =>
      _validated.read(monitor),
    )

    return toConcise(validated, isBoolean, false)
  })

  public readonly _validatedVerbose = Signal(
    (monitor): FormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _validatedVerbose }) => _validatedVerbose.read(monitor)),
  )

  public _forceValidated(monitor: Monitor): void {
    for (const element of this._elements.read(monitor)) {
      element._forceValidated(monitor)
    }
  }

  public readonly _dirty = Signal((monitor): FormListFlag<TElement> => {
    const elements = this._elements.read(monitor)
    const initialInputs = this._initialInputs.read(monitor)

    const dirty = concat(
      map(elements, ({ _dirty, _dirtyOn }, index) => {
        if (index >= initialInputs.length) {
          // added elements are always dirty
          return _dirtyOn.read(monitor)
        }

        return _dirty.read(monitor)
      }),

      // removed elements are always dirty
      map(drop(initialInputs, elements.length), (initial, index) =>
        this._factory(initial, elements.length + index)._dirtyOn.read(monitor),
      ),
    )

    return toConcise(dirty, isBoolean, false)
  })

  public readonly _dirtyVerbose = Signal((monitor): FormListFlagVerbose<TElement> => {
    const elements = this._elements.read(monitor)
    const initialInputs = this._initialInputs.read(monitor)

    return concat(
      map(elements, ({ _dirtyVerbose, _dirtyOnVerbose }, index) => {
        if (index >= initialInputs.length) {
          // added elements are always dirty
          return _dirtyOnVerbose.read(monitor)
        }

        return _dirtyVerbose.read(monitor)
      }),

      // removed elements are always dirty
      map(drop(initialInputs, elements.length), (initial, index) =>
        this._factory(initial, elements.length + index)._dirtyOnVerbose.read(monitor),
      ),
    )
  })

  public readonly _dirtyOn = Signal((monitor): FormListFlag<TElement> => {
    const elements = this._elements.read(monitor)
    const initialInputs = this._initialInputs.read(monitor)

    const dirtyOn = concat(
      map(elements, ({ _dirtyOn }) => _dirtyOn.read(monitor)),

      // removed elements should create first
      map(drop(initialInputs, elements.length), (initial, index) =>
        this._factory(initial, elements.length + index)._dirtyOn.read(monitor),
      ),
    )

    return toConcise(dirtyOn, isBoolean, false)
  })

  public readonly _dirtyOnVerbose = Signal((monitor): FormListFlagVerbose<TElement> => {
    const elements = this._elements.read(monitor)
    const initialInputs = this._initialInputs.read(monitor)

    return concat(
      map(elements, ({ _dirtyOnVerbose }) => _dirtyOnVerbose.read(monitor)),

      // removed elements should create first
      map(drop(initialInputs, elements.length), (initial, index) =>
        this._factory(initial, elements.length + index)._dirtyOnVerbose.read(monitor),
      ),
    )
  })

  public _reset(monitor: Monitor, resetter: undefined | FormListInputSetter<TElement>): void {
    if (!isUndefined(resetter)) {
      this._setInitial(monitor, resetter)
    }

    this._setInput(monitor, this._initial.read(monitor))

    for (const element of this._elements.read(monitor)) {
      element._reset(monitor, undefined)
    }
  }

  public _getChildren<TChildParams extends SignalFormParams>(
    monitor: Monitor,
  ): ReadonlyArray<SignalFormChild<TChildParams, FormListParams<TElement>>> {
    return map(this._elements.read(monitor), (element, index) => ({
      _state: element as unknown as SignalFormState<TChildParams>,
      _mapToChild: (output) => output.at(index),
    }))
  }
}

export type { FormListElementFactoryInternal }
export { FormListState }
