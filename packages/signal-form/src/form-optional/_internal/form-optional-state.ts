import { type Monitor, type ReadableSignal, Signal } from "@owanturist/signal"

import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { isTrue } from "~/tools/is-true"
import { isUndefined } from "~/tools/is-undefined"
import { lazy } from "~/tools/lazy"

import { toConcise } from "../../_internal/to-concise"
import type { GetFormState } from "../../signal-form/_internal/get-form-state"
import {
  type SignalFormChild,
  SignalFormState,
} from "../../signal-form/_internal/signal-form-state"
import type { SignalForm } from "../../signal-form/signal-form"
import type { SignalFormParams } from "../../signal-form/signal-form-params"
import type { FormOptionalError } from "../form-optional-error"
import type { FormOptionalErrorSetter } from "../form-optional-error-setter"
import type { FormOptionalErrorVerbose } from "../form-optional-error-verbose"
import type { FormOptionalFlag } from "../form-optional-flag"
import type { FormOptionalFlagSetter } from "../form-optional-flag-setter"
import type { FormOptionalFlagVerbose } from "../form-optional-flag-verbose"
import type { FormOptionalInput } from "../form-optional-input"
import type { FormOptionalInputSetter } from "../form-optional-input-setter"
import type { FormOptionalOutput } from "../form-optional-output"
import type { FormOptionalOutputVerbose } from "../form-optional-output-verbose"
import type { FormOptionalParams } from "../form-optional-params"
import type { FormOptionalValidateOn } from "../form-optional-validate-on"
import type { FormOptionalValidateOnSetter } from "../form-optional-validate-on-setter"
import type { FormOptionalValidateOnVerbose } from "../form-optional-validate-on-verbose"

import { FormOptional } from "./form-optional"
import type { FormOptionalParam } from "./form-optional-param"

class FormOptionalState<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> extends SignalFormState<
  FormOptionalParams<TEnabled, TElement>,
  FormOptional<TEnabled, TElement>
> {
  public readonly _host = lazy(() => new FormOptional(this))

  public readonly _enabled: GetFormState<TEnabled>
  public readonly _element: GetFormState<TElement>

  public constructor(
    parent: null | SignalFormState,
    enabled: GetFormState<TEnabled>,
    element: GetFormState<TElement>,
  ) {
    super(parent)

    this._enabled = this._parentOf(enabled)
    this._element = this._parentOf(element)
  }

  private _isEnabled(monitor: Monitor): boolean {
    return isTrue(this._enabled._output.read(monitor))
  }

  public _getEnabledElement(monitor: Monitor): undefined | GetFormState<TElement> {
    return this._isEnabled(monitor) ? this._element : undefined
  }

  public _childOf(parent: null | SignalFormState): FormOptionalState<TEnabled, TElement> {
    return new FormOptionalState(parent, this._enabled, this._element)
  }

  private _toConcise<TKey extends keyof SignalFormParams, TConcise>(
    monitor: Monitor,
    extract: (form: SignalFormState) => ReadableSignal<unknown>,
    isConcise: (value: unknown) => value is unknown,
    fallbackDisabled?: TConcise,
  ): FormOptionalParam<TEnabled, TElement, TKey, TConcise> {
    const enabled = extract(this._enabled).read(monitor)
    const enabledElement = this._getEnabledElement(monitor)
    let concise: unknown

    if (enabledElement) {
      const element = extract(enabledElement).read(monitor)

      concise = toConcise([enabled, element], isConcise, enabled, { enabled, element })
    } else {
      concise =
        isConcise(enabled) || isUndefined(fallbackDisabled)
          ? enabled
          : { enabled, element: fallbackDisabled }
    }

    // biome-ignore lint/nursery/noUnsafeTypeAssertion: the facet's value type is chosen by `extract`, which TS cannot relate to TKey (no higher-kinded types)
    return concise as FormOptionalParam<TEnabled, TElement, TKey, TConcise>
  }

  // I N I T I A L

  public readonly _initial = Signal(
    (monitor): FormOptionalInput<TEnabled, TElement> => ({
      enabled: this._enabled._initial.read(monitor),
      element: this._element._initial.read(monitor),
    }),
  )

  public _setInitial(monitor: Monitor, setter: FormOptionalInputSetter<TEnabled, TElement>): void {
    const { enabled, element } = isFunction(setter)
      ? setter(this._initial.read(monitor), this._input.read(monitor))
      : setter

    if (!isUndefined(enabled)) {
      this._enabled._setInitial(monitor, enabled)
    }

    if (!isUndefined(element)) {
      this._element._setInitial(monitor, element)
    }
  }

  public _patchInitial(monitor: Monitor, initial: FormOptionalInput<TEnabled, TElement>): void {
    this._enabled._patchInitial(monitor, initial.enabled)
    this._element._patchInitial(monitor, initial.element)
  }

  // I N P U T

  public readonly _input = Signal(
    (monitor): FormOptionalInput<TEnabled, TElement> => ({
      enabled: this._enabled._input.read(monitor),
      element: this._element._input.read(monitor),
    }),
  )

  public _setInput(monitor: Monitor, setter: FormOptionalInputSetter<TEnabled, TElement>): void {
    const { enabled, element } = isFunction(setter)
      ? setter(this._input.read(monitor), this._initial.read(monitor))
      : setter

    if (!isUndefined(enabled)) {
      this._enabled._setInput(monitor, enabled)
    }

    if (!isUndefined(element)) {
      this._element._setInput(monitor, element)
    }
  }

  // E R R O R

  public readonly _error = Signal(
    (monitor): FormOptionalError<TEnabled, TElement> =>
      this._toConcise(monitor, ({ _error }) => _error, isNull, null),
  )

  public readonly _errorVerbose = Signal(
    (monitor): FormOptionalErrorVerbose<TEnabled, TElement> => ({
      enabled: this._enabled._errorVerbose.read(monitor),
      element: this._element._errorVerbose.read(monitor),
    }),
  )

  public _setError(monitor: Monitor, setter: FormOptionalErrorSetter<TEnabled, TElement>): void {
    const resolved = isFunction(setter) ? setter(this._errorVerbose.read(monitor)) : setter

    const enabledSetter = isNull(resolved) ? resolved : resolved.enabled

    if (!isUndefined(enabledSetter)) {
      this._enabled._setError(monitor, enabledSetter)
    }

    const elementSetter = isNull(resolved)
      ? this._isEnabled(monitor)
        ? resolved
        : undefined
      : resolved.element

    if (!isUndefined(elementSetter)) {
      this._element._setError(monitor, elementSetter)
    }
  }

  // V A L I D A T E   O N

  public readonly _validateOn = Signal(
    (monitor): FormOptionalValidateOn<TEnabled, TElement> =>
      this._toConcise(monitor, ({ _validateOn }) => _validateOn, isString),
  )

  public readonly _validateOnVerbose = Signal(
    (monitor): FormOptionalValidateOnVerbose<TEnabled, TElement> => ({
      enabled: this._enabled._validateOnVerbose.read(monitor),
      element: this._element._validateOnVerbose.read(monitor),
    }),
  )

  public _setValidateOn(
    monitor: Monitor,
    setter: FormOptionalValidateOnSetter<TEnabled, TElement>,
  ): void {
    const resolved = isFunction(setter) ? setter(this._validateOnVerbose.read(monitor)) : setter

    const [enabledSetter, elementSetter] = isString(resolved)
      ? [resolved, this._isEnabled(monitor) ? resolved : undefined]
      : [resolved.enabled, resolved.element]

    if (!isUndefined(enabledSetter)) {
      this._enabled._setValidateOn(monitor, enabledSetter)
    }

    if (!isUndefined(elementSetter)) {
      this._element._setValidateOn(monitor, elementSetter)
    }
  }

  // T O U C H E D

  public readonly _touched = Signal(
    (monitor): FormOptionalFlag<TEnabled, TElement> =>
      this._toConcise(monitor, ({ _touched }) => _touched, isBoolean),
  )

  public readonly _touchedVerbose = Signal(
    (monitor): FormOptionalFlagVerbose<TEnabled, TElement> => ({
      enabled: this._enabled._touchedVerbose.read(monitor),
      element: this._element._touchedVerbose.read(monitor),
    }),
  )

  public _setTouched(monitor: Monitor, setter: FormOptionalFlagSetter<TEnabled, TElement>): void {
    const resolved = isFunction(setter) ? setter(this._touchedVerbose.read(monitor)) : setter

    const [enabledSetter, elementSetter] = isBoolean(resolved)
      ? [resolved, this._isEnabled(monitor) ? resolved : undefined]
      : [resolved.enabled, resolved.element]

    if (!isUndefined(enabledSetter)) {
      this._enabled._setTouched(monitor, enabledSetter)
    }

    if (!isUndefined(elementSetter)) {
      this._element._setTouched(monitor, elementSetter)
    }
  }

  // O U T P U T

  public readonly _output = Signal((monitor): null | FormOptionalOutput<TElement> => {
    const enabled = this._enabled._output.read(monitor)

    if (enabled === false) {
      return undefined
    }

    if (isNull(enabled)) {
      return null
    }

    const value = this._element._output.read(monitor)

    if (isNull(value)) {
      return null
    }

    return value
  })

  public readonly _outputVerbose = Signal(
    (monitor): FormOptionalOutputVerbose<TEnabled, TElement> => ({
      enabled: this._enabled._outputVerbose.read(monitor),
      element: this._element._outputVerbose.read(monitor),
    }),
  )

  // V A L I D

  public readonly _valid = Signal(
    (monitor): FormOptionalFlag<TEnabled, TElement> =>
      this._toConcise(monitor, ({ _valid }) => _valid, isBoolean),
  )

  public readonly _validVerbose = Signal(
    (monitor): FormOptionalFlagVerbose<TEnabled, TElement> => ({
      enabled: this._enabled._validVerbose.read(monitor),
      element: this._element._validVerbose.read(monitor),
    }),
  )

  // I N V A L I D

  public readonly _invalid = Signal(
    (monitor): FormOptionalFlag<TEnabled, TElement> =>
      this._toConcise(monitor, ({ _invalid }) => _invalid, isBoolean),
  )

  public readonly _invalidVerbose = Signal(
    (monitor): FormOptionalFlagVerbose<TEnabled, TElement> => ({
      enabled: this._enabled._invalidVerbose.read(monitor),
      element: this._element._invalidVerbose.read(monitor),
    }),
  )

  // V A L I D A T E D

  public readonly _validated = Signal(
    (monitor): FormOptionalFlag<TEnabled, TElement> =>
      this._toConcise(monitor, ({ _validated }) => _validated, isBoolean),
  )

  public readonly _validatedVerbose = Signal(
    (monitor): FormOptionalFlagVerbose<TEnabled, TElement> => ({
      enabled: this._enabled._validatedVerbose.read(monitor),
      element: this._element._validatedVerbose.read(monitor),
    }),
  )

  public _forceValidated(monitor: Monitor): void {
    this._enabled._forceValidated(monitor)
    this._element._forceValidated(monitor)
  }

  // D I R T Y

  public readonly _dirty = Signal(
    (monitor): FormOptionalFlag<TEnabled, TElement> =>
      this._toConcise(monitor, ({ _dirty }) => _dirty, isBoolean),
  )

  public readonly _dirtyVerbose = Signal(
    (monitor): FormOptionalFlagVerbose<TEnabled, TElement> => ({
      enabled: this._enabled._dirtyVerbose.read(monitor),
      element: this._element._dirtyVerbose.read(monitor),
    }),
  )

  public readonly _dirtyOnVerbose = Signal(
    (monitor): FormOptionalFlagVerbose<TEnabled, TElement> => ({
      enabled: this._enabled._dirtyOnVerbose.read(monitor),
      element: this._element._dirtyOnVerbose.read(monitor),
    }),
  )

  // R E S E T

  public _reset(
    monitor: Monitor,
    resetter: undefined | FormOptionalInputSetter<TEnabled, TElement>,
  ): void {
    if (!isUndefined(resetter)) {
      this._setInitial(monitor, resetter)
    }

    this._enabled._reset(monitor, undefined)
    this._element._reset(monitor, undefined)
  }

  // C H I L D R E N

  public _getChildren(
    monitor: Monitor,
  ): ReadonlyArray<SignalFormChild<FormOptionalParams<TEnabled, TElement>>> {
    const enabledValue = this._enabled._output.read(monitor)

    const enabledChild: SignalFormChild<FormOptionalParams<TEnabled, TElement>> = {
      _state: this._enabled,
      _mapToChild: () => enabledValue,
    }

    if (enabledValue !== true) {
      return [enabledChild]
    }

    return [
      enabledChild,
      {
        _state: this._element,
        _mapToChild: (output) => output,
      },
    ]
  }
}

export { FormOptionalState }
