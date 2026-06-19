import type { GetFormParam } from "../signal-form/get-form-param"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormOptionalSchema } from "./form-optional-schema"

type FormOptionalInput<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
> = FormOptionalSchema<
  GetFormParam<TEnabled, "input.schema">,
  GetFormParam<TElement, "input.schema">
>

export type { FormOptionalInput }
