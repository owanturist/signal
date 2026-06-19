import { batch } from "@owanturist/signal"

import { isUndefined } from "~/tools/is-undefined"
import { mapValues } from "~/tools/map-values"

import type { FormShapeErrorSetter } from "./form-shape-error-setter"
import type { FormShapeFields } from "./form-shape-fields"
import type { FormShapeFlagSetter } from "./form-shape-flag-setter"
import type { FormShapeInputSetter } from "./form-shape-input-setter"
import type { FormShapeValidateOnSetter } from "./form-shape-validate-on-setter"
import { FormShape as FormShapeImpl } from "./_internal/form-shape"
import { FormShapeState, type FormShapeStateFields } from "./_internal/form-shape-state"

type FormShape<TFields extends FormShapeFields<TFields>> = FormShapeImpl<TFields>

interface FormShapeOptions<TFields extends FormShapeFields<TFields>> {
  readonly input?: FormShapeInputSetter<TFields>
  readonly initial?: FormShapeInputSetter<TFields>
  readonly touched?: FormShapeFlagSetter<TFields>
  readonly validateOn?: FormShapeValidateOnSetter<TFields>
  readonly error?: FormShapeErrorSetter<TFields>
}

function FormShape<TFields extends FormShapeFields<TFields>>(
  fields: TFields,
  { input, initial, touched, validateOn, error }: FormShapeOptions<NoInfer<TFields>> = {},
): FormShape<TFields> {
  const state = new FormShapeState(
    null,
    mapValues(fields, FormShapeImpl._getState) as FormShapeStateFields<TFields>,
  )

  batch((monitor) => {
    if (!isUndefined(input)) {
      state._setInput(monitor, input)
    }

    if (!isUndefined(initial)) {
      state._setInitial(monitor, initial)
    }

    if (!isUndefined(touched)) {
      state._setTouched(monitor, touched)
    }

    if (!isUndefined(validateOn)) {
      state._setValidateOn(monitor, validateOn)
    }

    if (!isUndefined(error)) {
      state._setError(monitor, error)
    }
  })

  return state._host()
}

export type { FormShapeOptions }
export { FormShape }
