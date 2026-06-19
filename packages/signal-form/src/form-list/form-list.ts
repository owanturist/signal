import { Signal, batch } from "@owanturist/signal"

import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { isUndefined } from "~/tools/is-undefined"

import type { GetFormInput } from "../signal-form/get-form-input"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormListErrorSetter } from "./form-list-error-setter"
import type { FormListFlagSetter } from "./form-list-flag-setter"
import type { FormListInputSetter } from "./form-list-input-setter"
import type { FormListValidateOnSetter } from "./form-list-validate-on-setter"
import { FormList as FormListImpl } from "./_internal/form-list"
import { FormListState } from "./_internal/form-list-state"

type FormList<TElement extends SignalForm> = FormListImpl<TElement>

type FormListElementFactory<TElement extends SignalForm> = (
  input: GetFormInput<TElement>,
  index: number,
) => TElement

interface FormListOptions<TElement extends SignalForm> {
  /**
   * @default []
   */
  readonly initial?: FormListInputSetter<TElement>

  /**
   * @default {@link initial}
   */
  readonly input?: FormListInputSetter<TElement>

  readonly touched?: FormListFlagSetter<TElement>
  readonly validateOn?: FormListValidateOnSetter<TElement>
  readonly error?: FormListErrorSetter<TElement>
}

function FormList<TElement extends SignalForm>(
  factory: FormListElementFactory<TElement>,
  { input, initial, touched, validateOn, error }: FormListOptions<TElement> = {},
): FormList<TElement> {
  const state = new FormListState<TElement>(
    null,

    (value, index) => FormListImpl._getState(factory(value, index)),

    Signal<GetFormInput<TElement>>([], {
      equals: isShallowArrayEqual,
    }),
  )

  batch((monitor) => {
    const inputOrInitial = input ?? initial

    if (!isUndefined(inputOrInitial)) {
      state._setInput(monitor, inputOrInitial)
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

export type { FormListElementFactory, FormListOptions }
export { FormList }
