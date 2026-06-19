import { type Monitor, Signal } from "@owanturist/signal"

import { entries } from "~/tools/entries"
import { hasProperty } from "~/tools/has-property"
import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"
import { map } from "~/tools/map"
import { mapValues } from "~/tools/map-values"
import { values } from "~/tools/values"

import { toConcise } from "../../_internal/to-concise"
import type { GetSignalFormParams } from "../../signal-form/_internal/get-signal-form-params"
import {
  type SignalFormChild,
  SignalFormState,
} from "../../signal-form/_internal/signal-form-state"
import type { SignalForm } from "../../signal-form/signal-form"
import type { SignalFormParams } from "../../signal-form/signal-form-params"
import { VALIDATE_ON_TOUCH } from "../../validate-strategy"
import type { FormShapeError } from "../form-shape-error"
import type { FormShapeErrorSetter } from "../form-shape-error-setter"
import type { FormShapeErrorVerbose } from "../form-shape-error-verbose"
import type { FormShapeFields } from "../form-shape-fields"
import type { FormShapeFlag } from "../form-shape-flag"
import type { FormShapeFlagSetter } from "../form-shape-flag-setter"
import type { FormShapeFlagVerbose } from "../form-shape-flag-verbose"
import type { FormShapeInput } from "../form-shape-input"
import type { FormShapeInputSetter } from "../form-shape-input-setter"
import type { FormShapeOutput } from "../form-shape-output"
import type { FormShapeOutputVerbose } from "../form-shape-output-verbose"
import type { FormShapeParams } from "../form-shape-params"
import type { FormShapeValidateOn } from "../form-shape-validate-on"
import type { FormShapeValidateOnSetter } from "../form-shape-validate-on-setter"
import type { FormShapeValidateOnVerbose } from "../form-shape-validate-on-verbose"

import { FormShape } from "./form-shape"

type FormShapeStateFields<TFields extends FormShapeFields<TFields>> = {
  [TField in keyof TFields]: SignalFormState<GetSignalFormParams<TFields[TField]>>
}

class FormShapeState<
  TFields extends FormShapeFields<TFields> = Record<string, SignalForm>,
> extends SignalFormState<FormShapeParams<TFields>> {
  public readonly _host = Lazy(() => new FormShape(this))

  public readonly _fields: FormShapeStateFields<TFields>

  public constructor(parent: null | SignalFormState, fields: FormShapeStateFields<TFields>) {
    super(parent)

    this._fields = mapValues(fields, (field) => this._parentOf(field))
  }

  public _childOf(parent: null | SignalFormState): FormShapeState<TFields> {
    return new FormShapeState(parent, this._fields)
  }

  // I N I T I A L

  public readonly _initial = Signal(
    (monitor): FormShapeInput<TFields> =>
      mapValues(this._fields, ({ _initial }) => _initial.read(monitor)),
  )

  public _setInitial(monitor: Monitor, setter: FormShapeInputSetter<TFields>): void {
    const setters = isFunction(setter)
      ? setter(this._initial.read(monitor), this._input.read(monitor))
      : setter

    for (const [key, field] of entries(this._fields)) {
      if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setInitial(monitor, setters[key])
      }
    }
  }

  public _patchInitial(monitor: Monitor, initials: FormShapeInput<TFields>): void {
    for (const [key, field] of entries(this._fields)) {
      field._patchInitial(monitor, initials[key])
    }
  }

  // I N P U T

  public readonly _input = Signal(
    (monitor): FormShapeInput<TFields> =>
      mapValues(this._fields, ({ _input }) => _input.read(monitor)),
  )

  public _setInput(monitor: Monitor, setter: FormShapeInputSetter<TFields>): void {
    const setters = isFunction(setter)
      ? setter(this._input.read(monitor), this._initial.read(monitor))
      : setter

    for (const [key, field] of entries(this._fields)) {
      if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setInput(monitor, setters[key])
      }
    }
  }

  // E R R O R

  public readonly _error = Signal((monitor): FormShapeError<TFields> => {
    const error = mapValues(this._fields, ({ _error }) => _error.read(monitor))

    if (values(error).every(isNull)) {
      return null
    }

    return error
  })

  public readonly _errorVerbose = Signal(
    (monitor): FormShapeErrorVerbose<TFields> =>
      mapValues(this._fields, ({ _errorVerbose }) => _errorVerbose.read(monitor)),
  )

  public _setError(monitor: Monitor, setter: FormShapeErrorSetter<TFields>): void {
    const setters = isFunction(setter) ? setter(this._errorVerbose.read(monitor)) : setter

    for (const [key, field] of entries(this._fields)) {
      if (isNull(setters)) {
        field._setError(monitor, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setError(monitor, setters[key])
      }
    }
  }

  // V A L I D A T E   O N

  public readonly _validateOn = Signal((monitor): FormShapeValidateOn<TFields> => {
    const validateOn = mapValues(this._fields, ({ _validateOn }) => _validateOn.read(monitor))

    return toConcise(values(validateOn), isString, VALIDATE_ON_TOUCH, validateOn)
  })

  public readonly _validateOnVerbose = Signal(
    (monitor): FormShapeValidateOnVerbose<TFields> =>
      mapValues(this._fields, ({ _validateOnVerbose }) => _validateOnVerbose.read(monitor)),
  )

  public _setValidateOn(monitor: Monitor, setter: FormShapeValidateOnSetter<TFields>): void {
    const setters = isFunction(setter) ? setter(this._validateOnVerbose.read(monitor)) : setter

    for (const [key, field] of entries(this._fields)) {
      if (isString(setters)) {
        field._setValidateOn(monitor, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setValidateOn(monitor, setters[key])
      }
    }
  }

  // T O U C H E D

  public readonly _touched = Signal((monitor): FormShapeFlag<TFields> => {
    const touched = mapValues(this._fields, ({ _touched }) => _touched.read(monitor))

    return toConcise(values(touched), isBoolean, false, touched)
  })

  public readonly _touchedVerbose = Signal(
    (monitor): FormShapeFlagVerbose<TFields> =>
      mapValues(this._fields, ({ _touchedVerbose }) => _touchedVerbose.read(monitor)),
  )

  public _setTouched(monitor: Monitor, setter: FormShapeFlagSetter<TFields>): void {
    const setters = isFunction(setter) ? setter(this._touchedVerbose.read(monitor)) : setter

    for (const [key, field] of entries(this._fields)) {
      if (isBoolean(setters)) {
        field._setTouched(monitor, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setTouched(monitor, setters[key])
      }
    }
  }

  // O U T P U T

  public readonly _output = Signal((monitor): null | FormShapeOutput<TFields> => {
    const output = mapValues(this._fields, ({ _output }) => _output.read(monitor))

    if (values(output).some(isNull)) {
      return null
    }

    return output
  })

  public readonly _outputVerbose = Signal(
    (monitor): FormShapeOutputVerbose<TFields> =>
      mapValues(this._fields, ({ _outputVerbose }) => _outputVerbose.read(monitor)),
  )

  // V A L I D

  public readonly _valid = Signal((monitor): FormShapeFlag<TFields> => {
    const valid = mapValues(this._fields, ({ _valid }) => _valid.read(monitor))

    return toConcise(values(valid), isBoolean, false, valid)
  })

  public readonly _validVerbose = Signal(
    (monitor): FormShapeFlagVerbose<TFields> =>
      mapValues(this._fields, ({ _validVerbose }) => _validVerbose.read(monitor)),
  )

  // I N V A L I D

  public readonly _invalid = Signal((monitor): FormShapeFlag<TFields> => {
    const invalid = mapValues(this._fields, ({ _invalid }) => _invalid.read(monitor))

    return toConcise(values(invalid), isBoolean, false, invalid)
  })

  public readonly _invalidVerbose = Signal(
    (monitor): FormShapeFlagVerbose<TFields> =>
      mapValues(this._fields, ({ _invalidVerbose }) => _invalidVerbose.read(monitor)),
  )

  // V A L I D A T E D

  public readonly _validated = Signal((monitor): FormShapeFlag<TFields> => {
    const validated = mapValues(this._fields, ({ _validated }) => _validated.read(monitor))

    return toConcise(values(validated), isBoolean, false, validated)
  })

  public readonly _validatedVerbose = Signal(
    (monitor): FormShapeFlagVerbose<TFields> =>
      mapValues(this._fields, ({ _validatedVerbose }) => _validatedVerbose.read(monitor)),
  )

  public _forceValidated(monitor: Monitor): void {
    for (const field of values(this._fields)) {
      field._forceValidated(monitor)
    }
  }

  // D I R T Y

  public readonly _dirty = Signal((monitor): FormShapeFlag<TFields> => {
    const dirty = mapValues(this._fields, ({ _dirty }) => _dirty.read(monitor))

    return toConcise(values(dirty), isBoolean, false, dirty)
  })

  public readonly _dirtyVerbose = Signal(
    (monitor): FormShapeFlagVerbose<TFields> =>
      mapValues(this._fields, ({ _dirtyVerbose }) => _dirtyVerbose.read(monitor)),
  )

  public readonly _dirtyOn = Signal((monitor): FormShapeFlag<TFields> => {
    const dirtyOn = mapValues(this._fields, ({ _dirtyOn }) => _dirtyOn.read(monitor))

    return toConcise(values(dirtyOn), isBoolean, false, dirtyOn)
  })

  public readonly _dirtyOnVerbose = Signal(
    (monitor): FormShapeFlagVerbose<TFields> =>
      mapValues(this._fields, ({ _dirtyOnVerbose }) => _dirtyOnVerbose.read(monitor)),
  )

  // R E S E T

  public _reset(monitor: Monitor, resetter: undefined | FormShapeInputSetter<TFields>): void {
    if (!isUndefined(resetter)) {
      this._setInitial(monitor, resetter)
    }

    for (const field of values(this._fields)) {
      field._reset(monitor, undefined)
    }
  }

  // C H I L D R E N

  public _getChildren<TChildParams extends SignalFormParams>(): ReadonlyArray<
    SignalFormChild<TChildParams, FormShapeParams<TFields>>
  > {
    return map(entries(this._fields), ([key, field]) => ({
      _state: field as unknown as SignalFormState<TChildParams>,
      _mapToChild: (output) => output[key],
    }))
  }
}

export type { FormShapeStateFields }
export { FormShapeState }
