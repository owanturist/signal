// biome-ignore lint/nursery/noExcessiveLinesPerFile: <explanation>
import { type Monitor, Signal, untracked } from "@owanturist/signal"

import { concat } from "~/tools/concat"
import { drop } from "~/tools/drop"
import { entries } from "~/tools/entries"
import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
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
import type { GetSignalFormFlag } from "../../signal-form/get-signal-form-flag"
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

  public constructor(
    parent: null | SignalFormState,
    private readonly _factory: FormListElementFactoryInternal<TElement>,
  ) {
    super(parent)
  }

  public _childOf(parent: null | SignalFormState): FormListState<TElement> {
    return untracked((monitor) => {
      const child = new FormListState<TElement>(parent, this._factory)

      const clonedElements = map(this._elements.read(monitor), (element) =>
        child._parentOf(element._clone()),
      )

      child._elements.write(clonedElements)

      return child
    })
  }

  public _getElements(monitor: Monitor): ReadonlyArray<TElement> {
    return map(this._elements.read(monitor), ({ _host }) => _host() as TElement)
  }

  public readonly _elements = Signal<ReadonlyArray<SignalFormState<GetSignalFormParams<TElement>>>>(
    [],
  )

  public readonly _initialInputs = Signal<ReadonlyArray<GetSignalFormInput<TElement>>>([])

  // I N I T I A L

  public readonly _initial = Signal((monitor): FormListInput<TElement> => {
    const elements = this._elements.read(monitor)
    const initialInputs = this._initialInputs.read(monitor)

    return map(initialInputs, (input, index) => {
      const element = elements.at(index)

      return element ? element._initial.read(monitor) : input
    })
  })

  public _replaceInitial(
    monitor: Monitor,
    state: undefined | FormListState<TElement>,
    _isMounting: boolean,
  ): void {
    console.log("TODO NOW safe to remove?")
    if (state) {
      const initialInputs = state._initialInputs.read(monitor)

      this._initialInputs.write(initialInputs)

      const elements = this._elements.read(monitor)

      for (const [index, input] of entries(initialInputs)) {
        elements.at(index)?._setInitial(monitor, input)
      }
    }
  }

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

  // I N P U T

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
      const element = this._factory(input, index)

      // assign stored initial values
      if (existing.length + index < initials.length) {
        element._setInitial(monitor, initials.at(existing.length + index))
      }

      return this._parentOf(element)
    })

    this._elements.write(concat(existing, created))
  }

  // E R R O R

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

  // V A L I D A T E   O N

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

  // T O U C H E D

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

  // O U T P U T

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

  // V A L I D

  public readonly _valid = Signal((monitor): FormListFlag<TElement> => {
    const valid = map(this._elements.read(monitor), ({ _valid }) => _valid.read(monitor))

    return toConcise(valid, isBoolean, false)
  })

  public readonly _validVerbose = Signal(
    (monitor): FormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _validVerbose }) => _validVerbose.read(monitor)),
  )

  // I N V A L I D

  public readonly _invalid = Signal((monitor): FormListFlag<TElement> => {
    const invalid = map(this._elements.read(monitor), ({ _invalid }) => _invalid.read(monitor))

    return toConcise(invalid, isBoolean, false)
  })

  public readonly _invalidVerbose = Signal(
    (monitor): FormListFlagVerbose<TElement> =>
      map(this._elements.read(monitor), ({ _invalidVerbose }) => _invalidVerbose.read(monitor)),
  )

  // V A L I D A T E D

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

  // D I R T Y
  //
  // Length semantics: verbose signals report per-current-element only.
  // The "removed slots" case (elements.length < _initialInputs.length) folds into
  // the concise _dirty signal as `true` (the list is dirty because the structure
  // has shrunk from initial), but is NOT reflected in _dirtyVerbose to keep the
  // verbose array type-stable.

  public readonly _dirty = Signal((monitor): FormListFlag<TElement> => {
    const elements = this._elements.read(monitor)
    const initialInputsLength = this._initialInputs.read(monitor).length

    if (elements.length < initialInputsLength) {
      return true
    }

    const dirty = map(elements, ({ _dirty, _dirtyOn }, index) => {
      if (index >= initialInputsLength) {
        // added elements are always dirty
        return _dirtyOn.read(monitor)
      }

      return _dirty.read(monitor)
    })

    return toConcise(dirty, isBoolean, false)
  })

  public readonly _dirtyVerbose = Signal((monitor): FormListFlagVerbose<TElement> => {
    const elements = this._elements.read(monitor)
    const initialInputsLength = this._initialInputs.read(monitor).length

    return map(elements, ({ _dirtyVerbose, _dirtyOnVerbose }, index) => {
      if (index >= initialInputsLength) {
        // added elements are always dirty
        return _dirtyOnVerbose.read(monitor)
      }

      return _dirtyVerbose.read(monitor)
    })
  })

  public readonly _dirtyOn = Signal((monitor): FormListFlag<TElement> => {
    const elements = this._elements.read(monitor)
    const initialInputsLength = this._initialInputs.read(monitor).length

    const dirtyOn: Array<GetSignalFormFlag<TElement>> = []

    for (let index = 0; index < initialInputsLength; index += 1) {
      const element = elements.at(index)

      if (element) {
        dirtyOn.push(element._dirtyOn.read(monitor))
      } else {
        // removed slot — always considered dirty
        dirtyOn.push(true as GetSignalFormFlag<TElement>)
      }
    }

    return toConcise(dirtyOn, isBoolean, false)
  })

  public readonly _dirtyOnVerbose = Signal((monitor): FormListFlagVerbose<TElement> => {
    const elements = this._elements.read(monitor)
    const initialInputsLength = this._initialInputs.read(monitor).length

    // Like _dirtyVerbose, restrict to slots that have a current element to preserve
    // the per-slot verbose type.
    const length = Math.min(initialInputsLength, elements.length)

    return map(elements.slice(0, length), ({ _dirtyOnVerbose }) => _dirtyOnVerbose.read(monitor))
  })

  public _reset(monitor: Monitor, resetter: undefined | FormListInputSetter<TElement>): void {
    if (!isUndefined(resetter)) {
      this._setInitial(monitor, resetter)
    }

    // Capture validateOn so that list-level overrides survive recreation. Touched is
    // intentionally NOT captured — reset is supposed to clear touched state, and
    // factory-built elements start untouched.
    const conciseValidateOn = this._validateOn.read(monitor)
    const verboseValidateOn = this._validateOnVerbose.read(monitor)

    // Pull the *effective* initial inputs (children may have set their own _initial
    // since the last list-level setInitial) and refreeze them as the rebuild target.
    const targetInitials = this._initial.read(monitor)

    this._initialInputs.write(targetInitials)

    const nextElements = map(targetInitials, (input, index) =>
      this._parentOf(this._factory(input, index)),
    )

    for (const [index, element] of entries(nextElements)) {
      // If the list-level validateOn collapsed to a single strategy, apply it to every
      // fresh element (extending past the captured verbose length). Otherwise apply
      // per-slot from the verbose snapshot.
      if (isString(conciseValidateOn)) {
        element._setValidateOn(monitor, conciseValidateOn)
      } else {
        const validateOn = verboseValidateOn.at(index)

        if (!isUndefined(validateOn)) {
          element._setValidateOn(monitor, validateOn)
        }
      }
    }

    this._elements.write(nextElements)
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
