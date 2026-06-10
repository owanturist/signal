import type { Setter } from "~/tools/setter"

import type { GetSignalFormInput } from "../signal-form/get-signal-form-input"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormListInput } from "./form-list-input"

type FormListInputSetter<TElement extends SignalForm> = Setter<
  ReadonlyArray<GetSignalFormInput<TElement>>,
  [FormListInput<TElement>, FormListInput<TElement>]
>

export type { FormListInputSetter }
