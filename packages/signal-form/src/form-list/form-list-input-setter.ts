import type { Setter } from "~/tools/setter"

import type { GetFormInput } from "../signal-form/get-form-input"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormListInput } from "./form-list-input"

type FormListInputSetter<TElement extends SignalForm> = Setter<
  ReadonlyArray<GetFormInput<TElement>>,
  [FormListInput<TElement>, FormListInput<TElement>]
>

export type { FormListInputSetter }
