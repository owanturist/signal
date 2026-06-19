import type { GetFormParam } from "../../signal-form/get-form-param"
import type { SignalForm } from "../../signal-form/signal-form"
import type { SignalFormParams } from "../../signal-form/signal-form-params"
import type { FormOptionalSchema } from "../form-optional-schema"

type FormOptionalParam<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
  TKey extends keyof SignalFormParams,
  TConcise = never,
> =
  | TConcise
  | FormOptionalSchema<
      TConcise | GetFormParam<TEnabled, TKey>,
      TConcise | GetFormParam<TElement, TKey>
    >

export type { FormOptionalParam }
