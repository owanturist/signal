import type { Setter } from "~/tools/setter"

import type { GetFormErrorSetter } from "../signal-form/get-form-error-setter"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormListErrorVerbose } from "./form-list-error-verbose"

type FormListErrorSetter<TElement extends SignalForm> = Setter<
  null | ReadonlyArray<undefined | GetFormErrorSetter<TElement>>,
  [FormListErrorVerbose<TElement>]
>

export type { FormListErrorSetter }
