import type { Setter } from "~/tools/setter"

import type { GetFormInputSetter } from "../signal-form/get-form-input-setter"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormListInput } from "./form-list-input"

type FormListInputSetter<TElement extends SignalForm> = Setter<
  ReadonlyArray<GetFormInputSetter<TElement>>,
  [FormListInput<TElement>, FormListInput<TElement>]
>

export type { FormListInputSetter }
