import type { Setter } from "~/tools/setter"

import type { GetFormParam } from "../signal-form/get-form-param"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormOptionalErrorVerbose } from "./form-optional-error-verbose"
import type { FormOptionalSchema } from "./form-optional-schema"

type FormOptionalErrorSetter<TEnabled extends SignalForm, TElement extends SignalForm> = Setter<
  null | Partial<
    FormOptionalSchema<
      GetFormParam<TEnabled, "error.setter">,
      GetFormParam<TElement, "error.setter">
    >
  >,
  [FormOptionalErrorVerbose<TEnabled, TElement>]
>

export type { FormOptionalErrorSetter }
