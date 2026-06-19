import type { Setter } from "~/tools/setter"

import type { GetFormParam } from "../signal-form/get-form-param"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormOptionalFlagVerbose } from "./form-optional-flag-verbose"
import type { FormOptionalSchema } from "./form-optional-schema"

type FormOptionalFlagSetter<TEnabled extends SignalForm, TElement extends SignalForm> = Setter<
  | boolean
  | Partial<
      FormOptionalSchema<
        GetFormParam<TEnabled, "flag.setter">,
        GetFormParam<TElement, "flag.setter">
      >
    >,
  [FormOptionalFlagVerbose<TEnabled, TElement>]
>

export type { FormOptionalFlagSetter }
